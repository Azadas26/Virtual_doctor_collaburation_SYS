const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    pinCode: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    hospitalType: {
        type: String,
        default: 'Government Hospital'
    },
    departments: [{
        type: String,
        trim: true
    }],
    availableFacilities: [{
        type: String
    }],
    workingHours: {
        type: String,
        default: '08:00 AM - 05:00 PM'
    },
    emergencyAvailability: {
        type: Boolean,
        default: true
    },
    superintendentName: {
        type: String,
        required: true
    },
    superintendentEmail: {
        type: String,
        required: true
    },
    superintendentPhone: {
        type: String,
        required: true
    },
    supportingDocuments: [{
        title: String,
        fileUrl: String
    }],
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'DEACTIVATED'],
        default: 'PENDING'
    },
    adminUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);
