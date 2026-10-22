import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { CalendarCheck, Clock, Stethoscope, Building2, Ticket, CheckCircle2 } from 'lucide-react';

const PatientAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const res = await API.get('/appointments/my-appointments');
            if (res.data.success) {
                setAppointments(res.data.appointments);
            }
        } catch (error) {
            console.error('Fetch patient appointments error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 15000); // Live poll wait times
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            My OP Tickets & Appointments
                        </h1>
                        <p className="text-slate-600 text-sm mt-1">
                            Track live queue position, estimated wait times, and consultation statuses.
                        </p>
                    </div>
                    <Link
                        to="/patient/book-appointment"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-md shadow-teal-600/20"
                    >
                        <Ticket className="w-4 h-4" /> Book New Ticket
                    </Link>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading OP tickets...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto">
                        <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Active Appointments</h3>
                        <p className="text-slate-500 text-sm mt-1 mb-4">You have no booked OP tickets at this moment.</p>
                        <Link
                            to="/patient/book-appointment"
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-block shadow-sm"
                        >
                            Book Outpatient Ticket
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((apt) => (
                            <div key={apt._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                                            Ticket #{apt.appointmentNumber}
                                        </span>
                                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${apt.status === 'IN_CONSULTATION' ? 'bg-teal-100 text-teal-800 animate-pulse' :
                                                apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                                    apt.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-slate-100 text-slate-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>

                                    <h3 className="font-extrabold text-slate-900 text-xl">{apt.hospitalId?.name || 'Government Hospital'}</h3>

                                    <p className="text-slate-600 text-xs flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4 text-teal-600" />
                                        Doctor: <span className="font-bold text-slate-900">{apt.doctorId?.name}</span> ({apt.doctorId?.doctorType || 'Specialist'}) • {apt.department}
                                    </p>

                                    <p className="text-slate-500 text-xs">
                                        Symptoms: {apt.symptoms}
                                    </p>
                                </div>

                                {/* Queue Position Box */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right shrink-0 min-w-[180px]">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Live Queue Info
                                    </span>
                                    <p className="text-2xl font-black text-slate-900">
                                        #{apt.queuePosition} <span className="text-xs font-normal text-slate-500">in line</span>
                                    </p>
                                    <p className="text-xs font-semibold text-amber-700 mt-1 flex items-center justify-end gap-1">
                                        <Clock className="w-3.5 h-3.5" /> ~{apt.estimatedWaitTimeMinutes} mins wait
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientAppointmentsPage;
