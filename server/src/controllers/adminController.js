const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const TemporaryDoctorProfile = require('../models/TemporaryDoctorProfile');
const TemporaryContract = require('../models/TemporaryContract');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const AuditLog = require('../models/AuditLog');
const TemporaryDoctorRequest = require('../models/TemporaryDoctorRequest');
const { logAudit } = require('../utils/auditLogger');

// @desc Get Main Admin Dashboard Statistics
// @route GET /api/admin/dashboard
// @access Private (MAIN_ADMIN)
exports.getMainAdminDashboard = async (req, res) => {
    try {
        const totalHospitals = await Hospital.countDocuments();
        const activeHospitals = await Hospital.countDocuments({ status: 'APPROVED' });
        const pendingHospitals = await Hospital.countDocuments({ status: 'PENDING' });

        const totalUsers = await User.countDocuments();
        const fixedDoctorsCount = await Doctor.countDocuments({ doctorType: 'FIXED' });
        const tempDoctorsCount = await TemporaryDoctorProfile.countDocuments();
        const verifiedTempDoctorsCount = await TemporaryDoctorProfile.countDocuments({ verificationStatus: 'VERIFIED' });
        const totalPatients = await Patient.countDocuments();

        const activeContracts = await TemporaryContract.countDocuments({ status: 'ACTIVE' });
        const totalContracts = await TemporaryContract.countDocuments();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayAppointments = await Appointment.countDocuments({
            appointmentDate: { $gte: todayStart, $lte: todayEnd }
        });

        const totalAppointments = await Appointment.countDocuments();

        const recentAuditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
        const pendingVerifications = await TemporaryDoctorProfile.find({ verificationStatus: 'PENDING' }).limit(5);

        return res.json({
            success: true,
            stats: {
                totalHospitals,
                activeHospitals,
                pendingHospitals,
                totalUsers,
                fixedDoctorsCount,
                tempDoctorsCount,
                verifiedTempDoctorsCount,
                totalPatients,
                activeContracts,
                totalContracts,
                todayAppointments,
                totalAppointments
            },
            recentAuditLogs,
            pendingVerifications
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching main admin dashboard: ' + error.message
        });
    }
};

// @desc Get all users with filters
// @route GET /api/admin/users
// @access Private (MAIN_ADMIN)
exports.getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching users: ' + error.message
        });
    }
};

// @desc Suspend or Activate User Account
// @route PUT /api/admin/users/:id/toggle-suspend
// @access Private (MAIN_ADMIN)
exports.toggleUserSuspend = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (user.role === 'MAIN_ADMIN') {
            return res.status(400).json({
                success: false,
                message: 'Main Administrator account cannot be suspended.'
            });
        }

        user.isSuspended = !user.isSuspended;
        await user.save();

        await logAudit({
            req,
            action: user.isSuspended ? 'SUSPEND_USER' : 'ACTIVATE_USER',
            resource: 'User',
            resourceId: user._id,
            details: { userName: user.name, isSuspended: user.isSuspended }
        });

        return res.json({
            success: true,
            message: `User account '${user.name}' has been ${user.isSuspended ? 'suspended' : 'activated'}.`,
            user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error toggling user suspension: ' + error.message
        });
    }
};

// @desc Approve or Reject Hospital Registration (Main Admin)
// @route PUT /api/admin/hospitals/:id/status
// @access Private (MAIN_ADMIN)
exports.updateHospitalStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'DEACTIVATED'
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found.'
            });
        }

        hospital.status = status;
        await hospital.save();

        await logAudit({
            req,
            action: `HOSPITAL_STATUS_${status}`,
            resource: 'Hospital',
            resourceId: hospital._id,
            details: { hospitalName: hospital.name, status }
        });

        return res.json({
            success: true,
            message: `Hospital '${hospital.name}' status updated to ${status}.`,
            hospital
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating hospital status: ' + error.message
        });
    }
};

// @desc Get Audit Logs
// @route GET /api/admin/audit-logs
// @access Private (MAIN_ADMIN)
exports.getAuditLogs = async (req, res) => {
    try {
        const { search, limit = 50 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { action: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } },
                { resource: { $regex: search, $options: 'i' } }
            ];
        }

        const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(parseInt(limit));

        return res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving audit logs: ' + error.message
        });
    }
};

// @desc System Reports & Capacity Analytics
// @route GET /api/admin/reports
// @access Private (MAIN_ADMIN, HOSPITAL_ADMIN)
exports.getSystemReports = async (req, res) => {
    try {
        const hospitalCount = await Hospital.countDocuments({ status: 'APPROVED' });
        const fixedDoctors = await Doctor.countDocuments({ doctorType: 'FIXED' });
        const tempDoctors = await Doctor.countDocuments({ doctorType: 'TEMPORARY' });

        const contractsCompleted = await TemporaryContract.countDocuments({ status: 'COMPLETED' });
        const contractsCancelled = await TemporaryContract.countDocuments({ status: 'CANCELLED' });

        const totalAppointments = await Appointment.countDocuments();
        const completedAppointments = await Appointment.countDocuments({ status: 'COMPLETED' });

        // Capacity sharing efficiency ratio
        const capacitySharingPercentage = (fixedDoctors + tempDoctors) > 0
            ? Math.round((tempDoctors / (fixedDoctors + tempDoctors)) * 100)
            : 0;

        return res.json({
            success: true,
            reports: {
                hospitalCount,
                fixedDoctors,
                tempDoctors,
                capacitySharingPercentage,
                contractsCompleted,
                contractsCancelled,
                totalAppointments,
                completedAppointments
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error generating system reports: ' + error.message
        });
    }
};
