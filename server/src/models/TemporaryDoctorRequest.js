const mongoose = require('mongoose');

const temporaryDoctorRequestSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tempProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemporaryDoctorProfile',
        required: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HospitalDoctorRequirement',
        default: null
    },
    specialization: {
        type: String,
        required: true
    },
    requestedStartDate: {
        type: Date,
        required: true
    },
    requestedEndDate: {
        type: Date,
        required: true
    },
    availableDays: [{
        type: String
    }],
    availableStartTime: {
        type: String,
        required: true
    },
    availableEndTime: {
        type: String,
        required: true
    },
    totalHours: {
        type: Number,
        required: true
    },
    consultationCapacity: {
        type: Number,
        default: 25
    },
    message: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: [
            'PENDING',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED',
            'CONTRACT_SENT',
            'CONTRACT_ACCEPTED',
            'CONTRACT_REJECTED',
            'CANCELLED',
            'COMPLETED'
        ],
        default: 'PENDING'
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('TemporaryDoctorRequest', temporaryDoctorRequestSchema);
