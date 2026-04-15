import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  TrendingUp,
  Receipt,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Building2,
  Percent,
  Package,
  UserSquare2,
  Landmark,
} from 'lucide-react'
import {
  clearUser,
  selectUser,
  selectSidebarOpen,
  setSidebarOpen,
} from '../../app/DashboardSlice'
import { clearSession, hasRole, ROLES } from '../../utils/helpers'

// ─── Nav config ───────────────────────────────────────────────

const getNavItems = (user) => {
  const isAdminOrAbove = hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN)
  const isSuperAdmin   = hasRole(user, ROLES.SUPER_ADMIN)

  const items = []

  // Dashboard — all roles
  items.push({
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    exact: true,
  })

  // Bills — Manager and above
  items.push({
    label: 'Bills',
    icon: FileText,
    path: '/bills',
  })

  // Attendance — Manager and above
  items.push({
    label: 'Attendance',
    icon: ClipboardList,
    children: [
      { label: 'Monthly Register', path: '/attendance', exact: true },
      { label: 'Summary & Payroll', path: '/attendance/summary' },
    ],
  })

  // Reports — all roles (some sub-items gated)
  const reportChildren = [
    { label: 'Sales Summary',     path: '/reports/sales'      },
    { label: 'Attendance Report', path: '/reports/attendance' },
  ]
  if (isAdminOrAbove) {
    reportChildren.push(
      { label: 'Profit & Loss',       path: '/reports/pnl' },
      { label: 'GST Reconciliation',  path: '/reports/gst' }
    )
  }
  items.push({
    label: 'Reports',
    icon: BarChart3,
    children: reportChildren,
  })

  // Masters & Admin — Admin and above
  if (isAdminOrAbove) {
    items.push({
      label: 'Masters',
      icon: Settings,
      children: [
        { label: 'Products',     path: '/admin/masters/products',     icon: Package     },
        { label: 'Clients',      path: '/admin/masters/clients',      icon: Building2   },
        { label: 'Employees',    path: '/admin/masters/employees',    icon: UserSquare2 },
        { label: 'GST Slabs',    path: '/admin/masters/gst-slabs',    icon: Percent     },
        { label: 'Charge Types', path: '/admin/masters/charge-types', icon: Landmark    },
      ],
    })
  }

  // User Management — SuperAdmin only
  if (isSuperAdmin) {
    items.push({
      label: 'Manage Users',
      icon: Users,
      path: '/admin/users',
    })
  }

  return items
}

// ─── Single Nav Item ──────────────────────────────────────────

const NavItem = ({ item, depth = 0, onNavigate, sidebarOpen }) => {
  const hasChildren = item.children && item.children.length > 0
  const [open, setOpen] = useState(false)

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => {
            if (!sidebarOpen) {
               onNavigate?.();
            }
            setOpen((p) => !p);
          }}
          className={`w-full flex items-center justify-between gap-3
                      px-3 py-2.5 rounded-lg text-sm transition-colors
                      ${depth === 0
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/40'
                      }`}
          title={!sidebarOpen ? item.label : ''}
        >
          <span className="flex items-center gap-3">
            {item.icon && (
              <item.icon
                size={16}
                className={`shrink-0 ${open ? 'text-amber-500' : 'text-gray-500'}`}
              />
            )}
            <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${!sidebarOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'} ${open ? 'text-gray-900' : ''}`}>
              {item.label}
            </span>
          </span>
          {sidebarOpen && (
            open
              ? <ChevronDown size={14} className="text-gray-500 shrink-0" />
              : <ChevronRight size={14} className="text-gray-500 shrink-0" />
          )}
        </button>

        {open && sidebarOpen && (
          <div className="mt-0.5 ml-4 pl-3 border-l border-gray-200 space-y-0.5">
            {item.children.map((child) => (
              <NavItem
                key={child.path}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate}
                sidebarOpen={sidebarOpen}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      end={item.exact}
      onClick={onNavigate}
      title={!sidebarOpen ? item.label : ''}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
         transition-colors font-medium
         ${isActive
           ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm'
           : depth === 0
             ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
             : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/40'
         }`
      }
    >
      {item.icon && (
        <item.icon size={16} className="shrink-0" />
      )}
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${!sidebarOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        {item.label}
      </span>
    </NavLink>
  )
}

// ─── Sidebar Component ────────────────────────────────────────

export default function Sidebar() {
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const user        = useSelector(selectUser)
  const sidebarOpen = useSelector(selectSidebarOpen)

  const navItems = getNavItems(user)

  const handleLogout = () => {
    clearSession()
    dispatch(clearUser())
    navigate('/login', { replace: true })
  }

  // On mobile — close sidebar after nav
  const handleNavigate = () => {
    if (window.innerWidth < 768) {
      dispatch(setSidebarOpen(false))
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-white/60 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed md:relative z-30 h-full
          flex flex-col
          bg-white border-r border-gray-200 shadow-sm
          transition-all duration-200 ease-in-out
          ${sidebarOpen ? 'w-60' : 'w-0 md:w-16 overflow-hidden'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b
                        border-gray-200 shrink-0 bg-white">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center
                          justify-center shrink-0 shadow-sm">
            <span className="text-white font-black text-xs">RI</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-gray-900 leading-none
                            whitespace-nowrap tracking-wide">
                RAUT INDUSTRIES
              </p>
              <p className="text-[9px] text-gray-500 tracking-widest
                            uppercase mt-0.5">
                ERP System
              </p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5 bg-white">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              onNavigate={handleNavigate}
              sidebarOpen={sidebarOpen}
            />
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-200 p-3 shrink-0 bg-white">
          {sidebarOpen && user && (
            <div className="px-2 py-2 mb-2 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wider">
                {user.role}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                       text-sm text-gray-600 hover:text-red-600
                       hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && (
              <span className="font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}