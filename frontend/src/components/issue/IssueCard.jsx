import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MapPin, Clock, ArrowRight } from 'lucide-react';
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
      addToast('You have already supported this report', 'info');
      return;
    }

    setSupporting(true);
    try {
      const res = await issueApi.supportIssue(issue._id);
      if (res.success) {
        setSupportCount(res.supportCount);
        addToast('Report supported! Urgency escalated for department review.', 'success');
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
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Image Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={issue.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <PriorityBadge level={issue.priorityLevel} size="xs" />
          <StatusBadge status={issue.status} size="xs" />
        </div>

        {/* Bottom Category Tag */}
        <div className="absolute bottom-2 left-2.5">
          <CategoryBadge category={issue.category} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link to={`/issues/${issue._id}`}>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 hover:text-blue-700 transition-colors line-clamp-1">
              {issue.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Location & Time */}
        <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{issue.address || 'Reported Location'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              {timeAgo(issue.createdAt)}
            </span>
            {issue.department && (
              <span className="font-medium text-slate-600">
                {issue.department.code || issue.department.name}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Footer: Support button + View Detail */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleSupport}
            disabled={supporting}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
              isSupportedByMe
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Support this issue to confirm community impact"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isSupportedByMe ? 'fill-blue-600 text-blue-600' : 'text-slate-500'}`} />
            <span>{supportCount}</span>
            <span className="text-slate-500">Support</span>
          </button>

          <Link
            to={`/issues/${issue._id}`}
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
