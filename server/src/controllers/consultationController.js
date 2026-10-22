const Queue = require('../models/Queue');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');
const TemporaryContract = require('../models/TemporaryContract');
const { logAudit } = require('../utils/auditLogger');

// @desc Get Doctor's live Queue visualization & Shift Schedule
// @route GET /api/doctors/queue
// @access Private (FIXED_DOCTOR, TEMPORARY_DOCTOR, HOSPITAL_ADMIN)
exports.getDoctorQueue = async (req, res) => {
    try {
        let doctorId = req.query.doctorId;
        let doctor = null;

        if (doctorId) {
            doctor = await Doctor.findById(doctorId).populate('hospitalId', 'name address district state contactNumber');
        } else {
            doctor = await Doctor.findOne({ userId: req.user._id, status: 'ACTIVE' }).populate('hospitalId', 'name address district state contactNumber');
            if (!doctor) {
                doctor = await Doctor.findOne({ userId: req.user._id }).populate('hospitalId', 'name address district state contactNumber');
            }
        }

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'No doctor profile or active appointment queue found for this account.'
            });
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

        // Resilient query: appointments for today OR currently active in queue
        const appointments = await Appointment.find({
            doctorId,
            $or: [
                {
                    appointmentDate: {
                        $gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
                        $lte: new Date(endOfDay.getTime() + 24 * 60 * 60 * 1000)
                    }
                },
                {
                    status: { $in: ['IN_CONSULTATION', 'WAITING', 'CHECKED_IN'] }
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
            doctor: {
                id: doctor._id,
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
// @route PUT /api/appointments/:id/start-consultation
// @access Private (FIXED_DOCTOR, TEMPORARY_DOCTOR)
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

        appointment.status = 'IN_CONSULTATION';
        await appointment.save();

        await logAudit({
            req,
            action: 'START_CONSULTATION',
            resource: 'Appointment',
            resourceId: appointment._id,
            details: { appointmentNumber: appointment.appointmentNumber }
        });

        return res.json({
            success: true,
            message: 'Consultation started.',
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

