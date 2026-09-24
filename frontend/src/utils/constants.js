export const CATEGORIES = [
  'Road damage',
  'Garbage',
  'Water leakage',
  'Drain blockage',
  'Broken streetlight',
  'Damaged public infrastructure',
  'Traffic-related issue',
  'Other',
];

export const STATUSES = [
  'Reported',
  'Under Review',
  'Verified',
  'Assigned',
  'Accepted',
  'In Progress',
  'Resolved',
  'Citizen Verification',
  'Closed',
  'Reopened',
];

export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const ZONES = [
  'Zone 1 - North',
  'Zone 2 - East',
  'Zone 3 - Central',
  'Zone 4 - South',
];

export const DEMO_ACCOUNTS = [
  {
    role: 'citizen',
    label: 'Citizen (Priya)',
    email: 'citizen.priya@civicpulse.org',
    password: 'citizen123',
    badge: 'Citizen',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    role: 'field_worker',
    label: 'Field Worker (Rajesh)',
    email: 'worker.rajesh@civicpulse.org',
    password: 'worker123',
    badge: 'Field Tech',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  {
    role: 'department_admin',
    label: 'Dept Admin (Elena - Roads)',
    email: 'deptadmin.roads@civicpulse.org',
    password: 'admin123',
    badge: 'Dept Admin',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    role: 'system_admin',
    label: 'System Admin',
    email: 'admin@civicpulse.org',
    password: 'admin123',
    badge: 'Sys Admin',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
];
