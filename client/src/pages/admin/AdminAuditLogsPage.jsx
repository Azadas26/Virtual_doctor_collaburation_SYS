import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Activity, Search, ShieldCheck } from 'lucide-react';

const AdminAuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchAuditLogs = async () => {
        try {
            const res = await API.get('/admin/audit-logs');
            if (res.data.success) {
                setLogs(res.data.logs);
            }
        } catch (error) {
            console.error('Fetch audit logs error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.userName?.toLowerCase().includes(search.toLowerCase()) ||
        log.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        System Audit Trail & Security Logs
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        Immutable log stream recording contract issuances, credential verifications, role updates, and platform administrative actions.
                    </p>
                </div>

                <div className="mb-6 relative max-w-md">
                    <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search audit logs by action or user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading audit trail...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 pl-6">Timestamp</th>
                                        <th className="p-4">Action</th>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4 pr-6">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                                    {filteredLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/50 transition">
                                            <td className="p-4 pl-6 font-mono text-slate-500">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-4 font-bold text-teal-800">
                                                {log.action}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-900">
                                                {log.userName}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                                    {log.role}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 font-mono text-slate-400">
                                                {log.ipAddress || '127.0.0.1'}
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

export default AdminAuditLogsPage;
