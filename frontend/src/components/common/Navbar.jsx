import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  PlusCircle,
  MapPin,
  BarChart3,
  Layers,
  Bell,
  CheckCircle,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Shield,
  Briefcase,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DEMO_ACCOUNTS } from '../../utils/constants';

export default function Navbar() {
  const { user, logout, quickSwitchRole, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = async (role) => {
    await quickSwitchRole(role);
    setShowNotifications(false);
    // Redirect to relevant dashboard
    if (role === 'citizen') navigate('/dashboard/citizen');
    else if (role === 'field_worker') navigate('/dashboard/worker');
    else if (role === 'department_admin') navigate('/dashboard/department');
    else if (role === 'system_admin') navigate('/dashboard/admin');
  };

  const navLinks = [
    { label: 'Explore', path: '/issues', icon: Activity },
    { label: 'Map View', path: '/map', icon: MapPin },
    { label: 'Clusters', path: '/clusters', icon: Layers },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'citizen':
        return '/dashboard/citizen';
      case 'field_worker':
        return '/dashboard/worker';
      case 'department_admin':
        return '/dashboard/department';
      case 'system_admin':
        return '/dashboard/admin';
      default:
        return '/issues';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                CivicPulse
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Hackathon 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Quick Demo Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-2 font-medium">Demo As:</span>
              {DEMO_ACCOUNTS.map((acc) => {
                const isCurrent = user?.role === acc.role;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleRoleSwitch(acc.role)}
                    className={`px-2 py-1 rounded font-medium transition-all ${
                      isCurrent
                        ? `${acc.color} shadow-sm border`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    title={`Switch session to ${acc.label}`}
                  >
                    {acc.badge}
                  </button>
                );
              })}
            </div>

            {/* Report Button */}
            <Link
              to="/report"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-glow transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>

            {/* Notification Bell Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-xl border border-slate-800 shadow-2xl p-4 z-50 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">Notifications</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400">
                          {unreadCount} unread
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.relatedIssue?._id || n.relatedIssue) {
                                navigate(`/issues/${n.relatedIssue?._id || n.relatedIssue}`);
                                setShowNotifications(false);
                              }
                            }}
                            className={`p-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                              !n.read ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400'
                            }`}
                          >
                            <div className="font-semibold text-slate-200">{n.title}</div>
                            <div className="text-slate-300 mt-0.5 line-clamp-2">{n.message}</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dashboard / Profile */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium max-w-[100px] truncate">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              to="/report"
              className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-4">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                <link.icon className="w-4 h-4 text-blue-400" />
                <span>{link.label}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-blue-400 bg-blue-600/10 font-semibold"
              >
                <UserIcon className="w-4 h-4" />
                <span>My Dashboard ({user?.role})</span>
              </Link>
            )}
          </nav>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-2">Switch Demo Persona:</div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => {
                    handleRoleSwitch(acc.role);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-lg text-xs font-medium border text-left ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
