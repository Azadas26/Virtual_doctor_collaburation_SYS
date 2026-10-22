const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    appointmentNumber: {
        type: String,
        required: true,
        unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    doctorType: {
        type: String,
        enum: ['FIXED', 'TEMPORARY'],
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true // e.g. "09:30 AM"
    },
    symptoms: {
        type: String,
        required: true
    },
    symptomDuration: {
        type: String,
        default: '1-3 days'
    },
    existingConditions: {
        type: String,
        default: ''
    },
    currentMedication: {
        type: String,
        default: ''
    },
    allergies: {
        type: String,
        default: ''
    },
    priorityCategory: {
        type: String,
        enum: ['EMERGENCY', 'HIGH', 'NORMAL'],
        default: 'NORMAL'
    },
    isEmergencyWarningShown: {
        type: Boolean,
        default: false
    },
    allocationReason: [{
        type: String
    }],
    queuePosition: {
        type: Number,
        default: 1
    },
    estimatedWaitTimeMinutes: {
        type: Number,
        default: 15
    },
    status: {
        type: String,
        enum: [
            'BOOKED',
            'CHECKED_IN',
            'WAITING',
            'IN_CONSULTATION',
            'COMPLETED',
            'CANCELLED',
            'NO_SHOW'
        ],
        default: 'BOOKED'
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
