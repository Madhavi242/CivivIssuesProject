import React from 'react';
import { AlertTriangle, ThumbsUp, ArrowRight, ExternalLink } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { useNavigate } from 'react-router-dom';

export default function DuplicateModal({
  isOpen,
  onClose,
  existingIssue,
  onSupportExisting,
  onProceedAnyway,
  submitting,
}) {
  const navigate = useNavigate();

  if (!isOpen || !existingIssue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-amber-500/40 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Similar Civic Issue Already Reported</h3>
            <p className="text-xs text-slate-400">
              CivicPulse detected an active complaint matching your location and description.
            </p>
          </div>
        </div>

        {/* Existing Issue Card */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              ID: {existingIssue.issueId || existingIssue._id}
            </span>
            <div className="flex items-center gap-2">
              <PriorityBadge level={existingIssue.priorityLevel} size="xs" />
              <StatusBadge status={existingIssue.status} size="xs" />
            </div>
          </div>

          <h4 className="font-semibold text-sm text-slate-100">
            {existingIssue.title}
          </h4>

          <p className="text-xs text-slate-400 line-clamp-2">
            {existingIssue.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>📍 {existingIssue.distanceMeters ? `${existingIssue.distanceMeters} meters away` : 'Near your pin'}</span>
            <span className="font-medium text-blue-400">
              👥 {existingIssue.supportCount || 1} Citizen Supporters
            </span>
          </div>
        </div>

        <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-3 mb-5 text-xs text-blue-300">
          💡 Supporting an existing report prevents duplicate workload and automatically recalculates urgency in our Priority Engine!
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onSupportExisting(existingIssue.issueId || existingIssue._id)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Support Existing Issue (Recommended)</span>
          </button>

          <button
            onClick={onProceedAnyway}
            disabled={submitting}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <span>Submit As Separate Issue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-400"
          >
            Cancel and Return to Editor
          </button>
        </div>
      </div>
    </div>
  );
}
