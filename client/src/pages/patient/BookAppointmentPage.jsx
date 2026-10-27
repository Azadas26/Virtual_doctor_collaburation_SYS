import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import {
    Stethoscope,
    Building2,
    AlertTriangle,
    Clock,
    ShieldCheck,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    UserCheck,
    Calendar,
    Users,
    ChevronRight,
    Check,
    Info
} from 'lucide-react';

// Helper: YYYY-MM-DD in local timezone
const toLocalDateStr = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
const todayStr = toLocalDateStr(new Date());

const BookAppointmentPage = () => {
    const [searchParams] = useSearchParams();
    const initialHospId = searchParams.get('hospitalId') || '';
    const initialDocId = searchParams.get('doctorId') || '';
    const initialDept = searchParams.get('department') || 'General Medicine';

    const [hospitals, setHospitals] = useState([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState(initialHospId);
    const [department, setDepartment] = useState(initialDept);
    const [symptoms, setSymptoms] = useState('');
    const [symptomDuration, setSymptomDuration] = useState('1-3 days');

    // Doctor selection state
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState(initialDocId);
    const [doctorSelectionMode, setDoctorSelectionMode] = useState(initialDocId ? 'SPECIFIC' : 'AUTO');
    const [loadingDoctors, setLoadingDoctors] = useState(false);

    // Preview & Triage State
    const [triagePreviewData, setTriagePreviewData] = useState(null);
    const [evaluating, setEvaluating] = useState(false);
    const [booking, setBooking] = useState(false);
    const [bookedAppointment, setBookedAppointment] = useState(null);

    // Appointment date state
    const [appointmentDate, setAppointmentDate] = useState(todayStr);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const res = await API.get('/hospitals');
                if (res.data.success) {
                    const list = res.data.data || res.data.hospitals || [];
                    setHospitals(list);
                    if (!selectedHospitalId && list.length > 0) {
                        setSelectedHospitalId(list[0]._id);
                    }
                }
            } catch (error) {
                console.error('Fetch hospitals error:', error);
            }
        };
        fetchHospitals();
    }, []);

    // Fetch doctors when hospital or department changes
    useEffect(() => {
        if (!selectedHospitalId) return;
        const fetchDoctors = async () => {
            setLoadingDoctors(true);
            try {
                let res = await API.get(`/hospitals/${selectedHospitalId}/doctors?department=${encodeURIComponent(department)}`);
                let list = res.data.doctors || [];
                // Fallback: fetch all active doctors for hospital if none matched strict department
                if (list.length === 0) {
                    res = await API.get(`/hospitals/${selectedHospitalId}/doctors`);
                    list = res.data.doctors || [];
                }
                setDoctors(list);

                // If currently selected doctor is not in the list, keep it only if initialDocId was passed
                if (selectedDoctorId && !list.some(d => d._id === selectedDoctorId)) {
                    if (selectedDoctorId !== initialDocId) {
                        setSelectedDoctorId('');
                    }
                }
            } catch (error) {
                console.error('Fetch doctors error:', error);
                setDoctors([]);
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, [selectedHospitalId, department]);

    const handleDoctorSelect = (docId) => {
        setSelectedDoctorId(docId);
        setDoctorSelectionMode(docId ? 'SPECIFIC' : 'AUTO');
        // Reset appointment date when switching doctor
        setAppointmentDate(todayStr);
        setTriagePreviewData(null);
    };

    const handleEvaluateTriage = async (e) => {
        e.preventDefault();
        if (!selectedHospitalId || !symptoms) return;
        setEvaluating(true);
        try {
            const res = await API.post('/appointments/triage-preview', {
                hospitalId: selectedHospitalId,
                department,
                symptoms,
                appointmentDate
            });
            if (res.data.success) {
                setTriagePreviewData(res.data);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error evaluating symptoms.');
        } finally {
            setEvaluating(false);
        }
    };

    const handleConfirmBooking = async () => {
        setBooking(true);
        try {
            const res = await API.post('/appointments', {
                hospitalId: selectedHospitalId,
                department,
                symptoms,
                symptomDuration,
                appointmentDate,
                preferredDoctorId: selectedDoctorId || undefined,
                doctorId: selectedDoctorId || undefined
            });
            if (res.data.success) {
                setBookedAppointment(res.data);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error booking appointment.');
        } finally {
            setBooking(false);
        }
    };

    const selectedDoctorObj = doctors.find(d => d._id === selectedDoctorId);

    // Compute date constraints based on selected doctor type
    const getDateConstraints = () => {
        if (!selectedDoctorObj) {
            // Auto-assign or no doctor: today onwards
            return { min: todayStr, max: undefined, isTempRestricted: false };
        }
        if (selectedDoctorObj.doctorType === 'TEMPORARY') {
            const minDate = selectedDoctorObj.startDate
                ? toLocalDateStr(selectedDoctorObj.startDate)
                : todayStr;
            const maxDate = selectedDoctorObj.endDate
                ? toLocalDateStr(selectedDoctorObj.endDate)
                : undefined;
            return { min: minDate, max: maxDate, isTempRestricted: true };
        }
        // Fixed doctor: today onwards
        return { min: todayStr, max: undefined, isTempRestricted: false };
    };
    const dateConstraints = getDateConstraints();

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-5xl">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Dynamic Capacity Sharing OP Ticket System
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Book Outpatient Consultation
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Select a government hospital, choose a specific attending physician or let smart allocation route you to the fastest queue.
                    </p>
                </div>

                {bookedAppointment ? (
                    /* Confirmation Ticket Card */
                    <div className="card-modern p-8 border-2 border-emerald-500 shadow-xl space-y-6 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center justify-center font-bold shadow-xs">
                                    <CheckCircle2 className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-xl">OP Appointment Confirmed</h3>
                                    <p className="text-xs text-slate-500">
                                        Ticket Number: <span className="font-mono font-bold text-slate-900">{bookedAppointment.appointment?.appointmentNumber}</span>
                                    </p>
                                </div>
                            </div>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3.5 py-1 rounded-full uppercase shadow-xs">
                                {bookedAppointment.appointment?.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 panel-subtle p-5 border border-slate-200/80 text-xs shadow-xs">
                            <div>
                                <span className="text-slate-500 font-semibold block mb-1">Attending Physician</span>
                                <p className="font-black text-slate-900 text-base">Dr. {bookedAppointment.doctor?.name}</p>
                                <span className="text-teal-700 font-bold block mt-0.5">
                                    {bookedAppointment.doctor?.type} PHYSICIAN ({bookedAppointment.doctor?.specialization})
                                </span>
                            </div>

                            <div>
                                <span className="text-slate-500 font-semibold block mb-1">Queue & Estimated Wait</span>
                                <p className="font-black text-slate-900 text-base">Token Position: #{bookedAppointment.appointment?.queuePosition}</p>
                                <p className="text-amber-700 font-bold mt-0.5">
                                    Est. Wait: ~{bookedAppointment.appointment?.estimatedWaitTimeMinutes} mins
                                </p>
                            </div>
                        </div>

                        {/* Smart Allocation Reason Badges */}
                        <div className="pt-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Doctor Allocation Details:</span>
                            <div className="space-y-1.5">
                                {bookedAppointment.appointment?.allocationReason?.map((reason, i) => (
                                    <div key={i} className="text-xs text-slate-700 bg-teal-50/80 border border-teal-200/80 p-2.5 rounded-xl flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                                        <span className="font-medium">{reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => navigate('/patient/appointments')}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 active:scale-95"
                            >
                                Go to My Appointments & Live Queue Tracker <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Booking Form */
                    <div className="card-modern p-8 border border-slate-200/80 shadow-sm space-y-7">
                        <form onSubmit={handleEvaluateTriage} className="space-y-6">
                            {/* Hospital & Department */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Select Government Hospital
                                    </label>
                                    <select
                                        value={selectedHospitalId}
                                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                    >
                                        {hospitals.map((h) => (
                                            <option key={h._id} value={h._id}>
                                                {h.name} ({h.district})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Clinical Department
                                    </label>
                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                    >
                                        <option value="General Medicine">General Medicine</option>
                                        <option value="Orthopedics">Orthopedics</option>
                                        <option value="Pediatrics">Pediatrics</option>
                                        <option value="Pulmonology">Pulmonology</option>
                                        <option value="General Surgery">General Surgery</option>
                                        <option value="Dermatology">Dermatology</option>
                                        <option value="Cardiology">Cardiology</option>
                                    </select>
                                </div>
                            </div>

                            {/* DOCTOR SELECTION INTERFACE ("Book Particular Doctor") */}
                            <div className="space-y-3 pt-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                    <div>
                                        <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <Stethoscope className="w-4 h-4 text-teal-600" />
                                            Doctor Preference / Allocation Mode
                                        </label>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Choose a specific physician or let the system route to the fastest available queue.
                                        </p>
                                    </div>

                                    {/* Mode Pills */}
                                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => handleDoctorSelect('')}
                                            className={`px-3 py-1.5 rounded-lg transition ${
                                                !selectedDoctorId
                                                    ? 'bg-white text-teal-800 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-teal-600" />
                                            Auto-Assign (Fastest)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (doctors.length > 0 && !selectedDoctorId) {
                                                    handleDoctorSelect(doctors[0]._id);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg transition ${
                                                selectedDoctorId
                                                    ? 'bg-teal-600 text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                        >
                                            <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                                            Choose Specific Doctor
                                        </button>
                                    </div>
                                </div>

                                {loadingDoctors ? (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 py-6 justify-center">
                                        <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Loading hospital doctors and OPD queues...</span>
                                    </div>
                                ) : doctors.length === 0 ? (
                                    <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                                        No active doctors currently registered for this department. Automatic smart allocation will assign on duty.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Auto-Assign Card */}
                                        <div
                                            onClick={() => handleDoctorSelect('')}
                                            className={`cursor-pointer p-4 rounded-2xl border-2 transition text-left flex items-start gap-3.5 ${
                                                !selectedDoctorId
                                                    ? 'border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                                                !selectedDoctorId ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-extrabold text-slate-900 text-sm">Smart Auto-Allocation</p>
                                                    {!selectedDoctorId && (
                                                        <span className="text-[10px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Selected
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Dynamically balances load between permanent and voluntary doctors to minimize your wait time.
                                                </p>
                                                <span className="inline-block mt-2 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                                                    Recommended for Lowest Wait Time
                                                </span>
                                            </div>
                                        </div>

                                        {/* Particular Doctor Cards */}
                                        {doctors.map((doc) => {
                                            const isSelected = selectedDoctorId === doc._id;
                                            return (
                                                <div
                                                    key={doc._id}
                                                    onClick={() => handleDoctorSelect(doc._id)}
                                                    className={`cursor-pointer p-4 rounded-2xl border-2 transition text-left flex items-start gap-3.5 ${
                                                        isSelected
                                                            ? 'border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                                                        doc.doctorType === 'FIXED'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {doc.doctorType === 'FIXED' ? 'FX' : 'VL'}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <p className="font-extrabold text-slate-900 text-sm truncate">
                                                                Dr. {doc.doctorName}
                                                            </p>
                                                            {isSelected && (
                                                                <span className="text-[10px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                                                    <Check className="w-3 h-3" /> Selected
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                                            {doc.qualification || doc.specialization}
                                                        </p>

                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                                                doc.doctorType === 'FIXED'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {doc.doctorType === 'FIXED' ? 'Permanent Staff' : 'Voluntary Specialist'}
                                                            </span>

                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                                doc.waitingCount === 0
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            }`}>
                                                                {doc.waitingCount === 0
                                                                    ? 'Immediate Slot'
                                                                    : `${doc.waitingCount} waiting (~${doc.estimatedWaitTimeMinutes || 15}m)`}
                                                            </span>
                                                        </div>

                                                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {doc.workingHours?.start || '09:00 AM'} - {doc.workingHours?.end || '01:00 PM'}
                                                            {doc.workingDays?.length ? ` • ${doc.workingDays.slice(0, 3).join(', ')}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Appointment Date Picker */}
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <Calendar className="w-4 h-4 text-teal-600" />
                                        Appointment Date
                                    </label>

                                    {/* Temp doctor date restriction info banner */}
                                    {dateConstraints.isTempRestricted && (
                                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-2">
                                            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-amber-800 font-medium">
                                                Dr. <span className="font-bold">{selectedDoctorObj?.doctorName}</span> is a Voluntary Specialist available only from{' '}
                                                <span className="font-bold">
                                                    {dateConstraints.min ? new Date(dateConstraints.min).toLocaleDateString() : 'today'}
                                                </span>
                                                {dateConstraints.max && (
                                                    <> to <span className="font-bold">{new Date(dateConstraints.max).toLocaleDateString()}</span></>
                                                )}.
                                                Please select a date within this window.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="date"
                                            required
                                            min={dateConstraints.min}
                                            max={dateConstraints.max}
                                            value={appointmentDate}
                                            onChange={(e) => {
                                                setAppointmentDate(e.target.value);
                                                setTriagePreviewData(null); // reset preview on date change
                                            }}
                                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                            title={dateConstraints.isTempRestricted
                                                ? `Available: ${dateConstraints.min} to ${dateConstraints.max || 'open'}`
                                                : 'Select appointment date (today or later)'}
                                        />
                                        <div className="text-xs text-slate-500">
                                            {dateConstraints.isTempRestricted ? (
                                                <span className="text-amber-700 font-semibold">
                                                    ⚠ Restricted to doctor's availability window
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">Today or any future date</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Symptoms & Duration */}
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                            Describe Symptoms & Primary Complaint
                                        </label>

                                        <textarea
                                            rows={3}
                                            required
                                            value={symptoms}
                                            onChange={(e) => setSymptoms(e.target.value)}
                                            placeholder="e.g. Mild continuous fever for 3 days with throat irritation and body pain..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                            Symptom Duration
                                        </label>
                                        <input
                                            type="text"
                                            value={symptomDuration}
                                            onChange={(e) => setSymptomDuration(e.target.value)}
                                            placeholder="e.g. 2 days, 1 week"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-2">
                                            Helps clinicians triage your consultation queue.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={evaluating}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-md"
                            >
                                {evaluating ? 'Analyzing Symptoms & Queue Load...' : 'Analyze Symptoms & Preview Triage Ticket'} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        {/* Triage Preview Results */}
                        {triagePreviewData && (
                            <div className="pt-6 border-t border-slate-100 space-y-4 animate-in fade-in">
                                {/* Emergency Triage Warning */}
                                {triagePreviewData.triage?.isEmergencyWarningShown && (
                                    <div className="bg-red-50 border-2 border-red-500 p-5 rounded-2xl text-red-900 space-y-2">
                                        <div className="flex items-center gap-2 font-extrabold text-base text-red-700">
                                            <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" /> EMERGENCY TRIAGE ALERT
                                        </div>
                                        <p className="text-xs leading-relaxed font-medium">
                                            {triagePreviewData.triage.warningMessage}
                                        </p>
                                    </div>
                                )}

                                <div className="bg-teal-50/70 p-5 rounded-2xl border border-teal-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                                            Triage Priority Assessment:
                                        </span>
                                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                                            triagePreviewData.triage?.priority === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                                            triagePreviewData.triage?.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                                            'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {triagePreviewData.triage?.priority} PRIORITY
                                        </span>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-teal-100 text-xs text-slate-700">
                                        <span className="font-bold text-slate-900 block mb-0.5">Booking Destination:</span>
                                        {selectedDoctorObj ? (
                                            <p className="text-teal-900 font-semibold">
                                                Your appointment will be confirmed with your selected physician: <span className="font-bold">Dr. {selectedDoctorObj.doctorName}</span> ({selectedDoctorObj.doctorType} • {selectedDoctorObj.specialization}).
                                            </p>
                                        ) : (
                                            <p className="text-slate-600">
                                                The e-Health Bridge smart capacity allocation will assign you to the fastest available queue (Voluntary Specialist or Permanent Medical Officer).
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleConfirmBooking}
                                    disabled={booking}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-4 px-4 rounded-2xl shadow-lg shadow-teal-600/30 text-base flex items-center justify-center gap-2 transition"
                                >
                                    {booking ? 'Confirming OP Ticket...' : 'Confirm Outpatient Consultation Ticket'} <CheckCircle2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BookAppointmentPage;
