import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MapPin, Clock, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../common/Badge';
import { timeAgo } from '../../utils/formatters';
import { issueApi } from '../../services/issueApi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function IssueCard({ issue, onSupported }) {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [supportCount, setSupportCount] = useState(issue.supportCount || 1);
  const [supporting, setSupporting] = useState(false);

  const isSupportedByMe =
    user && issue.supportingUsers?.some((id) => id === user.id || id === user._id);

  const handleSupport = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast('Please login to support civic issues', 'warning');
      return;
    }
    if (isSupportedByMe) {
      addToast('You already supported this issue', 'info');
      return;
    }

    setSupporting(true);
    try {
      const res = await issueApi.supportIssue(issue._id);
      if (res.success) {
        setSupportCount(res.supportCount);
        addToast('Upvoted! Priority escalated.', 'success');
        if (onSupported) onSupported(issue._id, res);
      }
    } catch (err) {
      addToast(err.message || 'Failed to support issue', 'error');
    } finally {
      setSupporting(false);
    }
  };

  // Resolve image URL
  const API_HOST = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  const imageUrl = issue.evidence?.[0]?.fileUrl
    ? issue.evidence[0].fileUrl.startsWith('http')
      ? issue.evidence[0].fileUrl
      : `${API_HOST}${issue.evidence[0].fileUrl}`
    : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="glass-card rounded-2xl border border-slate-800 hover:border-blue-500/40 shadow-lg hover:shadow-glow/20 transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Image Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={imageUrl}
          alt={issue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <PriorityBadge level={issue.priorityLevel} />
          <StatusBadge status={issue.status} />
        </div>

        {/* Bottom Tag */}
        <div className="absolute bottom-2.5 left-3">
          <CategoryBadge category={issue.category} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link to={`/issues/${issue._id}`}>
            <h3 className="text-base font-bold text-slate-100 hover:text-blue-400 transition-colors line-clamp-1">
              {issue.title}
            </h3>
          </Link>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Location & Time */}
        <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{issue.address || 'Captured GPS'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              {timeAgo(issue.createdAt)}
            </span>
            {issue.department && (
              <span className="text-cyan-400/90 font-medium">
                {issue.department.code || issue.department.name}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Footer: Support button + View Detail */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={handleSupport}
            disabled={supporting}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 ${
              isSupportedByMe
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Upvote/support this report to raise its priority score"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isSupportedByMe ? 'fill-blue-400' : ''}`} />
            <span>{supportCount}</span>
            <span className="hidden sm:inline font-normal text-slate-400">Support</span>
          </button>

          <Link
            to={`/issues/${issue._id}`}
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View Issue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
