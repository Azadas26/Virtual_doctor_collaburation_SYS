import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, MapPin, Calendar, Heart, ShieldAlert } from 'lucide-react';

const PatientProfilePage = () => {
    const { user } = useAuth();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');
    const [allergies, setAllergies] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchPatientProfile = async () => {
            try {
                const res = await API.get('/patients/profile');
                if (res.data.success) {
                    const p = res.data.patient;
                    setPatientData(p);
                    setContactNumber(p.userId?.contactNumber || '');
                    setAddress(p.address || '');
                    setMedicalHistory(p.medicalHistory || '');
                    setAllergies(p.allergies || '');
                    setEmergencyContact(p.emergencyContact || '');
                }
            } catch (error) {
                console.error('Fetch patient profile error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatientProfile();
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await API.put('/patients/profile', {
                contactNumber,
                address,
                medicalHistory,
                allergies,
                emergencyContact
            });
            if (res.data.success) {
                alert('Patient medical profile updated successfully!');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating profile.');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Patient Health Profile & Emergency Info
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Maintain your medical background and emergency contacts for attending doctors during OP consultations.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading health profile...</p>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                            <div className="w-16 h-16 bg-teal-100 text-teal-800 rounded-3xl flex items-center justify-center font-extrabold text-2xl">
                                {user?.name ? user.name[0] : 'P'}
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-900">{user?.name}</h3>
                                <p className="text-xs text-slate-500">{user?.email} • Patient Account</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Contact Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Emergency Contact Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={emergencyContact}
                                        onChange={(e) => setEmergencyContact(e.target.value)}
                                        placeholder="Relative or Family Contact"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Residential Address
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Street address, district, state"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Known Medical Conditions / History
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={medicalHistory}
                                        onChange={(e) => setMedicalHistory(e.target.value)}
                                        placeholder="Asthma, Hypertension, Diabetes, Past Surgeries..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Known Drug & Environmental Allergies
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={allergies}
                                        onChange={(e) => setAllergies(e.target.value)}
                                        placeholder="Penicillin allergy, Latex allergy..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-teal-600/20 transition mt-4"
                            >
                                {updating ? 'Saving Profile...' : 'Save Health Profile'}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientProfilePage;
