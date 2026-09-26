import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationApi } from '../services/notificationApi';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

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
      {/* Clean Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let borderClass = 'border-slate-300';
          let icon = <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />;

          if (toast.type === 'success') {
            borderClass = 'border-emerald-300 bg-white';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
          } else if (toast.type === 'error') {
            borderClass = 'border-red-300 bg-white';
            icon = <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
          } else if (toast.type === 'warning') {
            borderClass = 'border-amber-300 bg-white';
            icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-lg shadow-md border bg-white text-slate-800 text-xs flex items-start justify-between gap-2.5 ${borderClass} animate-fadeIn`}
            >
              <div className="flex items-start gap-2.5">
                {icon}
                <div>
                  {toast.title && (
                    <div className="font-semibold text-slate-900 text-xs mb-0.5">
                      {toast.title}
                    </div>
                  )}
                  <div className="text-slate-700 leading-snug">{toast.message}</div>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
