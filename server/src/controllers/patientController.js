const Patient = require('../models/Patient');
const { logAudit } = require('../utils/auditLogger');

// @desc Get Patient Profile
// @route GET /api/patients/profile
// @access Private (PATIENT)
exports.getPatientProfile = async (req, res) => {
    try {
        let patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found.'
            });
        }
        return res.json({
            success: true,
            patient
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching patient profile: ' + error.message
        });
    }
};

// @desc Update Patient Profile & Attach Medical Documents
// @route PUT /api/patients/profile
// @access Private (PATIENT)
exports.updatePatientProfile = async (req, res) => {
    try {
        let patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found.'
            });
        }

        const {
            name,
            dateOfBirth,
            gender,
            contact,
            address,
            emergencyContactName,
            emergencyContactPhone,
            medicalHistory,
            allergies,
            existingConditions
        } = req.body;

        if (name) patient.name = name;
        if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
        if (gender) patient.gender = gender;
        if (contact) patient.contact = contact;
        if (address) patient.address = address;

        if (emergencyContactName || emergencyContactPhone) {
            patient.emergencyContact = {
                name: emergencyContactName || (patient.emergencyContact ? patient.emergencyContact.name : ''),
                phone: emergencyContactPhone || (patient.emergencyContact ? patient.emergencyContact.phone : '')
            };
        }

        if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;
        if (allergies !== undefined) patient.allergies = allergies;
        if (existingConditions !== undefined) patient.existingConditions = existingConditions;

        // File attachment handling
        if (req.file) {
            const documentTitle = req.body.documentTitle || 'Previous Medical Report';
            const documentType = req.body.documentType || 'Lab Report';
            patient.uploadedDocuments.push({
                title: documentTitle,
                documentType,
                fileUrl: `/uploads/${req.file.filename}`,
                uploadedAt: new Date()
            });
        }

        await patient.save();

        await logAudit({
            req,
            action: 'UPDATE_PATIENT_PROFILE',
            resource: 'Patient',
            resourceId: patient._id
        });

        return res.json({
            success: true,
            message: 'Patient profile updated.',
            patient
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating patient profile: ' + error.message
        });
    }
};
