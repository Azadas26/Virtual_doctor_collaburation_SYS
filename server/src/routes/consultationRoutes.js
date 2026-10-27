const express = require('express');
const router = express.Router();
const {
    getDoctorQueue,
    startConsultation,
    completeConsultation,
    getPatientConsultations,
    getMyConsultations,
    getConsultationHistory
} = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/queue', authorize('FIXED_DOCTOR', 'TEMPORARY_DOCTOR', 'HOSPITAL_ADMIN'), getDoctorQueue);
router.get('/history', authorize('FIXED_DOCTOR', 'TEMPORARY_DOCTOR', 'HOSPITAL_ADMIN', 'MAIN_ADMIN'), getConsultationHistory);
router.put('/appointments/:id/start', authorize('FIXED_DOCTOR', 'TEMPORARY_DOCTOR', 'HOSPITAL_ADMIN'), startConsultation);
router.post('/', authorize('FIXED_DOCTOR', 'TEMPORARY_DOCTOR', 'HOSPITAL_ADMIN'), completeConsultation);
router.get('/my-history', getMyConsultations);
router.get('/patient/:patientId', getPatientConsultations);

module.exports = router;

