import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertCircle,
  FileCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const getActionIcon = (action) => {
  switch (action) {
    case 'REPORTED':
      return <Sparkles className="w-4 h-4 text-blue-400" />;
    case 'ASSIGNED':
      return <UserCheck className="w-4 h-4 text-cyan-400" />;
    case 'IN_PROGRESS':
    case 'ACCEPTED':
      return <Wrench className="w-4 h-4 text-amber-400" />;
    case 'RESOLVED':
      return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
    case 'CITIZEN_VERIFIED':
    case 'CLOSED':
      return <FileCheck className="w-4 h-4 text-emerald-400" />;
    case 'CITIZEN_REOPENED':
      return <RotateCcw className="w-4 h-4 text-rose-400" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

export default function IssueTimeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500">
        No lifecycle status updates recorded yet.
      </div>
    );
  }

  const API_HOST = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {updates.map((update, idx) => {
        const isLatest = idx === updates.length - 1;
        const evidenceUrl = update.evidence?.fileUrl
          ? update.evidence.fileUrl.startsWith('http')
            ? update.evidence.fileUrl
            : `${API_HOST}${update.evidence.fileUrl}`
          : null;

        return (
          <div key={update._id || idx} className="relative group">
            {/* Step Marker Dot */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center bg-slate-900 ${
                isLatest
                  ? 'border-blue-500 shadow-glow'
                  : 'border-slate-700'
              }`}
            >
              {getActionIcon(update.action)}
            </div>

            {/* Content Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 transition-colors hover:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs text-slate-200">
                  {update.action.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatDate(update.createdAt)}
                </span>
              </div>

              {update.comment && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {update.comment}
                </p>
              )}

              {/* Author pill */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>By: {update.updatedBy?.name || 'System'}</span>
                {update.newStatus && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                    Status: {update.newStatus}
                  </span>
                )}
              </div>

              {/* Optional embedded evidence photo thumbnail */}
              {evidenceUrl && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-1 font-medium">Work Evidence:</div>
                  <img
                    src={evidenceUrl}
                    alt="Resolution Evidence"
                    className="w-32 h-20 object-cover rounded-lg border border-slate-700"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
