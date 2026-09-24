import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ThumbsUp,
  UserCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowLeft,
  Share2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { issueApi } from '../services/issueApi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import IssueMap from '../components/map/IssueMap';
import IssueTimeline from '../components/issue/IssueTimeline';
import CitizenVerificationModal from '../components/issue/CitizenVerificationModal';
import WorkerAssignmentModal from '../components/worker/WorkerAssignmentModal';
import ResolutionEvidenceModal from '../components/worker/ResolutionEvidenceModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [issue, setIssue] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [targetEvidenceStatus, setTargetEvidenceStatus] = useState('In Progress');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await issueApi.getIssueById(id);
      if (res.success) {
        setIssue(res.issue);
        setEvidenceList(res.evidence || []);
        setUpdates(res.updates || []);
        setFeedback(res.feedback || null);
      }
    } catch (err) {
      console.error('Failed to load issue details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSupport = async () => {
    if (!user) {
      addToast('Please login to support issues', 'warning');
      return;
    }
    try {
      const res = await issueApi.supportIssue(issue._id);
      if (res.success) {
        addToast('Supported issue! Priority score escalated.', 'success');
        fetchDetail();
      }
    } catch (err) {
      addToast(err.message || 'Support action failed', 'error');
    }
  };

  const handleVerifySubmit = async (verifyPayload) => {
    try {
      setSubmitting(true);
      const res = await issueApi.verifyResolution(issue._id, verifyPayload);
      if (res.success) {
        addToast(res.message, 'success');
        setShowVerifyModal(false);
        fetchDetail();
      }
    } catch (err) {
      addToast(err.message || 'Verification failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvidenceSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await issueApi.updateIssueStatus(issue._id, formData);
      if (res.success) {
        addToast('Issue status updated successfully', 'success');
        setShowEvidenceModal(false);
        fetchDetail();
      }
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving civic report and telemetry..." />;
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400 space-y-4">
        <p className="text-sm">Civic issue not found or deleted.</p>
        <Link to="/issues" className="text-xs text-blue-400 hover:underline">
          Return to explorer
        </Link>
      </div>
    );
  }

  const isReporter =
    user && (user.id === issue.reportedBy?._id || user._id === issue.reportedBy?._id);
  const isAssignedWorker =
    user &&
    user.role === 'field_worker' &&
    (issue.assignedWorker?.user?._id === user.id || issue.assignedWorker?.user?._id === user._id);
  const isAdmin = user && ['department_admin', 'system_admin'].includes(user.role);
  const canVerify =
    (isReporter || user?.role === 'system_admin') &&
    issue.status === 'Resolved' &&
    issue.verification?.status === 'pending';

  const API_HOST = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/issues"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Issues</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              addToast('Issue link copied to clipboard!', 'info');
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Share Issue"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge level={issue.priorityLevel} />
            <StatusBadge status={issue.status} />
            <CategoryBadge category={issue.category} />
            <span className="text-[11px] font-mono text-slate-500">
              Score: {issue.priorityScore}/100
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Reported on {formatDate(issue.createdAt)}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {issue.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          {issue.description}
        </p>

        {/* Dynamic Action Ribbon */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSupport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all active:scale-95"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{issue.supportCount || 1} Citizen Supporters</span>
            </button>
            <span className="text-xs text-slate-500">
              Zone: <span className="text-slate-300 font-medium">{issue.zone}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Citizen verification button */}
            {canVerify && (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Resolution (Citizen Action)</span>
              </button>
            )}

            {/* Worker action buttons */}
            {isAssignedWorker && issue.status === 'Assigned' && (
              <button
                onClick={() => {
                  setTargetEvidenceStatus('In Progress');
                  setShowEvidenceModal(true);
                }}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
              >
                <Wrench className="w-4 h-4" />
                <span>Start Field Work</span>
              </button>
            )}

            {isAssignedWorker && issue.status === 'In Progress' && (
              <button
                onClick={() => {
                  setTargetEvidenceStatus('Resolved');
                  setShowEvidenceModal(true);
                }}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Upload Proof & Mark Resolved</span>
              </button>
            )}

            {/* Admin dispatch button */}
            {isAdmin && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-semibold text-xs transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>{issue.assignedWorker ? 'Reassign Field Worker' : 'Dispatch Worker'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Details, Location, and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Telemetry & Evidence */}
        <div className="lg:col-span-7 space-y-6">
          {/* Priority Engine Factors Breakdown */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Priority Engine Factors (Transparent Scoring)</span>
              </h3>
              <span className="text-xs font-bold text-blue-400">
                Score: {issue.priorityScore}/100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Safety Risk</span>
                <div className="text-sm font-bold text-rose-400 mt-0.5">
                  {issue.priorityFactors?.safetyRisk || 5}/10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Physical Severity</span>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  {issue.priorityFactors?.severity || 5}/10
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Citizen Upvotes</span>
                <div className="text-sm font-bold text-blue-400 mt-0.5">
                  {issue.supportCount || 1} Reports
                </div>
              </div>
            </div>
          </div>

          {/* Photo Evidence Gallery */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Multimedia Photo Evidence ({evidenceList.length})
            </h3>

            {evidenceList.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No photo evidence uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {evidenceList.map((ev) => {
                  const url = ev.fileUrl?.startsWith('http')
                    ? ev.fileUrl
                    : `${API_HOST}${ev.fileUrl}`;
                  return (
                    <div
                      key={ev._id}
                      className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 space-y-2 p-2"
                    >
                      <img
                        src={url}
                        alt="Evidence"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="px-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-200 capitalize">
                          {ev.evidenceType.replace('_', ' ')}
                        </span>
                        {ev.caption && <p className="line-clamp-1 mt-0.5">{ev.caption}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Citizen Feedback if resolved/closed */}
          {feedback && (
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">Citizen Satisfaction Feedback</span>
                <span className="font-bold text-amber-400">⭐ {feedback.rating}/5 Stars</span>
              </div>
              <p className="text-xs text-slate-300">"{feedback.feedbackText}"</p>
            </div>
          )}
        </div>

        {/* Right Column: GPS Map & Chronological Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Location Map */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>GPS Location Coordinates</span>
              </span>
              <span className="font-mono text-slate-500 text-[10px]">
                {issue.location.coordinates[1]}, {issue.location.coordinates[0]}
              </span>
            </div>
            <IssueMap
              issues={[issue]}
              center={[issue.location.coordinates[1], issue.location.coordinates[0]]}
              zoom={15}
              height="240px"
            />
            <div className="text-xs text-slate-400">📍 {issue.address}</div>
          </div>

          {/* Lifecycle Audit Timeline */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Lifecycle Status History</span>
            </h3>
            <IssueTimeline updates={updates} />
          </div>
        </div>
      </div>

      {/* Citizen Verification Modal */}
      <CitizenVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        issueTitle={issue.title}
        onVerify={handleVerifySubmit}
        submitting={submitting}
      />

      {/* Worker Dispatch Recommendation Modal */}
      <WorkerAssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        issue={issue}
        onAssigned={() => {
          addToast('Worker assigned successfully', 'success');
          fetchDetail();
        }}
      />

      {/* Resolution & Evidence Upload Modal */}
      <ResolutionEvidenceModal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        issue={issue}
        targetStatus={targetEvidenceStatus}
        onSubmit={handleEvidenceSubmit}
        submitting={submitting}
      />
    </div>
  );
}
