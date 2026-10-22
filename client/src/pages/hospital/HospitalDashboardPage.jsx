import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import {
    Building2,
    Stethoscope,
    UserCheck,
    FileCheck,
    Briefcase,
    Users,
    Clock,
    PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HospitalDashboardPage = () => {
    const { hospital: authHospital, refreshProfile } = useAuth();
    const [liveHospital, setLiveHospital] = useState(authHospital);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const hospital = liveHospital || authHospital;

    const fetchHospitalStats = async () => {
        try {
            const res = await API.get('/hospital-admin/dashboard');
            if (res.data.success) {
                setStats(res.data.stats);
                if (res.data.hospital) {
                    setLiveHospital(res.data.hospital);
                }
            }
        } catch (error) {
            console.error('Fetch hospital stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitalStats();
        if (refreshProfile) refreshProfile();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                {/* Header */}
                <div className="mb-8 bg-gradient-to-r from-teal-800 to-slate-900 text-white p-8 rounded-3xl shadow-md">
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider mb-2">
                        <Building2 className="w-4 h-4" /> Hospital Superintendent Control Panel
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {hospital ? hospital.name : 'Government Hospital Portal'}
                    </h1>
                    <p className="text-teal-100 text-sm mt-1">
                        {hospital ? `${hospital.address}, ${hospital.district}, ${hospital.state}` : 'Manage capacity sharing, doctor rosters, and voluntary doctor contracts.'}
                    </p>
                </div>

                {/* Pending Approval Alert Banner */}
                {hospital && hospital.status === 'PENDING' && (
                    <div className="mb-8 bg-amber-50 border-2 border-amber-400 p-5 rounded-3xl flex items-center justify-between text-amber-900 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-200 text-amber-800 rounded-2xl flex items-center justify-center font-bold">
                                <Clock className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm">Hospital Registration Pending Approval</h3>
                                <p className="text-xs text-amber-800 mt-0.5">
                                    Your hospital registration ({hospital.name} - Reg: {hospital.registrationNumber}) is currently pending review by the Main Administrator. Voluntary doctors will be able to discover your hospital slots once approved.
                                </p>
                            </div>
                        </div>
                        <span className="bg-amber-200 text-amber-900 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0">
                            Pending Approval
                        </span>
                    </div>
                )}

                {/* Action Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Link
                        to="/hospital/requirements"
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Post Doctor Requirement</p>
                            <p className="text-slate-500 text-xs mt-0.5">Request voluntary temp doctor slots</p>
                        </div>
                        <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </Link>

                    <Link
                        to="/hospital/requests"
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Review Doctor Requests</p>
                            <p className="text-slate-500 text-xs mt-0.5">Verify MCI credentials & issue contracts</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </Link>

                    <Link
                        to="/hospital/doctors"
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Add Fixed Doctor</p>
                            <p className="text-slate-500 text-xs mt-0.5">Manage hospital permanent roster</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                            <PlusCircle className="w-5 h-5" />
                        </div>
                    </Link>
                </div>

                {/* Dashboard Metrics */}
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading hospital metrics...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Fixed Doctors</span>
                                <Stethoscope className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-extrabold text-slate-900">{stats?.fixedDoctorsCount || 0}</p>
                            <p className="text-xs text-slate-500 mt-1">Permanent hospital staff</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Active Voluntary Docs</span>
                                <UserCheck className="w-5 h-5 text-amber-600" />
                            </div>
                            <p className="text-3xl font-extrabold text-slate-900">{stats?.tempDoctorsCount || 0}</p>
                            <p className="text-xs text-slate-500 mt-1">Temporary contract doctors active</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Active Contracts</span>
                                <FileCheck className="w-5 h-5 text-teal-600" />
                            </div>
                            <p className="text-3xl font-extrabold text-slate-900">{stats?.activeContractsCount || 0}</p>
                            <p className="text-xs text-slate-500 mt-1">Legally binding service contracts</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Open Requirements</span>
                                <Briefcase className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-3xl font-extrabold text-slate-900">{stats?.openRequirementsCount || 0}</p>
                            <p className="text-xs text-slate-500 mt-1">Unfilled consultation slots</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HospitalDashboardPage;
