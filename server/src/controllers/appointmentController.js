const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Queue = require('../models/Queue');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');

// Basic Triage Rule Classifier (Administrative routing, NOT medical diagnosis)
const evaluateTriagePriority = (symptomsText) => {
    const text = (symptomsText || '').toLowerCase();

    const emergencyKeywords = [
        'chest pain', 'heart attack', 'cardiac arrest', 'severe shortness of breath',
        'difficulty breathing', 'unconscious', 'stroke', 'paralysis', 'severe bleeding',
        'heavy bleeding', 'head injury', 'seizure', 'convulsion'
    ];

    const highKeywords = [
        'high fever', 'fever 10', 'severe pain', 'fracture', 'broken bone',
        'abrupt stomach pain', 'vomiting blood', 'asthma attack', 'dehydration'
    ];

    for (const kw of emergencyKeywords) {
        if (text.includes(kw)) {
            return {
                priority: 'EMERGENCY',
                isEmergencyWarningShown: true,
                warningMessage: 'CRITICAL: Your reported symptoms indicate a potential medical emergency. Please visit the nearest Emergency Department immediately or call emergency medical services. Do NOT rely solely on an online OP appointment.'
            };
        }
    }

    for (const kw of highKeywords) {
        if (text.includes(kw)) {
            return {
                priority: 'HIGH',
                isEmergencyWarningShown: false,
                warningMessage: null
            };
        }
    }

    return {
        priority: 'NORMAL',
        isEmergencyWarningShown: false,
        warningMessage: null
    };
};

// @desc Evaluate Triage & Smart Allocation Preview before booking
// @route POST /api/appointments/triage-preview
// @access Private (PATIENT)
exports.triagePreview = async (req, res) => {
    try {
        const { hospitalId, department, symptoms } = req.body;

        const triageResult = evaluateTriagePriority(symptoms);

        // Find available doctors in department (flexible regex matching department or specialization)
        const doctors = await Doctor.find({
            hospitalId,
            $or: [
                { department: { $regex: new RegExp(department, 'i') } },
                { specialization: { $regex: new RegExp(department, 'i') } }
            ],
            status: 'ACTIVE'
        });

        const doctorsWithQueue = await Promise.all(doctors.map(async (doc) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const currentQueue = await Queue.findOne({ doctorId: doc._id, date: todayStr });
            const waitingCount = currentQueue ? currentQueue.waitingList.length : 0;
            return {
                id: doc._id,
                doctorName: doc.doctorName,
                specialization: doc.specialization,
                department: doc.department,
                qualification: doc.qualification,
                doctorType: doc.doctorType,
                workingDays: doc.workingDays,
                workingHours: doc.workingHours,
                consultationCapacity: doc.consultationCapacity,
                waitingCount,
                estimatedWaitTime: waitingCount * (doc.avgConsultationTimeMinutes || 15)
            };
        }));

        return res.json({
            success: true,
            triage: triageResult,
            availableDoctors: doctorsWithQueue
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error previewing triage allocation: ' + error.message
        });
    }
};

// @desc Book an Appointment (with Smart Allocation Logic)
// @route POST /api/appointments
// @access Private (PATIENT)
exports.bookAppointment = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) {
            return res.status(400).json({
                success: false,
                message: 'Patient profile not found. Please complete profile registration.'
            });
        }

        const {
            hospitalId,
            department,
            preferredDoctorId,
            appointmentDate,
            symptoms,
            symptomDuration,
            existingConditions,
            currentMedication,
            allergies
        } = req.body;

        if (!hospitalId || !department || !symptoms) {
            return res.status(400).json({
                success: false,
                message: 'Please provide hospital, department, and symptoms.'
            });
        }

        const triageResult = evaluateTriagePriority(symptoms);

        const bookingDate = appointmentDate ? new Date(appointmentDate) : new Date();
        const dateStr = bookingDate.toISOString().split('T')[0];

        const chosenDoctorId = preferredDoctorId || req.body.doctorId;

        // Candidate Doctors selection (matching either department or specialization)
        let candidateDoctors = await Doctor.find({
            hospitalId,
            $or: [
                { department: { $regex: new RegExp(department, 'i') } },
                { specialization: { $regex: new RegExp(department, 'i') } }
            ],
            status: 'ACTIVE'
        });

        let selectedDoctor = null;
        let allocationReason = [];

        // SMART ALLOCATION LOGIC / PARTICULAR DOCTOR SELECTION
        if (chosenDoctorId) {
            const chosenDoc = await Doctor.findOne({ _id: chosenDoctorId, hospitalId, status: 'ACTIVE' });
            if (chosenDoc) {
                if (!candidateDoctors.some(d => String(d._id) === String(chosenDoc._id))) {
                    candidateDoctors.push(chosenDoc);
                }
                const docDisplayName = chosenDoc.doctorName.startsWith('Dr.') ? chosenDoc.doctorName : `Dr. ${chosenDoc.doctorName}`;
                allocationReason.push(`Patient explicitly booked preferred physician: ${docDisplayName} (${chosenDoc.specialization})`);
            }
        }

        if (candidateDoctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active doctors currently available for this hospital department.'
            });
        }

        if (!selectedDoctor) {
            if (triageResult.priority === 'EMERGENCY' || triageResult.priority === 'HIGH') {
                // Prefer FIXED doctor for high severity
                selectedDoctor = candidateDoctors.find(d => d.doctorType === 'FIXED') || candidateDoctors[0];
                allocationReason.push(`Priority classification: ${triageResult.priority}`);
                allocationReason.push(selectedDoctor.doctorType === 'FIXED' ? 'Allocated to Permanent Hospital Doctor for high-priority evaluation' : 'Allocated to active duty doctor');
            } else {
                // For NORMAL symptoms: offload crowding by preferring verified TEMPORARY doctor or lowest queue length
                const tempDoctors = candidateDoctors.filter(d => d.doctorType === 'TEMPORARY');
                if (tempDoctors.length > 0) {
                    selectedDoctor = tempDoctors[0];
                    allocationReason.push('Normal priority symptom classification');
                    allocationReason.push('Dynamic capacity sharing enabled: allocated to verified voluntary Temporary Doctor to reduce hospital OP crowding');
                } else {
                    selectedDoctor = candidateDoctors[0];
                    allocationReason.push('Normal priority symptom classification');
                    allocationReason.push('Allocated to available department doctor based on queue capacity');
                }
            }
        }

        // Get or initialize Doctor Queue for the date
        let queueObj = await Queue.findOne({ doctorId: selectedDoctor._id, date: dateStr });
        if (!queueObj) {
            queueObj = new Queue({
                hospitalId,
                doctorId: selectedDoctor._id,
                date: dateStr,
                waitingList: [],
                completedList: [],
                totalCount: 0
            });
        }

        const queuePosition = queueObj.waitingList.length + 1;
        const estimatedWaitTimeMinutes = queuePosition * (selectedDoctor.avgConsultationTimeMinutes || 15);

        const appointmentNumber = `EHB-APT-${dateStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const appointment = new Appointment({
            appointmentNumber,
            patientId: patient._id,
            userId: req.user._id,
            hospitalId,
            department,
            doctorId: selectedDoctor._id,
            doctorType: selectedDoctor.doctorType,
            appointmentDate: bookingDate,
            timeSlot: `${selectedDoctor.workingHours.start || '09:00 AM'} (Slot #${queuePosition})`,
            symptoms,
            symptomDuration: symptomDuration || '1-3 days',
            existingConditions: existingConditions || patient.existingConditions || '',
            currentMedication: currentMedication || '',
            allergies: allergies || patient.allergies || '',
            priorityCategory: triageResult.priority,
            isEmergencyWarningShown: triageResult.isEmergencyWarningShown,
            allocationReason,
            queuePosition,
            estimatedWaitTimeMinutes,
            status: 'BOOKED'
        });
        await appointment.save();

        // Push into queue waitingList
        queueObj.waitingList.push(appointment._id);
        queueObj.totalCount += 1;
        await queueObj.save();

        // Create Notification for Patient
        await new Notification({
            userId: req.user._id,
            title: 'Appointment Booked Successfully',
            message: `Your appointment ${appointmentNumber} is confirmed with Dr. ${selectedDoctor.doctorName} (Queue #${queuePosition}, Est. Wait: ${estimatedWaitTimeMinutes} mins).`,
            type: 'APPOINTMENT',
            link: '/patient/appointments'
        }).save();

        await logAudit({
            req,
            action: 'BOOK_APPOINTMENT',
            resource: 'Appointment',
            resourceId: appointment._id,
            details: { appointmentNumber, priority: triageResult.priority, doctorName: selectedDoctor.doctorName }
        });

        return res.status(201).json({
            success: true,
            message: 'Appointment booked successfully.',
            triageWarning: triageResult.isEmergencyWarningShown ? triageResult.warningMessage : null,
            appointment,
            doctor: {
                id: selectedDoctor._id,
                name: selectedDoctor.doctorName,
                type: selectedDoctor.doctorType,
                specialization: selectedDoctor.specialization
            }
        });

    } catch (error) {
        console.error('Book Appointment Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error booking appointment: ' + error.message
        });
    }
};

// @desc Get Patient's own appointments
// @route GET /api/appointments/my-appointments
// @access Private (PATIENT)
exports.getMyAppointments = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) return res.json({ success: true, count: 0, appointments: [] });

        const appointments = await Appointment.find({ patientId: patient._id })
            .populate('hospitalId', 'name address district state')
            .populate('doctorId', 'doctorName specialization doctorType workingHours')
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching appointments: ' + error.message
        });
    }
};
