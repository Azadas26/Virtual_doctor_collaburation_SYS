import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
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
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white p-8 rounded-3xl shadow-md mb-8">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                        <Award className="w-4 h-4" /> Voluntary Doctor Capacity Exchange
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Welcome, Dr. {user?.name || 'Doctor'}!
                    </h1>
                    <p className="text-amber-100 text-sm mt-1">
                        Thank you for volunteering your limited consultation hours to support overcrowded government hospitals.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                            to="/temp-doctor/hospitals"
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition"
                        >
                            <Search className="w-4 h-4" /> Browse Government Hospital Slots
                        </Link>
                        <Link
                            to="/temp-doctor/contracts"
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5"
                        >
                            <FileCheck className="w-4 h-4" /> View My Service Contracts ({contractsCount})
                        </Link>
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
