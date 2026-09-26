import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Landmark,
  Plus,
  MapPin,
  BarChart3,
  Layers,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Search,
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
    if (role === 'citizen') navigate('/dashboard/citizen');
    else if (role === 'field_worker') navigate('/dashboard/worker');
    else if (role === 'department_admin') navigate('/dashboard/department');
    else if (role === 'system_admin') navigate('/dashboard/admin');
  };

  const navLinks = [
    { label: 'Browse Issues', path: '/issues' },
    { label: 'Map', path: '/map' },
    { label: 'Issue Hotspots', path: '/clusters' },
    { label: 'Analytics', path: '/analytics' },
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

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'citizen': return 'Citizen';
      case 'field_worker': return 'Field Tech';
      case 'department_admin': return 'Dept Admin';
      case 'system_admin': return 'System Admin';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Top Utility Bar for Portal Information & Quick Persona Switcher */}
      <div className="bg-slate-100 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-1 text-xs text-slate-600 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Official Municipal Service Portal</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Non-emergency citizen complaint & maintenance system</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] font-medium">Test Persona:</span>
            <div className="flex items-center gap-1">
              {DEMO_ACCOUNTS.map((acc) => {
                const isCurrent = user?.role === acc.role;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleRoleSwitch(acc.role)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={`Switch session to ${acc.label}`}
                  >
                    {acc.badge}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                CivicPulse
              </div>
              <div className="text-[11px] text-slate-500 leading-none">City Complaint Portal</div>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Report an Issue Button */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Report an Issue</span>
            </Link>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-lg p-3 z-50 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-900">Notifications</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                          {unreadCount} new
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-blue-700 hover:text-blue-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500">
                          No notifications right now.
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
                              !n.read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="font-semibold text-slate-900">{n.title}</div>
                            <div className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
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

            {/* User Account / Navigation */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-800 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-700" />
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({getRoleDisplayName(user?.role)})
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              to="/report"
              className="bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-semibold text-blue-700 bg-blue-50"
                >
                  My Dashboard ({getRoleDisplayName(user?.role)})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-md border border-slate-300 text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-md bg-blue-700 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-2">Switch Test Account:</div>
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
