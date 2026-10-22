import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { FileCheck, Building2, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const TempDoctorContractsPage = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [submittingCancel, setSubmittingCancel] = useState(false);

    const fetchContracts = async () => {
        try {
            const res = await API.get('/contracts');
            if (res.data.success) {
                setContracts(res.data.contracts);
            }
        } catch (error) {
            console.error('Fetch contracts error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const handleAcceptContract = async (id) => {
        try {
            const res = await API.post(`/contracts/${id}/accept`);
            if (res.data.success) {
                alert('Voluntary service contract accepted! You are now active in the hospital doctor roster for patient allocations.');
                fetchContracts();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error accepting contract.');
        }
    };

    const handleRejectContract = async (id) => {
        try {
            const res = await API.post(`/contracts/${id}/reject`);
            if (res.data.success) {
                alert('Contract offer declined.');
                fetchContracts();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error declining contract.');
        }
    };

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!selectedContract) return;
        setSubmittingCancel(true);
        try {
            const res = await API.post(`/contracts/${selectedContract._id}/cancel`, {
                cancellationReason
            });
            if (res.data.success) {
                alert('Contract cancellation recorded. Hospital superintendent notified.');
                setShowCancelModal(false);
                setCancellationReason('');
                fetchContracts();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error cancelling contract.');
        } finally {
            setSubmittingCancel(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Voluntary Contract Portal
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Service Contracts & Commitments
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Review hospital contract offers, accept voluntary consultation slots, or submit cancellation notice if unavailable.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading contracts...</p>
                    </div>
                ) : contracts.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto">
                        <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Contracts Issued Yet</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Contracts will appear here when hospital superintendents approve your interest requests.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {contracts.map((contract) => (
                            <div key={contract._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                                                {contract.contractNumber}
                                            </span>
                                            <span className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${contract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                                                    contract.status === 'PENDING_ACCEPTANCE' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {contract.status}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg">{contract.hospitalName}</h3>
                                        <p className="text-xs text-slate-500">{contract.hospitalAddress}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {contract.status === 'PENDING_ACCEPTANCE' && (
                                            <>
                                                <button
                                                    onClick={() => handleAcceptContract(contract._id)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Accept Voluntary Contract
                                                </button>
                                                <button
                                                    onClick={() => handleRejectContract(contract._id)}
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}

                                        {contract.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedContract(contract);
                                                    setShowCancelModal(true);
                                                }}
                                                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3.5 py-2 rounded-xl text-xs transition border border-red-200"
                                            >
                                                Request Drop-out / Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div>
                                        <span className="font-bold text-slate-500 block mb-1">Shift Schedule</span>
                                        <p className="font-semibold text-slate-900">{contract.workingDays?.join(', ')}</p>
                                        <p className="text-slate-500">{contract.workingHours}</p>
                                    </div>

                                    <div>
                                        <span className="font-bold text-slate-500 block mb-1">Notice Period Terms</span>
                                        <p className="font-semibold text-slate-900">{contract.noticePeriod || '24 Hours Notice'}</p>
                                    </div>

                                    <div>
                                        <span className="font-bold text-slate-500 block mb-1">Consultation Scope</span>
                                        <p className="font-medium text-slate-800">{contract.consultationResponsibilities || 'General OPD Consultations'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cancel Modal */}
                {showCancelModal && selectedContract && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                Submit Contract Cancellation Notice
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Cancelling contract <span className="font-bold text-slate-900">{selectedContract.contractNumber}</span> with {selectedContract.hospitalName}. Notice period: {selectedContract.noticePeriod}.
                            </p>

                            <form onSubmit={handleCancelSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Reason for Drop-out / Cancellation
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={cancellationReason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        placeholder="Enter reason (e.g. personal emergency, illness, institution recall)..."
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCancelModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                                    >
                                        Keep Contract
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingCancel}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
                                    >
                                        {submittingCancel ? 'Submitting...' : 'Confirm Cancellation'}
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

export default TempDoctorContractsPage;
