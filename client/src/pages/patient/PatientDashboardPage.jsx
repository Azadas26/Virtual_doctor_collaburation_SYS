import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
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
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 rounded-3xl shadow-md mb-8">
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider mb-2">
                        <User className="w-4 h-4 text-teal-400" /> Patient Wellness Portal
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Welcome back, {user?.name || 'Patient'}!
                    </h1>
                    <p className="text-slate-300 text-sm mt-1">
                        Book OPD tickets online, avoid crowded hospital lines, and view digital prescriptions from government & voluntary doctors.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                            to="/patient/book-appointment"
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition"
                        >
                            <Ticket className="w-4 h-4" /> Book OP Ticket Now
                        </Link>
                        <Link
                            to="/hospitals"
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5"
                        >
                            <Search className="w-4 h-4" /> Search Government Hospitals
                        </Link>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <Link to="/patient/appointments" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold mb-3">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">Active OP Tickets</h3>
                        <p className="text-xs text-slate-500 mt-1">Check queue numbers & wait times</p>
                    </Link>

                    <Link to="/patient/medical-history" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold mb-3">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">Digital Prescriptions</h3>
                        <p className="text-xs text-slate-500 mt-1">View clinical notes & medicines</p>
                    </Link>

                    <Link to="/hospitals" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold mb-3">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">Nearby OPD Centers</h3>
                        <p className="text-xs text-slate-500 mt-1">Locate 24x7 emergency & specialists</p>
                    </Link>
                </div>

                {/* Recent Appointments Preview */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 text-lg">My Recent Appointments</h3>
                        <Link to="/patient/appointments" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                            View All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="py-8 text-center text-slate-400 text-xs">Loading...</div>
                    ) : recentAppointments.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">No recent appointments booked.</div>
                    ) : (
                        <div className="space-y-3">
                            {recentAppointments.map((apt) => (
                                <div key={apt._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-mono font-bold text-slate-700">Ticket #{apt.appointmentNumber}</span>
                                        <p className="font-bold text-slate-900 text-sm">{apt.hospitalId?.name}</p>
                                        <p className="text-slate-500">{apt.department} • Doctor: {apt.doctorId?.name}</p>
                                    </div>
                                    <span className="bg-teal-100 text-teal-800 font-extrabold px-3 py-1 rounded-full">
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
