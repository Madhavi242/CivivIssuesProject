import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    <footer className="border-t border-white/[0.06] bg-[#060a10] py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-white text-sm tracking-tight">CivicPulse</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Intelligent Municipal Operations & Citizen Resolution Platform</span>
        </div>
        <div className="flex items-center gap-5 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ISO-Compliant GIS</span>
          <span>Neural Triaging</span>
          <span>Cloud Database</span>
          <span>Real-Time WebSockets</span>
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
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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
