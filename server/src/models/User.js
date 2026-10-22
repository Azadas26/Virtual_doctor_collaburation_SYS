const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['MAIN_ADMIN', 'HOSPITAL_ADMIN', 'FIXED_DOCTOR', 'TEMPORARY_DOCTOR', 'PATIENT'],
        required: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
