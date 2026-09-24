import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  Zap,
  MapPin,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle,
  FileCheck,
  TrendingUp,
  Users,
  Compass,
} from 'lucide-react';
import { issueApi } from '../services/issueApi';
import { adminApi } from '../services/adminApi';
import { DEMO_ACCOUNTS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/issue/IssueCard';
import IssueMap from '../components/map/IssueMap';

export default function Home() {
  const { quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const [recentIssues, setRecentIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 6,
    openIssues: 3,
    resolvedIssues: 3,
    criticalIssues: 3,
  });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const issuesRes = await issueApi.getIssues({ limit: 4 });
        if (issuesRes.success) setRecentIssues(issuesRes.issues);

        const statsRes = await adminApi.getDashboardStats();
        if (statsRes.success) setStats(statsRes.stats);
      } catch (err) {
        console.error('Home data load error:', err);
      }
    };
    loadHomeData();
  }, []);

  const handlePersonaClick = async (role) => {
    await quickSwitchRole(role);
    if (role === 'citizen') navigate('/dashboard/citizen');
    else if (role === 'field_worker') navigate('/dashboard/worker');
    else if (role === 'department_admin') navigate('/dashboard/department');
    else if (role === 'system_admin') navigate('/dashboard/admin');
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6 shadow-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hackathon Civic Tech Platform • Next-Gen Public Works</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Intelligent Civic Issue Detection, Prioritization & Resolution
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate traditional municipal complaint blind spots with multimodal AI reporting, automated duplicate prevention, real-time geographic clustering, and verified citizen resolutions.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Report Civic Issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/issues"
              className="glass-panel hover:bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore Live Issues</span>
            </Link>
          </div>

          {/* Quick Demo Personas Selector */}
          <div className="mt-12 p-4 max-w-2xl mx-auto glass-panel rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>1-Click Hackathon Persona Switcher</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handlePersonaClick(acc.role)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 ${acc.color}`}
                >
                  <span>{acc.badge}</span>
                  <span className="text-[10px] font-normal opacity-80">Test Flow →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Metric Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalIssues}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Total Reported Issues</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 text-center">
            <div className="text-2xl sm:text-3xl font-black text-rose-400">{stats.criticalIssues}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Critical Urgency Items</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{stats.openIssues}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Under Review / Queued</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.resolvedIssues}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Resolved & Verified</div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Transforming Civic Complaint Management
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Common limitations of traditional complaint systems solved through multimodal intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Limitations */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/20 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <span>Traditional Municipal Portals</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Manual issue categorization leading to misrouted complaints</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Dozens of duplicate tickets for the same physical pothole</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Text-only forms with no verified evidence collection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>No geographic clustering, causing inefficient field dispatch</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Weak resolution verification; tickets closed without citizen approval</span>
              </li>
            </ul>
          </div>

          {/* CivicPulse Innovation */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/30 space-y-4 shadow-glow">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <span>CivicPulse Platform Solution</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Multimodal AI suggestions: Title, text, and photo analyzed together</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Automated duplicate detection with 1-click citizen upvote/support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Transparent priority engine normalizing safety, duration, and volume</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Smart worker recommendations based on GPS proximity and active workload</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Citizen resolution verification: Reopen unresolved issues with 1-click</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Live Geolocation Intelligence</h2>
            <p className="text-xs text-slate-400 mt-1">Real-time issue pins and spatial severity heat.</p>
          </div>
          <Link
            to="/map"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Full Map View →
          </Link>
        </div>
        <IssueMap issues={recentIssues} height="420px" />
      </section>

      {/* Recent Issues Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Recent Civic Reports</h2>
            <p className="text-xs text-slate-400 mt-1">Actively tracked issues in your municipal zone.</p>
          </div>
          <Link
            to="/issues"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All ({stats.totalIssues}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentIssues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      </section>
    </div>
  );
}
