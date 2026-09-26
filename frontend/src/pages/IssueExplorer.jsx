import React, { useEffect, useState } from 'react';
import {
  Search,
  Grid,
  MapPin,
  Plus,
  RotateCcw,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Browse Issues
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Search, filter, and track public municipal issues across the city.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg p-1 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-medium ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-medium ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          <Link
            to="/report"
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Report an Issue</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, street, or landmark..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
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
              className="w-full text-xs px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
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
              className="w-full text-xs px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Zone Filter & Reset */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-md bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="">All Zones</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-2 rounded-md border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Grid or Map */}
      {loading ? (
        <LoadingSpinner text="Searching civic database..." />
      ) : issues.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
          <p className="text-sm text-slate-600">No civic issues match your current filter criteria.</p>
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Clear active filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <IssueMap issues={issues} height="550px" />
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
