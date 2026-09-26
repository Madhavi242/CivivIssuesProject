import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  MapPin,
  ArrowRight,
  AlertCircle
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
  const closedCount = myIssues.filter((i) => ['Closed', 'Resolved'].includes(i.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Citizen Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Welcome back, <span className="font-semibold text-slate-900">{user?.name}</span>. Track your complaints and verify completed municipal field work.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Report an Issue</span>
        </Link>
      </div>

      {/* Pending Citizen Verification Alert Banner */}
      {pendingVerification.length > 0 && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-blue-100 text-blue-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900">
                Action Required: {pendingVerification.length} Issue(s) Marked as Resolved
              </h3>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                Municipal field crews have uploaded resolution proof for your report. Please verify whether the repair is satisfactory or needs to be reopened.
              </p>
            </div>
          </div>

          <button
            onClick={() => setVerifyingIssue(pendingVerification[0])}
            className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
          >
            Verify Resolution →
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{myIssues.length}</div>
            <div className="text-xs text-slate-600 font-medium">My Reported Complaints</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{openCount}</div>
            <div className="text-xs text-slate-600 font-medium">In Progress / Active</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700">{closedCount}</div>
            <div className="text-xs text-slate-600 font-medium">Verified & Closed</div>
          </div>
        </div>
      </div>

      {/* Track My Reports Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>Track My Reports</span>
          </h2>
          <span className="text-xs text-slate-500">{myIssues.length} total</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your reported issues..." />
        ) : myIssues.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-3">
            <p className="text-xs sm:text-sm text-slate-600">You haven't reported any civic complaints yet.</p>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              <span>Submit your first complaint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myIssues.map((issue) => (
              <div key={issue._id} className="flex flex-col space-y-2">
                <IssueCard issue={issue} />
                {issue.status === 'Resolved' && (
                  <button
                    onClick={() => setVerifyingIssue(issue)}
                    className="w-full py-2 px-3 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
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
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-600" />
              <span>Nearby Issues</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Support complaints in your locality to help prioritize repairs.</p>
          </div>
          <Link to="/map" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
            View on Map →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
