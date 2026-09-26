import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Building2,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  History,
  Settings,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { departmentApi } from '../services/departmentApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

export default function SystemAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'audit' | 'departments'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, auditRes, deptRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getUsers(),
          adminApi.getAuditLogs(),
          departmentApi.getDepartments(),
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (usersRes.success) setUsers(usersRes.users);
        if (auditRes.success) setAuditLogs(auditRes.logs);
        if (deptRes.success) setDepartments(deptRes.departments);
      } catch (err) {
        console.error('System admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-blue-700" />
            <span>Platform Governance & Administration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Global system monitoring, user accounts, municipal departments, and audit logs.
          </p>
        </div>

        {/* Clean Tab Navigation */}
        <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg p-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'departments'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading system metrics and registry..." />
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Registered Users</div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats?.totalUsers || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Citizens & staff</div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Municipal Departments</div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1">{stats?.totalDepartments || 5}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Cross-sector jurisdiction</div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Avg SLA Resolution</div>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
                    {stats?.avgResolutionHours || 18.5} hrs
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">Within standard targets</div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Issues Handled</div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats?.totalIssues || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-1">All municipal zones</div>
                </div>
              </div>

              {/* Department Overview Cards */}
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-3">Jurisdictional Departments</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div key={dept._id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{dept.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{dept.description}</p>
                      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                        <span>Target SLA: <strong className="text-slate-800">{dept.slaHours}h</strong></span>
                        <span>Helpline: {dept.contactPhone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-bold text-slate-900">User Accounts Directory</h2>
                <span className="text-xs text-slate-500">{users.length} registered accounts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              u.role === 'system_admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : u.role === 'department_admin'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : u.role === 'field_worker'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.department?.name || '—'}</td>
                        <td className="px-4 py-3 text-emerald-700 font-medium">Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((d) => (
                <div key={d._id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">{d.name}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      {d.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{d.description}</p>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase">Covered Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.categories?.map((cat) => (
                        <span key={cat} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                    <span>SLA: {d.slaHours} hours</span>
                    <span>Contact: {d.contactPhone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-700" />
                  <span>Immutable System Audit Trail</span>
                </h2>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Timestamp</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                      <th className="px-4 py-3 font-semibold">Target</th>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-500">
                          No audit logs registered yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 text-slate-500">{formatDate(log.createdAt)}</td>
                          <td className="px-4 py-2.5 text-blue-700 font-bold">{log.action}</td>
                          <td className="px-4 py-2.5 text-slate-700">{log.targetType}</td>
                          <td className="px-4 py-2.5 text-slate-600">{log.user?.name || 'System'}</td>
                          <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
