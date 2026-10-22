const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');
const TemporaryDoctorProfile = require('./models/TemporaryDoctorProfile');
const HospitalDoctorRequirement = require('./models/HospitalDoctorRequirement');
const TemporaryDoctorRequest = require('./models/TemporaryDoctorRequest');
const TemporaryContract = require('./models/TemporaryContract');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Queue = require('./models/Queue');
const Consultation = require('./models/Consultation');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');

const seedDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_health_bridge';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for Seeding...');

        // Clear existing collections
        await User.deleteMany({});
        await Hospital.deleteMany({});
        await Doctor.deleteMany({});
        await TemporaryDoctorProfile.deleteMany({});
        await HospitalDoctorRequirement.deleteMany({});
        await TemporaryDoctorRequest.deleteMany({});
        await TemporaryContract.deleteMany({});
        await Patient.deleteMany({});
        await Appointment.deleteMany({});
        await Queue.deleteMany({});
        await Consultation.deleteMany({});
        await Notification.deleteMany({});
        await AuditLog.deleteMany({});

        console.log('Cleared existing database records.');

        const defaultPassword = await bcrypt.hash('password123', 10);
        const adminPassword = await bcrypt.hash('admin123', 10);

        // 1. Create Main Admin User
        const mainAdminUser = await User.create({
            name: 'Dr. A. K. Sharma (Director of Health Services)',
            email: 'admin@ehealthbridge.gov.in',
            password: adminPassword,
            role: 'MAIN_ADMIN',
            contactNumber: '0471-2300001'
        });
        console.log('Created Main Admin:', mainAdminUser.email);

        // 2. Create Hospital Admin Users
        const tvmAdminUser = await User.create({
            name: 'Dr. Suresh Kumar (Superintendent)',
            email: 'tvm.admin@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'HOSPITAL_ADMIN',
            contactNumber: '0471-2300100'
        });

        const ekmAdminUser = await User.create({
            name: 'Dr. Reena Joseph (Superintendent)',
            email: 'ekm.admin@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'HOSPITAL_ADMIN',
            contactNumber: '0484-2300200'
        });

        const cltAdminUser = await User.create({
            name: 'Dr. Mohammed Rafeeq (Superintendent)',
            email: 'clt.admin@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'HOSPITAL_ADMIN',
            contactNumber: '0495-2300300'
        });

        // 3. Create 3 Government Hospitals
        const tvmHospital = await Hospital.create({
            name: 'Trivandrum Government General Hospital',
            registrationNumber: 'GOVT-HOSP-KL-001',
            address: 'Vanchiyoor, Thiruvananthapuram',
            district: 'Thiruvananthapuram',
            state: 'Kerala',
            pinCode: '695035',
            location: { type: 'Point', coordinates: [76.9438, 8.4901] },
            contactNumber: '0471-2300100',
            email: 'tvm.hospital@kerala.gov.in',
            hospitalType: 'Government District Hospital',
            departments: ['General Medicine', 'Orthopedics', 'Pediatrics', 'General Surgery', 'Cardiology'],
            availableFacilities: ['24x7 Emergency', 'OPD Clinic', 'Blood Bank', 'Digital X-Ray', 'CT Scan', 'Pathology Lab'],
            workingHours: '08:00 AM - 04:00 PM',
            emergencyAvailability: true,
            superintendentName: tvmAdminUser.name,
            superintendentEmail: tvmAdminUser.email,
            superintendentPhone: tvmAdminUser.contactNumber,
            status: 'APPROVED',
            adminUserId: tvmAdminUser._id
        });

        tvmAdminUser.hospitalId = tvmHospital._id;
        await tvmAdminUser.save();

        const ekmHospital = await Hospital.create({
            name: 'Ernakulam Government General Hospital',
            registrationNumber: 'GOVT-HOSP-KL-002',
            address: 'Hospital Road, Marine Drive, Kochi',
            district: 'Ernakulam',
            state: 'Kerala',
            pinCode: '682011',
            location: { type: 'Point', coordinates: [76.2816, 9.9716] },
            contactNumber: '0484-2300200',
            email: 'ekm.hospital@kerala.gov.in',
            hospitalType: 'Government General Hospital',
            departments: ['General Medicine', 'Dermatology', 'Pediatrics', 'Orthopedics', 'ENT'],
            availableFacilities: ['24x7 Emergency', 'OPD', 'ICU', 'UltraSound', 'Dialysis Unit'],
            workingHours: '08:00 AM - 05:00 PM',
            emergencyAvailability: true,
            superintendentName: ekmAdminUser.name,
            superintendentEmail: ekmAdminUser.email,
            superintendentPhone: ekmAdminUser.contactNumber,
            status: 'APPROVED',
            adminUserId: ekmAdminUser._id
        });

        ekmAdminUser.hospitalId = ekmHospital._id;
        await ekmAdminUser.save();

        const cltHospital = await Hospital.create({
            name: 'Kozhikode District Government Hospital',
            registrationNumber: 'GOVT-HOSP-KL-003',
            address: 'Beach Road, Kozhikode',
            district: 'Kozhikode',
            state: 'Kerala',
            pinCode: '673001',
            location: { type: 'Point', coordinates: [75.7704, 11.2488] },
            contactNumber: '0495-2300300',
            email: 'clt.hospital@kerala.gov.in',
            hospitalType: 'Government District Hospital',
            departments: ['General Medicine', 'Pulmonology', 'Pediatrics', 'Psychiatry', 'General Surgery'],
            availableFacilities: ['24x7 Emergency', 'OPD Clinic', 'Surgical Theatre', 'Lab Services'],
            workingHours: '08:00 AM - 04:00 PM',
            emergencyAvailability: true,
            superintendentName: cltAdminUser.name,
            superintendentEmail: cltAdminUser.email,
            superintendentPhone: cltAdminUser.contactNumber,
            status: 'APPROVED',
            adminUserId: cltAdminUser._id
        });

        cltAdminUser.hospitalId = cltHospital._id;
        await cltAdminUser.save();

        console.log('Created 3 Government Hospitals.');

        // 4. Create Fixed/Permanent Doctors
        const fixedDoc1User = await User.create({
            name: 'Dr. Radhakrishnan V.',
            email: 'doc.radhakrishnan@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'FIXED_DOCTOR',
            contactNumber: '9847000001',
            hospitalId: tvmHospital._id
        });

        const fixedDoc1 = await Doctor.create({
            userId: fixedDoc1User._id,
            hospitalId: tvmHospital._id,
            doctorName: fixedDoc1User.name,
            registrationNumber: 'MCI-KL-12044',
            specialization: 'General Medicine',
            department: 'General Medicine',
            qualification: 'MBBS, MD (General Medicine)',
            contactInfo: '9847000001',
            email: fixedDoc1User.email,
            doctorType: 'FIXED',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            workingHours: { start: '09:00 AM', end: '01:00 PM' },
            consultationCapacity: 35,
            avgConsultationTimeMinutes: 12,
            status: 'ACTIVE'
        });

        const fixedDoc2User = await User.create({
            name: 'Dr. Priya Nambiar',
            email: 'doc.priya@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'FIXED_DOCTOR',
            contactNumber: '9847000002',
            hospitalId: tvmHospital._id
        });

        const fixedDoc2 = await Doctor.create({
            userId: fixedDoc2User._id,
            hospitalId: tvmHospital._id,
            doctorName: fixedDoc2User.name,
            registrationNumber: 'MCI-KL-18921',
            specialization: 'Orthopedics',
            department: 'Orthopedics',
            qualification: 'MBBS, MS (Orthopedics)',
            contactInfo: '9847000002',
            email: fixedDoc2User.email,
            doctorType: 'FIXED',
            workingDays: ['Monday', 'Wednesday', 'Friday'],
            workingHours: { start: '09:00 AM', end: '01:00 PM' },
            consultationCapacity: 25,
            avgConsultationTimeMinutes: 15,
            status: 'ACTIVE'
        });

        const fixedDoc3User = await User.create({
            name: 'Dr. George Thomas',
            email: 'doc.george@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'FIXED_DOCTOR',
            contactNumber: '9847000003',
            hospitalId: ekmHospital._id
        });

        const fixedDoc3 = await Doctor.create({
            userId: fixedDoc3User._id,
            hospitalId: ekmHospital._id,
            doctorName: fixedDoc3User.name,
            registrationNumber: 'MCI-KL-22109',
            specialization: 'Pediatrics',
            department: 'Pediatrics',
            qualification: 'MBBS, DCH, MD (Pediatrics)',
            contactInfo: '9847000003',
            email: fixedDoc3User.email,
            doctorType: 'FIXED',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            workingHours: { start: '09:00 AM', end: '01:00 PM' },
            consultationCapacity: 30,
            avgConsultationTimeMinutes: 10,
            status: 'ACTIVE'
        });

        const fixedDoc4User = await User.create({
            name: 'Dr. Fatima Zahra',
            email: 'doc.fatima@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'FIXED_DOCTOR',
            contactNumber: '9847000004',
            hospitalId: cltHospital._id
        });

        const fixedDoc4 = await Doctor.create({
            userId: fixedDoc4User._id,
            hospitalId: cltHospital._id,
            doctorName: fixedDoc4User.name,
            registrationNumber: 'MCI-KL-25418',
            specialization: 'Pulmonology',
            department: 'Pulmonology',
            qualification: 'MBBS, MD (Pulmonary Medicine)',
            contactInfo: '9847000004',
            email: fixedDoc4User.email,
            doctorType: 'FIXED',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            workingHours: { start: '09:00 AM', end: '01:00 PM' },
            consultationCapacity: 28,
            avgConsultationTimeMinutes: 12,
            status: 'ACTIVE'
        });

        console.log('Created Fixed Doctors across 3 Government Hospitals.');

        // 5. Create Voluntary Temporary Doctors
        // 5.1 Dr. Jacob Mathew (Retired HOD - Verified, Active Contract)
        const tempDoc1User = await User.create({
            name: 'Dr. Jacob Mathew (Retired Senior Physician)',
            email: 'temp.jacob@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'TEMPORARY_DOCTOR',
            contactNumber: '9895000001'
        });

        const tempDoc1Profile = await TemporaryDoctorProfile.create({
            userId: tempDoc1User._id,
            doctorName: tempDoc1User.name,
            dateOfBirth: new Date('1960-04-12'),
            gender: 'Male',
            contactNumber: '9895000001',
            email: tempDoc1User.email,
            address: 'Pattom, Thiruvananthapuram',
            currentLocation: { type: 'Point', coordinates: [76.9480, 8.5200] },
            medicalQualification: 'MBBS, MD, FRCP (General Medicine)',
            specialization: 'General Medicine',
            registrationNumber: 'MCI-KL-08712',
            registrationAuthority: 'Travancore-Cochin Medical Council',
            yearsOfExperience: 32,
            previousHospital: 'Government Medical College Thiruvananthapuram (Ex-HOD)',
            currentProfessionalStatus: 'Retired',
            verificationStatus: 'VERIFIED',
            verificationNotes: 'Retired Professor & HOD. Credentials verified by Superintendent.',
            verifiedByHospitalAdminId: tvmAdminUser._id,
            verifiedAt: new Date(),
            reliabilityRating: 5.0,
            completedContractsCount: 4,
            verificationDocuments: [{
                documentType: 'Medical Registration Certificate',
                fileUrl: '/uploads/sample_mci_cert.pdf',
                uploadedAt: new Date()
            }]
        });

        // 5.2 Dr. Ananya Nair (Freelance Specialist - Verified, Available for Contract)
        const tempDoc2User = await User.create({
            name: 'Dr. Ananya Nair (Freelance Specialist)',
            email: 'temp.ananya@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'TEMPORARY_DOCTOR',
            contactNumber: '9895000002'
        });

        const tempDoc2Profile = await TemporaryDoctorProfile.create({
            userId: tempDoc2User._id,
            doctorName: tempDoc2User.name,
            dateOfBirth: new Date('1988-09-21'),
            gender: 'Female',
            contactNumber: '9895000002',
            email: tempDoc2User.email,
            address: 'Kaloor, Ernakulam',
            currentLocation: { type: 'Point', coordinates: [76.2950, 9.9900] },
            medicalQualification: 'MBBS, DNB (General Medicine)',
            specialization: 'General Medicine',
            registrationNumber: 'MCI-KL-34102',
            registrationAuthority: 'Travancore-Cochin Medical Council',
            yearsOfExperience: 9,
            previousHospital: 'Private Healthcare Consultant',
            currentProfessionalStatus: 'Freelance',
            verificationStatus: 'VERIFIED',
            verificationNotes: 'Verified physician willing to support morning OP crowds.',
            verifiedByHospitalAdminId: ekmAdminUser._id,
            verifiedAt: new Date(),
            reliabilityRating: 4.8,
            completedContractsCount: 2,
            verificationDocuments: [{
                documentType: 'Degree Certificate',
                fileUrl: '/uploads/sample_degree.pdf',
                uploadedAt: new Date()
            }]
        });

        // 5.3 Dr. Kavita Menon (PENDING Verification - Applicant for Hospital Admin review)
        const tempDoc3User = await User.create({
            name: 'Dr. Kavita Menon (Community Physician)',
            email: 'temp.kavita@ehealthbridge.gov.in',
            password: defaultPassword,
            role: 'TEMPORARY_DOCTOR',
            contactNumber: '9895000003'
        });

        const tempDoc3Profile = await TemporaryDoctorProfile.create({
            userId: tempDoc3User._id,
            doctorName: tempDoc3User.name,
            dateOfBirth: new Date('1982-01-15'),
            gender: 'Female',
            contactNumber: '9895000003',
            email: tempDoc3User.email,
            address: 'Mananchira, Kozhikode',
            currentLocation: { type: 'Point', coordinates: [75.7804, 11.2588] },
            medicalQualification: 'MBBS, MD (Pulmonology)',
            specialization: 'Pulmonology',
            registrationNumber: 'MCI-KL-40915',
            registrationAuthority: 'Travancore-Cochin Medical Council',
            yearsOfExperience: 14,
            previousHospital: 'District TB & Chest Clinic, Kozhikode',
            currentProfessionalStatus: 'Part-time Available',
            verificationStatus: 'PENDING',
            verificationNotes: '',
            reliabilityRating: 5.0,
            completedContractsCount: 0,
            verificationDocuments: [{
                documentType: 'Medical Registration Certificate',
                fileUrl: '/uploads/sample_mci_cert_kavita.pdf',
                uploadedAt: new Date()
            }, {
                documentType: 'Experience Certificate',
                fileUrl: '/uploads/sample_exp_cert_kavita.pdf',
                uploadedAt: new Date()
            }]
        });

        console.log('Created Temporary Doctors (Verified + Pending Verification).');

        // 6. Hospital Doctor Requirements
        const req1 = await HospitalDoctorRequirement.create({
            hospitalId: tvmHospital._id,
            department: 'General Medicine',
            specialization: 'General Medicine',
            requiredDate: new Date(),
            startTime: '09:00 AM',
            endTime: '01:00 PM',
            requiredDoctorsCount: 2,
            filledDoctorsCount: 1,
            expectedPatientCapacity: 40,
            reason: 'Extreme Monday OP crowding in General Medicine block',
            status: 'OPEN'
        });

        const req2 = await HospitalDoctorRequirement.create({
            hospitalId: ekmHospital._id,
            department: 'General Medicine',
            specialization: 'General Medicine',
            requiredDate: new Date(),
            startTime: '09:00 AM',
            endTime: '01:00 PM',
            requiredDoctorsCount: 1,
            filledDoctorsCount: 0,
            expectedPatientCapacity: 30,
            reason: 'Permanent medical officer on deputation training',
            status: 'OPEN'
        });

        const req3 = await HospitalDoctorRequirement.create({
            hospitalId: cltHospital._id,
            department: 'Pulmonology',
            specialization: 'Pulmonology',
            requiredDate: new Date(),
            startTime: '09:00 AM',
            endTime: '01:00 PM',
            requiredDoctorsCount: 1,
            filledDoctorsCount: 0,
            expectedPatientCapacity: 25,
            reason: 'Seasonal asthma and allergic bronchitis clinic surge',
            status: 'OPEN'
        });

        console.log('Created Hospital Doctor Requirements across hospitals.');

        // 7. Temporary Doctor Interest Requests & Active Contract
        // 7.1 Accepted Contract for Dr. Jacob Mathew at TVM Hospital
        const request1 = await TemporaryDoctorRequest.create({
            doctorId: tempDoc1User._id,
            tempProfileId: tempDoc1Profile._id,
            hospitalId: tvmHospital._id,
            requirementId: req1._id,
            specialization: 'General Medicine',
            requestedStartDate: new Date(),
            requestedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            availableDays: ['Monday', 'Wednesday', 'Friday'],
            availableStartTime: '09:00 AM',
            availableEndTime: '01:00 PM',
            totalHours: 24,
            consultationCapacity: 30,
            message: 'Happy to voluntarily support General Medicine OP clinic 3 days a week.',
            status: 'CONTRACT_ACCEPTED'
        });

        const contract1 = await TemporaryContract.create({
            contractNumber: 'EHB-CNT-2026-9001',
            requestId: request1._id,
            doctorId: tempDoc1User._id,
            tempProfileId: tempDoc1Profile._id,
            hospitalId: tvmHospital._id,
            doctorName: tempDoc1Profile.doctorName,
            doctorRegistrationNumber: tempDoc1Profile.registrationNumber,
            hospitalName: tvmHospital.name,
            hospitalAddress: tvmHospital.address,
            specialization: 'General Medicine',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            workingDays: ['Monday', 'Wednesday', 'Friday'],
            workingHours: '09:00 AM - 01:00 PM',
            totalExpectedHours: 24,
            noticePeriod: '24 Hours',
            status: 'ACTIVE',
            acceptedAt: new Date()
        });

        // Create Active Temporary Doctor assigned to TVM Hospital
        const tempDoc1ActiveDoctor = await Doctor.create({
            userId: tempDoc1User._id,
            hospitalId: tvmHospital._id,
            doctorName: tempDoc1Profile.doctorName,
            registrationNumber: tempDoc1Profile.registrationNumber,
            specialization: 'General Medicine',
            department: 'General Medicine',
            qualification: tempDoc1Profile.medicalQualification,
            contactInfo: tempDoc1Profile.contactNumber,
            email: tempDoc1User.email,
            doctorType: 'TEMPORARY',
            workingDays: ['Monday', 'Wednesday', 'Friday'],
            workingHours: { start: '09:00 AM', end: '01:00 PM' },
            consultationCapacity: 25,
            avgConsultationTimeMinutes: 12,
            status: 'ACTIVE',
            activeContractId: contract1._id
        });

        // 7.2 Pending Volunteer Request from Dr. Ananya Nair to Ernakulam Hospital
        await TemporaryDoctorRequest.create({
            doctorId: tempDoc2User._id,
            tempProfileId: tempDoc2Profile._id,
            hospitalId: ekmHospital._id,
            requirementId: req2._id,
            specialization: 'General Medicine',
            requestedStartDate: new Date(),
            requestedEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            availableDays: ['Tuesday', 'Thursday', 'Saturday'],
            availableStartTime: '09:00 AM',
            availableEndTime: '01:00 PM',
            totalHours: 16,
            consultationCapacity: 25,
            message: 'Available to assist with morning outpatient consultations at Ernakulam General Hospital.',
            status: 'PENDING'
        });

        console.log('Created Active Contract for TVM and Pending Volunteer Request for EKM.');

        // 8. Create Patient Users & Profiles
        const patientUser1 = await User.create({
            name: 'Ramesh Nair',
            email: 'patient.ramesh@gmail.com',
            password: defaultPassword,
            role: 'PATIENT',
            contactNumber: '9447100001'
        });

        const patient1 = await Patient.create({
            userId: patientUser1._id,
            name: patientUser1.name,
            dateOfBirth: new Date('1975-06-20'),
            gender: 'Male',
            contact: '9447100001',
            address: 'PTP Nagar, Thiruvananthapuram',
            emergencyContact: { name: 'Sunitha Nair', relation: 'Wife', phone: '9447100002' },
            medicalHistory: 'Hypertension diagnosed 2020',
            allergies: 'Penicillin allergy',
            existingConditions: 'Hypertension'
        });

        const patientUser2 = await User.create({
            name: 'Anitha Varma',
            email: 'patient.anitha@gmail.com',
            password: defaultPassword,
            role: 'PATIENT',
            contactNumber: '9447100003'
        });

        const patient2 = await Patient.create({
            userId: patientUser2._id,
            name: patientUser2.name,
            dateOfBirth: new Date('1992-11-14'),
            gender: 'Female',
            contact: '9447100003',
            address: 'Statue Junction, Thiruvananthapuram',
            emergencyContact: { name: 'Vipin Varma', relation: 'Brother', phone: '9447100004' },
            medicalHistory: 'Mild intermittent seasonal allergies',
            allergies: 'Dust allergy',
            existingConditions: 'Allergic Rhinitis'
        });

        const patientUser3 = await User.create({
            name: 'Rahul Pillai',
            email: 'patient.rahul@gmail.com',
            password: defaultPassword,
            role: 'PATIENT',
            contactNumber: '9447100005'
        });

        const patient3 = await Patient.create({
            userId: patientUser3._id,
            name: patientUser3.name,
            dateOfBirth: new Date('1985-03-10'),
            gender: 'Male',
            contact: '9447100005',
            address: 'Kowdiar, Thiruvananthapuram',
            emergencyContact: { name: 'Deepa Pillai', relation: 'Spouse', phone: '9447100006' },
            medicalHistory: 'Seasonal bronchitis',
            allergies: 'Sulfa drugs',
            existingConditions: 'Bronchial asthma'
        });

        const patientUser4 = await User.create({
            name: 'Meera Krishnan',
            email: 'patient.meera@gmail.com',
            password: defaultPassword,
            role: 'PATIENT',
            contactNumber: '9447100007'
        });

        const patient4 = await Patient.create({
            userId: patientUser4._id,
            name: patientUser4.name,
            dateOfBirth: new Date('1958-08-19'),
            gender: 'Female',
            contact: '9447100007',
            address: 'Sasthamangalam, Thiruvananthapuram',
            emergencyContact: { name: 'Gopalan Nair', relation: 'Husband', phone: '9447100008' },
            medicalHistory: 'Type 2 Diabetes Mellitus (12 yrs), Ischemic Heart Disease',
            allergies: 'None known',
            existingConditions: 'Diabetes & Cardiac history'
        });

        console.log('Created 4 Demo Patients with comprehensive medical backgrounds.');

        // 9. Appointments, Consultations & Live Queues
        const todayStr = new Date().toISOString().split('T')[0];

        // 9.1 Completed Consultation earlier today: Rahul Pillai with Dr. Jacob Mathew (Temporary Doctor)
        const apptPastToday = await Appointment.create({
            appointmentNumber: `EHB-APT-${todayStr.replace(/-/g, '')}-1000`,
            patientId: patient3._id,
            userId: patientUser3._id,
            hospitalId: tvmHospital._id,
            department: 'General Medicine',
            doctorId: tempDoc1ActiveDoctor._id,
            doctorType: 'TEMPORARY',
            appointmentDate: new Date(),
            timeSlot: '09:00 AM (Slot #1)',
            symptoms: 'Acute productive cough with yellowish phlegm and episodic wheezing',
            symptomDuration: '4 days',
            existingConditions: patient3.existingConditions,
            allergies: patient3.allergies,
            priorityCategory: 'NORMAL',
            isEmergencyWarningShown: false,
            allocationReason: [
                'Normal priority symptom classification',
                'Allocated to voluntary Temporary Doctor (Dr. Jacob Mathew) to relieve peak morning OP crowding'
            ],
            queuePosition: 1,
            estimatedWaitTimeMinutes: 0,
            status: 'COMPLETED'
        });

        await Consultation.create({
            appointmentId: apptPastToday._id,
            patientId: patient3._id,
            doctorId: tempDoc1ActiveDoctor._id,
            doctorUserId: tempDoc1User._id,
            hospitalId: tvmHospital._id,
            consultationDate: new Date(),
            clinicalNotes: 'Patient presented with acute seasonal bronchitis with episodic wheezing for 4 days. Non-smoker, no hemoptysis. Chest bilateral lower zone rhonchi noted.',
            observations: 'Temp: 99.2 F, SpO2: 97% on room air, Pulse: 82 bpm, BP: 126/82 mmHg. Systemic examination otherwise unremarkable.',
            medications: [
                { name: 'Amoxicillin + Clavulanic Acid (Augmentin)', dosage: '625mg', frequency: '1-0-1 after food', duration: '5 days' },
                { name: 'Montelukast + Levocetirizine (Montair LC)', dosage: '10mg', frequency: '0-0-1 at bedtime', duration: '10 days' },
                { name: 'Salbutamol Inhaler (Asthalin 100mcg)', dosage: '2 puffs', frequency: 'SOS (as needed)', duration: '14 days' }
            ],
            investigations: [
                { testType: 'LAB', testName: 'Complete Blood Count (CBC) with ESR', notes: 'Evaluate inflammatory markers' },
                { testType: 'XRAY', testName: 'Chest X-Ray PA View', notes: 'Rule out pneumonia/consolidation' }
            ],
            followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            referralInfo: 'Review in Pulmonology OPD if breathlessness worsens or persists after 5 days.',
            status: 'COMPLETED'
        });

        // 9.2 Completed Consultation for Ramesh Nair from 2 weeks ago (gives rich medical history!)
        const pastDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const pastDateStr = pastDate.toISOString().split('T')[0];
        const apptPast2Weeks = await Appointment.create({
            appointmentNumber: `EHB-APT-${pastDateStr.replace(/-/g, '')}-0942`,
            patientId: patient1._id,
            userId: patientUser1._id,
            hospitalId: tvmHospital._id,
            department: 'General Medicine',
            doctorId: fixedDoc1._id,
            doctorType: 'FIXED',
            appointmentDate: pastDate,
            timeSlot: '10:00 AM (Slot #2)',
            symptoms: 'Routine hypertension follow-up and occasional morning headache',
            symptomDuration: '1 week',
            existingConditions: patient1.existingConditions,
            allergies: patient1.allergies,
            priorityCategory: 'NORMAL',
            isEmergencyWarningShown: false,
            allocationReason: [
                'Normal routine follow-up',
                'Consultation with primary permanent physician'
            ],
            queuePosition: 1,
            estimatedWaitTimeMinutes: 0,
            status: 'COMPLETED'
        });

        await Consultation.create({
            appointmentId: apptPast2Weeks._id,
            patientId: patient1._id,
            doctorId: fixedDoc1._id,
            doctorUserId: fixedDoc1User._id,
            hospitalId: tvmHospital._id,
            consultationDate: pastDate,
            clinicalNotes: 'Hypertension follow-up. Blood pressure slightly elevated at 138/88 mmHg. Advised reduction in dietary sodium, avoidance of salted snacks, and regular 40-minute brisk walk daily.',
            observations: 'BP: 138/88 mmHg, Pulse: 74 bpm, Heart sounds regular, no pedal edema.',
            medications: [
                { name: 'Telmisartan Tablets', dosage: '40mg', frequency: '1-0-0 morning after breakfast', duration: '30 days' },
                { name: 'Amlodipine Tablets', dosage: '5mg', frequency: '0-0-1 bedtime', duration: '30 days' }
            ],
            investigations: [
                { testType: 'LAB', testName: 'Serum Electrolytes & Renal Function Test (RFT)', notes: 'Annual hypertensive workup' },
                { testType: 'LAB', testName: 'Lipid Profile (Fasting)', notes: 'Cardiovascular risk screening' }
            ],
            followUpDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
            referralInfo: 'Continue regular lifestyle modifications and maintain daily home BP chart.',
            status: 'COMPLETED'
        });

        // 9.3 Active Live Appointment 1: Ramesh Nair with Voluntary Temp Doctor (Dr. Jacob) -> IN_CONSULTATION
        const appt1 = await Appointment.create({
            appointmentNumber: `EHB-APT-${todayStr.replace(/-/g, '')}-1001`,
            patientId: patient1._id,
            userId: patientUser1._id,
            hospitalId: tvmHospital._id,
            department: 'General Medicine',
            doctorId: tempDoc1ActiveDoctor._id,
            doctorType: 'TEMPORARY',
            appointmentDate: new Date(),
            timeSlot: '09:30 AM (Slot #2)',
            symptoms: 'Mild fever and persistent dry cough for 3 days',
            symptomDuration: '3 days',
            existingConditions: patient1.existingConditions,
            allergies: patient1.allergies,
            priorityCategory: 'NORMAL',
            isEmergencyWarningShown: false,
            allocationReason: [
                'Normal priority symptom classification',
                'Dynamic capacity sharing enabled: allocated to verified voluntary Temporary Doctor (Dr. Jacob Mathew) to reduce hospital OP crowding'
            ],
            queuePosition: 1,
            estimatedWaitTimeMinutes: 10,
            status: 'IN_CONSULTATION'
        });

        // 9.4 Active Live Appointment 2: Anitha Varma with Fixed Doctor (Dr. Radhakrishnan) -> WAITING
        const appt2 = await Appointment.create({
            appointmentNumber: `EHB-APT-${todayStr.replace(/-/g, '')}-1002`,
            patientId: patient2._id,
            userId: patientUser2._id,
            hospitalId: tvmHospital._id,
            department: 'General Medicine',
            doctorId: fixedDoc1._id,
            doctorType: 'FIXED',
            appointmentDate: new Date(),
            timeSlot: '09:45 AM (Slot #1)',
            symptoms: 'High fever 102F with shivering, sneezing and body ache',
            symptomDuration: '2 days',
            existingConditions: patient2.existingConditions,
            allergies: patient2.allergies,
            priorityCategory: 'NORMAL',
            isEmergencyWarningShown: false,
            allocationReason: [
                'Symptom assessment indicates acute viral febrile illness',
                'Assigned to permanent General Medicine unit queue'
            ],
            queuePosition: 1,
            estimatedWaitTimeMinutes: 12,
            status: 'WAITING'
        });

        // 9.5 Active Live Appointment 3: Meera Krishnan with Fixed Doctor (Dr. Radhakrishnan) -> WAITING (HIGH PRIORITY)
        const appt3 = await Appointment.create({
            appointmentNumber: `EHB-APT-${todayStr.replace(/-/g, '')}-1003`,
            patientId: patient4._id,
            userId: patientUser4._id,
            hospitalId: tvmHospital._id,
            department: 'General Medicine',
            doctorId: fixedDoc1._id,
            doctorType: 'FIXED',
            appointmentDate: new Date(),
            timeSlot: '10:00 AM (Slot #2)',
            symptoms: 'Moderate retrosternal tightness and fatigue with elevated fasting glucose',
            symptomDuration: '1 day',
            existingConditions: patient4.existingConditions,
            allergies: patient4.allergies,
            priorityCategory: 'HIGH',
            isEmergencyWarningShown: false,
            allocationReason: [
                'High priority triage: Pre-existing ischemic heart disease with new onset retrosternal chest tightness',
                'Fast-tracked directly to Senior Hospital Physician queue'
            ],
            queuePosition: 2,
            estimatedWaitTimeMinutes: 20,
            status: 'WAITING'
        });

        // Initialize Live Queues for Doctors today
        await Queue.create({
            hospitalId: tvmHospital._id,
            doctorId: tempDoc1ActiveDoctor._id,
            date: todayStr,
            currentAppointmentId: appt1._id,
            waitingList: [],
            completedList: [apptPastToday._id],
            totalCount: 2
        });

        await Queue.create({
            hospitalId: tvmHospital._id,
            doctorId: fixedDoc1._id,
            date: todayStr,
            currentAppointmentId: null,
            waitingList: [appt2._id, appt3._id],
            completedList: [],
            totalCount: 2
        });

        console.log('Created Completed Consultations, Live Prescriptions, and Real-time Queues.');

        // 10. Notifications across all user roles
        await Notification.create({
            userId: mainAdminUser._id,
            title: 'New Temporary Doctor Registration',
            message: 'Dr. Kavita Menon (Pulmonology) has submitted her credentials for voluntary collaboration. Pending hospital verification.',
            type: 'VERIFICATION'
        });

        await Notification.create({
            userId: tvmAdminUser._id,
            title: 'Dynamic Capacity Sharing Active',
            message: 'Dr. Jacob Mathew (General Medicine) has accepted service contract EHB-CNT-2026-9001 and is consulting OP patients in Room #3.',
            type: 'CONTRACT'
        });

        await Notification.create({
            userId: ekmAdminUser._id,
            title: 'New Volunteer Application Received',
            message: 'Dr. Ananya Nair has submitted an interest request for General Medicine requirement (Morning Surge).',
            type: 'INTEREST_REQUEST'
        });

        await Notification.create({
            userId: fixedDoc1User._id,
            title: 'Queue Alert: High Priority Patient Added',
            message: 'Patient Meera Krishnan (Token #2) has been categorized as HIGH PRIORITY due to pre-existing cardiac history.',
            type: 'APPOINTMENT'
        });

        await Notification.create({
            userId: tempDoc1User._id,
            title: 'Active Service Schedule',
            message: 'Your voluntary OPD schedule at Trivandrum General Hospital is active today from 09:00 AM to 01:00 PM.',
            type: 'CONTRACT'
        });

        await Notification.create({
            userId: patientUser1._id,
            title: 'Token #1 Called for Consultation',
            message: 'Dr. Jacob Mathew has initiated your consultation. Please proceed to Consultation Room #3.',
            type: 'APPOINTMENT'
        });

        // 11. System Audit Logs
        await AuditLog.create({
            userId: mainAdminUser._id,
            userName: mainAdminUser.name,
            role: 'MAIN_ADMIN',
            action: 'INITIALIZE_SYSTEM',
            resource: 'System',
            details: { message: 'Initialized e-Health Bridge multi-hospital doctor collaboration network.' }
        });

        await AuditLog.create({
            userId: tvmAdminUser._id,
            userName: tvmAdminUser.name,
            role: 'HOSPITAL_ADMIN',
            action: 'VERIFY_DOCTOR_VERIFIED',
            resource: 'TemporaryDoctorProfile',
            resourceId: tempDoc1Profile._id,
            details: { doctorName: tempDoc1Profile.doctorName, status: 'VERIFIED' }
        });

        await AuditLog.create({
            userId: tvmAdminUser._id,
            userName: tvmAdminUser.name,
            role: 'HOSPITAL_ADMIN',
            action: 'GENERATE_CONTRACT',
            resource: 'TemporaryContract',
            resourceId: contract1._id,
            details: { contractNumber: contract1.contractNumber, hospital: tvmHospital.name }
        });

        await AuditLog.create({
            userId: tempDoc1User._id,
            userName: tempDoc1User.name,
            role: 'TEMPORARY_DOCTOR',
            action: 'ACCEPT_CONTRACT',
            resource: 'TemporaryContract',
            resourceId: contract1._id,
            details: { contractNumber: contract1.contractNumber }
        });

        await AuditLog.create({
            userId: tempDoc1User._id,
            userName: tempDoc1User.name,
            role: 'TEMPORARY_DOCTOR',
            action: 'COMPLETE_CONSULTATION',
            resource: 'Consultation',
            details: { appointmentNumber: apptPastToday.appointmentNumber, patientName: patient3.name }
        });

        console.log('========================================================================');
        console.log('   e-HEALTH BRIDGE DATABASE SAMPLE CONTENTS SEEDED SUCCESSFULLY!       ');
        console.log('========================================================================');
        console.log(' TEST ACCOUNTS:');
        console.log(' 1. Main Admin:      admin@ehealthbridge.gov.in        | admin123');
        console.log(' 2. TVM Hosp Admin:  tvm.admin@ehealthbridge.gov.in    | password123');
        console.log(' 3. EKM Hosp Admin:  ekm.admin@ehealthbridge.gov.in    | password123');
        console.log(' 4. CLT Hosp Admin:  clt.admin@ehealthbridge.gov.in    | password123');
        console.log(' 5. Fixed Doctor:    doc.radhakrishnan@ehealthbridge.gov.in | password123');
        console.log(' 6. Temp Doctor:     temp.jacob@ehealthbridge.gov.in   | password123 (Active Contract)');
        console.log(' 7. Temp Doctor 2:   temp.ananya@ehealthbridge.gov.in  | password123 (Verified, Pending Request)');
        console.log(' 8. Temp Doctor 3:   temp.kavita@ehealthbridge.gov.in  | password123 (Pending Verification)');
        console.log(' 9. Patient (Ramesh):patient.ramesh@gmail.com          | password123 (Active Token + Past History)');
        console.log('10. Patient (Anitha):patient.anitha@gmail.com          | password123 (Waiting Queue Token)');
        console.log('11. Patient (Rahul): patient.rahul@gmail.com           | password123 (Completed Consultation)');
        console.log('12. Patient (Meera): patient.meera@gmail.com           | password123 (High Priority Triage)');
        console.log('========================================================================');

        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedDB();
