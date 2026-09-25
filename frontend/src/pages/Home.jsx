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
  Camera,
  Cpu,
  Workflow,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Building2,
  Wrench,
  UserCheck
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'citizen': return UserCheck;
      case 'field_worker': return Wrench;
      case 'department_admin': return Building2;
      case 'system_admin': return ShieldCheck;
      default: return Users;
    }
  };

  return (
    <div className="space-y-24 pb-24 relative overflow-hidden">
      
      {/* Background Lighting Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Platform Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-8 shadow-glow-cyan">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Autonomous Civic Operations • Smart Infrastructure Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Transforming City Issues into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Verified Real-Time Solutions
            </span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate traditional municipal complaint blind spots with multimodal AI vision, automated duplicate report suppression, geospatial clustering, and photo-verified citizen resolution.
          </p>

          {/* Main Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-glow transition-all active:scale-95 flex items-center gap-2.5 group"
            >
              <span>Report Community Issue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/issues"
              className="glass-panel hover:bg-slate-800/80 border border-white/10 text-slate-200 font-bold text-sm px-8 py-4 rounded-2xl transition-all flex items-center gap-2.5"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore Live GIS Map</span>
            </Link>
          </div>

          {/* Role Quick-Access Showcase */}
          <div className="mt-16 p-5 sm:p-6 max-w-3xl mx-auto glass-panel rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Explore The Multi-Role Municipal Ecosystem</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = getRoleIcon(acc.role);
                return (
                  <button
                    key={acc.role}
                    onClick={() => handlePersonaClick(acc.role)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all hover:scale-105 active:scale-95 group cursor-pointer ${acc.color}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-1.5 rounded-lg bg-white/10">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">→</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{acc.badge}</div>
                      <div className="text-[10px] text-slate-300 font-normal truncate mt-0.5">{acc.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Live Metric Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 text-center relative overflow-hidden group">
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-white">{stats.totalIssues}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Total Reported Incidents</div>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Real-time GIS feed
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 text-center relative overflow-hidden group">
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-rose-400">{stats.criticalIssues}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Critical Priority Hazards</div>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> High public safety score
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 text-center relative overflow-hidden group">
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-amber-400">{stats.openIssues}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Active Field Assignments</div>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <Clock className="w-3.5 h-3.5" /> Crew in dispatch
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 text-center relative overflow-hidden group">
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-400">{stats.resolvedIssues}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Verified Community Fixes</div>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> Citizen confirmed
            </div>
          </div>
        </div>
      </section>

      {/* How CivicPulse Works (Interactive 4-Step Architecture) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            How CivicPulse Powers Municipal Agility
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            From mobile snapshot to verified repair in four automated, transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Multimodal Snap & Pin',
              desc: 'Citizen captures a photo with GPS coordinates. AI vision scans hazard severity and classifies the category.',
              icon: Camera,
              color: 'text-cyan-400',
              border: 'border-cyan-500/30',
            },
            {
              step: '02',
              title: 'Duplicate Suppression',
              desc: 'Geospatial algorithms detect identical issues within radius and merge upvotes to eliminate duplicate municipal tickets.',
              icon: Layers,
              color: 'text-blue-400',
              border: 'border-blue-500/30',
            },
            {
              step: '03',
              title: 'Smart Dispatch & Routing',
              desc: 'Nearest qualified field technicians receive real-time routing based on live workload and geographic clustering.',
              icon: Workflow,
              color: 'text-violet-400',
              border: 'border-violet-500/30',
            },
            {
              step: '04',
              title: 'Photo-Verified Resolution',
              desc: 'Field worker uploads after-repair proof. Original reporting citizens verify and rate the fix before ticket closes.',
              icon: ShieldCheck,
              color: 'text-emerald-400',
              border: 'border-emerald-500/30',
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`glass-panel p-6 rounded-3xl border ${card.border} space-y-4 hover:-translate-y-1 transition-all duration-300 relative`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-display font-black text-slate-600">{card.step}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem vs Solution Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-display font-bold text-white">
            Transforming Municipal Governance
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A radical departure from slow, opaque, manual complaint portals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Limitations */}
          <div className="glass-panel p-8 rounded-3xl border border-rose-500/20 space-y-5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base font-display">
              <span>Traditional Municipal Portals</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold bg-rose-500/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">✕</span>
                <span>Manual issue categorization leading to misrouted complaints and delayed SLA</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold bg-rose-500/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">✕</span>
                <span>Dozens of redundant duplicate tickets for the same physical road hazard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold bg-rose-500/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">✕</span>
                <span>No spatial heat maps, resulting in disorganized field technician travel</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold bg-rose-500/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">✕</span>
                <span>Weak resolution verification; tickets closed internally without citizen consent</span>
              </li>
            </ul>
          </div>

          {/* CivicPulse Innovation */}
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 space-y-5 shadow-glow">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base font-display">
              <span>CivicPulse Platform Solution</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Multimodal AI suggestions: Image, description, and hazard parameters classified instantly</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Automated duplicate detection with 1-click citizen upvote & social confirmation</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Intelligent geospatial clustering to batch nearby repair jobs for maximum efficiency</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Citizen-powered verification: Community confirms resolution before issue is closed</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Live Geolocation Intelligence</h2>
            <p className="text-xs text-slate-400 mt-1">Real-time incident pins and spatial severity heat map.</p>
          </div>
          <Link
            to="/map"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <span>Full Map Explorer</span>
            <span>→</span>
          </Link>
        </div>
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <IssueMap issues={recentIssues} height="440px" />
        </div>
      </section>

      {/* Recent Issues Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Recent Civic Reports</h2>
            <p className="text-xs text-slate-400 mt-1">Actively tracked issues in your municipal zone.</p>
          </div>
          <Link
            to="/issues"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <span>View All ({stats.totalIssues})</span>
            <span>→</span>
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

