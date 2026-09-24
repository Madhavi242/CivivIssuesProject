import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  AlertCircle,
  Clock,
  UserCheck,
  Send,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { issueApi } from '../services/issueApi';
import { departmentApi } from '../services/departmentApi';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import IssueMap from '../components/map/IssueMap';
import WorkerAssignmentModal from '../components/worker/WorkerAssignmentModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function DepartmentAdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [departmentIssues, setDepartmentIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment modal
  const [selectedIssueForDispatch, setSelectedIssueForDispatch] = useState(null);

  const fetchDeptData = async () => {
    try {
      setLoading(true);
      const deptId = user?.department?._id || user?.department;

      const issuesRes = await issueApi.getIssues({
        department: deptId,
        limit: 50,
      });
      if (issuesRes.success) {
        setDepartmentIssues(issuesRes.issues);
      }

      if (deptId) {
        const workersRes = await departmentApi.getDepartmentWorkers(deptId);
        if (workersRes.success) {
          setWorkers(workersRes.workers);
        }
      }
    } catch (err) {
      console.error('Dept admin dashboard err:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeptData();
  }, [user]);

  const handleAssigned = () => {
    addToast('Technician assigned successfully!', 'success');
    fetchDeptData();
  };

  const unassignedIssues = departmentIssues.filter((i) => !i.assignedWorker);
  const inProgressIssues = departmentIssues.filter((i) =>
    ['Assigned', 'Accepted', 'In Progress'].includes(i.status)
  );
  const criticalIssues = departmentIssues.filter(
    (i) => i.priorityLevel === 'Critical' && i.status !== 'Closed'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-400" />
            <span>Department Operations Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Managing: <span className="text-amber-400 font-bold">{user?.department?.name || 'Roads & Infrastructure'}</span> • Admin: {user?.name}
          </p>
        </div>

        <div className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          Target SLA: <span className="font-bold text-white">{user?.department?.slaHours || 48} Hours</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Department Issues</div>
          <div className="text-2xl font-black text-white mt-1">{departmentIssues.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total jurisdiction tickets</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30">
          <div className="text-xs text-rose-400 font-medium">Unassigned Queue</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{unassignedIssues.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Needs worker dispatch</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30">
          <div className="text-xs text-amber-400 font-medium">Under Repair / In Field</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{inProgressIssues.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Field teams active</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30">
          <div className="text-xs text-cyan-400 font-medium">Field Technicians</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{workers.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Available workforce</div>
        </div>
      </div>

      {/* Unassigned Issues: Intelligent Worker Dispatch */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Unassigned Tickets Queue</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {unassignedIssues.length} Pending Dispatch
            </span>
          </div>
        </div>

        {unassignedIssues.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            ✓ All department issues currently have assigned field workers.
          </div>
        ) : (
          <div className="space-y-3">
            {unassignedIssues.map((issue) => (
              <div
                key={issue._id}
                className="glass-card rounded-2xl border border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <PriorityBadge level={issue.priorityLevel} />
                    <CategoryBadge category={issue.category} />
                    <span className="text-[11px] text-slate-500">
                      📍 {issue.address || 'GPS Location'}
                    </span>
                  </div>
                  <Link to={`/issues/${issue._id}`}>
                    <h3 className="font-bold text-sm text-white hover:text-blue-400 transition-colors">
                      {issue.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-1">{issue.description}</p>
                </div>

                <button
                  onClick={() => setSelectedIssueForDispatch(issue)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow transition-all active:scale-95 shrink-0"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Run AI Dispatch Recommendation</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Field Workforce Workload Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Field Workforce Status & Live Workload</span>
          </h2>

          <div className="space-y-3">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-300">
                    {worker.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{worker.user?.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Skills: {worker.skills?.join(', ') || 'General Repair'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      worker.currentWorkload >= 4
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {worker.currentWorkload} Active Tasks
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Rating: ⭐ {worker.rating || 4.8} ({worker.totalCompleted} done)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Geographic Map */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Department Issue Distribution</span>
          </h2>
          <IssueMap issues={departmentIssues} height="360px" />
        </div>
      </div>

      {/* Worker Dispatch Recommendation Modal */}
      <WorkerAssignmentModal
        isOpen={!!selectedIssueForDispatch}
        onClose={() => setSelectedIssueForDispatch(null)}
        issue={selectedIssueForDispatch}
        onAssigned={handleAssigned}
      />
    </div>
  );
}
