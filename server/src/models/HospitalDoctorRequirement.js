const mongoose = require('mongoose');

const hospitalDoctorRequirementSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    requiredDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true // e.g. "09:00 AM"
    },
    endTime: {
        type: String,
        required: true // e.g. "01:00 PM"
    },
    requiredDoctorsCount: {
        type: Number,
        required: true,
        default: 1
    },
    filledDoctorsCount: {
        type: Number,
        default: 0
    },
    expectedPatientCapacity: {
        type: Number,
        default: 25
    },
    reason: {
        type: String,
        required: true // e.g., "High OP crowd expected on Mondays", "Permanent doctor on leave"
    },
    status: {
        type: String,
        enum: ['OPEN', 'FILLED', 'CANCELLED'],
        default: 'OPEN'
    }
}, { timestamps: true });

module.exports = mongoose.model('HospitalDoctorRequirement', hospitalDoctorRequirementSchema);
