import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Clock, Users, ArrowRight } from 'lucide-react';

const DoctorDashboardPage = () => {
    const { user, hospital } = useAuth();
    const [queueSummary, setQueueSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await API.get('/consultations/queue');
                if (res.data.success) {
                    setQueueSummary(res.data.summary);
                }
            } catch (error) {
                console.error('Fetch queue summary error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQueue();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-8 rounded-3xl shadow-md mb-8">
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider mb-2">
                        <Stethoscope className="w-4 h-4" /> Outpatient Consultation Suite
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Dr. {user?.name || 'Doctor'}
                    </h1>
                    <p className="text-teal-100 text-sm mt-1">
                        {hospital?.name || 'Government Hospital OPD'}
                    </p>

                    <div className="mt-6">
                        <Link
                            to="/doctor/queue"
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md shadow-teal-500/20 inline-flex items-center gap-2 transition"
                        >
                            Open Live OPD Patient Queue <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Live Queue Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Today Total OP Patients</span>
                        <p className="text-3xl font-extrabold text-slate-900 mt-2">{queueSummary?.totalToday || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Waiting in Queue</span>
                        <p className="text-3xl font-extrabold text-amber-700 mt-2">{queueSummary?.waitingCount || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Consultations Completed</span>
                        <p className="text-3xl font-extrabold text-emerald-700 mt-2">{queueSummary?.completedCount || 0}</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboardPage;
