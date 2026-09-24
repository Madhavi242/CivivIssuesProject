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
    <footer className="border-t border-slate-900 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-300">CivicPulse Platform</span> • Production-Style Civic Technology Hackathon
        </div>
        <div className="flex items-center gap-6">
          <span>MongoDB Atlas</span>
          <span>Leaflet Maps</span>
          <span>Multimodal AI Vision</span>
          <span>Socket.IO Real-time</span>
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
