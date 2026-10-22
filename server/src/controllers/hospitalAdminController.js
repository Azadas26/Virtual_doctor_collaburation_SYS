const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const TemporaryDoctorProfile = require('../models/TemporaryDoctorProfile');
const TemporaryDoctorRequest = require('../models/TemporaryDoctorRequest');
const TemporaryContract = require('../models/TemporaryContract');
const HospitalDoctorRequirement = require('../models/HospitalDoctorRequirement');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');
const { logAudit } = require('../utils/auditLogger');

// Helper to get Hospital assigned to Sub-Admin
const getAdminHospital = async (userId) => {
    const hospital = await Hospital.findOne({ adminUserId: userId });
    if (!hospital) {
        throw new Error('No hospital associated with this administrator account.');
    }
    return hospital;
};

// @desc Hospital Sub-Admin Dashboard Statistics
// @route GET /api/hospital-admin/dashboard
// @access Private (HOSPITAL_ADMIN)
exports.getDashboardStats = async (req, res) => {
    try {
        const hospital = await getAdminHospital(req.user._id);

        const fixedDoctorsCount = await Doctor.countDocuments({
            hospitalId: hospital._id,
            doctorType: 'FIXED',
            status: 'ACTIVE'
        });

        const activeTempDoctorsCount = await Doctor.countDocuments({
            hospitalId: hospital._id,
            doctorType: 'TEMPORARY',
            status: 'ACTIVE'
        });

        const pendingRequestsCount = await TemporaryDoctorRequest.countDocuments({
            hospitalId: hospital._id,
            status: 'PENDING'
        });

        const activeContractsCount = await TemporaryContract.countDocuments({
            hospitalId: hospital._id,
            status: 'ACTIVE'
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayAppointmentsCount = await Appointment.countDocuments({
            hospitalId: hospital._id,
            appointmentDate: { $gte: todayStart, $lte: todayEnd }
        });

        const waitingQueueCount = await Appointment.countDocuments({
            hospitalId: hospital._id,
            status: { $in: ['BOOKED', 'CHECKED_IN', 'WAITING'] },
            appointmentDate: { $gte: todayStart, $lte: todayEnd }
        });

        const openRequirementsCount = await HospitalDoctorRequirement.countDocuments({
            hospitalId: hospital._id,
            status: 'OPEN'
        });

        return res.json({
            success: true,
            hospital,
            stats: {
                fixedDoctorsCount,
                activeTempDoctorsCount,
                pendingRequestsCount,
                activeContractsCount,
                todayAppointmentsCount,
                waitingQueueCount,
                openRequirementsCount
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving hospital admin dashboard: ' + error.message
        });
    }
};

// @desc Get doctors associated with this hospital
// @route GET /api/hospital-admin/doctors
// @access Private (HOSPITAL_ADMIN)
exports.getHospitalDoctors = async (req, res) => {
    try {
        const hospital = await getAdminHospital(req.user._id);
        const doctors = await Doctor.find({ hospitalId: hospital._id }).populate('userId', 'email contactNumber');

        return res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving hospital doctors: ' + error.message
        });
    }
};

// @desc Add a new FIXED/Permanent Doctor (Created directly by Hospital Sub-Admin)
// @route POST /api/hospital-admin/doctors
// @access Private (HOSPITAL_ADMIN)
exports.addFixedDoctor = async (req, res) => {
    try {
        const hospital = await getAdminHospital(req.user._id);

        const {
            doctorName,
            registrationNumber,
            specialization,
            department,
            qualification,
            contactInfo,
            email,
            username,
            password,
            workingDays,
            workingHours,
            consultationCapacity
        } = req.body;

        if (!doctorName || !registrationNumber || !specialization || !department || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required doctor details (name, reg#, specialization, department, email, password).'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email address already exists.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name: doctorName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'FIXED_DOCTOR',
            contactNumber: contactInfo,
            hospitalId: hospital._id
        });
        await user.save();

        const doctor = new Doctor({
            userId: user._id,
            hospitalId: hospital._id,
            doctorName,
            registrationNumber,
            specialization,
            department,
            qualification: qualification || 'MBBS, MD',
            contactInfo: contactInfo || '',
            email: email.toLowerCase(),
            doctorType: 'FIXED',
            workingDays: Array.isArray(workingDays) ? workingDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            workingHours: workingHours || { start: '09:00 AM', end: '01:00 PM' },
            consultationCapacity: consultationCapacity || 30,
            status: 'ACTIVE'
        });
        await doctor.save();

        await logAudit({
            req,
            action: 'ADD_FIXED_DOCTOR',
            resource: 'Doctor',
            resourceId: doctor._id,
            details: { doctorName, hospitalName: hospital.name }
        });

        return res.status(201).json({
            success: true,
            message: 'Fixed doctor account created successfully.',
            doctor
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error adding fixed doctor: ' + error.message
        });
    }
};

// @desc Verify Temporary Doctor Information (Checklist review & Status update)
// @route PUT /api/hospital-admin/verify-doctor/:profileId
// @access Private (HOSPITAL_ADMIN)
exports.verifyDoctorProfile = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { status, notes } = req.body; // status: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW'

        const profile = await TemporaryDoctorProfile.findById(profileId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Temporary doctor profile not found.'
            });
        }

        profile.verificationStatus = status;
        profile.verificationNotes = notes || '';
        profile.verifiedByHospitalAdminId = req.user._id;
        profile.verifiedAt = new Date();
        await profile.save();

        await logAudit({
            req,
            action: `VERIFY_DOCTOR_${status}`,
            resource: 'TemporaryDoctorProfile',
            resourceId: profile._id,
            details: { doctorName: profile.doctorName, status, notes }
        });

        return res.json({
            success: true,
            message: `Doctor verification status updated to '${status}'.`,
            profile
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error verifying doctor profile: ' + error.message
        });
    }
};

// @desc Get all temporary doctor interest requests for this hospital
// @route GET /api/hospital-admin/requests
// @access Private (HOSPITAL_ADMIN)
exports.getHospitalRequests = async (req, res) => {
    try {
        const hospital = await getAdminHospital(req.user._id);

        const requests = await TemporaryDoctorRequest.find({ hospitalId: hospital._id })
            .populate('tempProfileId', 'doctorName medicalQualification specialization registrationNumber verificationStatus documents')
            .populate('requirementId', 'department specialization requiredDate startTime endTime')
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching hospital requests: ' + error.message
        });
    }
};
