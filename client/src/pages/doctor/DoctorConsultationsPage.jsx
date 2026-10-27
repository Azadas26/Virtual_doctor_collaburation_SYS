import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import {
    Calendar,
    Search,
    User,
    Pill,
    FileText,
    Printer,
    Clock,
    Phone,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Stethoscope,
    Building2,
    CalendarCheck,
    Filter,
    X,
    Activity,
    ShieldAlert,
    Download,
    ChevronRight,
    RefreshCw
} from 'lucide-react';

const DoctorConsultationsPage = () => {
    const { user } = useAuth();
    
    // Default to today's date formatted as YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL', 'WITH_PRESCRIPTION', 'EMERGENCY'
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        doctor: null,
        hospitalDoctors: [],
        consultations: [],
        appointments: [],
        summary: { totalConsultations: 0, totalPrescriptions: 0, completedCount: 0, waitingCount: 0 }
    });

    // Prescription Print / View Modal State
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [activeConsultation, setActiveConsultation] = useState(null);

    const fetchConsultationHistory = async (dateVal = selectedDate, docId = selectedDoctorId, search = searchQuery) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateVal) params.append('date', dateVal);
            if (docId) params.append('doctorId', docId);
            if (search) params.append('search', search);

            const res = await API.get(`/consultations/history?${params.toString()}`);
            if (res.data.success) {
                setData({
                    doctor: res.data.doctor,
                    hospitalDoctors: res.data.hospitalDoctors || [],
                    consultations: res.data.consultations || [],
                    appointments: res.data.appointments || [],
                    summary: res.data.summary || {}
                });
                if (!docId && res.data.doctor?._id) {
                    setSelectedDoctorId(res.data.doctor._id);
                }
            }
        } catch (error) {
            console.error('Fetch consultation history error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultationHistory(selectedDate, selectedDoctorId, searchQuery);
    }, [selectedDate, selectedDoctorId]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchConsultationHistory(selectedDate, selectedDoctorId, searchQuery);
    };

    const handleQuickDate = (daysOffset) => {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        const dateStr = d.toISOString().split('T')[0];
        setSelectedDate(dateStr);
    };

    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    const handlePrintPrescription = (consultation) => {
        setActiveConsultation(consultation);
        setPrintModalOpen(true);
    };

    const triggerBrowserPrint = () => {
        window.print();
    };

    // Filter consultations based on category
    const filteredConsultations = (data.consultations || []).filter(c => {
        if (filterCategory === 'WITH_PRESCRIPTION') {
            return c.medications && c.medications.length > 0;
        }
        if (filterCategory === 'EMERGENCY') {
            return c.appointmentId?.priorityCategory === 'EMERGENCY';
        }
        return true;
    });

    const isHospitalAdmin = user?.role === 'HOSPITAL_ADMIN' || user?.role === 'MAIN_ADMIN';

    // Format display date: e.g. "27-10-2026" or "Tuesday, Oct 27, 2026"
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        try {
            const [y, m, d] = dateStr.split('-');
            const dt = new Date(y, m - 1, d);
            return dt.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }); // e.g. "Tue, 27 Oct 2026"
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-full mb-2">
                                <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
                                Patient Consultations & Digital Prescriptions
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                                Date-Wise Consultation Records
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                Inspect all patients examined by Dr. {data.doctor?.doctorName || user?.name || 'Doctor'} on the selected date along with clinical diagnosis and prescription slips.
                            </p>
                        </div>

                        {/* Doctor Selector if Hospital Admin */}
                        {isHospitalAdmin && data.hospitalDoctors?.length > 0 && (
                            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                                <div className="text-xs">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Attending Doctor</label>
                                    <select
                                        value={selectedDoctorId}
                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                        className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                                    >
                                        {data.hospitalDoctors.map(doc => (
                                            <option key={doc._id} value={doc._id}>
                                                Dr. {doc.doctorName} ({doc.specialization})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Picker & Search Controls Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm mb-8 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Interactive Date Picker */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs">
                                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                                <span className="font-bold text-slate-700">Select Date:</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-3 py-1 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                            </div>

                            {/* Quick Date Buttons */}
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
                                <button
                                    onClick={() => handleQuickDate(0)}
                                    className={`px-3 py-1.5 rounded-xl transition ${selectedDate === todayStr ? 'bg-white text-teal-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => handleQuickDate(-1)}
                                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition"
                                >
                                    Yesterday
                                </button>
                                <button
                                    onClick={() => setSelectedDate('2026-10-27')}
                                    className={`px-3 py-1.5 rounded-xl transition ${selectedDate === '2026-10-27' ? 'bg-white text-teal-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                    title="Quick select 27-10-2026"
                                >
                                    27-10-2026
                                </button>
                            </div>

                            <button
                                onClick={() => fetchConsultationHistory(selectedDate, selectedDoctorId, searchQuery)}
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search patient, token, medicine, notes..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            fetchConsultationHistory(selectedDate, selectedDoctorId, '');
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition shrink-0"
                            >
                                Filter
                            </button>
                        </form>
                    </div>

                    {/* Quick Category Tabs & Active Date Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-semibold flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5" /> Filter View:
                            </span>
                            <button
                                onClick={() => setFilterCategory('ALL')}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${filterCategory === 'ALL' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                All Records ({data.consultations?.length || 0})
                            </button>
                            <button
                                onClick={() => setFilterCategory('WITH_PRESCRIPTION')}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${filterCategory === 'WITH_PRESCRIPTION' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Prescriptions ({data.summary?.totalPrescriptions || 0})
                            </button>
                            <button
                                onClick={() => setFilterCategory('EMERGENCY')}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${filterCategory === 'EMERGENCY' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Emergency Triage
                            </button>
                        </div>

                        <div className="text-xs text-slate-500 font-medium">
                            Displaying consultations for: <span className="font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200">{formatDateDisplay(selectedDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Summary Metrics Bar for Selected Date */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Examined</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{data.summary?.totalConsultations || 0}</p>
                        <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Completed Consultations</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Digital Prescriptions</span>
                        <p className="text-2xl font-black text-emerald-700 mt-1">{data.summary?.totalPrescriptions || 0}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Rx Slips Generated</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Scheduled</span>
                        <p className="text-2xl font-black text-slate-900 mt-1">{data.summary?.totalAppointments || 0}</p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">OP Tickets for Date</p>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Waiting / Scheduled</span>
                        <p className="text-2xl font-black text-amber-600 mt-1">{data.summary?.waitingCount || 0}</p>
                        <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Pending Examination</p>
                    </div>
                </div>

                {/* Consultations List */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm font-semibold">Loading patient consultations for {selectedDate}...</p>
                    </div>
                ) : filteredConsultations.length === 0 ? (
                    <div className="bg-white p-12 lg:p-16 rounded-3xl border border-slate-200 text-center max-w-xl mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
                            <CalendarCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">
                            No Patient Consultations Found on {selectedDate}
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                            There are no completed patient consultations recorded for Dr. {data.doctor?.doctorName || user?.name} on this date.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => handleQuickDate(0)}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition"
                            >
                                View Today's Patients
                            </button>
                            <button
                                onClick={() => setSelectedDate('2026-10-27')}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                            >
                                Try 27-10-2026
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredConsultations.map((consultation) => {
                            const patient = consultation.patientId || {};
                            const appointment = consultation.appointmentId || {};
                            const consultDate = new Date(consultation.consultationDate || consultation.createdAt);
                            const age = calculateAge(patient.dateOfBirth);

                            return (
                                <div
                                    key={consultation._id}
                                    className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 space-y-5"
                                >
                                    {/* Patient & Consultation Top Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-teal-500/20 shrink-0">
                                                {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-lg font-black text-slate-900">
                                                        {patient.name || 'Anonymous Patient'}
                                                    </h2>
                                                    {appointment.priorityCategory && (
                                                        <span
                                                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                                                appointment.priorityCategory === 'EMERGENCY'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : appointment.priorityCategory === 'HIGH'
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-emerald-100 text-emerald-800'
                                                            }`}
                                                        >
                                                            {appointment.priorityCategory} TRIAGE
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                        Token #{appointment.queuePosition || 1}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                                                    <span>{age ? `${age} yrs` : 'Age N/A'} • {patient.gender || 'N/A'}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        {patient.contact || 'No phone'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>APT #{appointment.appointmentNumber || 'N/A'}</span>
                                                    {patient.bloodGroup && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-bold text-red-600">Blood: {patient.bloodGroup}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Consultation Timestamp & Print Action */}
                                        <div className="flex flex-wrap sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                                            <div className="text-right">
                                                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 inline-flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                                                    {consultDate.toLocaleDateString('en-GB')} {consultDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handlePrintPrescription(consultation)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition shadow-xs"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                                Print Rx Slip
                                            </button>
                                        </div>
                                    </div>

                                    {/* Clinical Assessment & Observations */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        {/* Diagnosis & Findings */}
                                        <div className="lg:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                                                    Clinical Diagnosis & Doctor Findings
                                                </span>
                                            </div>
                                            <p className="text-slate-900 font-semibold leading-relaxed whitespace-pre-line">
                                                {consultation.clinicalNotes || 'No notes entered'}
                                            </p>

                                            {consultation.observations && (
                                                <div className="pt-2 border-t border-slate-200/60 mt-2">
                                                    <span className="text-slate-500 font-bold text-[10px] block">Doctor Observations / Vitals:</span>
                                                    <p className="text-slate-800 font-medium mt-0.5">{consultation.observations}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Patient Background / Allergies */}
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                                <Activity className="w-3.5 h-3.5 text-teal-600" />
                                                Medical Background
                                            </span>

                                            <div>
                                                <span className="text-slate-400 text-[10px] font-bold block">Known Allergies:</span>
                                                <p className={`font-bold mt-0.5 ${patient.allergies ? 'text-red-700' : 'text-slate-600'}`}>
                                                    {patient.allergies || 'None reported'}
                                                </p>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 text-[10px] font-bold block">Existing Conditions:</span>
                                                <p className="font-medium text-slate-700 mt-0.5 truncate">
                                                    {patient.existingConditions || patient.medicalHistory || 'None reported'}
                                                </p>
                                            </div>

                                            {patient.address && (
                                                <div className="pt-1 border-t border-slate-200/60">
                                                    <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> Address:
                                                    </span>
                                                    <p className="font-medium text-slate-600 mt-0.5 truncate">{patient.address}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Digital Prescription / Medications List */}
                                    {consultation.medications && consultation.medications.length > 0 && (
                                        <div className="bg-teal-50/40 p-4 lg:p-5 rounded-2xl border border-teal-100 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Pill className="w-4 h-4 text-teal-700" />
                                                    Prescribed Medications ({consultation.medications.length} items)
                                                </span>
                                                <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                                                    Rx Verified
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                                {consultation.medications.map((med, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white p-3 rounded-xl border border-teal-200/70 shadow-2xs flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between gap-1">
                                                                <p className="font-black text-slate-900 text-xs">
                                                                    {med.name}
                                                                </p>
                                                                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                                                                    {med.dosage}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-600 mt-1 font-medium">
                                                                Frequency: <span className="font-semibold text-slate-800">{med.frequency}</span>
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                                            <span>Duration:</span>
                                                            <span className="font-bold text-slate-700">{med.duration}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Diagnostic Investigations & Follow-Up Advice */}
                                    {(consultation.investigations?.length > 0 || consultation.followUpDate || consultation.referralInfo) && (
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100 text-slate-600">
                                            {consultation.investigations && consultation.investigations.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-700">Investigations Ordered:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {consultation.investigations.map((inv, idx) => (
                                                            <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-800 text-[11px]">
                                                                {inv.testName} ({inv.testType})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {consultation.followUpDate && (
                                                <div className="flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl">
                                                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                                    Follow-up: {new Date(consultation.followUpDate).toLocaleDateString('en-GB')}
                                                </div>
                                            )}

                                            {consultation.referralInfo && (
                                                <div className="text-[11px] text-slate-500 font-medium">
                                                    Referral: <span className="font-bold text-slate-700">{consultation.referralInfo}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Printable Prescription Modal */}
                {printModalOpen && activeConsultation && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
                            {/* Modal Action Header (hidden during print) */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Printer className="w-5 h-5 text-teal-600" />
                                        Official Outpatient Prescription Slip
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Print or save prescription record for patient {activeConsultation.patientId?.name}.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={triggerBrowserPrint}
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                                    >
                                        <Printer className="w-4 h-4" /> Print Document
                                    </button>
                                    <button
                                        onClick={() => setPrintModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* PRINTABLE RX SHEET CONTAINER */}
                            <div className="border border-slate-300 p-6 sm:p-8 rounded-2xl bg-white space-y-5 text-slate-900" id="printable-rx">
                                {/* Hospital Top Letterhead */}
                                <div className="text-center border-b-2 border-slate-900 pb-4">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                        {activeConsultation.hospitalId?.name || data.doctor?.hospital?.name || 'Government General Hospital'}
                                    </h2>
                                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                                        Department of {activeConsultation.doctorId?.department || 'Outpatient Services (OPD)'} • Government Health System
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        {activeConsultation.hospitalId?.district || ''}, {activeConsultation.hospitalId?.state || ''} • Tel: {activeConsultation.hospitalId?.contactNumber || '108'}
                                    </p>
                                </div>

                                {/* Doctor & Patient Meta Grid */}
                                <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-200">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Attending Physician</span>
                                        <p className="font-black text-slate-900 text-sm mt-0.5">
                                            Dr. {activeConsultation.doctorId?.doctorName || data.doctor?.doctorName || 'Doctor'}
                                        </p>
                                        <p className="text-slate-600 font-medium">
                                            {activeConsultation.doctorId?.qualification || 'MBBS'} • Reg: {activeConsultation.doctorId?.registrationNumber || 'KMC-84920'}
                                        </p>
                                        <p className="text-slate-500 text-[11px]">
                                            {activeConsultation.doctorId?.specialization || 'General OPD'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Consultation Date & Token</span>
                                        <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                                            {new Date(activeConsultation.consultationDate || activeConsultation.createdAt).toLocaleDateString('en-GB')}
                                        </p>
                                        <p className="text-slate-600 font-bold">
                                            Token #{activeConsultation.appointmentId?.queuePosition || 1} • APT #{activeConsultation.appointmentId?.appointmentNumber || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Patient Demographics Bar */}
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-semibold block text-[10px]">Patient Name</span>
                                        <p className="font-black text-slate-900">{activeConsultation.patientId?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-semibold block text-[10px]">Age / Sex</span>
                                        <p className="font-bold text-slate-800">
                                            {calculateAge(activeConsultation.patientId?.dateOfBirth) ? `${calculateAge(activeConsultation.patientId?.dateOfBirth)} yrs` : 'N/A'} / {activeConsultation.patientId?.gender || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-semibold block text-[10px]">Phone Number</span>
                                        <p className="font-bold text-slate-800">{activeConsultation.patientId?.contact || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-semibold block text-[10px]">Allergies</span>
                                        <p className="font-bold text-red-600">{activeConsultation.patientId?.allergies || 'None reported'}</p>
                                    </div>
                                </div>

                                {/* Clinical Notes & Diagnosis */}
                                <div className="text-xs space-y-1">
                                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] block">
                                        Clinical Assessment & Findings:
                                    </span>
                                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                                        {activeConsultation.clinicalNotes}
                                    </p>
                                    {activeConsultation.observations && (
                                        <p className="text-[11px] text-slate-600 pt-1">
                                            <span className="font-bold">Observations / Vitals:</span> {activeConsultation.observations}
                                        </p>
                                    )}
                                </div>

                                {/* Rx Section */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-serif italic text-2xl font-black text-teal-800">℞</span>
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                            Prescribed Medicines & Dosage Schedule:
                                        </span>
                                    </div>

                                    {activeConsultation.medications && activeConsultation.medications.length > 0 ? (
                                        <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                                                    <th className="p-2 border border-slate-200">#</th>
                                                    <th className="p-2 border border-slate-200">Medicine Name</th>
                                                    <th className="p-2 border border-slate-200">Dosage</th>
                                                    <th className="p-2 border border-slate-200">Frequency (Schedule)</th>
                                                    <th className="p-2 border border-slate-200">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeConsultation.medications.map((m, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="p-2 border border-slate-200 font-bold">{idx + 1}</td>
                                                        <td className="p-2 border border-slate-200 font-black text-slate-900">{m.name}</td>
                                                        <td className="p-2 border border-slate-200 font-semibold">{m.dosage}</td>
                                                        <td className="p-2 border border-slate-200 text-slate-700">{m.frequency}</td>
                                                        <td className="p-2 border border-slate-200 font-semibold text-slate-800">{m.duration}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">No oral or parenteral medications prescribed.</p>
                                    )}
                                </div>

                                {/* Advice / Follow Up / Signature */}
                                <div className="pt-6 grid grid-cols-2 gap-4 items-end border-t border-slate-200 text-xs">
                                    <div>
                                        {activeConsultation.followUpDate && (
                                            <p className="font-bold text-slate-800">
                                                Review Date: {new Date(activeConsultation.followUpDate).toLocaleDateString('en-GB')}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            * Valid for government pharmacy dispense within 7 days.
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <div className="inline-block text-center border-t border-slate-900 pt-2 min-w-[160px]">
                                            <p className="font-black text-slate-900 text-xs">
                                                Dr. {activeConsultation.doctorId?.doctorName || data.doctor?.doctorName || 'Doctor'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium">Digital Signature Stamp</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Close */}
                            <div className="flex justify-end print:hidden">
                                <button
                                    onClick={() => setPrintModalOpen(false)}
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

export default DoctorConsultationsPage;
