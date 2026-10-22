import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { FileCheck, Building2, UserCheck } from 'lucide-react';

const HospitalContractsPage = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchContracts = async () => {
        try {
            const res = await API.get('/hospital-admin/contracts');
            if (res.data.success) {
                setContracts(res.data.contracts);
            }
        } catch (error) {
            console.error('Fetch hospital contracts error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Issued Voluntary Doctor Service Contracts
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Track active service terms, notice periods, and status of contracts issued to voluntary temporary doctors.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading service contracts...</p>
                    </div>
                ) : contracts.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto">
                        <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-lg">No Service Contracts Issued</h3>
                        <p className="text-slate-500 text-sm mt-1">Contracts will appear here after you approve voluntary doctor requests.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contracts.map((c) => (
                            <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                                            {c.contractNumber}
                                        </span>
                                        <span className="text-xs font-extrabold bg-teal-100 text-teal-800 px-3 py-0.5 rounded-full">
                                            {c.status}
                                        </span>
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 text-lg">{c.tempProfileId?.doctorName || 'Dr. Voluntary Doctor'}</h3>
                                    <p className="text-xs text-slate-500">Notice Period: {c.noticePeriod || '24 Hours'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default HospitalContractsPage;
