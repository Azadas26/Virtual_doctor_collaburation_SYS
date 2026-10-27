const User = require('../models/User');
const Patient = require('../models/Patient');
const TemporaryDoctorProfile = require('../models/TemporaryDoctorProfile');
const Hospital = require('../models/Hospital');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../utils/auditLogger');

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || 'e_health_bridge_super_secret_jwt_key_2026',
        { expiresIn: '30d' }
    );
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            contactNumber,
            // Additional fields based on role
            dateOfBirth,
            gender,
            address,
            medicalQualification,
            specialization,
            registrationNumber,
            registrationAuthority,
            yearsOfExperience,
            previousHospital,
            currentProfessionalStatus,
            // Hospital registration details if HOSPITAL_ADMIN registration
            hospitalName,
            hospitalRegNumber,
            hospitalAddress,
            district,
            state,
            pinCode,
            latitude,
            longitude,
            hospitalType,
            departments,
            superintendentName,
            superintendentEmail,
            superintendentPhone
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required registration fields (name, email, password, role).'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email address already exists.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let hospitalObj = null;

        // If registering as a Hospital Admin registering a new hospital
        if (role === 'HOSPITAL_ADMIN' && hospitalName) {
            const existingHospital = await Hospital.findOne({ registrationNumber: hospitalRegNumber });
            if (existingHospital) {
                return res.status(400).json({
                    success: false,
                    message: 'A hospital with this registration number already exists.'
                });
            }

            hospitalObj = new Hospital({
                name: hospitalName,
                registrationNumber: hospitalRegNumber || `GOVT-HOSP-${Date.now().toString().slice(-6)}`,
                address: hospitalAddress || address || 'Main Road',
                district: district || 'District Headquarters',
                state: state || 'Kerala',
                pinCode: pinCode || '695001',
                location: {
                    type: 'Point',
                    coordinates: [longitude ? parseFloat(longitude) : 76.9558, latitude ? parseFloat(latitude) : 8.5241]
                },
                contactNumber: contactNumber || '0471-2300000',
                email: email,
                hospitalType: hospitalType || 'Government District Hospital',
                departments: Array.isArray(departments) ? departments : ['General Medicine', 'Orthopedics', 'Pediatrics', 'General Surgery', 'Cardiology'],
                superintendentName: superintendentName || name,
                superintendentEmail: superintendentEmail || email,
                superintendentPhone: superintendentPhone || contactNumber || '0471-2300000',
                status: 'PENDING'
            });
            await hospitalObj.save();
        }

        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            contactNumber,
            hospitalId: hospitalObj ? hospitalObj._id : null
        });
        await user.save();

        if (hospitalObj) {
            hospitalObj.adminUserId = user._id;
            await hospitalObj.save();
        }

        // Role-specific profile creation
        if (role === 'PATIENT') {
            const patient = new Patient({
                userId: user._id,
                name,
                dateOfBirth: dateOfBirth || new Date('1990-01-01'),
                gender: gender || 'Male',
                contact: contactNumber || '',
                address: address || 'Not provided',
                emergencyContact: { name: '', relation: '', phone: '' }
            });
            await patient.save();
        } else if (role === 'TEMPORARY_DOCTOR') {
            const tempProfile = new TemporaryDoctorProfile({
                userId: user._id,
                doctorName: name,
                dateOfBirth: dateOfBirth || new Date('1985-05-15'),
                gender: gender || 'Male',
                contactNumber: contactNumber || '',
                email: email.toLowerCase(),
                address: address || 'District Headquarters, Kerala',
                currentLocation: {
                    type: 'Point',
                    coordinates: [longitude ? parseFloat(longitude) : 76.9558, latitude ? parseFloat(latitude) : 8.5241]
                },
                medicalQualification: medicalQualification || 'MBBS, MD',
                specialization: specialization || 'General Medicine',
                registrationNumber: registrationNumber || `MCI-TEMP-${Date.now().toString().slice(-6)}`,
                registrationAuthority: registrationAuthority || 'State Medical Council',
                yearsOfExperience: yearsOfExperience || 5,
                previousHospital: previousHospital || 'Government Medical College Hospital',
                currentProfessionalStatus: currentProfessionalStatus || 'Freelance',
                verificationStatus: 'PENDING'
            });
            await tempProfile.save();
        }

        await logAudit({
            req,
            userId: user._id,
            userName: user.name,
            role: user.role,
            action: 'REGISTER_USER',
            resource: 'User',
            resourceId: user._id,
            details: { role: user.role }
        });

        const token = generateToken(user._id);

        // Return hospital approval status so the frontend can gate access immediately
        const hospitalStatus = hospitalObj ? hospitalObj.status : null;

        return res.status(201).json({
            success: true,
            message: 'Registration successful!' + (hospitalStatus === 'PENDING' ? ' Your hospital registration is pending admin approval.' : ''),
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hospitalId: user.hospitalId
            },
            hospitalStatus
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration: ' + error.message
        });
    }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email address or password.'
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended by the Main Administrator.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email address or password.'
            });
        }

        const token = generateToken(user._id);

        await logAudit({
            req,
            userId: user._id,
            userName: user.name,
            role: user.role,
            action: 'LOGIN_USER',
            resource: 'User',
            resourceId: user._id
        });

        // For HOSPITAL_ADMIN, fetch hospital status so frontend can gate portal access
        let hospitalStatus = null;
        if (user.role === 'HOSPITAL_ADMIN') {
            const hosp = await Hospital.findOne({ adminUserId: user._id }).select('status');
            hospitalStatus = hosp ? hosp.status : null;
        }

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hospitalId: user.hospitalId
            },
            hospitalStatus
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during login: ' + error.message
        });
    }
};

// @desc Get current user details & role profile
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        let profile = null;
        let hospital = null;

        if (user.role === 'PATIENT') {
            profile = await Patient.findOne({ userId: user._id });
        } else if (user.role === 'TEMPORARY_DOCTOR') {
            profile = await TemporaryDoctorProfile.findOne({ userId: user._id });
        } else if (user.role === 'HOSPITAL_ADMIN') {
            hospital = await Hospital.findOne({ adminUserId: user._id });
        } else if (user.role === 'FIXED_DOCTOR') {
            hospital = await Hospital.findById(user.hospitalId);
        }

        return res.json({
            success: true,
            user,
            profile,
            hospital,
            hospitalStatus: hospital ? hospital.status : null
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching user profile: ' + error.message
        });
    }
};
