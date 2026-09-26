import React, { useEffect, useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight,
  User
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Field Worker Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Logged in as <span className="font-semibold text-slate-900">{user?.name}</span> • Department: {user?.department?.name || 'Public Works'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Duty Status: Active</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Assigned Issues</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{assignedIssues.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total active workload</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Critical Priority</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{criticalTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">High safety urgency</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">In Progress</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{inProgressTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Under field repair</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Completed / Resolved</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{resolvedTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Evidence submitted</div>
        </div>
      </div>

      {/* Map of Assigned Tasks */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            <span>Assigned Dispatch Map</span>
          </h2>
          <span className="text-xs text-slate-500">{assignedIssues.length} location(s)</span>
        </div>
        <IssueMap issues={assignedIssues} height="320px" />
      </div>

      {/* Assigned Issues Task List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-700" />
            <span>Assigned Issues & Work Actions</span>
          </h2>
          <span className="text-xs text-slate-500">{assignedIssues.length} assigned task(s)</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching assigned work orders..." />
        ) : assignedIssues.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-xs text-slate-500">
            No pending tasks assigned right now. You are ready for new field assignments.
          </div>
        ) : (
          <div className="space-y-3">
            {assignedIssues.map((issue) => {
              const isAssigned = issue.status === 'Assigned' || issue.status === 'Accepted';
              const isInProgress = issue.status === 'In Progress';
              const isResolved = ['Resolved', 'Citizen Verification', 'Closed'].includes(issue.status);

              return (
                <div
                  key={issue._id}
                  className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors hover:border-slate-300"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge level={issue.priorityLevel} />
                      <StatusBadge status={issue.status} />
                      <CategoryBadge category={issue.category} />
                    </div>

                    <Link to={`/issues/${issue._id}`}>
                      <h3 className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors">
                        {issue.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
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
                        className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Start Work (In Progress)</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => handleOpenActionModal(issue, 'Resolved')}
                        className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Upload Proof & Mark Resolved</span>
                      </button>
                    )}

                    {isResolved && (
                      <div className="text-center py-1.5 px-3 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                        ✓ Work Complete
                      </div>
                    )}

                    <Link
                      to={`/issues/${issue._id}`}
                      className="text-center py-2 px-4 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
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
