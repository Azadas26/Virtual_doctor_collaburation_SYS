import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import API from '../services/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await API.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.error('Fetch notifications error:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Refresh every 15s
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark read error:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-200">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <Bell className="w-4 h-4 text-teal-600" /> Notifications
                        </h3>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                            {unreadCount} Unread
                        </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-sm">
                                No notifications right now.
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item._id}
                                    className={`p-3.5 transition flex items-start justify-between gap-3 ${item.isRead ? 'bg-white opacity-80' : 'bg-teal-50/50'
                                        }`}
                                >
                                    <div className="space-y-1 text-xs">
                                        <p className="font-semibold text-slate-900">{item.title}</p>
                                        <p className="text-slate-600 leading-relaxed">{item.message}</p>
                                        <span className="text-[10px] text-slate-400 block pt-1">
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {!item.isRead && (
                                        <button
                                            onClick={() => markAsRead(item._id)}
                                            className="text-teal-600 hover:text-teal-800 p-1 hover:bg-teal-100 rounded-lg transition"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
