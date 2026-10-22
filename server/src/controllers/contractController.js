const TemporaryContract = require('../models/TemporaryContract');
const TemporaryDoctorRequest = require('../models/TemporaryDoctorRequest');
const TemporaryDoctorProfile = require('../models/TemporaryDoctorProfile');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');

// @desc Generate & Issue Contract from Interest Request (Hospital Admin)
// @route POST /api/contracts/issue/:requestId
// @access Private (HOSPITAL_ADMIN)
exports.issueContract = async (req, res) => {
    try {
        const { requestId } = req.params;
        const tempRequest = await TemporaryDoctorRequest.findById(requestId)
            .populate('hospitalId')
            .populate('tempProfileId');

        if (!tempRequest) {
            return res.status(404).json({
                success: false,
                message: 'Temporary doctor request not found.'
            });
        }

        // Verify hospital admin ownership
        const hospital = await Hospital.findOne({ adminUserId: req.user._id });
        if (!hospital || String(hospital._id) !== String(tempRequest.hospitalId._id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You can only issue contracts for your own hospital requests.'
            });
        }

        const {
            consultationResponsibilities,
            hospitalResponsibilities,
            doctorResponsibilities,
            noticePeriod
        } = req.body;

        const contractNumber = `EHB-CNT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

        const contract = new TemporaryContract({
            contractNumber,
            requestId: tempRequest._id,
            doctorId: tempRequest.doctorId,
            tempProfileId: tempRequest.tempProfileId._id,
            hospitalId: hospital._id,
            doctorName: tempRequest.tempProfileId.doctorName,
            doctorRegistrationNumber: tempRequest.tempProfileId.registrationNumber,
            hospitalName: hospital.name,
            hospitalAddress: `${hospital.address}, ${hospital.district}, ${hospital.state}`,
            specialization: tempRequest.specialization,
            startDate: tempRequest.requestedStartDate,
            endDate: tempRequest.requestedEndDate,
            workingDays: tempRequest.availableDays,
            workingHours: `${tempRequest.availableStartTime} - ${tempRequest.availableEndTime}`,
            totalExpectedHours: tempRequest.totalHours,
            consultationResponsibilities: consultationResponsibilities || undefined,
            hospitalResponsibilities: hospitalResponsibilities || undefined,
            doctorResponsibilities: doctorResponsibilities || undefined,
            noticePeriod: noticePeriod || '24 Hours',
            status: 'PENDING_ACCEPTANCE'
        });
        await contract.save();

        tempRequest.status = 'CONTRACT_SENT';
        await tempRequest.save();

        // Create notification for Doctor
        const notification = new Notification({
            userId: tempRequest.doctorId,
            title: 'Service Contract Received',
            message: `${hospital.name} has sent you a temporary service contract (${contractNumber}). Please review and accept or reject.`,
            type: 'CONTRACT',
            link: '/temp-doctor/contracts'
        });
        await notification.save();

        await logAudit({
            req,
            action: 'ISSUE_TEMPORARY_CONTRACT',
            resource: 'TemporaryContract',
            resourceId: contract._id,
            details: { contractNumber, hospitalName: hospital.name, doctorName: contract.doctorName }
        });

        return res.status(201).json({
            success: true,
            message: 'Temporary contract generated and sent to doctor.',
            contract
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error issuing contract: ' + error.message
        });
    }
};

// @desc Get contracts for logged-in user (Temp Doctor, Hospital Admin, Main Admin)
// @route GET /api/contracts
// @access Private
exports.getContracts = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'TEMPORARY_DOCTOR') {
            query.doctorId = req.user._id;
        } else if (req.user.role === 'HOSPITAL_ADMIN') {
            const hospital = await Hospital.findOne({ adminUserId: req.user._id });
            if (hospital) query.hospitalId = hospital._id;
        }

        const contracts = await TemporaryContract.find(query)
            .populate('hospitalId', 'name address district state')
            .populate('tempProfileId', 'doctorName registrationNumber medicalQualification specialization yearsOfExperience reliabilityRating')
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: contracts.length,
            contracts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching contracts: ' + error.message
        });
    }
};

// @desc Get single contract details
// @route GET /api/contracts/:id
// @access Private
exports.getContractById = async (req, res) => {
    try {
        const contract = await TemporaryContract.findById(req.params.id)
            .populate('hospitalId')
            .populate('tempProfileId');

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found.'
            });
        }

        return res.json({
            success: true,
            contract
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving contract: ' + error.message
        });
    }
};

// @desc Doctor Accepts Contract
// @route POST /api/contracts/:id/accept
// @access Private (TEMPORARY_DOCTOR)
exports.acceptContract = async (req, res) => {
    try {
        const contract = await TemporaryContract.findById(req.params.id);
        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found.'
            });
        }

        if (String(contract.doctorId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You can only respond to your own contracts.'
            });
        }

        if (contract.status !== 'PENDING_ACCEPTANCE') {
            return res.status(400).json({
                success: false,
                message: `Contract cannot be accepted because its status is '${contract.status}'.`
            });
        }

        contract.status = 'ACTIVE';
        contract.acceptedAt = new Date();
        await contract.save();

        // Update TemporaryDoctorRequest status
        await TemporaryDoctorRequest.findByIdAndUpdate(contract.requestId, { status: 'CONTRACT_ACCEPTED' });

        // Activate/Create Doctor entry for this hospital so appointments can be assigned!
        const tempProfile = await TemporaryDoctorProfile.findById(contract.tempProfileId);

        let doctor = await Doctor.findOne({
            userId: req.user._id,
            hospitalId: contract.hospitalId
        });

        if (!doctor) {
            doctor = new Doctor({
                userId: req.user._id,
                hospitalId: contract.hospitalId,
                doctorName: contract.doctorName,
                registrationNumber: contract.doctorRegistrationNumber,
                specialization: contract.specialization,
                department: contract.specialization, // will still be matched via $or query
                qualification: tempProfile ? tempProfile.medicalQualification : 'MBBS',
                contactInfo: tempProfile ? tempProfile.contactNumber : '',
                email: req.user.email,
                doctorType: 'TEMPORARY',
                workingDays: contract.workingDays,
                startDate: contract.startDate,
                endDate: contract.endDate,
                workingHours: {
                    start: contract.workingHours.split(' - ')[0] || '09:00 AM',
                    end: contract.workingHours.split(' - ')[1] || '01:00 PM'
                },
                consultationCapacity: 25,
                status: 'ACTIVE',
                activeContractId: contract._id
            });
        } else {
            doctor.status = 'ACTIVE';
            doctor.activeContractId = contract._id;
            doctor.workingDays = contract.workingDays;
        }
        await doctor.save();

        // Notify Hospital Admin
        const hospital = await Hospital.findById(contract.hospitalId);
        if (hospital && hospital.adminUserId) {
            await new Notification({
                userId: hospital.adminUserId,
                title: 'Contract Accepted',
                message: `Dr. ${contract.doctorName} has accepted contract ${contract.contractNumber}. They are now active in your hospital doctor schedule.`,
                type: 'CONTRACT',
                link: '/hospital/contracts'
            }).save();
        }

        await logAudit({
            req,
            action: 'ACCEPT_CONTRACT',
            resource: 'TemporaryContract',
            resourceId: contract._id,
            details: { contractNumber: contract.contractNumber, doctorName: contract.doctorName }
        });

        return res.json({
            success: true,
            message: 'Contract accepted! You are now active for patient appointments at this hospital.',
            contract,
            doctor
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error accepting contract: ' + error.message
        });
    }
};

// @desc Doctor Rejects Contract
// @route POST /api/contracts/:id/reject
// @access Private (TEMPORARY_DOCTOR)
exports.rejectContract = async (req, res) => {
    try {
        const contract = await TemporaryContract.findById(req.params.id);
        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found.'
            });
        }

        if (String(contract.doctorId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized.'
            });
        }

        contract.status = 'REJECTED';
        await contract.save();

        await TemporaryDoctorRequest.findByIdAndUpdate(contract.requestId, { status: 'CONTRACT_REJECTED' });

        await logAudit({
            req,
            action: 'REJECT_CONTRACT',
            resource: 'TemporaryContract',
            resourceId: contract._id
        });

        return res.json({
            success: true,
            message: 'Contract declined.',
            contract
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error rejecting contract: ' + error.message
        });
    }
};

// @desc Cancel Contract / Drop-out Handling (Doctor or Hospital Admin)
// @route POST /api/contracts/:id/cancel
// @access Private
exports.cancelContract = async (req, res) => {
    try {
        const contract = await TemporaryContract.findById(req.params.id);
        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found.'
            });
        }

        const { cancellationReason } = req.body;
        if (!cancellationReason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a reason for cancelling this contract.'
            });
        }

        const cancelledByRole = req.user.role === 'TEMPORARY_DOCTOR' ? 'DOCTOR' : (req.user.role === 'HOSPITAL_ADMIN' ? 'HOSPITAL' : 'ADMIN');

        contract.status = 'CANCELLED';
        contract.cancellationReason = cancellationReason;
        contract.cancelledBy = cancelledByRole;
        contract.cancelledAt = new Date();
        await contract.save();

        // Deactivate Doctor record for this hospital
        await Doctor.findOneAndUpdate(
            { userId: contract.doctorId, hospitalId: contract.hospitalId },
            { status: 'INACTIVE' }
        );

        // Update Temporary Doctor reliability rating log
        if (cancelledByRole === 'DOCTOR') {
            const tempProfile = await TemporaryDoctorProfile.findById(contract.tempProfileId);
            if (tempProfile) {
                tempProfile.cancelledContractsCount += 1;
                // Adjust rating slightly (minimum 1.0)
                tempProfile.reliabilityRating = Math.max(1.0, (tempProfile.reliabilityRating - 0.4).toFixed(1));
                await tempProfile.save();
            }
        }

        // Trigger Replacement Workflow: Notify Hospital Admin
        const hospital = await Hospital.findById(contract.hospitalId);
        if (hospital && hospital.adminUserId) {
            await new Notification({
                userId: hospital.adminUserId,
                title: 'Temporary Doctor Contract Cancelled',
                message: `Contract ${contract.contractNumber} was cancelled by ${cancelledByRole}. Reason: "${cancellationReason}". Please review affected appointments and post replacement requirements if needed.`,
                type: 'CANCELLATION',
                link: '/hospital/contracts'
            }).save();
        }

        await logAudit({
            req,
            action: 'CANCEL_CONTRACT',
            resource: 'TemporaryContract',
            resourceId: contract._id,
            details: { contractNumber: contract.contractNumber, cancelledBy: cancelledByRole, reason: cancellationReason }
        });

        return res.json({
            success: true,
            message: 'Contract cancelled. Audit log and hospital replacement workflow updated.',
            contract
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error cancelling contract: ' + error.message
        });
    }
};
