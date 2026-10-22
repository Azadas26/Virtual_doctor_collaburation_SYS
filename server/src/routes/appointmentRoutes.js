const express = require('express');
const router = express.Router();
const {
    triagePreview,
    bookAppointment,
    getMyAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/triage-preview', authorize('PATIENT'), triagePreview);
router.post('/', authorize('PATIENT'), bookAppointment);
router.get('/my-appointments', authorize('PATIENT'), getMyAppointments);

module.exports = router;
