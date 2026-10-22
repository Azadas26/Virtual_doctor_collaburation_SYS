import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { FileText, Stethoscope, Pill, Calendar, Building2, Activity } from 'lucide-react';

const PatientMedicalHistoryPage = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Immutable Clinical Records & Prescriptions
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        View clinical observations, digital prescriptions, and investigation advisories recorded by attending doctors.
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
                        {consultations.map((c) => (
                            <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                                    <div>
                                        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                                            {c.hospitalId?.name || 'Government Hospital'}
                                        </span>
                                        <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                                            Attending Doctor: {c.doctorId?.doctorName || c.doctorId?.name || 'Assigned Physician'} ({c.doctorId?.doctorType || 'Specialist'})
                                        </h3>
                                    </div>
                                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Notes */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                                    <span className="font-bold text-slate-700 block mb-1">Clinical Observations & Diagnosis</span>
                                    <p className="text-slate-800 font-medium leading-relaxed">{c.clinicalNotes}</p>
                                </div>

                                {/* Medications */}
                                {c.medications && c.medications.length > 0 && (
                                    <div>
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                            <Pill className="w-4 h-4 text-teal-600" /> Digital Prescription
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {c.medications.map((m, i) => (
                                                <div key={i} className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-slate-900">{m.name}</p>
                                                        <p className="text-slate-500 text-[11px]">{m.dosage}</p>
                                                    </div>
                                                    <span className="text-teal-800 font-bold bg-white px-2 py-0.5 rounded-md border border-teal-200 text-[10px]">
                                                        {m.duration}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientMedicalHistoryPage;
