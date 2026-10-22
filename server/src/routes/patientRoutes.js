const express = require('express');
const router = express.Router();
const { getPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('PATIENT'));

router.get('/profile', getPatientProfile);
router.put('/profile', upload.single('document'), updatePatientProfile);

module.exports = router;
