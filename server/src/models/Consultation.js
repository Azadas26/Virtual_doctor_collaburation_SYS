const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    doctorUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    consultationDate: {
        type: Date,
        default: Date.now
    },
    clinicalNotes: {
        type: String,
        required: true
    },
    observations: {
        type: String,
        default: ''
    },
    medications: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500mg"
        frequency: { type: String, required: true }, // e.g. "1-0-1 after food"
        duration: { type: String, required: true } // e.g. "5 days"
    }],
    investigations: [{
        testType: {
            type: String,
            enum: ['LAB', 'XRAY', 'CT', 'MRI', 'SCAN', 'OTHER'],
            required: true
        },
        testName: { type: String, required: true },
        notes: { type: String, default: '' }
    }],
    followUpDate: {
        type: Date,
        default: null
    },
    referralInfo: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['COMPLETED'],
        default: 'COMPLETED'
    }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
