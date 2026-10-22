const AuditLog = require('../models/AuditLog');

const logAudit = async ({ req, userId, userName, role, action, resource, resourceId, details }) => {
    try {
        const log = new AuditLog({
            userId: userId || (req && req.user ? req.user._id : null),
            userName: userName || (req && req.user ? req.user.name : 'System'),
            role: role || (req && req.user ? req.user.role : 'GUEST'),
            action,
            resource,
            resourceId: resourceId ? String(resourceId) : '',
            details: details || {},
            ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : ''
        });
        await log.save();
    } catch (error) {
        console.error('Audit Log Error:', error.message);
    }
};

module.exports = { logAudit };
