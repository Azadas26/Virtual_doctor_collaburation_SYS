const Queue = require('../models/Queue');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');
const TemporaryContract = require('../models/TemporaryContract');
const { logAudit } = require('../utils/auditLogger');

// @desc Get Doctor's live Queue visualization & Shift Schedule
// @route GET /api/consultations/queue
// @access Private (FIXED_DOCTOR, TEMPORARY_DOCTOR, HOSPITAL_ADMIN)
exports.getDoctorQueue = async (req, res) => {
    try {
        let doctorId = req.query.doctorId;
        let doctor = null;
        let hospital = null;
        let hospitalDoctors = [];

        // 1. If HOSPITAL_ADMIN, find their hospital and all associated doctors
        if (req.user.role === 'HOSPITAL_ADMIN') {
            hospital = await Hospital.findOne({ adminUserId: req.user._id });
            if (!hospital && req.user.hospitalId) {
                hospital = await Hospital.findById(req.user.hospitalId);
            }

            if (hospital) {
                const docs = await Doctor.find({ hospitalId: hospital._id, status: 'ACTIVE' });
                hospitalDoctors = await Promise.all(docs.map(async (doc) => {
                    const queueCount = await Appointment.countDocuments({
                        doctorId: doc._id,
                        status: { $in: ['BOOKED', 'CHECKED_IN', 'WAITING'] }
                    });
                    const inConsult = await Appointment.findOne({
                        doctorId: doc._id,
                        status: 'IN_CONSULTATION'
                    }).populate('patientId', 'name');
                    return {
                        _id: doc._id,
                        id: doc._id,
                        doctorName: doc.doctorName,
                        specialization: doc.specialization,
                        department: doc.department,
                        doctorType: doc.doctorType,
                        workingHours: doc.workingHours,
                        waitingCount: queueCount,
                        currentPatientName: inConsult?.patientId?.name || null
                    };
                }));

                if (doctorId) {
                    doctor = await Doctor.findOne({ _id: doctorId, hospitalId: hospital._id }).populate('hospitalId');
                }
                if (!doctor && docs.length > 0) {
                    // Pick doctor with active queue or the first doctor
                    const docWithQueue = hospitalDoctors.find(d => d.waitingCount > 0);
                    const pickId = docWithQueue ? docWithQueue._id : docs[0]._id;
                    doctor = await Doctor.findById(pickId).populate('hospitalId');
                }
            }

            if (!doctor) {
                return res.json({
                    success: true,
                    hospital,
                    hospitalDoctors: hospitalDoctors || [],
                    doctor: null,
                    activeContract: null,
                    summary: { totalToday: 0, completedCount: 0, waitingCount: 0 },
                    currentPatient: null,
                    nextPatient: null,
                    waitingQueue: [],
                    completedQueue: [],
                    message: hospitalDoctors.length === 0 ? 'No active doctors assigned to this hospital OPD yet.' : 'Select a doctor to view their live patient queue.'
                });
            }
        } else {
            // 2. Doctor user (FIXED_DOCTOR or TEMPORARY_DOCTOR)
            if (doctorId) {
                doctor = await Doctor.findById(doctorId).populate('hospitalId', 'name address district state contactNumber');
            } else {
                doctor = await Doctor.findOne({ userId: req.user._id, status: 'ACTIVE' }).populate('hospitalId', 'name address district state contactNumber');
                if (!doctor) {
                    doctor = await Doctor.findOne({ userId: req.user._id }).populate('hospitalId', 'name address district state contactNumber');
                }
            }

            if (!doctor) {
                return res.json({
                    success: true,
                    doctor: null,
                    hospital: null,
                    hospitalDoctors: [],
                    activeContract: null,
                    summary: { totalToday: 0, completedCount: 0, waitingCount: 0 },
                    currentPatient: null,
                    nextPatient: null,
                    waitingQueue: [],
                    completedQueue: [],
                    message: 'No active hospital OPD assignment yet. Please review and accept a hospital contract in the Contracts page.'
                });
            }
        }

        doctorId = doctor._id;

        // Fetch active shift schedule contract if temporary doctor
        let activeContract = null;
        if (doctor.activeContractId) {
            activeContract = await TemporaryContract.findById(doctor.activeContractId);
        }
        if (!activeContract && doctor.doctorType === 'TEMPORARY') {
            activeContract = await TemporaryContract.findOne({
                doctorId: doctor.userId,
                status: 'ACTIVE'
            });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Resilient query: all active queue appointments (BOOKED, CHECKED_IN, WAITING, IN_CONSULTATION)
        // OR appointments created/scheduled for today/yesterday
        const appointments = await Appointment.find({
            doctorId,
            $or: [
                {
                    status: { $in: ['IN_CONSULTATION', 'WAITING', 'CHECKED_IN', 'BOOKED'] }
                },
                {
                    appointmentDate: {
                        $gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
                        $lte: new Date(endOfDay.getTime() + 24 * 60 * 60 * 1000)
                    }
                }
            ]
        })
            .populate('patientId', 'name dateOfBirth gender contact address emergencyContact medicalHistory allergies existingConditions uploadedDocuments')
            .sort({ queuePosition: 1, createdAt: 1 });

        const current = appointments.find(a => a.status === 'IN_CONSULTATION') || null;
        const waiting = appointments.filter(a => ['BOOKED', 'CHECKED_IN', 'WAITING'].includes(a.status));
        const completed = appointments.filter(a => a.status === 'COMPLETED');

        const nextPatient = waiting.length > 0 ? waiting[0] : null;

        return res.json({
            success: true,
            hospital: hospital || (doctor?.hospitalId ? doctor.hospitalId : null),
            hospitalDoctors: hospitalDoctors,
            doctor: {
                id: doctor._id,
                _id: doctor._id,
                doctorName: doctor.doctorName,
                specialization: doctor.specialization,
                department: doctor.department,
                qualification: doctor.qualification,
                doctorType: doctor.doctorType,
                workingDays: doctor.workingDays,
                workingHours: doctor.workingHours,
                consultationCapacity: doctor.consultationCapacity,
                hospital: doctor.hospitalId
            },
            activeContract: activeContract ? {
                contractNumber: activeContract.contractNumber,
                hospitalName: activeContract.hospitalName,
                hospitalAddress: activeContract.hospitalAddress,
                workingDays: activeContract.workingDays,
                workingHours: activeContract.workingHours,
                startDate: activeContract.startDate,
                endDate: activeContract.endDate,
                status: activeContract.status,
                consultationResponsibilities: activeContract.consultationResponsibilities
            } : null,
            summary: {
                totalToday: appointments.length,
                completedCount: completed.length,
                waitingCount: waiting.length
            },
            currentPatient: current,
            nextPatient: nextPatient,
            waitingQueue: waiting,
            completedQueue: completed
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching queue: ' + error.message
        });
    }
};

// @desc Start consultation with next patient in queue
// @route PUT /api/consultations/appointments/:id/start
// @access Private (FIXED_DOCTOR, TEMPORARY_DOCTOR, HOSPITAL_ADMIN)
exports.startConsultation = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId')
            .populate('hospitalId');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found.'
            });
        }

        // Reset any existing in-consultation appointment for this doctor back to WAITING
        await Appointment.updateMany(
            { doctorId: appointment.doctorId, status: 'IN_CONSULTATION', _id: { $ne: appointment._id } },
            { $set: { status: 'WAITING' } }
        );

        appointment.status = 'IN_CONSULTATION';
        await appointment.save();

        // Update Queue collection if exists
        const dateStr = new Date(appointment.appointmentDate || Date.now()).toISOString().split('T')[0];
        await Queue.findOneAndUpdate(
            { doctorId: appointment.doctorId, date: dateStr },
            { $set: { currentAppointmentId: appointment._id } }
        );

        await logAudit({
            req,
            action: 'START_CONSULTATION',
            resource: 'Appointment',
            resourceId: appointment._id,
            details: { appointmentNumber: appointment.appointmentNumber }
        });

        return res.json({
            success: true,
            message: 'Consultation started with patient ' + (appointment.patientId?.name || ''),
            appointment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error starting consultation: ' + error.message
        });
    }
};

// @desc Complete Consultation, write Clinical Notes & Prescriptions (Creates immutable medical record)
// @route POST /api/consultations
// @access Private (FIXED_DOCTOR, TEMPORARY_DOCTOR)
exports.completeConsultation = async (req, res) => {
    try {
        const {
            appointmentId,
            clinicalNotes,
            observations,
            medications,
            investigations,
            followUpDate,
            referralInfo
        } = req.body;

        if (!appointmentId || !clinicalNotes) {
            return res.status(400).json({
                success: false,
                message: 'Please provide appointment ID and clinical notes.'
            });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found.'
            });
        }

        const consultation = new Consultation({
            appointmentId: appointment._id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            doctorUserId: req.user._id,
            hospitalId: appointment.hospitalId,
            clinicalNotes,
            observations: observations || '',
            medications: Array.isArray(medications) ? medications : [],
            investigations: Array.isArray(investigations) ? investigations : [],
            followUpDate: followUpDate ? new Date(followUpDate) : null,
            referralInfo: referralInfo || '',
            status: 'COMPLETED'
        });
        await consultation.save();

        // Mark appointment completed
        appointment.status = 'COMPLETED';
        await appointment.save();

        // Update Queue collection if exists
        const dateStr = new Date(appointment.appointmentDate || Date.now()).toISOString().split('T')[0];
        await Queue.findOneAndUpdate(
            { doctorId: appointment.doctorId, date: dateStr },
            {
                $set: { currentAppointmentId: null },
                $pull: { waitingList: appointment._id },
                $addToSet: { completedList: appointment._id }
            }
        );

        await logAudit({
            req,
            action: 'COMPLETE_CONSULTATION',
            resource: 'Consultation',
            resourceId: consultation._id,
            details: { appointmentNumber: appointment.appointmentNumber }
        });

        return res.status(201).json({
            success: true,
            message: 'Consultation completed and immutable medical record stored.',
            consultation
        });

    } catch (error) {
        console.error('Complete Consultation Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error completing consultation: ' + error.message
        });
    }
};

// @desc Get Patient Consultation History (Medical History)
// @route GET /api/consultations/patient/:patientId
// @access Private (Authorized Doctor, Patient, Hospital Admin)
exports.getPatientConsultations = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Check privacy authorization: Patient can view own records, Doctor can view assigned patient records
        const consultations = await Consultation.find({ patientId })
            .populate('doctorId', 'doctorName specialization doctorType')
            .populate('hospitalId', 'name district state')
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: consultations.length,
            consultations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching patient consultations: ' + error.message
        });
    }
};

// @desc Get Current Logged-in Patient Consultation & Prescription History
// @route GET /api/consultations/my-history
// @access Private (PATIENT)
exports.getMyConsultations = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) {
            return res.json({
                success: true,
                count: 0,
                consultations: []
            });
        }

        const consultations = await Consultation.find({ patientId: patient._id })
            .populate('doctorId', 'doctorName specialization doctorType')
            .populate('hospitalId', 'name district state')
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: consultations.length,
            consultations
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching medical history: ' + error.message
        });
    }
};

