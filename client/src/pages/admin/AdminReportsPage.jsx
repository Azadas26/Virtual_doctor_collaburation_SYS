import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { TrendingUp, BarChart3, PieChart, Building2, Users } from 'lucide-react';

const AdminReportsPage = () => {
    const [reportsData, setReportsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await API.get('/admin/reports');
            if (res.data.success) {
                setReportsData(res.data.reports);
            }
        } catch (error) {
            console.error('Fetch admin reports error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Platform Analytics & Doctor Capacity Sharing Reports
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Visual statistics on government hospital OP crowd distribution, voluntary doctor contract utilization, and regional capacity sharing metrics.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Generating analytics reports...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-teal-600" /> Voluntary Doctor Capacity by District
                            </h3>
                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="font-bold text-slate-800">Thiruvananthapuram District</span>
                                    <span className="font-extrabold text-teal-700">12 Voluntary Contracts</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="font-bold text-slate-800">Ernakulam District</span>
                                    <span className="font-extrabold text-teal-700">8 Voluntary Contracts</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="font-bold text-slate-800">Kozhikode District</span>
                                    <span className="font-extrabold text-teal-700">6 Voluntary Contracts</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-purple-600" /> Outpatient Queue Reduction Impact
                            </h3>
                            <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100 text-center space-y-2">
                                <p className="text-4xl font-black text-purple-900">42%</p>
                                <p className="text-xs font-semibold text-purple-800">Average Reduction in Physical OP Waiting Time</p>
                                <p className="text-[11px] text-slate-500">Achieved via online smart triage allocation & voluntary doctor slots.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminReportsPage;
