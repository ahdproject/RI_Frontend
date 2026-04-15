import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Menu, Bell, ChevronDown } from 'lucide-react'
import {
  toggleSidebar,
  selectUser,
  selectSidebarOpen,
} from '../../app/DashboardSlice'

// ─── Route → Page Title map ───────────────────────────────────

const PAGE_TITLES = {
  '/dashboard':                         'Dashboard',
  '/bills':                             'Bills',
  '/bills/new':                         'New Bill',
  '/attendance':                        'Attendance Register',
  '/attendance/summary':                'Attendance Summary',
  '/reports/sales':                     'Sales Report',
  '/reports/attendance':                'Attendance Report',
  '/reports/pnl':                       'Profit & Loss',
  '/reports/gst':                       'GST Reconciliation',
  '/admin/users':                       'User Management',
  '/admin/users/new':                   'Add User',
  '/admin/masters/products':            'Products',
  '/admin/masters/products/new':        'Add Product',
  '/admin/masters/clients':             'Clients',
  '/admin/masters/clients/new':         'Add Client',
  '/admin/masters/employees':           'Employees',
  '/admin/masters/employees/new':       'Add Employee',
  '/admin/masters/gst-slabs':           'GST Slabs',
  '/admin/masters/gst-slabs/new':       'Add GST Slab',
  '/admin/masters/charge-types':        'Charge Types',
  '/admin/masters/charge-types/new':    'Add Charge Type',
}

const getPageTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.includes('/edit'))    return 'Edit'
  if (pathname.includes('/preview')) return 'Bill Preview'
  if (pathname.includes('/bills/'))  return 'Bill Details'
  return 'Raut Industries'
}

// ─── Role badge style ─────────────────────────────────────────

const roleBadgeClass = (role) => {
  const map = {
    SuperAdmin: 'bg-purple-100/50 text-purple-700 border-purple-200',
    Admin:      'bg-blue-100/50   text-blue-700   border-blue-200',
    Manager:    'bg-amber-100/50  text-amber-700  border-amber-200',
  }
  return map[role] || 'bg-gray-100/50 text-gray-600 border-gray-200'
}

// ─── NavBar Component ─────────────────────────────────────────

export default function NavBar() {
  const dispatch    = useDispatch()
  const location    = useLocation()
  const user        = useSelector(selectUser)
  const sidebarOpen = useSelector(selectSidebarOpen)

  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="h-14 bg-white/80 backdrop-blur-sm border-b
                        border-gray-200 flex items-center justify-between
                        px-4 shrink-0 sticky top-0 z-10 shadow-sm">

      {/* Left — Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-gray-900">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right — User info */}
      <div className="flex items-center gap-3">

        {/* Notification bell (placeholder) */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     transition-colors relative"
        >
          <Bell size={16} />
        </button>

        {/* User pill */}
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">

            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-amber-100 border
                            border-amber-200 flex items-center
                            justify-center shrink-0">
              <span className="text-amber-700 font-bold text-xs">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>

            {/* Name + Role */}
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-900 leading-none">
                {user.name}
              </p>
              <span className={`inline-block mt-1 text-[10px] font-semibold
                               px-1.5 py-0.5 rounded border
                               ${roleBadgeClass(user.role)}`}>
                {user.role}
              </span>
            </div>

          </div>
        )}
      </div>
    </header>
  )
}