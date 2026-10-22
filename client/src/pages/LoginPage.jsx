import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HeartPulse,
    Lock,
    Mail,
    ArrowRight,
    ShieldCheck,
    Building2,
    Stethoscope,
    UserCheck,
    User as UserIcon,
    Sparkles
} from 'lucide-react';
import Ambient3DBackground from '../components/Ambient3DBackground';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const data = await login(email, password);
            switch (data.user.role) {
                case 'MAIN_ADMIN': navigate('/admin/dashboard'); break;
                case 'HOSPITAL_ADMIN': navigate('/hospital/dashboard'); break;
                case 'FIXED_DOCTOR': navigate('/doctor/dashboard'); break;
                case 'TEMPORARY_DOCTOR': navigate('/temp-doctor/dashboard'); break;
                case 'PATIENT': navigate('/patient/dashboard'); break;
                default: navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid login credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    const setDemoCredentials = (roleKey, demoEmail, demoPass) => {
        setSelectedRole(roleKey);
        setEmail(demoEmail);
        setPassword(demoPass);
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
            {/* Ambient 3D Interactive Background */}
            <Ambient3DBackground density="medium" colorTheme="teal" />

            {/* Subtle Ambient Radial Lighting */}
            <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-teal-200/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-200/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link to="/" className="inline-flex items-center gap-2 group mb-3">
                    <div className="w-12 h-12 bg-gradient-to-tr from-teal-600 to-cyan-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/25 group-hover:scale-105 transition-transform duration-300">
                        <HeartPulse className="w-7 h-7 text-white animate-heartbeat" />
                    </div>
                </Link>

                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Sign In to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">e-Health Bridge</span>
                </h2>
                <p className="mt-1 text-xs text-slate-500 uppercase tracking-widest font-mono">
                    Virtual Doctor Collaboration System
                </p>
            </div>

            <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/95 py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 shadow-2xl shadow-teal-900/5 backdrop-blur-xl">
                    {location.search.includes('session=expired') && (
                        <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded-2xl text-xs font-semibold border border-amber-200">
                            Your session expired. Please sign in again.
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-2xl text-xs font-semibold border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Official Email Address
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@ehealthbridge.gov.in"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Security Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-teal-600/25 text-sm flex items-center justify-center gap-2 transition duration-200 hover:scale-[1.01] active:scale-95"
                        >
                            {submitting ? 'Authenticating...' : 'Sign In to Portal'}
                            <ArrowRight className="w-4 h-4 text-white" />
                        </button>
                    </form>

                    {/* 1-Click Demo Evaluation Login Pills */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> 1-Click Evaluation Logins
                            </span>
                            <span className="text-[10px] text-teal-700 font-mono font-bold">Instant Fill</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                            <button
                                type="button"
                                onClick={() => setDemoCredentials('MAIN_ADMIN', 'admin@ehealthbridge.gov.in', 'admin123')}
                                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${selectedRole === 'MAIN_ADMIN'
                                    ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-sm'
                                    : 'bg-purple-50/80 text-purple-700 border-purple-200 hover:bg-purple-100'
                                    }`}
                            >
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                                <span>Main Admin</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDemoCredentials('HOSP_ADMIN', 'tvm.admin@ehealthbridge.gov.in', 'password123')}
                                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${selectedRole === 'HOSP_ADMIN'
                                    ? 'bg-blue-100 border-blue-400 text-blue-900 shadow-sm'
                                    : 'bg-blue-50/80 text-blue-700 border-blue-200 hover:bg-blue-100'
                                    }`}
                            >
                                <Building2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                <span>Hosp Admin</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDemoCredentials('FIXED_DOC', 'doc.radhakrishnan@ehealthbridge.gov.in', 'password123')}
                                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${selectedRole === 'FIXED_DOC'
                                    ? 'bg-teal-100 border-teal-400 text-teal-900 shadow-sm'
                                    : 'bg-teal-50/80 text-teal-700 border-teal-200 hover:bg-teal-100'
                                    }`}
                            >
                                <Stethoscope className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                                <span>Fixed Doctor</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDemoCredentials('TEMP_DOC', 'temp.jacob@ehealthbridge.gov.in', 'password123')}
                                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${selectedRole === 'TEMP_DOC'
                                    ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm'
                                    : 'bg-amber-50/80 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    }`}
                            >
                                <UserCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                <span>Temp Doctor</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDemoCredentials('PATIENT', 'patient.ramesh@gmail.com', 'password123')}
                                className={`col-span-2 p-2 rounded-xl border text-center flex items-center justify-center gap-1.5 transition ${selectedRole === 'PATIENT'
                                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm'
                                    : 'bg-emerald-50/80 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    }`}
                            >
                                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Patient Demo (Ramesh Nair)</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 text-center text-xs text-slate-500">
                        New user or voluntary doctor?{' '}
                        <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700 underline underline-offset-4">
                            Register Here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
