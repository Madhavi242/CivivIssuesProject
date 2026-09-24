import React, { useEffect, useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assignmentApi } from '../services/assignmentApi';
import { issueApi } from '../services/issueApi';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import IssueMap from '../components/map/IssueMap';
import ResolutionEvidenceModal from '../components/worker/ResolutionEvidenceModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function FieldWorkerDashboard() {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [activeModalIssue, setActiveModalIssue] = useState(null);
  const [modalTargetStatus, setModalTargetStatus] = useState('In Progress');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const res = await assignmentApi.getMyAssignments();
      if (res.success) {
        setAssignedIssues(res.issues);
      }
    } catch (err) {
      console.error('Field worker dashboard fetch err:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [user]);

  const handleOpenActionModal = (issue, targetStatus) => {
    setActiveModalIssue(issue);
    setModalTargetStatus(targetStatus);
  };

  const handleStatusSubmit = async (formData) => {
    if (!activeModalIssue) return;
    setSubmittingStatus(true);
    try {
      const res = await issueApi.updateIssueStatus(activeModalIssue._id, formData);
      if (res.success) {
        addToast(res.message, 'success');
        setActiveModalIssue(null);
        fetchAssigned();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const criticalTasks = assignedIssues.filter(
    (i) => i.priorityLevel === 'Critical' && i.status !== 'Closed'
  );
  const inProgressTasks = assignedIssues.filter((i) => i.status === 'In Progress');
  const resolvedTasks = assignedIssues.filter((i) =>
    ['Resolved', 'Closed', 'Citizen Verification'].includes(i.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Field Technician Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-cyan-400 font-semibold">{user?.name}</span> • Department: {user?.department?.name || 'Municipal Works'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Duty Status: Active & Dispatchable</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Assigned Tasks</div>
          <div className="text-2xl font-black text-white mt-1">{assignedIssues.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Current Active Load</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20">
          <div className="text-xs text-slate-400 font-medium">Critical Emergencies</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{criticalTasks.length}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">High Safety Hazards</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20">
          <div className="text-xs text-slate-400 font-medium">Work In Progress</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{inProgressTasks.length}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Field Crews Deployed</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
          <div className="text-xs text-slate-400 font-medium">Resolved / Awaiting Review</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{resolvedTasks.length}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Resolution Evidence Sent</div>
        </div>
      </div>

      {/* Map of Assigned Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Assigned Dispatch GPS Locations</span>
          </h2>
          <span className="text-xs text-slate-400">Bangalore Zone</span>
        </div>
        <IssueMap issues={assignedIssues} height="360px" />
      </div>

      {/* Task Queue List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <span>Assigned Tasks Queue & Work Actions</span>
          </h2>
          <span className="text-xs text-slate-400">{assignedIssues.length} assigned</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching assigned work orders..." />
        ) : assignedIssues.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            No pending tasks assigned right now. You are ready for new dispatches.
          </div>
        ) : (
          <div className="space-y-4">
            {assignedIssues.map((issue) => {
              const isAssigned = issue.status === 'Assigned' || issue.status === 'Accepted';
              const isInProgress = issue.status === 'In Progress';
              const isResolved = ['Resolved', 'Citizen Verification', 'Closed'].includes(issue.status);

              return (
                <div
                  key={issue._id}
                  className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-slate-700"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge level={issue.priorityLevel} />
                      <StatusBadge status={issue.status} />
                      <CategoryBadge category={issue.category} />
                    </div>

                    <Link to={`/issues/${issue._id}`}>
                      <h3 className="text-base font-bold text-white hover:text-blue-400 transition-colors">
                        {issue.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {issue.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>📍 {issue.address || 'GPS Coordinates'}</span>
                      <span>•</span>
                      <span>Reporter: {issue.reportedBy?.name || 'Citizen'}</span>
                    </div>
                  </div>

                  {/* Worker Action Buttons */}
                  <div className="flex flex-wrap md:flex-col items-stretch gap-2 shrink-0 min-w-[200px]">
                    {isAssigned && (
                      <button
                        onClick={() => handleOpenActionModal(issue, 'In Progress')}
                        className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Start Work (In Progress)</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => handleOpenActionModal(issue, 'Resolved')}
                        className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-glow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Upload Proof & Mark Resolved</span>
                      </button>
                    )}

                    {isResolved && (
                      <div className="text-center py-1.5 px-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        ✓ Work Complete
                      </div>
                    )}

                    <Link
                      to={`/issues/${issue._id}`}
                      className="text-center py-2 px-4 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                    >
                      View Details & Timeline
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolution & Evidence Upload Modal */}
      <ResolutionEvidenceModal
        isOpen={!!activeModalIssue}
        onClose={() => setActiveModalIssue(null)}
        issue={activeModalIssue}
        targetStatus={modalTargetStatus}
        onSubmit={handleStatusSubmit}
        submitting={submittingStatus}
      />
    </div>
  );
}
