import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Wrench,
  UserCheck,
  ShieldCheck,
  Camera,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle
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
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    criticalIssues: 0,
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
      default: return FileText;
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-4">
              <span>Official City Service Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Report and Track City Issues in Your Neighborhood
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              CivicPulse connects citizens directly with municipal departments to fix potholes, streetlight outages, garbage accumulation, and water leaks quickly and transparently.
            </p>

            {/* Main Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/report"
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-xs transition-colors inline-flex items-center gap-2"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/issues"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-6 py-3 rounded-lg border border-slate-300 transition-colors inline-flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-slate-600" />
                <span>Browse All Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Summary Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Reports</span>
              <FileText className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.totalIssues}</div>
            <div className="text-xs text-slate-500 mt-1">Logged in system</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.openIssues}</div>
            <div className="text-xs text-slate-500 mt-1">Assigned to field crews</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Resolved</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.resolvedIssues}</div>
            <div className="text-xs text-slate-500 mt-1">Verified resolutions</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Critical Priority</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.criticalIssues}</div>
            <div className="text-xs text-slate-500 mt-1">High public safety impact</div>
          </div>
        </div>
      </section>

      {/* 4-Step Resolution Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              How Issue Resolution Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Transparent, accountable complaint management from citizen report to verified fix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Report an Issue',
                desc: 'Upload a photo, describe the issue, and select the location on the map.',
                icon: Camera,
              },
              {
                step: '2',
                title: 'Department Triaging',
                desc: 'Complaints are categorized and routed to Roads, Sanitation, Water, or Electrical.',
                icon: Layers,
              },
              {
                step: '3',
                title: 'Field Crew Dispatch',
                desc: 'Qualified technicians are dispatched with clear job tasks and timelines.',
                icon: Wrench,
              },
              {
                step: '4',
                title: 'Citizen Verification',
                desc: 'After work is done with photo proof, reporting citizens verify and rate the fix.',
                icon: ShieldCheck,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.step}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">Step {card.step}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Switcher Demo Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Explore Portal by User Role</h2>
              <p className="text-xs text-slate-600">Quick-switch demo personas to test each workflow.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = getRoleIcon(acc.role);
              return (
                <button
                  key={acc.role}
                  onClick={() => handlePersonaClick(acc.role)}
                  className={`p-3.5 rounded-lg border text-left flex flex-col justify-between gap-2 bg-white transition-all hover:border-slate-400 hover:shadow-xs ${acc.color}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-1.5 rounded bg-slate-100 text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-400">→</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{acc.badge}</div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">{acc.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">City Issue Map</h2>
            <p className="text-xs text-slate-600 mt-0.5">Geographic view of open and resolved community complaints.</p>
          </div>
          <Link
            to="/map"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>Open Full Map</span>
            <span>→</span>
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-white">
          <IssueMap issues={recentIssues} height="400px" />
        </div>
      </section>

      {/* Recent Issues Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Reports</h2>
            <p className="text-xs text-slate-600 mt-0.5">Latest community issues submitted by residents.</p>
          </div>
          <Link
            to="/issues"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>View All Reports</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentIssues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      </section>
    </div>
  );
}
