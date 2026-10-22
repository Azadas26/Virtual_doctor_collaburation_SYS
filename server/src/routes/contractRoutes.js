const express = require('express');
const router = express.Router();
const {
    issueContract,
    getContracts,
    getContractById,
    acceptContract,
    rejectContract,
    cancelContract
} = require('../controllers/contractController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getContracts);
router.get('/:id', getContractById);
router.post('/issue/:requestId', authorize('HOSPITAL_ADMIN'), issueContract);
router.post('/:id/accept', authorize('TEMPORARY_DOCTOR'), acceptContract);
router.post('/:id/reject', authorize('TEMPORARY_DOCTOR'), rejectContract);
router.post('/:id/cancel', cancelContract);

module.exports = router;
