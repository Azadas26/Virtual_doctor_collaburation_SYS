const express = require('express');
const router = express.Router();
const {
    getMainAdminDashboard,
    getUsers,
    toggleUserSuspend,
    updateHospitalStatus,
    getAuditLogs,
    getSystemReports
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', authorize('MAIN_ADMIN'), getMainAdminDashboard);
router.get('/users', authorize('MAIN_ADMIN'), getUsers);
router.put('/users/:id/toggle-suspend', authorize('MAIN_ADMIN'), toggleUserSuspend);
router.put('/hospitals/:id/status', authorize('MAIN_ADMIN'), updateHospitalStatus);
router.get('/audit-logs', authorize('MAIN_ADMIN'), getAuditLogs);
router.get('/reports', authorize('MAIN_ADMIN', 'HOSPITAL_ADMIN'), getSystemReports);

module.exports = router;
