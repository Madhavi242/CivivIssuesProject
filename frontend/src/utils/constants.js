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
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  },
  {
    role: 'field_worker',
    label: 'Field Tech (Rajesh)',
    email: 'worker.rajesh@civicpulse.org',
    password: 'worker123',
    badge: 'Field Tech',
    color: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100',
  },
  {
    role: 'department_admin',
    label: 'Dept Admin (Elena)',
    email: 'deptadmin.roads@civicpulse.org',
    password: 'admin123',
    badge: 'Dept Admin',
    color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  },
  {
    role: 'system_admin',
    label: 'System Admin',
    email: 'admin@civicpulse.org',
    password: 'admin123',
    badge: 'Admin',
    color: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
  },
];

