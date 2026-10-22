const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    expressInterest,
    getMyRequests,
    uploadDocument
} = require('../controllers/temporaryDoctorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('TEMPORARY_DOCTOR'));

router.get('/profile', getProfile);
router.put('/profile', upload.single('document'), updateProfile);
router.post('/documents', upload.single('document'), uploadDocument);
router.post('/interest', expressInterest);
router.get('/my-requests', getMyRequests);

module.exports = router;
