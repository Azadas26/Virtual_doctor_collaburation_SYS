const mongoose = require('mongoose');

const temporaryDoctorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorName: {
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
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [76.9558, 8.5241]
        }
    },
    medicalQualification: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    registrationAuthority: {
        type: String,
        required: true
    },
    yearsOfExperience: {
        type: Number,
        required: true
    },
    previousHospital: {
        type: String,
        default: ''
    },
    currentProfessionalStatus: {
        type: String,
        enum: ['Retired', 'Freelance', 'On Leave from Institution', 'Part-time Available', 'Other'],
        required: true
    },
    verificationDocuments: [{
        documentType: {
            type: String, // e.g. 'Registration Certificate', 'Degree Certificate', 'Government ID', 'Experience Certificate'
            required: true
        },
        fileUrl: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
    },
    verificationNotes: {
        type: String,
        default: ''
    },
    verifiedByHospitalAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    reliabilityRating: {
        type: Number,
        default: 5.0 // 1-5 scale based on contract completions & cancellations
    },
    completedContractsCount: {
        type: Number,
        default: 0
    },
    cancelledContractsCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

temporaryDoctorProfileSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('TemporaryDoctorProfile', temporaryDoctorProfileSchema);
