const express = require('express');
const router = express.Router();
const { createRequirement, getRequirements } = require('../controllers/requirementController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getRequirements);
router.post('/', protect, authorize('HOSPITAL_ADMIN'), createRequirement);

module.exports = router;
