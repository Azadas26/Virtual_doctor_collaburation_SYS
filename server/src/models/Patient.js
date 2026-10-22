const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    emergencyContact: {
        name: String,
        relation: String,
        phone: String
    },
    medicalHistory: {
        type: String,
        default: ''
    },
    allergies: {
        type: String,
        default: 'None reported'
    },
    existingConditions: {
        type: String,
        default: 'None reported'
    },
    uploadedDocuments: [{
        title: String,
        documentType: String, // 'Prescription', 'Lab Report', 'X-Ray', 'Scan', 'Other'
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
