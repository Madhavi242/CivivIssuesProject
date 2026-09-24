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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, ShieldCheck, CheckCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
    return <LoadingSpinner text="Computing real-time analytics from MongoDB Atlas..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <span>Municipal Civic Telemetry & Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Live analytics compiled from MongoDB Atlas issues, department dispatches, and citizen verification feedback.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Total Tracked Complaints</div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {stats?.totalIssues || 0}
          </div>
          <div className="text-[10px] text-blue-400 mt-1">Multimodal submissions</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 text-center">
          <div className="text-xs text-rose-400">Critical Hazards</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
            {stats?.criticalIssues || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Priority Engine flags</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 text-center">
          <div className="text-xs text-amber-400">Avg Resolution Speed</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {stats?.avgResolutionHours || 18.5}h
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Department dispatch SLA</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 text-center">
          <div className="text-xs text-emerald-400">Resolved & Closed</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {(stats?.resolvedIssues || 0) + (stats?.closedIssues || 0)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Citizen verified</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Issues by Category */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" />
            <span>Civic Issues by Category</span>
          </h3>
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
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Issues by Priority Level */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Issues by Priority Severity</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.byPriority || []}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {(analytics?.byPriority || []).map((entry, index) => {
                    let barColor = '#3B82F6';
                    if (entry.name === 'Critical') barColor = '#EF4444';
                    if (entry.name === 'High') barColor = '#F97316';
                    if (entry.name === 'Medium') barColor = '#F59E0B';
                    if (entry.name === 'Low') barColor = '#10B981';
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Issues by Municipal Zone */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Issue Distribution by Municipal Zone</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.byZone || []} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#06B6D4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Department Workforce Workload Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Active Department Workload (Tasks in Field)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.departmentWorkload || []}>
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="totalWorkload" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
