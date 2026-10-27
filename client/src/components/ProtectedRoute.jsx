import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth, getRoleHomePath } from '../context/AuthContext';

// Status config for hospital approval states
const HOSPITAL_STATUS_CONFIG = {
    PENDING: {
        icon: '⏳',
        color: 'amber',
        title: 'Awaiting Admin Approval',
        description:
            'Your hospital registration has been submitted and is currently under review by the Main Administrator. You will be able to access your portal once approved.',
        tip: 'This process usually takes 1–2 business days. Please check back later.'
    },
    REJECTED: {
        icon: '✗',
        color: 'red',
        title: 'Registration Rejected',
        description:
            'Your hospital registration has been rejected by the Main Administrator. Please contact support for more information.',
        tip: 'If you believe this is a mistake, please reach out to the platform administrator.'
    },
    DEACTIVATED: {
        icon: '⛔',
        color: 'slate',
        title: 'Hospital Deactivated',
        description:
            'Your hospital account has been deactivated by the Main Administrator.',
        tip: 'Please contact the Main Administrator to resolve this issue.'
    }
};

const HospitalStatusScreen = ({ status, hospitalName, onLogout }) => {
    const cfg = HOSPITAL_STATUS_CONFIG[status] || HOSPITAL_STATUS_CONFIG.PENDING;
    const colorMap = {
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            iconBg: 'bg-amber-100',
            iconText: 'text-amber-600',
            badge: 'bg-amber-100 text-amber-800',
            dot: 'bg-amber-400'
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            iconBg: 'bg-red-100',
            iconText: 'text-red-600',
            badge: 'bg-red-100 text-red-800',
            dot: 'bg-red-400'
        },
        slate: {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            iconBg: 'bg-slate-100',
            iconText: 'text-slate-600',
            badge: 'bg-slate-100 text-slate-700',
            dot: 'bg-slate-400'
        }
    };
    const c = colorMap[cfg.color];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Top accent bar */}
                <div className={`h-1.5 w-full ${cfg.color === 'amber' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : cfg.color === 'red' ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'}`} />

                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className={`w-20 h-20 ${c.iconBg} ${c.iconText} rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner`}>
                        {cfg.icon}
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.badge} mb-4`}>
                        <span className={`w-2 h-2 rounded-full ${c.dot} ${status === 'PENDING' ? 'animate-pulse' : ''}`} />
                        {status}
                    </span>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{cfg.title}</h2>

                    {hospitalName && (
                        <p className="text-sm font-medium text-slate-500 mb-3">
                            Hospital: <span className="text-slate-800 font-semibold">{hospitalName}</span>
                        </p>
                    )}

                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {cfg.description}
                    </p>

                    <div className={`${c.bg} border ${c.border} rounded-xl p-4 text-left mb-6`}>
                        <p className="text-xs text-slate-600">
                            <span className="font-semibold">💡 Note: </span>
                            {cfg.tip}
                        </p>
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, hospital, hospitalStatus, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600 font-medium text-sm">Authenticating e-Health Bridge Session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        !
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
                    <p className="text-slate-600 text-sm mb-6">
                        Your role (<span className="font-semibold text-teal-700">{user.role}</span>) does not have authorization to view this portal.
                    </p>
                    <Link
                        to={user ? getRoleHomePath(user.role) : "/"}
                        className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Gate HOSPITAL_ADMIN portal access until the admin approves the hospital
    if (user.role === 'HOSPITAL_ADMIN' && hospitalStatus && hospitalStatus !== 'APPROVED') {
        return (
            <HospitalStatusScreen
                status={hospitalStatus}
                hospitalName={hospital?.name}
                onLogout={logout}
            />
        );
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
