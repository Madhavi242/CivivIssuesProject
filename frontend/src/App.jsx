import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import IssueExplorer from './pages/IssueExplorer';
import IssueDetailPage from './pages/IssueDetailPage';
import IssueReportForm from './components/issue/IssueReportForm';
import CitizenDashboard from './pages/CitizenDashboard';
import FieldWorkerDashboard from './pages/FieldWorkerDashboard';
import DepartmentAdminDashboard from './pages/DepartmentAdminDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import ClusterExplorer from './pages/ClusterExplorer';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/issues" replace />;
  }

  return children;
};

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-bold text-slate-800 text-sm">CivicPulse</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="text-slate-600">Municipal Grievance & Public Service Management System</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500">
          <Link to="/issues" className="hover:text-slate-900 transition-colors">Browse Issues</Link>
          <Link to="/map" className="hover:text-slate-900 transition-colors">Incident Map</Link>
          <Link to="/clusters" className="hover:text-slate-900 transition-colors">Hotspots</Link>
          <Link to="/analytics" className="hover:text-slate-900 transition-colors">Public Telemetry</Link>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">Non-Emergency Municipal Helpline: 1913</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-700 selection:text-white">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/issues" element={<IssueExplorer />} />
                  <Route path="/issues/:id" element={<IssueDetailPage />} />
                  <Route path="/report" element={<IssueReportForm />} />
                  <Route path="/map" element={<IssueExplorer />} />
                  <Route path="/clusters" element={<ClusterExplorer />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />

                  {/* Role Dashboards */}
                  <Route
                    path="/dashboard/citizen"
                    element={
                      <ProtectedRoute allowedRoles={['citizen', 'system_admin']}>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/worker"
                    element={
                      <ProtectedRoute allowedRoles={['field_worker', 'system_admin']}>
                        <FieldWorkerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/department"
                    element={
                      <ProtectedRoute allowedRoles={['department_admin', 'system_admin']}>
                        <DepartmentAdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard/admin"
                    element={
                      <ProtectedRoute allowedRoles={['system_admin']}>
                        <SystemAdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
