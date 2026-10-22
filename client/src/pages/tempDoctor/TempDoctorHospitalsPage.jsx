import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Search, Building2, Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const TempDoctorHospitalsPage = () => {
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);

    // Interest application form
    const [availableDays, setAvailableDays] = useState(['Monday', 'Wednesday']);
    const [availableStartTime, setAvailableStartTime] = useState('09:00 AM');
    const [availableEndTime, setAvailableEndTime] = useState('01:00 PM');
    const [requestedStartDate, setRequestedStartDate] = useState('');
    const [requestedEndDate, setRequestedEndDate] = useState('');
    const [message, setMessage] = useState('Volunteering for morning OPD consultation slots.');
    const [submitting, setSubmitting] = useState(false);

    const fetchRequirements = async () => {
        try {
            const res = await API.get('/requirements');
            if (res.data.success) {
                setRequirements(res.data.requirements);
            }
        } catch (error) {
            console.error('Fetch requirements error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, []);

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!selectedReq) return;
        setSubmitting(true);
        try {
            const res = await API.post('/temporary-doctors/interest', {
                requirementId: selectedReq._id,
                hospitalId: selectedReq.hospitalId?._id || selectedReq.hospitalId,
                requestedStartDate: requestedStartDate || selectedReq.requiredDate,
                requestedEndDate: requestedEndDate || selectedReq.requiredDate,
                availableDays,
                availableStartTime,
                availableEndTime,
                message
            });
            if (res.data.success) {
                alert('Voluntary interest expressed successfully! Hospital superintendent will review your credentials.');
                setShowApplyModal(false);
                setSelectedReq(null);
                setRequestedStartDate('');
                setRequestedEndDate('');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting interest request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Voluntary Doctor Capacity Exchange
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Government Hospital Consultation Requirements
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Browse active doctor staffing shortages published by government hospital superintendents and voluntarily offer limited hours.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading hospital requirements...</p>
                    </div>
                ) : requirements.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Requirements Posted</h3>
                        <p className="text-slate-500 text-sm mt-1">Check back soon for new government hospital OPD doctor slots.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requirements.map((req) => (
                            <div key={req._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                                            {req.hospitalId?.district || 'Kerala'}
                                        </span>
                                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                                            {req.department}
                                        </span>
                                    </div>

                                    <h3 className="font-extrabold text-slate-900 text-xl leading-snug">{req.hospitalId?.name}</h3>
                                    <p className="text-slate-500 text-xs mt-1">{req.hospitalId?.address}</p>

                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                                        <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            Required Date: {new Date(req.requiredDate).toLocaleDateString()}
                                        </p>
                                        <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            Shift: {req.startTime} - {req.endTime}
                                        </p>
                                        <p className="text-slate-500 italic bg-slate-50 p-2 rounded-xl mt-2">
                                            "{req.reason}"
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedReq(req);
                                        setShowApplyModal(true);
                                    }}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition mt-4"
                                >
                                    Express Voluntary Interest <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Application Modal */}
                {showApplyModal && selectedReq && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Express Voluntary Doctor Interest</h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Hospital: <span className="font-bold text-slate-900">{selectedReq.hospitalId?.name}</span> ({selectedReq.department})
                            </p>

                            <form onSubmit={handleApplySubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Available From
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={requestedStartDate}
                                            onChange={(e) => setRequestedStartDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Available Until
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={requestedEndDate}
                                            onChange={(e) => setRequestedEndDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Start Time
                                        </label>
                                        <input
                                            type="text"
                                            value={availableStartTime}
                                            onChange={(e) => setAvailableStartTime(e.target.value)}
                                            placeholder="09:00 AM"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            End Time
                                        </label>
                                        <input
                                            type="text"
                                            value={availableEndTime}
                                            onChange={(e) => setAvailableEndTime(e.target.value)}
                                            placeholder="01:00 PM"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Your Message to Superintendent
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowApplyModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Voluntary Interest'}
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

export default TempDoctorHospitalsPage;
