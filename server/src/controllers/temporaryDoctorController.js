const TemporaryDoctorProfile = require('../models/TemporaryDoctorProfile');
const TemporaryDoctorRequest = require('../models/TemporaryDoctorRequest');
const HospitalDoctorRequirement = require('../models/HospitalDoctorRequirement');
const Hospital = require('../models/Hospital');
const TemporaryContract = require('../models/TemporaryContract');
const { logAudit } = require('../utils/auditLogger');

// @desc Get Temporary Doctor Profile for logged-in user
// @route GET /api/temporary-doctors/profile
// @access Private (TEMPORARY_DOCTOR)
exports.getProfile = async (req, res) => {
    try {
        let profile = await TemporaryDoctorProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Temporary doctor profile not found.'
            });
        }
        return res.json({
            success: true,
            profile
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching temporary doctor profile: ' + error.message
        });
    }
};

// @desc Update Profile & Upload Verification Documents
// @route PUT /api/temporary-doctors/profile
// @access Private (TEMPORARY_DOCTOR)
exports.updateProfile = async (req, res) => {
    try {
        let profile = await TemporaryDoctorProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Temporary doctor profile not found.'
            });
        }

        const {
            doctorName,
            contactNumber,
            address,
            medicalQualification,
            specialization,
            registrationNumber,
            registrationAuthority,
            yearsOfExperience,
            previousHospital,
            currentProfessionalStatus,
            latitude,
            longitude
        } = req.body;

        if (doctorName) profile.doctorName = doctorName;
        if (contactNumber) profile.contactNumber = contactNumber;
        if (address) profile.address = address;
        if (medicalQualification) profile.medicalQualification = medicalQualification;
        if (specialization) profile.specialization = specialization;
        if (registrationNumber) profile.registrationNumber = registrationNumber;
        if (registrationAuthority) profile.registrationAuthority = registrationAuthority;
        if (yearsOfExperience) profile.yearsOfExperience = yearsOfExperience;
        if (previousHospital) profile.previousHospital = previousHospital;
        if (currentProfessionalStatus) profile.currentProfessionalStatus = currentProfessionalStatus;

        if (latitude && longitude) {
            profile.currentLocation = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        // Handle document upload if file attached via multer
        if (req.file) {
            const documentType = req.body.documentType || 'Verification Document';
            const fileUrl = `/uploads/${req.file.filename}`;
            profile.verificationDocuments.push({
                documentType,
                fileUrl,
                uploadedAt: new Date()
            });
        }

        await profile.save();

        await logAudit({
            req,
            action: 'UPDATE_TEMP_DOCTOR_PROFILE',
            resource: 'TemporaryDoctorProfile',
            resourceId: profile._id
        });

        return res.json({
            success: true,
            message: 'Profile updated successfully.',
            profile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating profile: ' + error.message
        });
    }
};

// @desc Express Interest in a Hospital or Requirement
// @route POST /api/temporary-doctors/interest
// @access Private (TEMPORARY_DOCTOR)
exports.expressInterest = async (req, res) => {
    try {
        const profile = await TemporaryDoctorProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Temporary doctor profile not found. Please complete registration profile first.'
            });
        }

        const {
            hospitalId,
            requirementId,
            specialization,
            requestedStartDate,
            requestedEndDate,
            availableDays,
            availableStartTime,
            availableEndTime,
            totalHours,
            consultationCapacity,
            message
        } = req.body;

        if (!hospitalId || !requestedStartDate || !requestedEndDate || !availableStartTime || !availableEndTime) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required availability fields (hospital, start/end dates, start/end times).'
            });
        }

        const tempRequest = new TemporaryDoctorRequest({
            doctorId: req.user._id,
            tempProfileId: profile._id,
            hospitalId,
            requirementId: requirementId || null,
            specialization: specialization || profile.specialization,
            requestedStartDate,
            requestedEndDate,
            availableDays: Array.isArray(availableDays) ? availableDays : ['Monday', 'Wednesday', 'Friday'],
            availableStartTime,
            availableEndTime,
            totalHours: totalHours || 20,
            consultationCapacity: consultationCapacity || 25,
            message: message || 'Volunteering to support hospital OP crowd during peak hours.',
            status: 'PENDING'
        });
        await tempRequest.save();

        await logAudit({
            req,
            action: 'EXPRESS_INTEREST',
            resource: 'TemporaryDoctorRequest',
            resourceId: tempRequest._id,
            details: { hospitalId, specialization: tempRequest.specialization }
        });

        return res.status(201).json({
            success: true,
            message: 'Interest request submitted successfully to hospital administration.',
            request: tempRequest
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error expressing interest: ' + error.message
        });
    }
};

// @desc Get doctor's own interest requests
// @route GET /api/temporary-doctors/my-requests
// @access Private (TEMPORARY_DOCTOR)
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await TemporaryDoctorRequest.find({ doctorId: req.user._id })
            .populate('hospitalId', 'name address district state')
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching interest requests: ' + error.message
        });
    }
};

// @desc Upload verification document/certificate
// @route POST /api/temporary-doctors/documents
// @access Private (TEMPORARY_DOCTOR)
exports.uploadDocument = async (req, res) => {
    try {
        const profile = await TemporaryDoctorProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Temporary doctor profile not found.'
            });
        }

        const { documentType, documentNumber } = req.body;
        let fileUrl = req.body.documentUrl || '';

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        profile.verificationDocuments.push({
            documentType: documentType || 'MCI Certificate',
            documentNumber: documentNumber || 'N/A',
            fileUrl: fileUrl || '/uploads/sample_mci.pdf',
            uploadedAt: new Date()
        });

        await profile.save();

        await logAudit({
            req,
            action: 'UPLOAD_VERIFICATION_DOCUMENT',
            resource: 'TemporaryDoctorProfile',
            resourceId: profile._id,
            details: { documentType, documentNumber }
        });

        return res.json({
            success: true,
            message: 'Verification document uploaded successfully.',
            profile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error uploading document: ' + error.message
        });
    }
};
