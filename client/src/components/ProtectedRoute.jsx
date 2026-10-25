import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth, getRoleHomePath } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();

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

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
