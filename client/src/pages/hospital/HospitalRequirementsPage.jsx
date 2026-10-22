import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Briefcase, Plus, Calendar, Clock, Users } from 'lucide-react';

const HospitalRequirementsPage = () => {
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [department, setDepartment] = useState('General Medicine');
    const [specialization, setSpecialization] = useState('General Medicine');
    const [requiredDate, setRequiredDate] = useState('');
    const [startTime, setStartTime] = useState('09:00 AM');
    const [endTime, setEndTime] = useState('01:00 PM');
    const [requiredDoctorsCount, setRequiredDoctorsCount] = useState(1);
    const [reason, setReason] = useState('Peak Monday OPD crowding');
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

    const handleCreateRequirement = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await API.post('/requirements', {
                department,
                specialization,
                requiredDate,
                startTime,
                endTime,
                requiredDoctorsCount,
                reason
            });
            if (res.data.success) {
                alert('Doctor requirement slot posted successfully!');
                setShowModal(false);
                fetchRequirements();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error posting requirement.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Temporary Doctor Requirements
                        </h1>
                        <p className="text-slate-600 text-sm mt-1">
                            Post required consultation slots for voluntary temporary doctors to apply.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-md shadow-teal-600/20"
                    >
                        <Plus className="w-4 h-4" /> Post New Requirement
                    </button>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading posted requirements...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requirements.map((req) => (
                            <div key={req._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                                        {req.department}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500">
                                        {req.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">{req.specialization}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {new Date(req.requiredDate).toLocaleDateString()} ({req.startTime} - {req.endTime})
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    Required: {req.requiredDoctorsCount} Doctor(s) • Filled: {req.filledDoctorsCount || 0}
                                </p>
                                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic">
                                    "{req.reason}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Post Voluntary Doctor Requirement</h3>
                            <form onSubmit={handleCreateRequirement} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                                        <input
                                            type="text"
                                            required
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialization</label>
                                        <input
                                            type="text"
                                            required
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={requiredDate}
                                            onChange={(e) => setRequiredDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
                                        <input
                                            type="text"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Time</label>
                                        <input
                                            type="text"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Extra Staffing</label>
                                    <textarea
                                        rows={2}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
                                    >
                                        {submitting ? 'Posting...' : 'Post Slot'}
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

export default HospitalRequirementsPage;
