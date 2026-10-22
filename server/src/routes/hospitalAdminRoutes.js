const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getHospitalDoctors,
    addFixedDoctor,
    verifyDoctorProfile,
    getHospitalRequests
} = require('../controllers/hospitalAdminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('HOSPITAL_ADMIN', 'MAIN_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/doctors', getHospitalDoctors);
router.post('/doctors', addFixedDoctor);
router.get('/requests', getHospitalRequests);
router.put('/verify-doctor/:profileId', verifyDoctorProfile);
router.put('/temporary-doctors/:profileId/verify', verifyDoctorProfile);

module.exports = router;
