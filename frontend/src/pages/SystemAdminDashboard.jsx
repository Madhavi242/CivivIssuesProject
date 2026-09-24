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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <span>Platform Governance & System Administration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global system monitoring, role permissions, municipal departments, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'departments'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
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
                <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Total Registered Users</div>
                  <div className="text-2xl font-black text-white mt-1">{stats?.totalUsers || 0}</div>
                  <div className="text-[11px] text-blue-400 mt-1">Citizens & Field Teams</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Active Municipal Departments</div>
                  <div className="text-2xl font-black text-cyan-400 mt-1">{stats?.totalDepartments || 5}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Cross-sector jurisdiction</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Average SLA Resolution Time</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {stats?.avgResolutionHours || 18.5} hrs
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">Within standard targets</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Total Issues Processed</div>
                  <div className="text-2xl font-black text-purple-400 mt-1">{stats?.totalIssues || 0}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Across 4 municipal zones</div>
                </div>
              </div>

              {/* Department Overview Cards */}
              <div>
                <h3 className="text-base font-bold text-white mb-3">Jurisdictional Departments</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div key={dept._id} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{dept.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300">
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{dept.description}</p>
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
                        <span>SLA: {dept.slaHours}h</span>
                        <span>Contact: {dept.contactPhone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">System User Accounts</h3>
                <span className="text-xs text-slate-400">{users.length} registered accounts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                        <td className="px-4 py-3 text-slate-400 font-mono">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'system_admin'
                                ? 'bg-purple-500/20 text-purple-400'
                                : u.role === 'department_admin'
                                ? 'bg-amber-500/20 text-amber-400'
                                : u.role === 'field_worker'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{u.department?.name || '—'}</td>
                        <td className="px-4 py-3 text-emerald-400 font-medium">Active</td>
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
                <div key={d._id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{d.name}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {d.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{d.description}</p>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase">Covered Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.categories?.map((cat) => (
                        <span key={cat} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Immutable System Audit Trail</span>
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-500">
                          No audit logs registered yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-900/40">
                          <td className="px-4 py-2.5 text-slate-500">{formatDate(log.createdAt)}</td>
                          <td className="px-4 py-2.5 text-cyan-400 font-bold">{log.action}</td>
                          <td className="px-4 py-2.5 text-slate-300">{log.targetType}</td>
                          <td className="px-4 py-2.5 text-slate-400">{log.user?.name || 'System'}</td>
                          <td className="px-4 py-2.5 text-slate-400 max-w-xs truncate">
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
