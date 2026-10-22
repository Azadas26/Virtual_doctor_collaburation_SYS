import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Building2, CheckCircle2, XCircle, MapPin, Plus } from 'lucide-react';

const AdminHospitalsPage = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHospitals = async () => {
        try {
            const res = await API.get('/hospitals?status=ALL');
            if (res.data.success) {
                const list = res.data.data || res.data.hospitals || [];
                setHospitals(list);
            }
        } catch (error) {
            console.error('Fetch hospitals error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'APPROVED' ? 'DEACTIVATED' : 'APPROVED';
        try {
            const res = await API.put(`/admin/hospitals/${id}/status`, { status: newStatus });
            if (res.data.success) {
                setHospitals(prev => prev.map(h => h._id === id ? { ...h, status: newStatus } : h));
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating hospital status.');
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Government Hospitals Management
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Approve, inspect, or manage government hospital registrations on the e-Health Bridge platform.
                    </p>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 text-sm font-medium">Loading Government Hospitals...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 pl-6">Hospital Name</th>
                                        <th className="p-4">District / State</th>
                                        <th className="p-4">Superintendent</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 pr-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {hospitals.map((hosp) => (
                                        <tr key={hosp._id} className="hover:bg-slate-50/50 transition">
                                            <td className="p-4 pl-6">
                                                <p className="font-bold text-slate-900">{hosp.name}</p>
                                                <p className="text-xs text-slate-500">Reg: {hosp.registrationNumber}</p>
                                            </td>
                                            <td className="p-4 text-xs">
                                                <span className="font-semibold text-slate-800">{hosp.district}</span>, {hosp.state}
                                            </td>
                                            <td className="p-4 text-xs">
                                                <p className="font-semibold text-slate-900">{hosp.superintendentName || 'Dr. Superintendent'}</p>
                                                <p className="text-slate-500">{hosp.contactNumber}</p>
                                            </td>
                                            <td className="p-4">
                                                {hosp.status === 'APPROVED' ? (
                                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                                        <XCircle className="w-3.5 h-3.5" /> {hosp.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <button
                                                    onClick={() => handleStatusToggle(hosp._id, hosp.status)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${hosp.status === 'APPROVED'
                                                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        }`}
                                                >
                                                    {hosp.status === 'APPROVED' ? 'Deactivate' : 'Approve'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminHospitalsPage;
