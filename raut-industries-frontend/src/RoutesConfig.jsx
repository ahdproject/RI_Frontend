import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUser } from './app/DashboardSlice'
import { ROLES } from './utils/helpers'

// ── Common
import Login      from './components/common/Login'
import HeroPage   from './components/common/HeroPage'
import NotFound   from './components/common/NotFound'

// ── Layout wrapper (Sidebar + NavBar)
import NavBar  from './components/layout/NavBar'
import Sidebar from './components/layout/Sidebar'

// ── Admin
import AdminDashboard  from './components/protected/Admin/Dashboard/AdminDashboard'
import UsersList       from './components/protected/Admin/Manage/Users/UsersList'
import UserForm        from './components/protected/Admin/Manage/Users/UserForm'
import GstSlabsList    from './components/protected/Admin/Masters/GstSlabs/GstSlabsList'
import GstSlabForm     from './components/protected/Admin/Masters/GstSlabs/GstSlabForm'
import ChargeTypesList from './components/protected/Admin/Masters/ChargeTypes/ChargeTypesList'
import ChargeTypeForm  from './components/protected/Admin/Masters/ChargeTypes/ChargeTypeForm'
import ClientsList     from './components/protected/Admin/Masters/Clients/ClientsList'
import ClientForm      from './components/protected/Admin/Masters/Clients/ClientForm'
import ProductsList    from './components/protected/Admin/Masters/Products/ProductsList'
import ProductForm     from './components/protected/Admin/Masters/Products/ProductForm'
import EmployeesList   from './components/protected/Admin/Masters/Employees/EmployeesList'
import EmployeeForm    from './components/protected/Admin/Masters/Employees/EmployeeForm'

// ── Manager
import BillsList          from './components/protected/Manager/Bills/BillsList'
import BillForm           from './components/protected/Manager/Bills/BillForm'
import BillPreview        from './components/protected/Manager/Bills/BillPreview'
import AttendanceGrid     from './components/protected/Manager/Attendance/AttendanceGrid'
import AttendanceSummary  from './components/protected/Manager/Attendance/AttendanceSummary'

// ── Shared Reports
import Dashboard        from './components/protected/Shared/Reports/Dashboard'
import PnlReport        from './components/protected/Shared/Reports/PnlReport'
import GstReport        from './components/protected/Shared/Reports/GstReport'
import SalesReport      from './components/protected/Shared/Reports/SalesReport'
import AttendanceReport from './components/protected/Shared/Reports/AttendanceReport'

// ─── Protected Route Wrapper ──────────────────────────────────

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user            = useSelector(selectUser)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// ─── App Shell (Sidebar + NavBar + Content) ───────────────────

const AppShell = ({ children }) => {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <NavBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Routes ───────────────────────────────────────────────────

export default function RoutesConfig() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ─────────────────────────────────────── */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <HeroPage />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />

        {/* ── Shared — All Authenticated Roles ───────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell><Dashboard /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/reports/sales" element={
          <ProtectedRoute>
            <AppShell><SalesReport /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/reports/attendance" element={
          <ProtectedRoute>
            <AppShell><AttendanceReport /></AppShell>
          </ProtectedRoute>
        } />

        {/* ── Admin + SuperAdmin only ─────────────────────── */}
        <Route path="/reports/pnl" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><PnlReport /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/reports/gst" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><GstReport /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><AdminDashboard /></AppShell>
          </ProtectedRoute>
        } />

        {/* Users */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><UsersList /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/users/new" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <AppShell><UserForm /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><UserForm /></AppShell>
          </ProtectedRoute>
        } />

        {/* GST Slabs */}
        <Route path="/admin/masters/gst-slabs" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><GstSlabsList /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/gst-slabs/new" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><GstSlabForm /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/gst-slabs/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><GstSlabForm /></AppShell>
          </ProtectedRoute>
        } />

        {/* Charge Types */}
        <Route path="/admin/masters/charge-types" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ChargeTypesList /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/charge-types/new" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ChargeTypeForm /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/charge-types/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ChargeTypeForm /></AppShell>
          </ProtectedRoute>
        } />

        {/* Clients */}
        <Route path="/admin/masters/clients" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ClientsList /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/clients/new" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ClientForm /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/clients/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ClientForm /></AppShell>
          </ProtectedRoute>
        } />

        {/* Products */}
        <Route path="/admin/masters/products" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ProductsList /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/products/new" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ProductForm /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/products/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><ProductForm /></AppShell>
          </ProtectedRoute>
        } />

        {/* Employees */}
        <Route path="/admin/masters/employees" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><EmployeesList /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/employees/new" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><EmployeeForm /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/masters/employees/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <AppShell><EmployeeForm /></AppShell>
          </ProtectedRoute>
        } />

        {/* ── Manager + Admin + SuperAdmin ────────────────── */}

        {/* Bills */}
        <Route path="/bills" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <AppShell><BillsList /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/bills/new" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <AppShell><BillForm /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/bills/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <AppShell><BillForm /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/bills/:id/preview" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <AppShell><BillPreview /></AppShell>
          </ProtectedRoute>
        } />

        {/* Attendance */}
        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <AppShell><AttendanceGrid /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/attendance/summary" element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
            <AppShell><AttendanceSummary /></AppShell>
          </ProtectedRoute>
        } />

        {/* ── 404 ─────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}