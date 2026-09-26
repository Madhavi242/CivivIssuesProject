import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  FileCheck,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const getActionIcon = (action) => {
  switch (action) {
    case 'REPORTED':
      return <FileText className="w-3.5 h-3.5 text-blue-700" />;
    case 'ASSIGNED':
      return <UserCheck className="w-3.5 h-3.5 text-sky-700" />;
    case 'IN_PROGRESS':
    case 'ACCEPTED':
      return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
    case 'RESOLVED':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    case 'CITIZEN_VERIFIED':
    case 'CLOSED':
      return <FileCheck className="w-3.5 h-3.5 text-slate-700" />;
    case 'CITIZEN_REOPENED':
      return <RotateCcw className="w-3.5 h-3.5 text-red-600" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-slate-500" />;
  }
};

export default function IssueTimeline({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
        No status updates recorded yet.
      </div>
    );
  }

  const API_HOST = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {updates.map((update, idx) => {
        const isLatest = idx === updates.length - 1;
        const evidenceUrl = update.evidence?.fileUrl
          ? update.evidence.fileUrl.startsWith('http')
            ? update.evidence.fileUrl
            : `${API_HOST}${update.evidence.fileUrl}`
          : null;

        return (
          <div key={update._id || idx} className="relative">
            {/* Step Marker Dot */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center bg-white ${
                isLatest
                  ? 'border-blue-600 shadow-xs'
                  : 'border-slate-300'
              }`}
            >
              {getActionIcon(update.action)}
            </div>

            {/* Content Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900">
                  {update.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-500">
                  {formatDate(update.createdAt)}
                </span>
              </div>

              {update.comment && (
                <p className="text-xs text-slate-700 leading-relaxed">
                  {update.comment}
                </p>
              )}

              {/* Author and Status pill */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Updated by: <strong className="text-slate-700 font-medium">{update.updatedBy?.name || 'System'}</strong></span>
                {update.newStatus && (
                  <span className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-medium border border-slate-200">
                    Status: {update.newStatus}
                  </span>
                )}
              </div>

              {/* Optional embedded evidence photo thumbnail */}
              {evidenceUrl && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="text-[11px] text-slate-600 mb-1 font-medium">Work Evidence Attached:</div>
                  <img
                    src={evidenceUrl}
                    alt="Resolution Evidence"
                    className="w-36 h-24 object-cover rounded-md border border-slate-200"
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
