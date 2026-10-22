import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, User, Mail, Lock, Phone, Stethoscope, Building2, UserCheck, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
    const [role, setRole] = useState('PATIENT');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    // Patient fields
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('Male');
    const [address, setAddress] = useState('');

    // Temp Doctor fields
    const [medicalQualification, setMedicalQualification] = useState('');
    const [specialization, setSpecialization] = useState('General Medicine');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState(5);

    // Hospital Admin fields
    const [hospitalName, setHospitalName] = useState('');
    const [hospitalRegNumber, setHospitalRegNumber] = useState('');
    const [hospitalAddress, setHospitalAddress] = useState('');
    const [district, setDistrict] = useState('Thiruvananthapuram');
    const [hospitalType, setHospitalType] = useState('Government District Hospital');

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const payload = {
                name,
                email,
                password,
                contactNumber,
                role,
                dateOfBirth,
                gender,
                address,
                medicalQualification,
                specialization,
                registrationNumber,
                yearsOfExperience,
                hospitalName,
                hospitalRegNumber,
                hospitalAddress,
                district,
                hospitalType,
                superintendentName: name,
                superintendentEmail: email,
                superintendentPhone: contactNumber
            };
            const data = await register(payload);
            switch (data.user.role) {
                case 'TEMPORARY_DOCTOR': navigate('/temp-doctor/profile'); break;
                case 'PATIENT': navigate('/patient/dashboard'); break;
                case 'HOSPITAL_ADMIN': navigate('/hospital/dashboard'); break;
                default: navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-600/30">
                    <HeartPulse className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Create Your Account
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Join the e-Health Bridge Healthcare Network
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200 sm:px-10">

                    {/* Role selector tabs */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('PATIENT')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${role === 'PATIENT' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <User className="w-3.5 h-3.5" /> Patient
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('TEMPORARY_DOCTOR')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${role === 'TEMPORARY_DOCTOR' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <UserCheck className="w-3.5 h-3.5" /> Voluntary Doctor
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('HOSPITAL_ADMIN')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${role === 'HOSPITAL_ADMIN' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <Building2 className="w-3.5 h-3.5" /> Hospital Sub-Admin
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={role === 'TEMPORARY_DOCTOR' ? 'Dr. First Last' : 'John Doe'}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    placeholder="9847000000"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* Role specific fields */}
                        {role === 'PATIENT' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {role === 'TEMPORARY_DOCTOR' && (
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Medical Registration Number
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={registrationNumber}
                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                            placeholder="MCI-KL-XXXXX"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Specialization
                                        </label>
                                        <select
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="Orthopedics">Orthopedics</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                            <option value="General Surgery">General Surgery</option>
                                            <option value="Dermatology">Dermatology</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Medical Qualification
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={medicalQualification}
                                        onChange={(e) => setMedicalQualification(e.target.value)}
                                        placeholder="MBBS, MD (General Medicine)"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Clinic / Residential Address
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="City, District, State"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        )}

                        {role === 'HOSPITAL_ADMIN' && (
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Government Hospital Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={hospitalName}
                                            onChange={(e) => setHospitalName(e.target.value)}
                                            placeholder="e.g. Trivandrum Govt District Hospital"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Government Reg. Number
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={hospitalRegNumber}
                                            onChange={(e) => setHospitalRegNumber(e.target.value)}
                                            placeholder="GOVT-HOSP-KL-XXX"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            District
                                        </label>
                                        <select
                                            value={district}
                                            onChange={(e) => setDistrict(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                            <option value="Ernakulam">Ernakulam</option>
                                            <option value="Kozhikode">Kozhikode</option>
                                            <option value="Kollam">Kollam</option>
                                            <option value="Thrissur">Thrissur</option>
                                            <option value="Kannur">Kannur</option>
                                            <option value="Kottayam">Kottayam</option>
                                            <option value="Palakkad">Palakkad</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Hospital Type
                                        </label>
                                        <select
                                            value={hospitalType}
                                            onChange={(e) => setHospitalType(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="Government District Hospital">Government District Hospital</option>
                                            <option value="Government General Hospital">Government General Hospital</option>
                                            <option value="Community Health Centre">Community Health Centre</option>
                                            <option value="Government Medical College">Government Medical College</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Hospital Full Address
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={hospitalAddress}
                                        onChange={(e) => setHospitalAddress(e.target.value)}
                                        placeholder="Hospital Road, Main Junction"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-teal-600/20 text-sm flex items-center justify-center gap-2 transition mt-6"
                        >
                            {submitting ? 'Registering Account...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        Already registered?{' '}
                        <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
                            Sign In Here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
