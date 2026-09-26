import React from 'react';
import { AlertTriangle, ThumbsUp, ArrowRight } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';

export default function DuplicateModal({
  isOpen,
  onClose,
  existingIssue,
  onSupportExisting,
  onProceedAnyway,
  submitting,
}) {
  if (!isOpen || !existingIssue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl p-6 overflow-hidden">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Similar Issue Already Reported Nearby</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              An active complaint matching your description and location is already registered.
            </p>
          </div>
        </div>

        {/* Existing Issue Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">
              ID: {existingIssue.issueId || existingIssue._id}
            </span>
            <div className="flex items-center gap-1.5">
              <PriorityBadge level={existingIssue.priorityLevel} size="xs" />
              <StatusBadge status={existingIssue.status} size="xs" />
            </div>
          </div>

          <h4 className="font-semibold text-sm text-slate-900">
            {existingIssue.title}
          </h4>

          <p className="text-xs text-slate-600 line-clamp-2">
            {existingIssue.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
            <span>📍 {existingIssue.distanceMeters ? `Approx. ${existingIssue.distanceMeters}m away` : 'Nearby'}</span>
            <span className="font-medium text-slate-700">
              {existingIssue.supportCount || 1} Community Supporter(s)
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 text-xs text-blue-900 leading-relaxed">
          Supporting an existing report helps municipal departments prioritize urgent cluster hazards and avoids redundant work orders.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => onSupportExisting(existingIssue.issueId || existingIssue._id)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Support Existing Report</span>
          </button>

          <button
            onClick={onProceedAnyway}
            disabled={submitting}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <span>Submit As New Issue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Cancel and Return to Form
          </button>
        </div>
      </div>
    </div>
  );
}
