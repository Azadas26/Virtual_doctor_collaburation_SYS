const HospitalDoctorRequirement = require('../models/HospitalDoctorRequirement');
const Hospital = require('../models/Hospital');
const { logAudit } = require('../utils/auditLogger');

// @desc Create a new Temporary Doctor Requirement (Hospital Admin)
// @route POST /api/requirements
// @access Private (HOSPITAL_ADMIN)
exports.createRequirement = async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ adminUserId: req.user._id });
        if (!hospital) {
            return res.status(403).json({
                success: false,
                message: 'No hospital found associated with your admin account.'
            });
        }

        const {
            department,
            specialization,
            requiredDate,
            startTime,
            endTime,
            requiredDoctorsCount,
            expectedPatientCapacity,
            reason
        } = req.body;

        if (!department || !specialization || !requiredDate || !startTime || !endTime || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required requirement fields (department, specialization, date, start/end time, reason).'
            });
        }

        const requirement = new HospitalDoctorRequirement({
            hospitalId: hospital._id,
            department,
            specialization,
            requiredDate,
            startTime,
            endTime,
            requiredDoctorsCount: requiredDoctorsCount || 1,
            expectedPatientCapacity: expectedPatientCapacity || 25,
            reason,
            status: 'OPEN'
        });
        await requirement.save();

        await logAudit({
            req,
            action: 'CREATE_DOCTOR_REQUIREMENT',
            resource: 'HospitalDoctorRequirement',
            resourceId: requirement._id,
            details: { hospitalName: hospital.name, department, specialization }
        });

        return res.status(201).json({
            success: true,
            message: 'Temporary doctor requirement posted successfully.',
            requirement
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating requirement: ' + error.message
        });
    }
};

// @desc Get open requirements (Public/Temp Doctors)
// @route GET /api/requirements
// @access Public
exports.getRequirements = async (req, res) => {
    try {
        const { hospitalId, department, specialization, date } = req.query;
        let query = { status: 'OPEN' };

        if (hospitalId) query.hospitalId = hospitalId;
        if (department) query.department = { $regex: department, $options: 'i' };
        if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.requiredDate = { $gte: searchDate, $lt: nextDay };
        }

        const requirements = await HospitalDoctorRequirement.find(query)
            .populate('hospitalId', 'name address district state location contactNumber hospitalType status')
            .sort({ requiredDate: 1 });

        const approvedRequirements = requirements.filter(r => r.hospitalId && r.hospitalId.status === 'APPROVED');

        return res.json({
            success: true,
            count: approvedRequirements.length,
            requirements: approvedRequirements
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching requirements: ' + error.message
        });
    }
};
