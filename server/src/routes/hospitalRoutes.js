const express = require('express');
const router = express.Router();
const {
    getHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    getHospitalDoctors
} = require('../controllers/hospitalController');
const { protect, authorize, checkHospitalApproved } = require('../middleware/auth');

router.get('/', getHospitals);
router.get('/:id', getHospitalById);
router.get('/:id/doctors', getHospitalDoctors);
router.post('/', protect, authorize('MAIN_ADMIN'), createHospital);
router.put('/:id', protect, authorize('MAIN_ADMIN', 'HOSPITAL_ADMIN'), checkHospitalApproved, updateHospital);

module.exports = router;
