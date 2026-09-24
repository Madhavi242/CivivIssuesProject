import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationApi } from '../services/notificationApi';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();

  const addToast = (message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Listen to live socket events
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      addToast(data.message, 'info', data.title);
      fetchNotifications();
    };

    const handleStatusUpdate = (data) => {
      addToast(`Issue status changed to "${data.newStatus}" by ${data.updatedBy}`, 'warning', 'Status Update');
      fetchNotifications();
    };

    const handleNewIssue = (data) => {
      addToast(`New ${data.priorityLevel} issue reported: "${data.title}"`, 'info', 'Civic Alert');
      fetchNotifications();
    };

    socket.on('notification', handleNotification);
    socket.on('issue_status_updated', handleStatusUpdate);
    socket.on('new_issue', handleNewIssue);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('issue_status_updated', handleStatusUpdate);
      socket.off('new_issue', handleNewIssue);
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border text-sm flex items-start justify-between backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-100'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/30 text-amber-100'
                : 'bg-slate-900/90 border-blue-500/30 text-slate-100'
            }`}
          >
            <div className="pr-3">
              {toast.title && <div className="font-semibold text-xs uppercase tracking-wider mb-1 opacity-90">{toast.title}</div>}
              <div>{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
