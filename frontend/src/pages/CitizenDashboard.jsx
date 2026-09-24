import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issueApi } from '../services/issueApi';
import IssueCard from '../components/issue/IssueCard';
import CitizenVerificationModal from '../components/issue/CitizenVerificationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [myIssues, setMyIssues] = useState([]);
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification modal state
  const [verifyingIssue, setVerifyingIssue] = useState(null);
  const [submittingVerify, setSubmittingVerify] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch user's reported issues
      const res = await issueApi.getIssues({ reportedBy: user?.id || user?._id });
      if (res.success) {
        setMyIssues(res.issues);
      }

      // Fetch nearby issues
      const nearbyRes = await issueApi.getNearbyIssues({
        latitude: 12.9716,
        longitude: 77.5946,
        radius: 3000,
      });
      if (nearbyRes.success) {
        setNearbyIssues(nearbyRes.issues);
      }
    } catch (err) {
      console.error('Citizen dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Handle citizen verification submission
  const handleVerifySubmit = async (verifyPayload) => {
    if (!verifyingIssue) return;
    setSubmittingVerify(true);
    try {
      const res = await issueApi.verifyResolution(verifyingIssue._id, verifyPayload);
      if (res.success) {
        addToast(res.message, 'success');
        setVerifyingIssue(null);
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Verification failed', 'error');
    } finally {
      setSubmittingVerify(false);
    }
  };

  const pendingVerification = myIssues.filter(
    (i) => i.status === 'Resolved' && i.verification?.status === 'pending'
  );
  const openCount = myIssues.filter((i) => !['Closed', 'Resolved'].includes(i.status)).length;
  const closedCount = myIssues.filter((i) => i.status === 'Closed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Citizen Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <span className="text-blue-400 font-semibold">{user?.name}</span>. Track your complaints and verify completed field work.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-glow transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Civic Issue</span>
        </Link>
      </div>

      {/* Pending Citizen Verification Alert Banner */}
      {pendingVerification.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 shadow-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Action Required: {pendingVerification.length} Issue(s) Marked as Resolved
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Field technicians have uploaded resolution proof. Please verify whether the issue is solved or needs to be reopened.
              </p>
            </div>
          </div>

          <button
            onClick={() => setVerifyingIssue(pendingVerification[0])}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
          >
            Verify Resolution Now →
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{myIssues.length}</div>
            <div className="text-xs text-slate-400 font-medium">My Reported Complaints</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">{openCount}</div>
            <div className="text-xs text-slate-400 font-medium">In Progress / Active</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">{closedCount}</div>
            <div className="text-xs text-slate-400 font-medium">Verified & Closed</div>
          </div>
        </div>
      </div>

      {/* My Reports Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>My Submitted Reports</span>
          </h2>
          <span className="text-xs text-slate-400">{myIssues.length} total</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your reported issues..." />
        ) : myIssues.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400">You haven't reported any civic complaints yet.</p>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              <span>Submit your first complaint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myIssues.map((issue) => (
              <div key={issue._id} className="relative">
                <IssueCard issue={issue} />
                {issue.status === 'Resolved' && (
                  <button
                    onClick={() => setVerifyingIssue(issue)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>Click to Verify Resolution</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby Issues in Community */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span>Active Issues in Your Area (Upvote & Support)</span>
          </h2>
          <Link to="/map" className="text-xs text-blue-400 hover:underline">
            View on Map →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyIssues.slice(0, 3).map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      </div>

      {/* Verification Modal Dialog */}
      <CitizenVerificationModal
        isOpen={!!verifyingIssue}
        onClose={() => setVerifyingIssue(null)}
        issueTitle={verifyingIssue?.title}
        onVerify={handleVerifySubmit}
        submitting={submittingVerify}
      />
    </div>
  );
}
