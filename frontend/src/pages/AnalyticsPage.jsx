import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, ShieldCheck } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#2563eb', '#0284c7', '#0d9488', '#d97706', '#dc2626', '#7c3aed', '#db2777'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getAnalytics(),
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing civic telemetry & analytics..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-blue-700" />
          <span>Municipal Telemetry & Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Public metrics compiled from reported issues, department dispatches, and citizen verification.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Complaints</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {stats?.totalIssues || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Logged across all zones</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Critical Hazards</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">
            {stats?.criticalIssues || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">High public safety flags</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Avg Resolution Time</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
            {stats?.avgResolutionHours || 18.5}h
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Department dispatch SLA</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Resolved & Closed</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
            {(stats?.resolvedIssues || 0) + (stats?.closedIssues || 0)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Citizen verified</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Issues by Category */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-blue-700" />
            <span>Complaints by Category</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.byCategory || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics?.byCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Issues by Priority Level */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>Issues by Priority Severity</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.byPriority || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {(analytics?.byPriority || []).map((entry, index) => {
                    let barColor = '#2563eb';
                    if (entry.name === 'Critical') barColor = '#dc2626';
                    if (entry.name === 'High') barColor = '#ea580c';
                    if (entry.name === 'Medium') barColor = '#d97706';
                    if (entry.name === 'Low') barColor = '#16a34a';
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Issues by Municipal Zone */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Issue Distribution by Municipal Zone</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.byZone || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="value" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Department Workforce Workload Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Active Department Workload</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.departmentWorkload || []}>
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="totalWorkload" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
