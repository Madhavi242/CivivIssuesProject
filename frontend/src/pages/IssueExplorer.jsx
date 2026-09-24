import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Grid,
  MapPin,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { issueApi } from '../services/issueApi';
import { CATEGORIES, STATUSES, PRIORITY_LEVELS, ZONES } from '../utils/constants';
import IssueCard from '../components/issue/IssueCard';
import IssueMap from '../components/map/IssueMap';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function IssueExplorer() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('');
  const [status, setStatus] = useState('');
  const [zone, setZone] = useState('');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (priorityLevel) params.priorityLevel = priorityLevel;
      if (status) params.status = status;
      if (zone) params.zone = zone;

      const res = await issueApi.getIssues(params);
      if (res.success) {
        setIssues(res.issues);
      }
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIssues();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, priorityLevel, status, zone]);

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setPriorityLevel('');
    setStatus('');
    setZone('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Civic Issues Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and upvote community-reported civic hazards across the metropolitan area.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>

          <Link
            to="/report"
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-glow transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, street, or landmark..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:col-span-2">
            <select
              value={priorityLevel}
              onChange={(e) => setPriorityLevel(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              {PRIORITY_LEVELS.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <div className="lg:col-span-2 flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Grid or Map */}
      {loading ? (
        <LoadingSpinner text="Searching civic database..." />
      ) : issues.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-400">No civic issues match your current filter criteria.</p>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-blue-400 hover:underline"
          >
            Clear active filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <IssueMap issues={issues} height="600px" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.slice(0, 6).map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
