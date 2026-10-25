import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Role3DCanvas from '../../components/Role3DCanvas';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, FileCheck, Search, ShieldCheck, ArrowRight, Award } from 'lucide-react';

const TempDoctorDashboardPage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [contractsCount, setContractsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTempData = async () => {
            try {
                const profRes = await API.get('/temporary-doctors/profile');
                if (profRes.data.success) {
                    setProfile(profRes.data.profile);
                }

                const contractRes = await API.get('/contracts');
                if (contractRes.data.success) {
                    setContractsCount(contractRes.data.contracts.length);
                }
            } catch (error) {
                console.error('Fetch temp doctor dashboard error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTempData();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                {/* Hero Section with Star Constellation 3D Canvas */}
                <div className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 shadow-2xl shadow-amber-900/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-8 lg:p-10 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4 w-fit">
                                <Award className="w-3.5 h-3.5" />
                                Voluntary Doctor Capacity Exchange
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                                Welcome, Dr. {user?.name || 'Doctor'}!
                            </h1>
                            <p className="text-amber-200/70 text-sm mt-2 leading-relaxed">
                                Thank you for volunteering your limited consultation hours to support overcrowded government hospitals.
                            </p>
                            <div className="mt-6 grid grid-cols-3 gap-3">
                                {[{ label: 'Verification', val: profile?.verificationStatus || 'PENDING', color: 'text-amber-300' },
                                  { label: 'Active Contracts', val: contractsCount, color: 'text-white' },
                                  { label: 'Specialization', val: profile?.specialization || 'General', color: 'text-emerald-300' }
                                ].map(({ label, val, color }) => (
                                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                                        <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">{label}</p>
                                        <p className={`text-sm font-black mt-0.5 truncate ${color}`}>{val}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link to="/temp-doctor/hospitals" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2 transition">
                                    <Search className="w-4 h-4" /> Browse Hospital Slots
                                </Link>
                                <Link to="/temp-doctor/contracts" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2">
                                    <FileCheck className="w-4 h-4" /> My Contracts ({contractsCount})
                                </Link>
                            </div>
                        </div>
                        <div className="relative h-64 lg:h-auto min-h-[280px]">
                            <Role3DCanvas role="TEMPORARY_DOCTOR" className="absolute inset-0" />
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                Volunteer Constellation
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Verification Status</span>
                        <p className="text-xl font-extrabold text-slate-900 mt-2">
                            {profile?.verificationStatus || 'PENDING'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Superintendent credentials check</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Active Contracts</span>
                        <p className="text-3xl font-extrabold text-slate-900 mt-1">{contractsCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Voluntary terms accepted</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Specialization</span>
                        <p className="text-lg font-bold text-slate-900 mt-2">{profile?.specialization || 'General Medicine'}</p>
                        <p className="text-xs text-slate-500 mt-1">MCI Reg: {profile?.registrationNumber}</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TempDoctorDashboardPage;
