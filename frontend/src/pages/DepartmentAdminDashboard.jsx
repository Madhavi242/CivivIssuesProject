import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  AlertCircle,
  Clock,
  UserCheck,
  MapPin,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-blue-700" />
            <span>Department Operations Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Department: <strong className="text-slate-900">{user?.department?.name || 'Municipal Works'}</strong> • Administrator: {user?.name}
          </p>
        </div>

        <div className="text-xs px-3.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 shadow-xs">
          Target SLA: <strong className="text-slate-900 font-semibold">{user?.department?.slaHours || 48} Hours</strong>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Department Issues</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{departmentIssues.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Assigned jurisdiction</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Unassigned Queue</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{unassignedIssues.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Pending dispatch</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">In Progress</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{inProgressIssues.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Field teams active</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Field Technicians</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1">{workers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Department workforce</div>
        </div>
      </div>

      {/* Unassigned Issues Queue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Unassigned Issues Queue</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              {unassignedIssues.length} Pending
            </span>
          </div>
        </div>

        {unassignedIssues.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border border-slate-200 text-center text-xs sm:text-sm text-slate-500">
            ✓ All department issues currently have assigned field technicians.
          </div>
        ) : (
          <div className="space-y-3">
            {unassignedIssues.map((issue) => (
              <div
                key={issue._id}
                className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
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
                    <h3 className="font-semibold text-sm text-slate-900 hover:text-blue-700 transition-colors">
                      {issue.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-600 line-clamp-1">{issue.description}</p>
                </div>

                <button
                  onClick={() => setSelectedIssueForDispatch(issue)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Assign Technician</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Field Workforce Workload Monitor & Department Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <span>Field Workforce & Live Workload</span>
          </h2>

          <div className="space-y-2.5">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                    {worker.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{worker.user?.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Skills: {worker.skills?.join(', ') || 'General Repair'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      worker.currentWorkload >= 4
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {worker.currentWorkload} Active Task(s)
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Rating: ⭐ {worker.rating || 4.8} ({worker.totalCompleted} completed)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Geographic Map */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            <span>Department Issues Map</span>
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
