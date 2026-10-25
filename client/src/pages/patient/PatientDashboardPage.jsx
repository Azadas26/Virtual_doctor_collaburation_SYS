import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Role3DCanvas from '../../components/Role3DCanvas';
import { useAuth } from '../../context/AuthContext';
import { User, Ticket, Stethoscope, FileText, Search, Clock, Plus, ArrowRight } from 'lucide-react';

const PatientDashboardPage = () => {
    const { user } = useAuth();
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await API.get('/appointments/my-appointments');
                if (res.data.success) {
                    setRecentAppointments(res.data.appointments.slice(0, 3));
                }
            } catch (error) {
                console.error('Fetch dashboard error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                {/* Hero Section with Heartbeat ECG 3D Canvas */}
                <div className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 shadow-2xl shadow-emerald-900/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-8 lg:p-10 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4 w-fit">
                                <User className="w-3.5 h-3.5" />
                                Patient Wellness Portal
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                                Welcome back, <span className="text-emerald-300">{user?.name || 'Patient'}!</span>
                            </h1>
                            <p className="text-emerald-200/70 text-sm mt-2 leading-relaxed">
                                Book OPD tickets online, avoid crowded hospital lines, and view digital prescriptions from government & voluntary doctors.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link to="/patient/book-appointment" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2 transition">
                                    <Ticket className="w-4 h-4" /> Book OP Ticket Now
                                </Link>
                                <Link to="/hospitals" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2">
                                    <Search className="w-4 h-4" /> Search Hospitals
                                </Link>
                            </div>
                        </div>
                        <div className="relative h-64 lg:h-auto min-h-[280px]">
                            <Role3DCanvas role="PATIENT" className="absolute inset-0" />
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                Heartbeat ECG Live
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Interactive Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <Link to="/patient/appointments" className="card-interactive p-6 group">
                        <div className="w-12 h-12 bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition-colors">Active OP Tickets</h3>
                        <p className="text-xs text-slate-500 mt-1">Check queue numbers & wait times</p>
                    </Link>

                    <Link to="/patient/medical-history" className="card-interactive p-6 group">
                        <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700 transition-colors">Digital Prescriptions</h3>
                        <p className="text-xs text-slate-500 mt-1">View clinical notes & medicines</p>
                    </Link>

                    <Link to="/hospitals" className="card-interactive p-6 group">
                        <div className="w-12 h-12 bg-purple-50 border border-purple-200 text-purple-700 rounded-2xl flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-700 transition-colors">Nearby OPD Centers</h3>
                        <p className="text-xs text-slate-500 mt-1">Locate 24x7 emergency & specialists</p>
                    </Link>
                </div>

                {/* Recent Appointments Preview */}
                <div className="card-modern p-6 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-slate-900 text-lg">My Recent Appointments</h3>
                        <Link to="/patient/appointments" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
                            View All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="py-8 text-center text-slate-400 text-xs">Loading...</div>
                    ) : recentAppointments.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs panel-subtle border-dashed">No recent appointments booked.</div>
                    ) : (
                        <div className="space-y-3">
                            {recentAppointments.map((apt) => (
                                <div key={apt._id} className="p-4 panel-subtle hover:bg-teal-50/30 transition border border-slate-200/80 flex items-center justify-between text-xs shadow-xs">
                                    <div>
                                        <span className="font-mono font-bold text-slate-600">Ticket #{apt.appointmentNumber}</span>
                                        <p className="font-extrabold text-slate-900 text-sm mt-0.5">{apt.hospitalId?.name}</p>
                                        <p className="text-slate-500">{apt.department} • Doctor: {apt.doctorId?.name}</p>
                                    </div>
                                    <span className="bg-teal-50 text-teal-800 border border-teal-200 font-extrabold px-3 py-1 rounded-full shadow-xs">
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PatientDashboardPage;
