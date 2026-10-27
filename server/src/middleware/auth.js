const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'e_health_bridge_super_secret_jwt_key_2026'
        );

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'The user belonging to this token no longer exists.'
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended by the Main Administrator.'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Invalid or expired token.'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this resource.`
            });
        }

        next();
    };
};

/**
 * Middleware: checkHospitalApproved
 * Must be used AFTER `protect`. Blocks HOSPITAL_ADMIN users whose
 * associated hospital has not yet been approved by the Main Admin.
 * Other roles pass through without any check.
 */
const checkHospitalApproved = async (req, res, next) => {
    if (!req.user || req.user.role !== 'HOSPITAL_ADMIN') {
        return next(); // not a sub-admin, skip
    }

    try {
        const hospital = await Hospital.findOne({ adminUserId: req.user._id }).select('status name');

        if (!hospital) {
            return res.status(403).json({
                success: false,
                message: 'No hospital record is linked to your account. Please contact the Main Administrator.'
            });
        }

        if (hospital.status === 'PENDING') {
            return res.status(403).json({
                success: false,
                hospitalStatus: 'PENDING',
                message: `Your hospital registration ("${hospital.name}") is pending approval by the Main Administrator. You cannot perform any actions until it is approved.`
            });
        }

        if (hospital.status === 'REJECTED') {
            return res.status(403).json({
                success: false,
                hospitalStatus: 'REJECTED',
                message: `Your hospital registration ("${hospital.name}") has been rejected by the Main Administrator. Please contact support.`
            });
        }

        if (hospital.status === 'DEACTIVATED') {
            return res.status(403).json({
                success: false,
                hospitalStatus: 'DEACTIVATED',
                message: `Your hospital ("${hospital.name}") has been deactivated. Please contact the Main Administrator.`
            });
        }

        // hospital.status === 'APPROVED'
        req.hospital = hospital;
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error verifying hospital approval status: ' + err.message
        });
    }
};

module.exports = { protect, authorize, checkHospitalApproved };
