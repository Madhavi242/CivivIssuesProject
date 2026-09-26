export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return 'just now';
};

export const getPriorityBadge = (level) => {
  switch (level) {
    case 'Critical':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200 font-semibold',
        dot: 'bg-red-600',
        pulse: false,
      };
    case 'High':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200 font-medium',
        dot: 'bg-orange-500',
        pulse: false,
      };
    case 'Medium':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
        dot: 'bg-amber-500',
        pulse: false,
      };
    case 'Low':
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
        dot: 'bg-slate-400',
        pulse: false,
      };
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'Reported':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Under Review':
    case 'Verified':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Assigned':
    case 'Accepted':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'In Progress':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Resolved':
    case 'Citizen Verification':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Closed':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Reopened':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

