import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { UserCheck, ShieldCheck, FileCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const HospitalRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState(null);
    const [showContractModal, setShowContractModal] = useState(false);

    // Contract modal state
    const [noticePeriod, setNoticePeriod] = useState('24 Hours');
    const [consultationResponsibilities, setConsultationResponsibilities] = useState('Provide outpatient clinical consultation during assigned shift hours');
    const [submittingContract, setSubmittingContract] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await API.get('/hospital-admin/requests');
            if (res.data.success) {
                setRequests(res.data.requests);
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleVerifyDoctor = async (tempProfileId) => {
        try {
            const res = await API.put(`/hospital-admin/temporary-doctors/${tempProfileId}/verify`, {
                verificationNotes: 'MCI Medical Registration and credentials verified by Superintendent.'
            });
            if (res.data.success) {
                alert('Temporary doctor credentials verified!');
                fetchRequests();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error verifying doctor.');
        }
    };

    const handleIssueContractSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReq) return;
        setSubmittingContract(true);
        try {
            const res = await API.post(`/contracts/issue/${selectedReq._id}`, {
                noticePeriod,
                consultationResponsibilities
            });
            if (res.data.success) {
                alert('Service Contract generated and issued to doctor successfully!');
                setShowContractModal(false);
                setSelectedReq(null);
                fetchRequests();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error issuing contract.');
        } finally {
            setSubmittingContract(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Voluntary Doctor Applications & Verifications
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Review interest requests submitted by voluntary temporary doctors, verify MCI credentials, and issue legally binding service contracts.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm">Loading applications...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto">
                        <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Applications Pending</h3>
                        <p className="text-slate-500 text-sm mt-1">Temporary doctor applications will appear here when doctors express interest in your hospital requirements.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((reqItem) => (
                            <div key={reqItem._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-slate-900 text-lg">
                                            {reqItem.tempProfileId?.doctorName || 'Dr. Applicant'}
                                        </span>
                                        {reqItem.tempProfileId?.verificationStatus === 'VERIFIED' ? (
                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> MCI Credentials Verified
                                            </span>
                                        ) : (
                                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" /> Verification Required
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-slate-600 text-xs">
                                        <span className="font-bold text-slate-800">Specialization:</span> {reqItem.specialization} •{' '}
                                        <span className="font-bold text-slate-800">Qualification:</span> {reqItem.tempProfileId?.medicalQualification} •{' '}
                                        <span className="font-bold text-slate-800">MCI Reg:</span> {reqItem.tempProfileId?.registrationNumber}
                                    </p>

                                    <p className="text-slate-600 text-xs">
                                        <span className="font-bold text-slate-800">Shift Availability:</span> {reqItem.availableDays?.join(', ')} ({reqItem.availableStartTime} - {reqItem.availableEndTime})
                                    </p>

                                    {reqItem.message && (
                                        <p className="text-slate-500 text-xs bg-slate-50 p-2.5 rounded-xl italic">
                                            "{reqItem.message}"
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {reqItem.tempProfileId?.verificationStatus !== 'VERIFIED' && (
                                        <button
                                            onClick={() => handleVerifyDoctor(reqItem.tempProfileId?._id)}
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
                                        >
                                            <ShieldCheck className="w-4 h-4" /> Verify Credentials
                                        </button>
                                    )}

                                    {reqItem.status === 'PENDING' && (
                                        <button
                                            onClick={() => {
                                                setSelectedReq(reqItem);
                                                setShowContractModal(true);
                                            }}
                                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                                        >
                                            <FileCheck className="w-4 h-4" /> Issue Contract
                                        </button>
                                    )}

                                    {reqItem.status === 'CONTRACT_SENT' && (
                                        <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-xl text-xs">
                                            Contract Issued (Awaiting Doctor Acceptance)
                                        </span>
                                    )}

                                    {reqItem.status === 'CONTRACT_ACCEPTED' && (
                                        <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl text-xs">
                                            Contract Accepted & Doctor Active
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Contract Issuance Modal */}
                {showContractModal && selectedReq && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Issue Service Contract
                            </h3>
                            <p className="text-slate-600 text-xs mb-4">
                                Issuing voluntary service contract to <span className="font-bold text-slate-900">{selectedReq.tempProfileId?.doctorName}</span> for {selectedReq.specialization}.
                            </p>

                            <form onSubmit={handleIssueContractSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Notice Period for Drop-out / Cancellation
                                    </label>
                                    <select
                                        value={noticePeriod}
                                        onChange={(e) => setNoticePeriod(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="24 Hours">24 Hours Notice</option>
                                        <option value="48 Hours">48 Hours Notice</option>
                                        <option value="7 Days">7 Days Notice</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Consultation Responsibilities
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={consultationResponsibilities}
                                        onChange={(e) => setConsultationResponsibilities(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowContractModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingContract}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20 transition"
                                    >
                                        {submittingContract ? 'Issuing Contract...' : 'Issue & Send Contract'}
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

export default HospitalRequestsPage;
