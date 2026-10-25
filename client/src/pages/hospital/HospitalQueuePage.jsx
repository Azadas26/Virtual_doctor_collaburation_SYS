import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import {
    Clock,
    Users,
    Stethoscope,
    Building2,
    CheckCircle2,
    AlertCircle,
    User,
    Calendar,
    Phone,
    MapPin,
    HeartPulse,
    Eye,
    X,
    FileText,
    Pill,
    ArrowRight,
    RefreshCw,
    Activity,
    ShieldAlert
} from 'lucide-react';

const HospitalQueuePage = () => {
    const [queueData, setQueueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);

    // Patient Details Modal State
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedPatientInfo, setSelectedPatientInfo] = useState(null);
    const [patientHistoryList, setPatientHistoryList] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Complete Consultation Modal State
    const [showConsultModal, setShowConsultModal] = useState(false);
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [observations, setObservations] = useState('');
    const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '5 days' }]);
    const [investigations, setInvestigations] = useState(['']);
    const [submittingConsult, setSubmittingConsult] = useState(false);

    const fetchQueue = async (docId = selectedDoctorId, isBackground = false) => {
        if (!isBackground) setLoading(true);
        else setRefreshing(true);

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
            console.error('Fetch hospital queue error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchQueue(selectedDoctorId, false);
        const interval = setInterval(() => {
            fetchQueue(selectedDoctorId, true);
        }, 5000); // 5s live polling
        return () => clearInterval(interval);
    }, [selectedDoctorId]);

    const handleDoctorSelect = (docId) => {
        setSelectedDoctorId(docId);
        fetchQueue(docId, false);
    };

    const handleStartConsultation = async (appointmentId) => {
        try {
            const res = await API.put(`/consultations/appointments/${appointmentId}/start`);
            if (res.data.success) {
                fetchQueue(selectedDoctorId, true);
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
            console.error('Error fetching patient history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCompleteConsultationSubmit = async (e) => {
        e.preventDefault();
        if (!queueData?.currentPatient?._id) return;
        setSubmittingConsult(true);

        try {
            const res = await API.post('/consultations', {
                appointmentId: queueData.currentPatient._id,
                clinicalNotes,
                observations,
                medications: medications.filter(m => m.name.trim() !== ''),
                investigations: investigations.filter(i => i.trim() !== '')
            });

            if (res.data.success) {
                alert('Consultation completed and prescription stored!');
                setShowConsultModal(false);
                setClinicalNotes('');
                setObservations('');
                setMedications([{ name: '', dosage: '', duration: '5 days' }]);
                setInvestigations(['']);
                fetchQueue(selectedDoctorId, true);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error completing consultation.');
        } finally {
            setSubmittingConsult(false);
        }
    };

    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    const {
        hospital,
        hospitalDoctors = [],
        doctor,
        activeContract,
        summary,
        currentPatient,
        nextPatient,
        waitingQueue = [],
        completedQueue = []
    } = queueData || {};

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                {/* 1. Header Banner */}
                <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-7 rounded-3xl shadow-md mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full mb-2.5 border border-teal-400/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                Live Hospital OPD Patient Queue
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
                                {hospital?.name || 'Government Hospital Live OPD Center'}
                            </h1>
                            <p className="text-teal-200/80 text-xs mt-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                {hospital ? `${hospital.address}, ${hospital.district}, ${hospital.state}` : 'Real-time patient tokens, OPD consultation suites & capacity monitoring'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fetchQueue(selectedDoctorId, false)}
                                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-1.5 transition"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                Live Polling (5s)
                            </button>
                        </div>
                    </div>

                    {/* Hospital OPD Summary Stat Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-teal-800/80 text-center">
                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                            <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider block">OPD Doctors Active</span>
                            <span className="text-xl font-black font-mono">{hospitalDoctors.length}</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                            <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider block">Total Patients Today</span>
                            <span className="text-xl font-black font-mono">{summary?.totalToday || 0}</span>
                        </div>
                        <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-400/30">
                            <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider block">In Waiting Queue</span>
                            <span className="text-xl font-black font-mono text-amber-300">{summary?.waitingCount || 0}</span>
                        </div>
                        <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-400/30">
                            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block">Completed Consultations</span>
                            <span className="text-xl font-black font-mono text-emerald-300">{summary?.completedCount || 0}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Doctor OPD Roster Selector */}
                {hospitalDoctors.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Stethoscope className="w-4 h-4 text-teal-600" />
                                Hospital OPD Rooms & Attending Doctors ({hospitalDoctors.length})
                            </h2>
                            <span className="text-xs text-slate-500">
                                Click an OPD Doctor to switch live queue view
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {hospitalDoctors.map((doc) => {
                                const isSelected = String(doc._id) === String(doctor?._id || selectedDoctorId);
                                return (
                                    <button
                                        key={doc._id}
                                        type="button"
                                        onClick={() => handleDoctorSelect(doc._id)}
                                        className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                                            isSelected
                                                ? 'bg-teal-50/90 border-teal-500 shadow-sm ring-2 ring-teal-500/30'
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                    doc.doctorType === 'TEMPORARY' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {doc.doctorType === 'TEMPORARY' ? 'VOLUNTARY' : 'PERMANENT'}
                                                </span>
                                                {doc.waitingCount > 0 ? (
                                                    <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-amber-600" /> {doc.waitingCount} Waiting
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        Queue Clear
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="font-extrabold text-slate-900 text-sm truncate">
                                                {doc.doctorName.startsWith('Dr.') ? doc.doctorName : `Dr. ${doc.doctorName}`}
                                            </h3>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {doc.specialization} • {doc.department}
                                            </p>
                                        </div>

                                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                                            {doc.currentPatientName ? (
                                                <span className="text-teal-700 font-bold flex items-center gap-1 truncate">
                                                    <HeartPulse className="w-3 h-3 text-teal-600 animate-pulse" />
                                                    {doc.currentPatientName}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">No Active Patient</span>
                                            )}
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. Main Queue Layout */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm font-semibold">Synchronizing Live Hospital Patient Queue...</p>
                    </div>
                ) : !doctor ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto shadow-sm">
                        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Active OPD Doctor Assigned</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Add fixed doctors or accept voluntary temporary doctor contracts to activate live consultation suites.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left 2 Cols: Active & Next Patients */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* CURRENT PATIENT IN CONSULTATION */}
                            <div className="bg-white border-2 border-teal-500 p-6 rounded-3xl relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 bg-teal-600 text-white text-[11px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                    <HeartPulse className="w-3.5 h-3.5 animate-pulse" /> In Consultation
                                </div>

                                <h3 className="font-black text-slate-900 text-xl mb-4 flex items-center gap-2">
                                    <Stethoscope className="w-6 h-6 text-teal-600" /> Active OP Consultation Room
                                </h3>

                                {currentPatient ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200 gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-2xl font-black text-slate-900">
                                                        {currentPatient.patientId?.name || 'Patient'}
                                                    </p>
                                                    {calculateAge(currentPatient.patientId?.dateOfBirth) && (
                                                        <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
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
                                                        {currentPatient.priorityCategory || 'NORMAL'}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenPatientDetails(currentPatient)}
                                                    className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs border border-slate-200 flex items-center gap-1.5 transition shadow-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-teal-600" /> Patient Medical File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConsultModal(true)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete Consultation
                                                </button>
                                            </div>
                                        </div>

                                        {/* Symptoms & Triage Box */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                                <span className="font-bold text-slate-500 uppercase text-[10px]">Reported Symptoms</span>
                                                <p className="font-bold text-slate-900">{currentPatient.symptoms || 'General OP evaluation'}</p>
                                                <span className="text-slate-400 text-[11px]">Duration: {currentPatient.symptomDuration || '1-3 days'}</span>
                                            </div>
                                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                                <span className="font-bold text-slate-500 uppercase text-[10px]">Triage Capacity Routing</span>
                                                <p className="font-semibold text-teal-800 text-[11px] leading-tight">
                                                    {Array.isArray(currentPatient.allocationReason) ? currentPatient.allocationReason.join(' • ') : currentPatient.allocationReason || 'Standard OPD Routing'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="text-sm font-bold text-slate-700">No Patient Currently in Consultation</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {waitingQueue.length > 0
                                                ? 'Click "Call In / Start Consultation" on the next patient below.'
                                                : 'Waiting queue is currently empty.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* WAITING QUEUE LIST */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-amber-600" /> Live Waiting Queue ({waitingQueue.length})
                                    </h3>
                                    <span className="text-xs text-slate-500 font-medium">Sorted by Token & Priority</span>
                                </div>

                                {waitingQueue.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl">
                                        No patients waiting in queue right now.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {waitingQueue.map((apt, idx) => (
                                            <div
                                                key={apt._id}
                                                className="p-4 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 font-black flex flex-col items-center justify-center shrink-0 border border-teal-200 shadow-xs">
                                                        <span className="text-[9px] uppercase font-bold text-teal-600 leading-none">Token</span>
                                                        <span className="text-sm font-mono leading-none mt-0.5">#{apt.queuePosition}</span>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black text-slate-900 text-sm truncate">
                                                                {apt.patientId?.name || 'Patient'}
                                                            </p>
                                                            {calculateAge(apt.patientId?.dateOfBirth) && (
                                                                <span className="text-[10px] text-slate-500 font-semibold">
                                                                    ({calculateAge(apt.patientId?.dateOfBirth)} yrs • {apt.patientId?.gender})
                                                                </span>
                                                            )}
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                apt.priorityCategory === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                                                                apt.priorityCategory === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                                                                'bg-emerald-100 text-emerald-800'
                                                            }`}>
                                                                {apt.priorityCategory || 'NORMAL'}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                                            Symptoms: <span className="font-medium text-slate-700">{apt.symptoms || 'General OP'}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenPatientDetails(apt)}
                                                        className="p-2 hover:bg-white text-slate-600 rounded-xl border border-slate-200 transition"
                                                        title="View Patient Record"
                                                    >
                                                        <Eye className="w-4 h-4 text-teal-600" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartConsultation(apt._id)}
                                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                                                    >
                                                        <HeartPulse className="w-3.5 h-3.5" /> Call In Patient
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Col: Attending Doctor Shift & Completed List */}
                        <div className="space-y-6">
                            {/* Doctor Shift Schedule Info */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-teal-600" /> Duty Shift Details
                                </h3>

                                <div className="space-y-3 text-xs">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-400 font-bold block mb-1">Attending Physician</span>
                                        <p className="font-extrabold text-slate-900 text-sm">
                                            {doctor.doctorName.startsWith('Dr.') ? doctor.doctorName : `Dr. ${doctor.doctorName}`}
                                        </p>
                                        <p className="text-teal-700 font-semibold">{doctor.specialization} ({doctor.qualification})</p>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <span className="text-slate-500 font-semibold">Doctor Type:</span>
                                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                                            doctor.doctorType === 'TEMPORARY' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {doctor.doctorType === 'TEMPORARY' ? 'Voluntary Specialist' : 'Permanent Staff'}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <span className="text-slate-500 font-semibold">Shift Hours:</span>
                                        <span className="font-bold text-slate-900">
                                            {doctor.workingHours ? `${doctor.workingHours.start} - ${doctor.workingHours.end}` : '09:00 AM - 01:00 PM'}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <span className="text-slate-500 font-semibold">Consultation Capacity:</span>
                                        <span className="font-bold text-slate-900">~{doctor.consultationCapacity || 25} Patients / Shift</span>
                                    </div>

                                    {activeContract && (
                                        <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
                                            <span className="text-teal-800 font-bold block mb-0.5">Active Service Contract</span>
                                            <p className="font-mono text-[11px] text-teal-900 font-bold">{activeContract.contractNumber}</p>
                                            <p className="text-[10px] text-teal-700 mt-1 italic">
                                                Notice: {activeContract.noticePeriod || '24 Hours'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Completed Today List */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed Today ({completedQueue.length})
                                    </h3>
                                </div>

                                {completedQueue.length === 0 ? (
                                    <p className="text-slate-400 text-xs text-center py-4 bg-slate-50 rounded-xl">
                                        No completed consultations recorded yet today.
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                        {completedQueue.map((apt) => (
                                            <div
                                                key={apt._id}
                                                className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-900">{apt.patientId?.name || 'Patient'}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">APT #{apt.appointmentNumber}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenPatientDetails(apt)}
                                                    className="p-1.5 hover:bg-white text-slate-500 hover:text-teal-700 rounded-lg border border-slate-200"
                                                    title="View Consultation Record"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Patient Medical Details Modal */}
                {detailsModalOpen && selectedPatientInfo && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
                            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        {selectedPatientInfo.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {calculateAge(selectedPatientInfo.dateOfBirth)} yrs • {selectedPatientInfo.gender} • Token #{selectedPatientInfo.queuePosition}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDetailsModalOpen(false)}
                                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="font-bold text-slate-400 block mb-1">Contact Number</span>
                                    <p className="font-bold text-slate-800">{selectedPatientInfo.contact || 'Not Provided'}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="font-bold text-slate-400 block mb-1">Priority Classification</span>
                                    <span className="font-bold text-teal-800">{selectedPatientInfo.priorityCategory || 'NORMAL'}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                                    <span className="font-bold text-slate-400 block mb-1">Reported Symptoms</span>
                                    <p className="text-slate-800 font-semibold">{selectedPatientInfo.symptoms || 'General OP evaluation'}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                                    <span className="font-bold text-slate-400 block mb-1">Known Allergies & Existing Conditions</span>
                                    <p className="text-slate-800">{selectedPatientInfo.allergies || selectedPatientInfo.existingConditions || 'None reported'}</p>
                                </div>
                            </div>

                            {/* Medical Consultation History */}
                            <div className="pt-2">
                                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                                    Prior Consultation History ({patientHistoryList.length})
                                </h4>

                                {loadingHistory ? (
                                    <p className="text-xs text-slate-400 py-3 text-center">Loading medical records...</p>
                                ) : patientHistoryList.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">No previous consultations found on record.</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {patientHistoryList.map((hist, i) => (
                                            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                                <div className="flex items-center justify-between font-bold text-slate-800">
                                                    <span>{new Date(hist.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-teal-700">{hist.doctorId?.doctorName || 'Doctor'}</span>
                                                </div>
                                                <p className="text-slate-600 mt-1 italic">"{hist.clinicalNotes}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Complete Consultation Modal */}
                {showConsultModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        Complete Consultation & Prescription
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Patient: {currentPatient?.patientId?.name} (Token #{currentPatient?.queuePosition})
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowConsultModal(false)}
                                    className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCompleteConsultationSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Clinical Findings & Diagnosis
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={clinicalNotes}
                                        onChange={(e) => setClinicalNotes(e.target.value)}
                                        placeholder="Enter clinical diagnosis, observations, advice..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowConsultModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingConsult}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20"
                                    >
                                        {submittingConsult ? 'Completing...' : 'Save & Finish Consultation'}
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

export default HospitalQueuePage;
