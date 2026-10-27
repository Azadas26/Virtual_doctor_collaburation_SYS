import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import {
    CalendarCheck,
    Clock,
    Stethoscope,
    Building2,
    Ticket,
    CheckCircle2,
    Printer,
    Download,
    X,
    User,
    Phone,
    MapPin,
    AlertCircle,
    ShieldCheck,
    Calendar,
    Activity,
    FileText
} from 'lucide-react';

const PatientAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Receipt Modal State
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

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

    const handleOpenReceipt = (apt) => {
        setSelectedAppointment(apt);
        setReceiptModalOpen(true);
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                            <Ticket className="w-3.5 h-3.5 text-teal-600" />
                            Official Hospital OPD Consultation Tickets
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            My OP Tickets & Appointments
                        </h1>
                        <p className="text-slate-600 text-sm mt-1">
                            Track live queue position, estimated wait times, and download official appointment receipts.
                        </p>
                    </div>
                    <Link
                        to="/patient/book-appointment"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-md shadow-teal-600/20 w-fit"
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
                            <div
                                key={apt._id}
                                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                            >
                                <div className="space-y-2.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                                            Ticket #{apt.appointmentNumber}
                                        </span>
                                        <span
                                            className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                                                apt.status === 'IN_CONSULTATION'
                                                    ? 'bg-teal-100 text-teal-800 animate-pulse'
                                                    : apt.status === 'COMPLETED'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : apt.status === 'SCHEDULED'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {apt.status}
                                        </span>
                                        {apt.priorityCategory && (
                                            <span
                                                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                                    apt.priorityCategory === 'EMERGENCY'
                                                        ? 'bg-red-100 text-red-800'
                                                        : apt.priorityCategory === 'HIGH'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}
                                            >
                                                {apt.priorityCategory} TRIAGE
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-extrabold text-slate-900 text-xl">
                                        {apt.hospitalId?.name || 'Government Hospital'}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Stethoscope className="w-4 h-4 text-teal-600" />
                                            Doctor: <span className="font-bold text-slate-900">{apt.doctorId?.doctorName || apt.doctorId?.name || 'Assigned Duty Doctor'}</span> ({apt.doctorId?.doctorType || 'Specialist'})
                                        </span>
                                        <span>•</span>
                                        <span className="text-teal-700 font-bold">{apt.department}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(apt.appointmentDate || apt.createdAt).toLocaleDateString('en-GB')} ({apt.timeSlot || '09:00 AM'})
                                        </span>
                                    </div>

                                    <p className="text-slate-500 text-xs">
                                        <span className="font-semibold text-slate-700">Reported Symptoms:</span> {apt.symptoms} {apt.symptomDuration ? `(${apt.symptomDuration})` : ''}
                                    </p>
                                </div>

                                {/* Right Side: Queue Info & Download Receipt Button */}
                                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right min-w-[170px] shadow-2xs">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                                            Live Queue Token
                                        </span>
                                        <p className="text-2xl font-black text-slate-900">
                                            #{apt.queuePosition} <span className="text-xs font-normal text-slate-500">in line</span>
                                        </p>
                                        <p className="text-xs font-semibold text-amber-700 mt-1 flex items-center justify-end gap-1">
                                            <Clock className="w-3.5 h-3.5" /> ~{apt.estimatedWaitTimeMinutes} mins wait
                                        </p>
                                    </div>

                                    {/* Download Receipt Button */}
                                    <button
                                        onClick={() => handleOpenReceipt(apt)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-sm shadow-teal-600/20 transition active:scale-95"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Receipt
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* OFFICIAL DOWNLOADABLE OP TICKET RECEIPT MODAL */}
                {receiptModalOpen && selectedAppointment && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
                            {/* Modal Header & Actions (hidden during print) */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Ticket className="w-5 h-5 text-teal-600" />
                                        Official Outpatient Appointment Receipt
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Download or print your verified hospital OP consultation slip.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrintReceipt}
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                                    >
                                        <Printer className="w-4 h-4" /> Print / Save PDF
                                    </button>
                                    <button
                                        onClick={() => setReceiptModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* PRINTABLE RECEIPT CARD CONTAINER */}
                            <div className="border-2 border-slate-800 p-6 sm:p-8 rounded-2xl bg-white space-y-6 text-slate-900" id="printable-receipt">
                                {/* Top Header / Government Hospital Letterhead */}
                                <div className="text-center border-b-2 border-slate-800 pb-4 relative">
                                    <div className="inline-block bg-teal-800 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mb-1 tracking-wider">
                                        e-Health Bridge • Government Outpatient Department
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                        {selectedAppointment.hospitalId?.name || 'Government General Hospital'}
                                    </h2>
                                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                                        Department of {selectedAppointment.department} • Outpatient Consultation Ticket
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        {selectedAppointment.hospitalId?.address || selectedAppointment.hospitalId?.district || ''}, {selectedAppointment.hospitalId?.state || ''} • Helpline: {selectedAppointment.hospitalId?.contactNumber || '108 / 104'}
                                    </p>
                                </div>

                                {/* Ticket Bar & Live Token Highlight */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-bold text-[10px] uppercase block">Ticket Number</span>
                                        <p className="font-mono font-black text-slate-900 text-sm mt-0.5">
                                            {selectedAppointment.appointmentNumber}
                                        </p>
                                    </div>

                                    <div className="text-center border-x border-slate-200">
                                        <span className="text-teal-800 font-bold text-[10px] uppercase block">Live Queue Token</span>
                                        <p className="font-black text-teal-800 text-xl font-mono">
                                            #{selectedAppointment.queuePosition}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-slate-400 font-bold text-[10px] uppercase block">Estimated Wait</span>
                                        <p className="font-bold text-amber-700 text-sm mt-0.5">
                                            ~{selectedAppointment.estimatedWaitTimeMinutes} mins
                                        </p>
                                    </div>
                                </div>

                                {/* Patient Demographics Section */}
                                <div className="space-y-2">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                                        1. Patient Demographic Information
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[10px]">Patient Name</span>
                                            <p className="font-black text-slate-900 mt-0.5">
                                                {selectedAppointment.patientId?.name || 'Registered Citizen'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[10px]">Age / Gender</span>
                                            <p className="font-bold text-slate-800 mt-0.5">
                                                {calculateAge(selectedAppointment.patientId?.dateOfBirth)
                                                    ? `${calculateAge(selectedAppointment.patientId?.dateOfBirth)} yrs`
                                                    : 'N/A'}{' '}
                                                / {selectedAppointment.patientId?.gender || 'N/A'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[10px]">Contact Mobile</span>
                                            <p className="font-bold text-slate-800 mt-0.5">
                                                {selectedAppointment.patientId?.contact || 'N/A'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[10px]">Blood Group</span>
                                            <p className="font-black text-red-600 mt-0.5">
                                                {selectedAppointment.patientId?.bloodGroup || 'Not Tested'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Consultation & Physician Details */}
                                <div className="space-y-2">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                                        2. Consultation Shift & Attending Physician
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[10px]">Attending Doctor</span>
                                            <p className="font-black text-slate-900 text-sm mt-0.5">
                                                Dr. {selectedAppointment.doctorId?.doctorName || selectedAppointment.doctorId?.name || 'Assigned Duty Doctor'}
                                            </p>
                                            <p className="text-teal-700 font-semibold text-[11px]">
                                                {selectedAppointment.doctorId?.qualification || 'MBBS'} • {selectedAppointment.doctorId?.specialization || selectedAppointment.department}
                                            </p>
                                            <p className="text-slate-500 text-[10px]">
                                                Capacity Stream: {selectedAppointment.doctorId?.doctorType === 'TEMPORARY' ? 'Voluntary Specialist Capacity Sharing' : 'Permanent Medical Officer'}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[10px]">Scheduled Date & Slot</span>
                                            <p className="font-black text-slate-900 mt-0.5">
                                                {new Date(selectedAppointment.appointmentDate || selectedAppointment.createdAt).toLocaleDateString('en-GB')}
                                            </p>
                                            <p className="font-bold text-teal-800 text-xs">
                                                Time Slot: {selectedAppointment.timeSlot || '09:00 AM - 10:00 AM'}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-slate-500">Triage Priority:</span>
                                                <span
                                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                                        selectedAppointment.priorityCategory === 'EMERGENCY'
                                                            ? 'bg-red-100 text-red-800'
                                                            : selectedAppointment.priorityCategory === 'HIGH'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-emerald-100 text-emerald-800'
                                                    }`}
                                                >
                                                    {selectedAppointment.priorityCategory}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Symptoms Recorded */}
                                <div className="space-y-1 text-xs">
                                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] block">
                                        3. Primary Health Symptoms & Duration:
                                    </span>
                                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                                        {selectedAppointment.symptoms} {selectedAppointment.symptomDuration ? `• Duration: ${selectedAppointment.symptomDuration}` : ''}
                                    </p>
                                </div>

                                {/* Barcode / Verification Stamp Simulation */}
                                <div className="pt-4 border-t-2 border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                                    <div className="text-left space-y-1">
                                        <div className="flex items-center gap-1 font-mono tracking-widest text-slate-400 text-base font-black">
                                            |||| | |||||| | |||| | ||| ||||||| | ||
                                        </div>
                                        <p className="font-mono text-[10px] text-slate-500 font-bold">
                                            VERIFIED DIGITAL OP PASS • {selectedAppointment.appointmentNumber}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            Please present this slip at the OPD consultation counter or pharmacy.
                                        </p>
                                    </div>

                                    <div className="text-center sm:text-right shrink-0">
                                        <div className="inline-block border border-slate-900 p-2 rounded-xl text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-900">Hospital Superintendent</p>
                                            <p className="text-[9px] text-slate-500">Digital Validation Stamp</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Close Action */}
                            <div className="flex justify-end print:hidden">
                                <button
                                    onClick={() => setReceiptModalOpen(false)}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientAppointmentsPage;
