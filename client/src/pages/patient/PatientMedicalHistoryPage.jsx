import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import {
    FileText,
    Stethoscope,
    Pill,
    Calendar,
    Building2,
    Activity,
    Printer,
    Download,
    X,
    Clock,
    Phone,
    MapPin,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

const PatientMedicalHistoryPage = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Prescription Print / Receipt Modal State
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [activeConsultation, setActiveConsultation] = useState(null);

    const fetchHistory = async () => {
        try {
            const res = await API.get('/consultations/my-history');
            if (res.data.success) {
                setConsultations(res.data.consultations);
            }
        } catch (error) {
            console.error('Fetch medical history error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleOpenReceipt = (consultation) => {
        setActiveConsultation(consultation);
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
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        Verified Digital Health Records
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Immutable Clinical Records & Prescriptions
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        View past doctor consultations, clinical observations, and download official medical prescription receipts.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading medical history...</p>
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Medical Records Found</h3>
                        <p className="text-slate-500 text-sm mt-1">Your past consultation prescriptions will be permanently stored here after completing a doctor appointment.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {consultations.map((c) => {
                            const consultDate = new Date(c.consultationDate || c.createdAt);
                            return (
                                <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                                                    {c.hospitalId?.name || 'Government Hospital'}
                                                </span>
                                                {c.appointmentId?.appointmentNumber && (
                                                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                        APT #{c.appointmentId.appointmentNumber}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                                                Attending Doctor: Dr. {c.doctorId?.doctorName || c.doctorId?.name || 'Assigned Physician'} ({c.doctorId?.doctorType || 'Specialist'})
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {c.doctorId?.specialization || 'General Medicine'} {c.doctorId?.qualification ? `• ${c.doctorId.qualification}` : ''}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {consultDate.toLocaleDateString('en-GB')}
                                            </span>

                                            <button
                                                onClick={() => handleOpenReceipt(c)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Download Prescription
                                            </button>
                                        </div>
                                    </div>

                                    {/* Clinical Observations & Diagnosis */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
                                        <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                                            Clinical Observations & Doctor Diagnosis
                                        </span>
                                        <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-line">{c.clinicalNotes}</p>
                                        {c.observations && (
                                            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                                                <span className="font-semibold text-slate-600">Doctor Observations:</span> {c.observations}
                                            </p>
                                        )}
                                    </div>

                                    {/* Medications / Prescription Table */}
                                    {c.medications && c.medications.length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                                <Pill className="w-4 h-4 text-teal-600" /> Prescribed Medications ({c.medications.length})
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {c.medications.map((m, i) => (
                                                    <div key={i} className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs flex justify-between items-center">
                                                        <div>
                                                            <p className="font-bold text-slate-900">{m.name}</p>
                                                            <p className="text-slate-500 text-[11px]">Dosage: {m.dosage} • {m.frequency}</p>
                                                        </div>
                                                        <span className="text-teal-800 font-bold bg-white px-2 py-0.5 rounded-md border border-teal-200 text-[10px]">
                                                            {m.duration}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Investigations & Follow Up */}
                                    {(c.investigations?.length > 0 || c.followUpDate) && (
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                                            {c.investigations?.length > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-slate-700">Lab Orders:</span>
                                                    {c.investigations.map((inv, idx) => (
                                                        <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                                                            {inv.testName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {c.followUpDate && (
                                                <span className="font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg">
                                                    Review Date: {new Date(c.followUpDate).toLocaleDateString('en-GB')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* OFFICIAL DOWNLOADABLE PRESCRIPTION RECEIPT MODAL */}
                {receiptModalOpen && activeConsultation && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
                            {/* Modal Header Actions (hidden during print) */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Printer className="w-5 h-5 text-teal-600" />
                                        Official Medical Prescription Receipt
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Print or save your digital medical prescription receipt.
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

                            {/* PRINTABLE RX CONTAINER */}
                            <div className="border-2 border-slate-900 p-6 sm:p-8 rounded-2xl bg-white space-y-5 text-slate-900" id="printable-rx">
                                {/* Letterhead */}
                                <div className="text-center border-b-2 border-slate-900 pb-4">
                                    <div className="inline-block bg-teal-800 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mb-1 tracking-wider">
                                        Official Outpatient Clinical Prescription
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                        {activeConsultation.hospitalId?.name || 'Government General Hospital'}
                                    </h2>
                                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                                        Department of {activeConsultation.doctorId?.department || 'Outpatient Services'}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        {activeConsultation.hospitalId?.district || ''}, {activeConsultation.hospitalId?.state || ''} • Tel: {activeConsultation.hospitalId?.contactNumber || '108 / 104'}
                                    </p>
                                </div>

                                {/* Doctor and Date Info */}
                                <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-200">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Attending Doctor</span>
                                        <p className="font-black text-slate-900 text-sm mt-0.5">
                                            Dr. {activeConsultation.doctorId?.doctorName || activeConsultation.doctorId?.name || 'Doctor'}
                                        </p>
                                        <p className="text-slate-600 font-medium">
                                            {activeConsultation.doctorId?.qualification || 'MBBS'} • Reg: {activeConsultation.doctorId?.registrationNumber || 'KMC-84920'}
                                        </p>
                                        <p className="text-slate-500 text-[11px]">
                                            {activeConsultation.doctorId?.specialization || 'General OPD'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Consultation Date</span>
                                        <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                                            {new Date(activeConsultation.consultationDate || activeConsultation.createdAt).toLocaleDateString('en-GB')}
                                        </p>
                                        <p className="text-slate-600 font-bold">
                                            APT #{activeConsultation.appointmentId?.appointmentNumber || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Patient Demographics Bar */}
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-semibold block text-[10px]">Patient Name</span>
                                        <p className="font-black text-slate-900">{activeConsultation.patientId?.name || 'Registered Patient'}</p>
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

                                {/* Clinical Diagnosis */}
                                <div className="text-xs space-y-1">
                                    <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] block">
                                        Clinical Findings & Diagnosis:
                                    </span>
                                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                                        {activeConsultation.clinicalNotes}
                                    </p>
                                    {activeConsultation.observations && (
                                        <p className="text-[11px] text-slate-600 pt-1">
                                            <span className="font-bold">Observations:</span> {activeConsultation.observations}
                                        </p>
                                    )}
                                </div>

                                {/* Rx Table */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-serif italic text-2xl font-black text-teal-800">℞</span>
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                            Prescribed Medicines:
                                        </span>
                                    </div>

                                    {activeConsultation.medications && activeConsultation.medications.length > 0 ? (
                                        <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                                                    <th className="p-2 border border-slate-200">#</th>
                                                    <th className="p-2 border border-slate-200">Medicine Name</th>
                                                    <th className="p-2 border border-slate-200">Dosage</th>
                                                    <th className="p-2 border border-slate-200">Schedule (Frequency)</th>
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

                                {/* Signature & Footer */}
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
                                                Dr. {activeConsultation.doctorId?.doctorName || activeConsultation.doctorId?.name || 'Doctor'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium">Digital Signature Stamp</p>
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

export default PatientMedicalHistoryPage;
