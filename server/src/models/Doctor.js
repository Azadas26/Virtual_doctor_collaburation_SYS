const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
    doctorName: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    contactInfo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    doctorType: {
        type: String,
        enum: ['FIXED', 'TEMPORARY'],
        required: true
    },
    workingDays: [{
        type: String // e.g. ['Monday', 'Wednesday', 'Friday']
    }],
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    workingHours: {
        start: { type: String, default: '09:00 AM' },
        end: { type: String, default: '01:00 PM' }
    },
    consultationCapacity: {
        type: Number,
        default: 25 // Patients per slot/day
    },
    avgConsultationTimeMinutes: {
        type: Number,
        default: 15
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
        default: 'ACTIVE'
    },
    activeContractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemporaryContract',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
