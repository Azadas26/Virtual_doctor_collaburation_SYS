import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Role3DCanvas from '../../components/Role3DCanvas';
import { useAuth } from '../../context/AuthContext';
import {
    Building2,
    Users,
    FileCheck,
    CalendarCheck,
    ShieldCheck,
    Activity,
    UserCheck,
    AlertTriangle
} from 'lucide-react';

const AdminDashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const res = await API.get('/admin/dashboard');
            if (res.data.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Fetch admin dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const { user } = useAuth();

    if (loading) {
        return (
            <div className="flex bg-slate-50 min-h-screen">
                <Sidebar />
                <div className="flex-1 p-8 text-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm font-medium">Loading Admin Platform...</p>
                </div>
            </div>
        );
    }

    const { stats, recentAuditLogs, pendingVerifications } = data || {};

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10 max-w-7xl">

                {/* Hero Section with 3D Canvas */}
                <div className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 shadow-2xl shadow-purple-900/30 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left: Welcome Content */}
                        <div className="p-8 lg:p-10 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4 w-fit">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                State Health Directorate Command Center
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                                Welcome, <span className="text-purple-300">{user?.name || 'Admin'}</span>
                            </h1>
                            <p className="text-purple-200/70 text-sm mt-2 leading-relaxed">
                                Global capacity oversight, hospital verifications, voluntary doctor service contracts, and system audit trails.
                            </p>
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                {[{ label: 'Total Hospitals', val: stats?.totalHospitals || 0, sub: `${stats?.activeHospitals || 0} approved` },
                                  { label: 'Active Contracts', val: stats?.activeContracts || 0, sub: 'Temp doctor terms' },
                                  { label: "Today's Appointments", val: stats?.todayAppointments || 0, sub: 'Scheduled today' },
                                  { label: 'Verified Doctors', val: stats?.verifiedTempDoctorsCount || 0, sub: `of ${stats?.tempDoctorsCount || 0} registered` }
                                ].map(({ label, val, sub }) => (
                                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                                        <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">{label}</p>
                                        <p className="text-2xl font-black text-white mt-0.5">{val}</p>
                                        <p className="text-[11px] text-purple-200/60 mt-0.5">{sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Right: 3D Canvas */}
                        <div className="relative h-64 lg:h-auto min-h-[280px]">
                            <Role3DCanvas role="MAIN_ADMIN" className="absolute inset-0" />
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-purple-200 text-xs font-bold px-3 py-1.5 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                                Governance Shield Active
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospitals</span>
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">{stats?.totalHospitals || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            <span className="font-bold text-emerald-600">{stats?.activeHospitals || 0} Approved</span> Govt Units
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voluntary Contracts</span>
                            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-bold">
                                <FileCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">{stats?.activeContracts || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Active Temp Doctor Contracts in Force
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Doctors</span>
                            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">{stats?.verifiedTempDoctorsCount || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Out of {stats?.tempDoctorsCount || 0} registered temp profiles
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Appointments</span>
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
                                <CalendarCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">{stats?.totalAppointments || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            <span className="font-bold text-teal-600">{stats?.todayAppointments || 0}</span> scheduled for today
                        </p>
                    </div>
                </div>

                {/* Audit Log Stream & Pending Verifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Verifications */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-teal-600" /> Pending Doctor Credential Verifications
                        </h3>
                        {pendingVerifications && pendingVerifications.length > 0 ? (
                            <div className="space-y-3">
                                {pendingVerifications.map((doc) => (
                                    <div key={doc._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{doc.doctorName}</p>
                                            <p className="text-xs text-slate-500">{doc.specialization} • MCI Reg: {doc.registrationNumber}</p>
                                        </div>
                                        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
                                            Pending Verification
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl">
                                No pending credential verifications right now.
                            </div>
                        )}
                    </div>

                    {/* Real-time Audit Stream */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-600" /> System Audit Trail Stream
                        </h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {recentAuditLogs && recentAuditLogs.map((log) => (
                                <div key={log._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                    <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                                        <span className="text-teal-700">{log.action}</span>
                                        <span className="text-[10px] text-slate-400 font-normal">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-slate-600">
                                        By: <span className="font-semibold text-slate-900">{log.userName}</span> ({log.role})
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
