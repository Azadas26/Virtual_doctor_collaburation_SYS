import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import {
    Clock,
    UserCheck,
    Stethoscope,
    CheckCircle2,
    FileText,
    AlertTriangle,
    Plus,
    Trash2,
    Activity,
    Building2,
    Calendar,
    Phone,
    MapPin,
    HeartPulse,
    ShieldAlert,
    Pill,
    X,
    Eye,
    User,
    CalendarCheck,
    FileCheck
} from 'lucide-react';

const DoctorQueuePage = () => {
    const [queueData, setQueueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);

    // Patient Details Modal State
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedPatientInfo, setSelectedPatientInfo] = useState(null);
    const [patientHistoryList, setPatientHistoryList] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Active consultation prescription modal state
    const [showConsultModal, setShowConsultModal] = useState(false);
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [observations, setObservations] = useState('');
    const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '5 days' }]);
    const [investigations, setInvestigations] = useState(['']);
    const [submitting, setSubmitting] = useState(false);

    const fetchQueue = async (docId = selectedDoctorId) => {
        try {
            const url = docId ? `/consultations/queue?doctorId=${docId}` : '/consultations/queue';
            const res = await API.get(url);
            if (res.data.success) {
                setQueueData(res.data);
                if (!docId && res.data.doctor?._id) {
                    setSelectedDoctorId(res.data.doctor._id);
                }
            }
        } catch (error) {
            console.error('Fetch queue error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue(selectedDoctorId);
        const interval = setInterval(() => {
            fetchQueue(selectedDoctorId);
        }, 5000); // Live poll queue every 5s
        return () => clearInterval(interval);
    }, [selectedDoctorId]);

    const handleStartConsultation = async (appointmentId) => {
        try {
            const res = await API.put(`/consultations/appointments/${appointmentId}/start`);
            if (res.data.success) {
                fetchQueue();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error starting consultation.');
        }
    };

    const handleOpenPatientDetails = async (appointment) => {
        const patient = appointment.patientId || {};
        setSelectedPatientInfo({
            ...patient,
            appointmentNumber: appointment.appointmentNumber,
            symptoms: appointment.symptoms,
            symptomDuration: appointment.symptomDuration,
            priorityCategory: appointment.priorityCategory,
            allocationReason: appointment.allocationReason,
            queuePosition: appointment.queuePosition,
            timeSlot: appointment.timeSlot,
            appointmentId: appointment._id
        });
        setDetailsModalOpen(true);
        setLoadingHistory(true);

        try {
            if (patient._id) {
                const res = await API.get(`/consultations/patient/${patient._id}`);
                if (res.data.success) {
                    setPatientHistoryList(res.data.consultations || []);
                }
            } else {
                setPatientHistoryList([]);
            }
        } catch (err) {
            console.error('Fetch patient consultation history error:', err);
            setPatientHistoryList([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleAddMedicationRow = () => {
        setMedications([...medications, { name: '', dosage: '', duration: '5 days' }]);
    };

    const handleRemoveMedicationRow = (idx) => {
        setMedications(medications.filter((_, i) => i !== idx));
    };

    const handleMedChange = (idx, field, val) => {
        const updated = [...medications];
        updated[idx][field] = val;
        setMedications(updated);
    };

    const handleCompleteConsultation = async (e) => {
        e.preventDefault();
        if (!queueData?.currentPatient) return;
        setSubmitting(true);
        try {
            const res = await API.post('/consultations', {
                appointmentId: queueData.currentPatient._id,
                clinicalNotes,
                observations,
                medications: medications.filter(m => m.name.trim() !== ''),
                investigations: investigations.filter(i => i && i.trim() !== '')
            });
            if (res.data.success) {
                alert('Consultation completed! Prescription and clinical records stored.');
                setShowConsultModal(false);
                setClinicalNotes('');
                setObservations('');
                setMedications([{ name: '', dosage: '', duration: '5 days' }]);
                fetchQueue();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error completing consultation.');
        } finally {
            setSubmitting(false);
        }
    };

    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    const { currentPatient, nextPatient, waitingQueue, completedQueue, summary, doctor, activeContract } = queueData || {};

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                {/* 1. Modern Light Shift Schedule & Hospital Banner */}
                <div className="hero-banner-light p-7 mb-8 relative overflow-hidden border border-teal-200/90 text-slate-900 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 bg-teal-100/80 text-teal-800 text-xs font-bold px-3 py-1 rounded-full mb-2.5 border border-teal-300/60 shadow-xs">
                                <Clock className="w-3.5 h-3.5 text-teal-600" />
                                {doctor?.doctorType === 'TEMPORARY'
                                    ? 'Voluntary Capacity Sharing Shift'
                                    : 'Permanent OPD Clinical Shift'}
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                                Dr. {doctor?.doctorName || 'Doctor'}
                            </h1>
                            <p className="text-teal-700 font-bold text-sm mt-0.5">
                                {doctor?.specialization} • {doctor?.department}
                                {doctor?.qualification ? ` (${doctor.qualification})` : ''}
                            </p>
                            <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                                {doctor?.hospital?.name || activeContract?.hospitalName || 'Government Hospital'}
                                {doctor?.hospital?.district ? ` (${doctor.hospital.district})` : ''}
                            </p>
                        </div>

                        {/* Shift Timings & Contract Card */}
                        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl text-xs space-y-2 min-w-[270px] shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-semibold flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Shift Hours:
                                </span>
                                <span className="font-bold text-slate-900">
                                    {activeContract?.workingHours || doctor?.workingHours?.start + ' - ' + doctor?.workingHours?.end || '09:00 AM - 01:00 PM'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-semibold flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-teal-600" /> Duty Days:
                                </span>
                                <span className="font-bold text-teal-700 truncate max-w-[160px]">
                                    {activeContract?.workingDays?.join(', ') || doctor?.workingDays?.join(', ') || 'Mon, Wed, Fri'}
                                </span>
                            </div>

                            {activeContract && (
                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Contract:
                                    </span>
                                    <span className="font-mono font-bold text-emerald-700">
                                        {activeContract.contractNumber}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Today Live Counter Pills */}
                    <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-teal-100">
                        <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                            <span className="text-[11px] font-bold text-slate-500 uppercase block tracking-wider">Today Patients</span>
                            <span className="text-2xl font-black text-slate-900 font-mono">{summary?.totalToday || 0}</span>
                        </div>
                        <div className="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-200/80 text-center shadow-xs">
                            <span className="text-[11px] font-bold text-amber-800 uppercase block tracking-wider">Waiting in Queue</span>
                            <span className="text-2xl font-black text-amber-700 font-mono">{summary?.waitingCount || 0}</span>
                        </div>
                        <div className="bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-200/80 text-center shadow-xs">
                            <span className="text-[11px] font-bold text-emerald-800 uppercase block tracking-wider">Completed</span>
                            <span className="text-2xl font-black text-emerald-700 font-mono">{summary?.completedCount || 0}</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm font-semibold">Synchronizing Live Patient Queue & Shift Schedule...</p>
                    </div>
                ) : !doctor ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto shadow-sm">
                        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Active OPD Shift Assignment</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            {queueData?.message || 'Please check your active hospital contract on the Contracts page to begin live consultation shifts.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left 2 Cols: Active & Next Patients */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* CURRENT PATIENT IN CONSULTATION */}
                            <div className="card-modern border-2 border-teal-500/80 p-6 relative overflow-hidden shadow-xl shadow-teal-900/5">
                                <div className="absolute top-0 right-0 bg-teal-600 text-white text-[11px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                    <HeartPulse className="w-3.5 h-3.5 animate-pulse" /> In Consultation
                                </div>

                                <h3 className="font-black text-slate-900 text-xl mb-4 flex items-center gap-2">
                                    <Stethoscope className="w-6 h-6 text-teal-600" /> Active OP Consultation
                                </h3>

                                {currentPatient ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between panel-subtle p-5 border border-slate-200/80 gap-4 shadow-xs">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-2xl font-black text-slate-900">
                                                        {currentPatient.patientId?.name || 'Patient'}
                                                    </p>
                                                    {calculateAge(currentPatient.patientId?.dateOfBirth) && (
                                                        <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
                                                            {calculateAge(currentPatient.patientId?.dateOfBirth)} yrs • {currentPatient.patientId?.gender}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                    <span className="font-mono font-bold text-slate-900">Token #{currentPatient.queuePosition}</span>
                                                    <span>•</span>
                                                    <span>APT #{currentPatient.appointmentNumber}</span>
                                                    <span>•</span>
                                                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                                        currentPatient.priorityCategory === 'EMERGENCY' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        currentPatient.priorityCategory === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    }`}>
                                                        {currentPatient.priorityCategory} PRIORITY
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenPatientDetails(currentPatient)}
                                                    className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-200 shadow-xs"
                                                >
                                                    <Eye className="w-4 h-4 text-slate-600" /> Full Patient Details
                                                </button>

                                                <button
                                                    onClick={() => setShowConsultModal(true)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition active:scale-95"
                                                >
                                                    <FileText className="w-4 h-4" /> Prescribe & Complete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Chief Symptoms & Background Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="panel-subtle p-4 border border-slate-200/80 shadow-xs">
                                                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Chief Symptoms Reported</span>
                                                <p className="font-extrabold text-slate-900 text-sm">{currentPatient.symptoms}</p>
                                                <span className="text-slate-400 text-[11px] block mt-1">Duration: {currentPatient.symptomDuration}</span>
                                            </div>

                                            <div className="panel-subtle p-4 border border-slate-200/80 shadow-xs">
                                                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Medical Background</span>
                                                <p className="font-semibold text-slate-800">
                                                    History: <span className="font-normal">{currentPatient.patientId?.medicalHistory || 'None reported'}</span>
                                                </p>
                                                <p className="font-semibold text-red-600 mt-1">
                                                    Allergies: <span className="font-bold">{currentPatient.patientId?.allergies || currentPatient.allergies || 'None reported'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-10 text-center text-slate-500 text-sm bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                                        <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
                                        <p className="font-bold text-slate-700">No Patient Currently in Consultation</p>
                                        <p className="text-xs text-slate-400">
                                            {waitingQueue && waitingQueue.length > 0
                                                ? 'Click "Call Patient" on the next patient below to begin consultation.'
                                                : 'All patients in today\'s shift queue have been attended.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* NEXT WAITING PATIENT CARD */}
                            {nextPatient && (
                                <div className="card-modern p-6 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/60 to-white">
                                    <div>
                                        <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                            Next In Queue (Token #{nextPatient.queuePosition})
                                        </span>
                                        <p className="font-black text-slate-900 text-lg mt-1.5">
                                            {nextPatient.patientId?.name || 'Next Patient'}
                                        </p>
                                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                                            Symptoms: {nextPatient.symptoms} ({nextPatient.symptomDuration})
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenPatientDetails(nextPatient)}
                                            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Details
                                        </button>
                                        <button
                                            onClick={() => handleStartConsultation(nextPatient._id)}
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md shadow-amber-600/20 active:scale-95"
                                        >
                                            Call Patient into Room
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Col: Full Waiting Queue List */}
                        <div className="card-modern p-6 border border-slate-200/80 shadow-sm h-fit">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-600" /> Waiting List ({waitingQueue?.length || 0})
                                </h3>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live OPD Tokens</span>
                            </div>

                            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                                {waitingQueue && waitingQueue.length > 0 ? (
                                    waitingQueue.map((item, idx) => (
                                        <div
                                            key={item._id}
                                            className="p-4 panel-subtle hover:bg-teal-50/40 hover:border-teal-200 transition-all rounded-2xl border border-slate-200/80 text-xs space-y-2.5 shadow-xs"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md font-mono">
                                                        #{item.queuePosition || idx + 1}
                                                    </span>
                                                    <span className="font-bold text-slate-900 text-sm">
                                                        {item.patientId?.name || 'Patient'}
                                                    </span>
                                                </div>
                                                <span className={`font-extrabold px-2 py-0.5 rounded-md text-[10px] ${
                                                    item.priorityCategory === 'EMERGENCY' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                    item.priorityCategory === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                                    'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {item.priorityCategory}
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-slate-600 line-clamp-2">
                                                {item.symptoms}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    Wait: ~{item.estimatedWaitTimeMinutes || 15} mins
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenPatientDetails(item)}
                                                        className="text-slate-600 hover:text-slate-900 font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] flex items-center gap-1 transition shadow-xs"
                                                    >
                                                        <Eye className="w-3 h-3" /> View
                                                    </button>
                                                    <button
                                                        onClick={() => handleStartConsultation(item._id)}
                                                        className="text-teal-700 hover:text-teal-800 font-bold px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-[11px] transition shadow-xs hover:bg-teal-100"
                                                    >
                                                        Call
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                                        No waiting patients in queue.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. COMPREHENSIVE PATIENT DETAILS MODAL ("Show the patient details") */}
                {detailsModalOpen && selectedPatientInfo && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center font-black text-lg">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">
                                            {selectedPatientInfo.name}
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Token #{selectedPatientInfo.queuePosition} • APT #{selectedPatientInfo.appointmentNumber}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setDetailsModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Demographics & Contact Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 font-semibold block">Age / Gender</span>
                                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                                        {calculateAge(selectedPatientInfo.dateOfBirth) ? `${calculateAge(selectedPatientInfo.dateOfBirth)} yrs` : 'N/A'} • {selectedPatientInfo.gender || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold block">Contact Number</span>
                                    <p className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedPatientInfo.contact || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold block">Triage Priority</span>
                                    <span className={`inline-block font-extrabold px-2 py-0.5 rounded-md text-[10px] mt-1 ${
                                        selectedPatientInfo.priorityCategory === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                                        selectedPatientInfo.priorityCategory === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                                        'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {selectedPatientInfo.priorityCategory}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-semibold block">Time Slot</span>
                                    <p className="font-bold text-slate-900 text-xs mt-1">
                                        {selectedPatientInfo.timeSlot || '09:00 AM'}
                                    </p>
                                </div>
                            </div>

                            {/* Address & Emergency Contact */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-slate-400 font-semibold block">Patient Residential Address</span>
                                        <p className="font-medium text-slate-800 mt-0.5">{selectedPatientInfo.address || 'Not specified'}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-slate-400 font-semibold block">Emergency Contact</span>
                                        <p className="font-medium text-slate-800 mt-0.5">
                                            {selectedPatientInfo.emergencyContact?.name ? (
                                                `${selectedPatientInfo.emergencyContact.name} (${selectedPatientInfo.emergencyContact.relation || 'Contact'}): ${selectedPatientInfo.emergencyContact.phone || ''}`
                                            ) : 'None provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical Presentation & Allergies */}
                            <div className="space-y-3">
                                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
                                    Clinical Presentation & Health History
                                </h3>

                                <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-teal-900">Current Reported Symptoms</span>
                                        <span className="text-teal-700 font-semibold">Duration: {selectedPatientInfo.symptomDuration}</span>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">{selectedPatientInfo.symptoms}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200">
                                        <span className="font-extrabold text-red-700 flex items-center gap-1.5 mb-1">
                                            <ShieldAlert className="w-4 h-4 text-red-600" /> Known Drug Allergies
                                        </span>
                                        <p className="font-bold text-red-900">
                                            {selectedPatientInfo.allergies || 'None reported'}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                        <span className="font-bold text-slate-700 block mb-1">
                                            Existing Medical Conditions
                                        </span>
                                        <p className="font-medium text-slate-900">
                                            {selectedPatientInfo.existingConditions || selectedPatientInfo.medicalHistory || 'None reported'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Past Medical History & Prescriptions Timeline */}
                            <div className="pt-2 border-t border-slate-100">
                                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                    <CalendarCheck className="w-4 h-4 text-teal-600" /> Past Consultations & Prescriptions
                                </h3>

                                {loadingHistory ? (
                                    <div className="py-6 text-center text-xs text-slate-400">
                                        Loading past records...
                                    </div>
                                ) : patientHistoryList.length === 0 ? (
                                    <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 border border-slate-100">
                                        No prior hospital consultations recorded in the system.
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                        {patientHistoryList.map((rec) => (
                                            <div key={rec._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                                                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                    <div>
                                                        <span className="font-bold text-slate-900">
                                                            Dr. {rec.doctorId?.doctorName || 'Doctor'}
                                                        </span>
                                                        <span className="text-slate-500 text-[11px] block">
                                                            {rec.hospitalId?.name || 'Government Hospital'}
                                                        </span>
                                                    </div>
                                                    <span className="text-slate-400 text-[11px]">
                                                        {new Date(rec.consultationDate || rec.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <p className="text-slate-700">
                                                    <span className="font-bold text-slate-800">Notes:</span> {rec.clinicalNotes}
                                                </p>

                                                {rec.medications && rec.medications.length > 0 && (
                                                    <div className="pt-1">
                                                        <span className="font-bold text-slate-600 text-[11px] block mb-1 flex items-center gap-1">
                                                            <Pill className="w-3 h-3 text-teal-600" /> Prescribed:
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {rec.medications.map((med, i) => (
                                                                <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-800">
                                                                    {med.name} ({med.dosage}) - {med.duration}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => setDetailsModalOpen(false)}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                                >
                                    Close Details
                                </button>
                                {selectedPatientInfo.appointmentId !== currentPatient?._id && (
                                    <button
                                        onClick={() => {
                                            setDetailsModalOpen(false);
                                            handleStartConsultation(selectedPatientInfo.appointmentId);
                                        }}
                                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition"
                                    >
                                        Call This Patient Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. CLINICAL PRESCRIPTION & COMPLETE CONSULTATION MODAL */}
                {showConsultModal && currentPatient && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">
                                        Digital Clinical Entry & Prescription
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Patient: <span className="font-bold text-slate-900">{currentPatient.patientId?.name}</span> (Token #{currentPatient.queuePosition} • APT #{currentPatient.appointmentNumber})
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowConsultModal(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCompleteConsultation} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Clinical Diagnosis & Findings
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={clinicalNotes}
                                        onChange={(e) => setClinicalNotes(e.target.value)}
                                        placeholder="Enter clinical assessment, diagnosis, and findings..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Doctor Observations / Vitals
                                    </label>
                                    <input
                                        type="text"
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        placeholder="e.g. Temp: 98.6F, BP: 120/80 mmHg, SpO2: 99%"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* Medications Table */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                            <Pill className="w-3.5 h-3.5 text-teal-600" /> Prescribed Medications
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddMedicationRow}
                                            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add Drug
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {medications.map((med, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs">
                                                <input
                                                    type="text"
                                                    placeholder="Medicine Name (e.g. Paracetamol)"
                                                    value={med.name}
                                                    onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Dosage (e.g. 500mg 1-0-1)"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                                                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Duration"
                                                    value={med.duration}
                                                    onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                                                    className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                                                />
                                                {medications.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMedicationRow(idx)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowConsultModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20"
                                    >
                                        {submitting ? 'Saving Prescription...' : 'Complete Consultation & Store Record'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorQueuePage;
