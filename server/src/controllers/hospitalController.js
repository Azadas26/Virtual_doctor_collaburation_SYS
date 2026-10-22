const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const HospitalDoctorRequirement = require('../models/HospitalDoctorRequirement');
const Queue = require('../models/Queue');
const { logAudit } = require('../utils/auditLogger');

// @desc Search & List Hospitals (with Geospatial query & filters)
// @route GET /api/hospitals
// @access Public
exports.getHospitals = async (req, res) => {
    try {
        const { name, district, state, department, latitude, longitude, maxDistanceKm = 50, status } = req.query;
        let query = {};

        // Filter by approval status if not specified
        if (status && status !== 'ALL') {
            query.status = status;
        } else if (!status) {
            query.status = 'APPROVED'; // Default to active approved hospitals for public patients/doctors
        }

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        if (district) {
            query.district = { $regex: district, $options: 'i' };
        }

        if (state) {
            query.state = { $regex: state, $options: 'i' };
        }

        if (department) {
            query.departments = { $elemMatch: { $regex: department, $options: 'i' } };
        }

        let hospitals;

        // Geospatial search if lat & lng provided
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const maxMeters = parseFloat(maxDistanceKm) * 1000;

            hospitals = await Hospital.aggregate([
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [lng, lat] },
                        distanceField: 'distanceMeters',
                        maxDistance: maxMeters,
                        query: query,
                        spherical: true
                    }
                },
                {
                    $addFields: {
                        distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] }
                    }
                }
            ]);
        } else {
            hospitals = await Hospital.find(query).sort({ createdAt: -1 });
        }

        return res.json({
            success: true,
            count: hospitals.length,
            data: hospitals
        });

    } catch (error) {
        console.error('Get Hospitals Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error retrieving hospitals: ' + error.message
        });
    }
};

// @desc Get single hospital details with requirements and doctor statistics
// @route GET /api/hospitals/:id
// @access Public
exports.getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found.'
            });
        }

        const fixedDoctorsCount = await Doctor.countDocuments({
            hospitalId: hospital._id,
            doctorType: 'FIXED',
            status: 'ACTIVE'
        });

        const activeTempDoctorsCount = await Doctor.countDocuments({
            hospitalId: hospital._id,
            doctorType: 'TEMPORARY',
            status: 'ACTIVE'
        });

        const openRequirements = await HospitalDoctorRequirement.find({
            hospitalId: hospital._id,
            status: 'OPEN'
        });

        return res.json({
            success: true,
            hospital,
            stats: {
                fixedDoctorsCount,
                activeTempDoctorsCount,
                openRequirementsCount: openRequirements.length
            },
            requirements: openRequirements
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching hospital details: ' + error.message
        });
    }
};

// @desc Get all active doctors at a specific hospital (fixed + voluntary temp)
// @route GET /api/hospitals/:id/doctors
// @access Public
exports.getHospitalDoctors = async (req, res) => {
    try {
        const { department } = req.query;
        let query = { hospitalId: req.params.id, status: 'ACTIVE' };

        // Department filter: match on department OR specialization (temp doctors use specialization as department)
        if (department) {
            query.$or = [
                { department: { $regex: department, $options: 'i' } },
                { specialization: { $regex: department, $options: 'i' } }
            ];
        }

        const doctors = await Doctor.find(query)
            .select('doctorName specialization department doctorType qualification workingDays workingHours consultationCapacity avgConsultationTimeMinutes')
            .sort({ doctorType: 1, doctorName: 1 });

        const todayStr = new Date().toISOString().split('T')[0];
        const doctorsWithQueue = await Promise.all(doctors.map(async (doc) => {
            const currentQueue = await Queue.findOne({ doctorId: doc._id, date: todayStr });
            const waitingCount = currentQueue ? currentQueue.waitingList.length : 0;
            return {
                ...doc.toObject(),
                waitingCount,
                estimatedWaitTimeMinutes: waitingCount * (doc.avgConsultationTimeMinutes || 15)
            };
        }));

        return res.json({
            success: true,
            count: doctorsWithQueue.length,
            doctors: doctorsWithQueue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching hospital doctors: ' + error.message
        });
    }
};

// @desc Create new hospital (Main Admin or Hospital Admin)
// @route POST /api/hospitals
// @access Private (MAIN_ADMIN)
exports.createHospital = async (req, res) => {
    try {
        const hospital = new Hospital(req.body);
        await hospital.save();

        await logAudit({
            req,
            action: 'CREATE_HOSPITAL',
            resource: 'Hospital',
            resourceId: hospital._id,
            details: { name: hospital.name }
        });

        return res.status(201).json({
            success: true,
            message: 'Hospital created successfully.',
            hospital
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating hospital: ' + error.message
        });
    }
};

// @desc Update hospital details
// @route PUT /api/hospitals/:id
// @access Private (MAIN_ADMIN or HOSPITAL_ADMIN for own hospital)
exports.updateHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found.'
            });
        }

        // Check ownership if HOSPITAL_ADMIN
        if (req.user.role === 'HOSPITAL_ADMIN' && String(hospital.adminUserId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. You can only update your assigned hospital.'
            });
        }

        Object.assign(hospital, req.body);
        await hospital.save();

        await logAudit({
            req,
            action: 'UPDATE_HOSPITAL',
            resource: 'Hospital',
            resourceId: hospital._id
        });

        return res.json({
            success: true,
            message: 'Hospital details updated.',
            hospital
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating hospital: ' + error.message
        });
    }
};
