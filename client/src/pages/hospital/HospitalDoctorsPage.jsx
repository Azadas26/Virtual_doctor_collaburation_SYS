import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Stethoscope, Plus, CheckCircle2, Mail, Lock, Phone } from 'lucide-react';

const HospitalDoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('password123');
    const [contactNumber, setContactNumber] = useState('');
    const [department, setDepartment] = useState('General Medicine');
    const [specialization, setSpecialization] = useState('General Medicine');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchDoctors = async () => {
        try {
            const res = await API.get('/hospital-admin/doctors');
            if (res.data.success) {
                setDoctors(res.data.doctors);
            }
        } catch (error) {
            console.error('Fetch doctors error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await API.post('/hospital-admin/doctors', {
                name,
                email,
                password,
                contactNumber,
                department,
                specialization,
                registrationNumber
            });
            if (res.data.success) {
                alert('Fixed permanent doctor account created!');
                setShowAddModal(false);
                setName('');
                setEmail('');
                setContactNumber('');
                setRegistrationNumber('');
                fetchDoctors();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding fixed doctor.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Hospital Permanent Doctor Roster
                        </h1>
                        <p className="text-slate-600 text-sm mt-1">
                            Manage permanent government hospital medical staff and fixed outpatient schedule capacity.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-md shadow-teal-600/20"
                    >
                        <Plus className="w-4 h-4" /> Add Fixed Doctor Account
                    </button>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading doctor roster...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doc) => (
                            <div key={doc._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                        FIXED STAFF
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-xl">{doc.name}</h3>
                                <p className="text-xs text-slate-500">{doc.specialization} • Dept: {doc.department}</p>
                                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                                    <p>Email: {doc.userId?.email}</p>
                                    <p>MCI Reg: {doc.registrationNumber || 'KL-MCI-STAFF'}</p>
                                    <p>Daily OP Max: {doc.maxDailyPatients} Patients</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Create Permanent Doctor Account</h3>
                            <form onSubmit={handleAddDoctor} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Dr. Full Name"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="doc@hospital.gov.in"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact</label>
                                        <input
                                            type="text"
                                            required
                                            value={contactNumber}
                                            onChange={(e) => setContactNumber(e.target.value)}
                                            placeholder="9847000000"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        >
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="Orthopedics">Orthopedics</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">MCI Reg #</label>
                                        <input
                                            type="text"
                                            required
                                            value={registrationNumber}
                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                            placeholder="MCI-KL-5544"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
                                    >
                                        {submitting ? 'Creating...' : 'Create Doctor Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HospitalDoctorsPage;
