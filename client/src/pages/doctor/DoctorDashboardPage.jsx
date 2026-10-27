import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Role3DCanvas from '../../components/Role3DCanvas';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Clock, Users, ArrowRight, CalendarCheck } from 'lucide-react';

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
                {/* Hero Section with DNA Helix 3D Canvas */}
                <div className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-teal-950 via-slate-900 to-teal-900 shadow-2xl shadow-teal-900/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="p-8 lg:p-10 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4 w-fit">
                                <Stethoscope className="w-3.5 h-3.5" />
                                Outpatient Consultation Suite
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                                Dr. {user?.name || 'Doctor'}
                            </h1>
                            <p className="text-teal-200/70 text-sm mt-2">
                                {hospital?.name || 'Government Hospital OPD'}
                            </p>
                            <div className="mt-6 grid grid-cols-3 gap-3">
                                {[{ label: "Today's Patients", val: queueSummary?.totalToday || 0, color: 'text-white' },
                                  { label: 'Waiting', val: queueSummary?.waitingCount || 0, color: 'text-amber-300' },
                                  { label: 'Completed', val: queueSummary?.completedCount || 0, color: 'text-emerald-300' }
                                ].map(({ label, val, color }) => (
                                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                                        <p className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">{label}</p>
                                        <p className={`text-2xl font-black mt-0.5 ${color}`}>{val}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link to="/doctor/queue" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2 transition w-fit">
                                    <Clock className="w-4 h-4" /> Open Live OPD Queue <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/doctor/consultations" className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition w-fit">
                                    <CalendarCheck className="w-4 h-4 text-teal-300" /> Patient Consultations & Rx
                                </Link>
                            </div>
                        </div>
                        <div className="relative h-64 lg:h-auto min-h-[280px]">
                            <Role3DCanvas role="FIXED_DOCTOR" className="absolute inset-0" />
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-teal-200 text-xs font-bold px-3 py-1.5 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                                DNA Helix — OPD Active
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboardPage;
