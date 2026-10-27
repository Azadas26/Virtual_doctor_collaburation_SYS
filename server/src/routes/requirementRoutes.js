const express = require('express');
const router = express.Router();
const { createRequirement, getRequirements, getMyRequirements } = require('../controllers/requirementController');
const { protect, authorize, checkHospitalApproved } = require('../middleware/auth');

// Private: hospital admin sees only their own hospital's requirements (all statuses)
router.get('/my', protect, authorize('HOSPITAL_ADMIN'), checkHospitalApproved, getMyRequirements);

// Public: all open requirements across all approved hospitals (for temp doctors)
router.get('/', getRequirements);

router.post('/', protect, authorize('HOSPITAL_ADMIN'), checkHospitalApproved, createRequirement);

module.exports = router;
