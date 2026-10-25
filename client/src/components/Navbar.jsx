import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getRoleHomePath } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { HeartPulse, LogOut, User as UserIcon, Shield, Building2, Stethoscope, UserCheck, Sparkles, Clock, ShieldCheck, LayoutDashboard, Search, PlusCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const getRoleBadge = (role) => {
        switch (role) {
            case 'MAIN_ADMIN':
                return (
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Shield className="w-3 h-3 text-purple-600" /> Main Admin
                    </span>
                );
            case 'HOSPITAL_ADMIN':
                return (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Building2 className="w-3 h-3 text-blue-600" /> Hospital Admin
                    </span>
                );
            case 'FIXED_DOCTOR':
                return (
                    <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Stethoscope className="w-3 h-3 text-teal-600" /> Fixed Doctor
                    </span>
                );
            case 'TEMPORARY_DOCTOR':
                return (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <UserCheck className="w-3 h-3 text-amber-600" /> Voluntary Doctor
                    </span>
                );
            case 'PATIENT':
                return (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <UserIcon className="w-3 h-3 text-emerald-600" /> Patient
                    </span>
                );
            default:
                return null;
        }
    };

    const getDashboardPath = (role) => getRoleHomePath(role);

    return (
        <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200/90 sticky top-0 z-50 shadow-sm shadow-slate-900/5 text-slate-900 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo with 3D pulse - routes to role home page if logged in */}
                <Link
                    to="/"
                    className="flex items-center gap-3 group"
                    title="e-Health Bridge Home"
                >
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform duration-300">
                        <HeartPulse className="w-5 h-5 animate-heartbeat text-white" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
                    </div>
                    <div>
                        <span className="font-black text-lg tracking-tight block leading-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                            e-Health <span className="text-teal-600">Bridge</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                            Govt Capacity Exchange
                        </span>
                    </div>
                </Link>

                {/* Role-Specific Quick Nav Links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
                    {!user && (
                        <>
                            <Link to="/hospitals" className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5" /><span>Find Hospitals</span>
                            </Link>
                            <Link to="/login" className="hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-600" /><span>Book Doctor</span>
                            </Link>
                        </>
                    )}
                    {user?.role === 'PATIENT' && (
                        <>
                            <Link to="/hospitals" className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5" /><span>Find Hospitals</span>
                            </Link>
                            <Link to="/patient/book-appointment" className="hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                                <PlusCircle className="w-3.5 h-3.5 text-cyan-600" /><span>Book OP Ticket</span>
                            </Link>
                        </>
                    )}
                    {user?.role === 'MAIN_ADMIN' && (
                        <>
                            <Link to="/admin/hospitals" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" /><span>Hospitals</span>
                            </Link>
                            <Link to="/admin/users" className="hover:text-purple-600 transition-colors flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /><span>Users</span>
                            </Link>
                        </>
                    )}
                    {user?.role === 'HOSPITAL_ADMIN' && (
                        <>
                            <Link to="/hospital/queue" className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /><span>Live Queue</span>
                            </Link>
                            <Link to="/hospital/requirements" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-amber-600" /><span>Requirements</span>
                            </Link>
                        </>
                    )}
                    {(user?.role === 'FIXED_DOCTOR' || user?.role === 'TEMPORARY_DOCTOR') && (
                        <>
                            <Link to={user.role === 'FIXED_DOCTOR' ? '/doctor/queue' : '/temp-doctor/schedule'} className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /><span>Patient Queue</span>
                            </Link>
                            {user.role === 'TEMPORARY_DOCTOR' && (
                                <Link to="/temp-doctor/hospitals" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-amber-600" /><span>Hospitals</span>
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* User Right Nav */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <NotificationBell />
                            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                            <div className="flex items-center gap-3">
                                <Link
                                    to={getDashboardPath(user.role)}
                                    className="hidden sm:flex items-center gap-2 hover:opacity-90 transition"
                                >
                                    {getRoleBadge(user.role)}
                                    <span className="text-sm font-bold text-slate-800 max-w-[120px] truncate">
                                        {user.name}
                                    </span>
                                </Link>

                                <button
                                    onClick={logout}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition flex items-center gap-1 text-xs font-semibold"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <Link
                                to="/login"
                                className="text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition hover:bg-slate-100"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/register"
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-teal-600/20 transition-all hover:scale-105 active:scale-95"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
