import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Users, Search, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');

    const fetchUsers = async () => {
        try {
            const params = {};
            if (roleFilter) params.role = roleFilter;
            const res = await API.get('/admin/users', { params });
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const handleToggleActive = async (userId, isCurrentlySuspended) => {
        try {
            const res = await API.put(`/admin/users/${userId}/toggle-suspend`);
            if (res.data.success) {
                const updatedUser = res.data.user;
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: updatedUser.isSuspended } : u));
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating user status.');
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            User Accounts & Role Governance
                        </h1>
                        <p className="text-slate-600 text-sm mt-1">
                            Manage accounts across Main Admin, Hospital Superintendents, Fixed Doctors, Voluntary Doctors, and Patients.
                        </p>
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm"
                    >
                        <option value="">All User Roles</option>
                        <option value="MAIN_ADMIN">Main Admin</option>
                        <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                        <option value="FIXED_DOCTOR">Fixed Doctor</option>
                        <option value="TEMPORARY_DOCTOR">Voluntary Temp Doctor</option>
                        <option value="PATIENT">Patient</option>
                    </select>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Loading platform users...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 pl-6">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 pr-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                                    {users.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50/50 transition">
                                            <td className="p-4 pl-6 font-bold text-slate-900">
                                                {u.name}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {u.email}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {!u.isSuspended ? (
                                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600 font-bold flex items-center gap-1">
                                                        <XCircle className="w-3.5 h-3.5" /> Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <button
                                                    onClick={() => handleToggleActive(u._id, u.isSuspended)}
                                                    className={`px-3 py-1 rounded-xl font-bold transition text-[11px] ${!u.isSuspended
                                                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        }`}
                                                >
                                                    {!u.isSuspended ? 'Suspend' : 'Activate'}
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

export default AdminUsersPage;
