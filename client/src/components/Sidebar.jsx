import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileCheck,
    CalendarCheck,
    Stethoscope,
    FileText,
    ShieldAlert,
    UserCheck,
    Briefcase,
    History,
    Clock,
    PlusCircle,
    ChevronRight,
    Activity,
    Shield,
    HeartPulse,
    Sparkles,
    Lock,
    AlertTriangle
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Track whether temp doctor has uploaded verification documents
    const [tempDocHasDocs, setTempDocHasDocs] = useState(true); // true by default to avoid flash
    const [docCheckDone, setDocCheckDone] = useState(false);

    useEffect(() => {
        if (user?.role === 'TEMPORARY_DOCTOR') {
            API.get('/temporary-doctors/profile')
                .then(res => {
                    if (res.data.success) {
                        const docs = res.data.profile?.verificationDocuments || [];
                        setTempDocHasDocs(docs.length > 0);
                    }
                })
                .catch(() => setTempDocHasDocs(false))
                .finally(() => setDocCheckDone(true));
        } else {
            setDocCheckDone(true);
        }
    }, [user]);

    if (!user) return null;

    const getRoleDetails = (role) => {
        switch (role) {
            case 'MAIN_ADMIN':
                return {
                    label: 'Main Administrator',
                    color: 'purple',
                    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
                    dotColor: 'bg-purple-500'
                };
            case 'HOSPITAL_ADMIN':
                return {
                    label: 'Hospital Superintendent',
                    color: 'blue',
                    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
                    dotColor: 'bg-blue-500'
                };
            case 'FIXED_DOCTOR':
                return {
                    label: 'Hospital Doctor (OPD)',
                    color: 'teal',
                    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
                    dotColor: 'bg-teal-500'
                };
            case 'TEMPORARY_DOCTOR':
                return {
                    label: 'Voluntary Temp Doctor',
                    color: 'amber',
                    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
                    dotColor: 'bg-amber-500'
                };
            case 'PATIENT':
                return {
                    label: 'Registered Citizen',
                    color: 'emerald',
                    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    dotColor: 'bg-emerald-500'
                };
            default:
                return {
                    label: 'Portal User',
                    color: 'slate',
                    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
                    dotColor: 'bg-slate-400'
                };
        }
    };

    const roleInfo = getRoleDetails(user.role);

    // Standard nav item
    const navItem = (to, icon, label, badge = null) => {
        const IconComponent = icon;
        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-transparent text-teal-800 font-bold border-l-4 border-teal-600 shadow-sm shadow-teal-500/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive
                                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-105'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:scale-105'
                                    }`}
                            >
                                <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="truncate">{label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                                    {badge}
                                </span>
                            )}
                            <ChevronRight
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive
                                    ? 'text-teal-600 opacity-100 translate-x-0'
                                    : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                                    }`}
                            />
                        </div>
                    </>
                )}
            </NavLink>
        );
    };

    // Locked nav item — redirects to profile page on click
    const lockedNavItem = (icon, label) => {
        const IconComponent = icon;
        return (
            <button
                type="button"
                onClick={() => {
                    alert('Please upload your verification documents (MCI Certificate / Degree) on the Profile page before accessing this section.');
                    navigate('/temp-doctor/profile');
                }}
                title="Upload credentials first to unlock"
                className="group w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 text-slate-400 hover:bg-red-50/50 cursor-not-allowed opacity-60"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400">
                        <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="truncate">{label}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            </button>
        );
    };

    const renderNavGroups = () => {
        switch (user.role) {
            case 'MAIN_ADMIN':
                return (
                    <div className="space-y-4">
                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Overview & Operations
                            </span>
                            <div className="space-y-1">
                                {navItem('/admin/dashboard', LayoutDashboard, 'Global Dashboard')}
                                {navItem('/admin/hospitals', Building2, 'Hospitals & Approvals')}
                                {navItem('/admin/users', Users, 'Users & Suspensions')}
                            </div>
                        </div>

                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Governance & Logs
                            </span>
                            <div className="space-y-1">
                                {navItem('/admin/audit-logs', ShieldAlert, 'Security Audit Logs')}
                                {navItem('/admin/reports', FileText, 'System Analytics')}
                            </div>
                        </div>
                    </div>
                );

            case 'HOSPITAL_ADMIN':
                return (
                    <div className="space-y-4">
                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Live Hospital OPD
                            </span>
                            <div className="space-y-1">
                                {navItem('/hospital/dashboard', LayoutDashboard, 'Hospital Dashboard')}
                                {navItem('/hospital/queue', Clock, 'Live Patient Queue', 'Live')}
                                {navItem('/hospital/doctors', Stethoscope, 'Doctor Roster & OPDs')}
                            </div>
                        </div>

                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Voluntary Capacity
                            </span>
                            <div className="space-y-1">
                                {navItem('/hospital/requirements', Briefcase, 'OP Requirements')}
                                {navItem('/hospital/requests', UserCheck, 'Doctor Requests')}
                                {navItem('/hospital/contracts', FileCheck, 'Service Contracts')}
                            </div>
                        </div>
                    </div>
                );

            case 'FIXED_DOCTOR':
                return (
                    <div className="space-y-4">
                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Consultation Center
                            </span>
                            <div className="space-y-1">
                                {navItem('/doctor/dashboard', LayoutDashboard, 'Doctor Dashboard')}
                                {navItem('/doctor/queue', Clock, 'Live Patient Queue', 'Active')}
                            </div>
                        </div>
                    </div>
                );

            case 'TEMPORARY_DOCTOR': {
                const docsLocked = docCheckDone && !tempDocHasDocs;
                return (
                    <div className="space-y-4">
                        {/* Warning banner when documents not uploaded */}
                        {docsLocked && (
                            <div className="mx-1 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-red-700 font-semibold leading-snug">
                                    Upload your credentials first to unlock all features.
                                </p>
                            </div>
                        )}

                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Voluntary Console
                            </span>
                            <div className="space-y-1">
                                {docsLocked
                                    ? lockedNavItem(LayoutDashboard, 'Voluntary Portal')
                                    : navItem('/temp-doctor/dashboard', LayoutDashboard, 'Voluntary Portal')}
                                {docsLocked
                                    ? lockedNavItem(Clock, 'My Shift & Queue')
                                    : navItem('/temp-doctor/schedule', Clock, 'My Shift & Queue', 'OPD')}
                                {docsLocked
                                    ? lockedNavItem(Building2, 'Available Requirements')
                                    : navItem('/temp-doctor/hospitals', Building2, 'Available Requirements')}
                            </div>
                        </div>

                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Credentials & Legal
                            </span>
                            <div className="space-y-1">
                                {docsLocked
                                    ? lockedNavItem(FileCheck, 'Signed Contracts')
                                    : navItem('/temp-doctor/contracts', FileCheck, 'Signed Contracts')}
                                {/* Profile page is always accessible — this is where they upload docs */}
                                {navItem('/temp-doctor/profile', UserCheck, 'Doctor Profile & KMC',
                                    docsLocked ? '⚠ Required' : null)}
                            </div>
                        </div>
                    </div>
                );
            }

            case 'PATIENT':
                return (
                    <div className="space-y-4">
                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Patient Health Center
                            </span>
                            <div className="space-y-1">
                                {navItem('/patient/dashboard', LayoutDashboard, 'Patient Portal')}
                                {navItem('/patient/book-appointment', PlusCircle, 'Book OP Appointment', 'New')}
                                {navItem('/patient/appointments', CalendarCheck, 'My Appointments')}
                            </div>
                        </div>

                        <div>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Health Records
                            </span>
                            <div className="space-y-1">
                                {navItem('/patient/medical-history', History, 'Consultation History')}
                                {navItem('/patient/profile', Users, 'Health Profile')}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <aside className="w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex shrink-0 shadow-[2px_0_16px_rgba(0,0,0,0.02)] select-none">
            <div className="space-y-5">
                {/* Modern User Profile & Identity Hub */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-teal-600/25">
                                {user.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-extrabold text-slate-900 truncate leading-snug">
                                {user.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.badgeBg} flex items-center gap-1`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${roleInfo.dotColor}`}></span>
                                    {roleInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {user.hospitalName && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate font-medium">{user.hospitalName}</span>
                        </div>
                    )}
                </div>

                {/* Categorized Nav Groups */}
                <div className="space-y-4">
                    {renderNavGroups()}
                </div>
            </div>

            {/* Bottom 2026 Health Grid Telemetry Widget */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-teal-50 via-white to-cyan-50/50 border border-teal-200/70 shadow-sm text-xs">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
                        <span>e-Health Grid v2.4</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Live
                    </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                    Apex Government Hospitals synced with Voluntary Specialists.
                </p>
                <div className="mt-2 pt-2 border-t border-teal-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Latency: 0.08s</span>
                    <span className="text-teal-700 font-semibold">Triage Sync: 100%</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
