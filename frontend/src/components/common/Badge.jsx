import React from 'react';
import { getPriorityBadge, getStatusBadge } from '../../utils/formatters';

export const PriorityBadge = ({ level, size = 'sm' }) => {
  const { bg, dot, pulse } = getPriorityBadge(level);
  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${pulse ? 'animate-ping' : ''}`} />
      {level}
    </span>
  );
};

export const StatusBadge = ({ status, size = 'sm' }) => {
  const bg = getStatusBadge(status);
  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${bg} ${sizeClasses}`}
    >
      {status}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  return (
    <span className="inline-flex items-center text-xs px-2.5 py-0.5 font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
      {category}
    </span>
  );
};

