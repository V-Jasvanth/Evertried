import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, X, Briefcase, AlertCircle, Info, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

const NotificationCenter = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const socketRef = useRef(null);
    const dropdownRef = useRef(null);

    const API_URL = (
        import.meta.env.VITE_API_URL || 'http://localhost:5000'
    ).replace(/\/$/, '');

    const getAuthConfig = useCallback(() => {
        if (!user?.token) return null;
        return {
            headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        };
    }, [user?.token]);

    // Fetch notifications list
    const fetchNotifications = useCallback(async () => {
        const config = getAuthConfig();
        if (!config) return;

        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(`${API_URL}/api/notifications`, config);
            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [API_URL, getAuthConfig]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        const config = getAuthConfig();
        if (!config) return;

        try {
            const { data } = await axios.get(`${API_URL}/api/notifications/unread-count`, config);
            if (data.success) {
                setUnreadCount(data.count || 0);
            }
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    }, [API_URL, getAuthConfig]);

    // Initial load + Socket connection
    useEffect(() => {
        if (!user?.token) return;

        fetchUnreadCount();
        fetchNotifications();

        // Connect Socket.IO client for live notification updates
        const socket = io(API_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('register', user._id);
        });

        // Listen for new real-time notifications
        socket.on('notification:new', (newNotif) => {
            setNotifications((prev) => {
                // Avoid duplicates
                if (prev.some((n) => n._id === newNotif._id)) {
                    return prev;
                }
                return [newNotif, ...prev];
            });

            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.off('notification:new');
            socket.close();
            socketRef.current = null;
        };
    }, [user, API_URL, fetchUnreadCount, fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Mark single notification as read
    const handleMarkAsRead = async (notification) => {
        if (notification.read) return;

        const config = getAuthConfig();
        if (!config) return;

        // Optimistic UI update
        setNotifications((prev) =>
            prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await axios.patch(
                `${API_URL}/api/notifications/${notification._id}/read`,
                {},
                config
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            // Revert on error
            fetchUnreadCount();
            fetchNotifications();
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        const config = getAuthConfig();
        if (!config || unreadCount === 0) return;

        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);

        try {
            await axios.patch(`${API_URL}/api/notifications/read-all`, {}, config);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            fetchUnreadCount();
            fetchNotifications();
        }
    };

    // Handle clicking a notification card
    const handleNotificationClick = (notification) => {
        handleMarkAsRead(notification);

        // Optionally navigate to dashboard based on user role or notification type
        if (user.role === 'worker') {
            navigate('/worker');
        } else if (user.role === 'employer') {
            navigate('/employer');
        }

        setIsOpen(false);
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        fetchNotifications();
                        fetchUnreadCount();
                    }
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-DEFAULT text-[11px] font-black text-white shadow-md animate-in zoom-in-75 duration-200">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Panel Header */}
                    <div className="p-4 px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-brand-DEFAULT" />
                            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="bg-brand-light text-brand-dark px-2 py-0.5 rounded-full text-xs font-bold">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-bold text-brand-DEFAULT hover:text-brand-dark transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                                </button>
                            )}

                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Panel Body */}
                    <div className="max-h-[26rem] overflow-y-auto divide-y divide-slate-100">
                        {loading && notifications.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                <div className="w-6 h-6 border-2 border-brand-DEFAULT border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-xs font-medium">Loading notifications...</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 text-center text-xs text-red-500 bg-red-50">
                                <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                                {error}
                            </div>
                        )}

                        {!loading && notifications.length === 0 && !error && (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <Info className="w-6 h-6" />
                                </div>
                                <p className="font-bold text-slate-700 text-sm">No notifications yet.</p>
                                <p className="text-slate-400 text-xs mt-1">Updates on jobs and applications will appear here.</p>
                            </div>
                        )}

                        {notifications.map((notification) => {
                            const isUnread = !notification.read;

                            return (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 px-5 flex items-start gap-3 cursor-pointer transition-colors relative group ${
                                        isUnread ? 'bg-blue-50/60 hover:bg-blue-50' : 'bg-white hover:bg-slate-50'
                                    }`}
                                >
                                    {/* Type Icon Badge */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                        isUnread ? 'bg-brand-DEFAULT text-white shadow-md shadow-brand-DEFAULT/20' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {notification.type === 'JOB_CREATED' && <Briefcase className="w-4 h-4" />}
                                        {notification.type === 'JOB_APPLICATION' && <Sparkles className="w-4 h-4" />}
                                        {notification.type === 'APPLICATION_ACCEPTED' && <Check className="w-4 h-4" />}
                                        {notification.type === 'JOB_STARTED' && <Briefcase className="w-4 h-4" />}
                                        {notification.type === 'JOB_COMPLETED' && <CheckCheck className="w-4 h-4" />}
                                        {!['JOB_CREATED', 'JOB_APPLICATION', 'APPLICATION_ACCEPTED', 'JOB_STARTED', 'JOB_COMPLETED'].includes(notification.type) && <Info className="w-4 h-4" />}
                                    </div>

                                    {/* Notification Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className={`text-xs font-bold truncate ${isUnread ? 'text-slate-900 font-black' : 'text-slate-700'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                                                {formatRelativeTime(notification.createdAt)}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </p>
                                    </div>

                                    {/* Unread Indicator Dot */}
                                    {isUnread && (
                                        <div className="w-2 h-2 rounded-full bg-brand-DEFAULT shrink-0 mt-1.5"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Panel Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <span className="text-[11px] text-slate-400 font-medium">
                                Showing recent notifications
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
