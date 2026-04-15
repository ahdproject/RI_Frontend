// ─── Registry maps route paths to page metadata ───────────────
// Used for breadcrumbs, page titles, and sidebar highlights

const registry = {
  '/dashboard': {
    title:  'Dashboard',
    module: 'dashboard',
  },
  '/bills': {
    title:  'Bills',
    module: 'bills',
    description: 'Manage sales invoices',
  },
  '/bills/new': {
    title:  'New Bill',
    module: 'bills',
    parent: '/bills',
  },
  '/attendance': {
    title:  'Attendance Register',
    module: 'attendance',
    description: 'Monthly attendance grid',
  },
  '/attendance/summary': {
    title:  'Attendance Summary',
    module: 'attendance',
    description: 'Payroll & summary view',
    parent: '/attendance',
  },
  '/reports/sales': {
    title:  'Sales Report',
    module: 'reports',
  },
  '/reports/attendance': {
    title:  'Attendance Report',
    module: 'reports',
  },
  '/reports/pnl': {
    title:  'Profit & Loss',
    module: 'reports',
  },
  '/reports/gst': {
    title:  'GST Reconciliation',
    module: 'reports',
  },
  '/admin/users': {
    title:  'User Management',
    module: 'users',
  },
  '/admin/masters/products': {
    title:  'Products',
    module: 'masters',
  },
  '/admin/masters/clients': {
    title:  'Clients',
    module: 'masters',
  },
  '/admin/masters/employees': {
    title:  'Employees',
    module: 'masters',
  },
  '/admin/masters/gst-slabs': {
    title:  'GST Slabs',
    module: 'masters',
  },
  '/admin/masters/charge-types': {
    title:  'Charge Types',
    module: 'masters',
  },
}

export default registry