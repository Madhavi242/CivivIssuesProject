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
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-500',
        pulse: true,
      };
    case 'High':
      return {
        bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        dot: 'bg-orange-500',
        pulse: false,
      };
    case 'Medium':
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
        pulse: false,
      };
    case 'Low':
    default:
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-500',
        pulse: false,
      };
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'Reported':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'Under Review':
    case 'Verified':
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    case 'Assigned':
    case 'Accepted':
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    case 'In Progress':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'Resolved':
    case 'Citizen Verification':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    case 'Closed':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'Reopened':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }
};
