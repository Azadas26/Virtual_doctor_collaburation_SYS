const mongoose = require('mongoose');

const temporaryContractSchema = new mongoose.Schema({
    contractNumber: {
        type: String,
        required: true,
        unique: true
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemporaryDoctorRequest',
        required: true
    },
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
    doctorName: String,
    doctorRegistrationNumber: String,
    hospitalName: String,
    hospitalAddress: String,
    specialization: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    workingDays: [{
        type: String
    }],
    workingHours: {
        type: String,
        required: true // e.g. "09:00 AM - 01:00 PM"
    },
    totalExpectedHours: {
        type: Number,
        required: true
    },
    consultationResponsibilities: {
        type: String,
        default: 'Provide OPD consultation, diagnose patients, issue digital prescriptions, suggest necessary lab tests, and complete medical notes within assigned schedule.'
    },
    hospitalResponsibilities: {
        type: String,
        default: 'Provide consultation space, basic diagnostic support, administrative assistance, access to e-Health Bridge system, and verified service certificate upon completion.'
    },
    doctorResponsibilities: {
        type: String,
        default: 'Voluntarily fulfill promised consultation hours, adhere to hospital protocols, maintain patient confidentiality, and provide timely notice if unable to attend.'
    },
    cancellationPolicy: {
        type: String,
        default: 'Temporary doctors are voluntary contributors. Either party may cancel with 24 hours notice. Doctor cancellations trigger immediate hospital notification and replacement workflow.'
    },
    noticePeriod: {
        type: String,
        default: '24 Hours'
    },
    status: {
        type: String,
        enum: [
            'DRAFT',
            'PENDING_ACCEPTANCE',
            'ACTIVE',
            'COMPLETED',
            'CANCELLED',
            'REJECTED'
        ],
        default: 'PENDING_ACCEPTANCE'
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    cancelledBy: {
        type: String, // 'DOCTOR', 'HOSPITAL', 'ADMIN'
        default: null
    },
    acceptedAt: Date,
    cancelledAt: Date,
    completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('TemporaryContract', temporaryContractSchema);
