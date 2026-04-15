import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  TrendingUp,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
  Loader2,
  AlertCircle,
  Receipt,
  ClipboardCheck,
} from 'lucide-react'
import { selectUser } from '../../../../app/DashboardSlice'
import ReportsRepo from '../../../../services/repository/Shared/ReportsRepo'
import {
  formatCurrency,
  formatNumber,
  monthName,
  hasRole,
  ROLES,
  extractError,
} from '../../../../utils/helpers'

// ─── KPI Card ─────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, color, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className={`card p-5 space-y-3
                ${onClick ? 'cursor-pointer hover:border-gray-600 transition-colors' : ''}`}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">
        {label}
      </p>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                       ${color.bg}`}>
        <Icon size={15} className={color.icon} />
      </div>
    </div>
    <p className={`text-2xl font-bold ${color.text}`}>
      {value}
    </p>
    {sub && (
      <p className="text-xs text-gray-600">{sub}</p>
    )}
  </div>
)

// ─── Section Header ───────────────────────────────────────────

const SectionHeader = ({ title, action, onAction }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-semibold text-gray-900 uppercase
                   tracking-wider">
      {title}
    </h2>
    {action && (
      <button
        onClick={onAction}
        className="text-xs text-amber-400 hover:text-amber-300
                   flex items-center gap-1 transition-colors"
      >
        {action} <ArrowRight size={12} />
      </button>
    )}
  </div>
)

// ─── AdminDashboard ───────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate()
  const user     = useSelector(selectUser)

  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const isAdminOrAbove = hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await ReportsRepo.getDashboard(month, year)
        setData(res.data)
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [month, year])

  // ── Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-amber-500" />
      </div>
    )
  }

  // ── Error state
  if (error) {
    return (
      <div className="flex items-start gap-3 bg-red-500/10 border
                      border-red-500/30 rounded-xl p-5 max-w-lg">
        <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-400">
            Failed to load dashboard
          </p>
          <p className="text-xs text-red-400/70 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  const sales     = data?.sales    || {}
  const profit    = data?.profit   || {}
  const products  = data?.top_products || []
  const clients   = data?.top_clients  || []

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17
              ? 'Afternoon' : 'Evening'}, <span className="text-amber-500">{user?.name?.split(' ')[0]}</span> 
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {monthName(month)} {year} · Raut Industries Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/bills/new')}
            className="btn-primary text-xs"
          >
            <FileText size={14} /> New Bill
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Sales"
          value={formatCurrency(sales.total_subtotal)}
          sub="excl. GST"
          icon={TrendingUp}
          color={{
            bg:   'bg-amber-500/10',
            icon: 'text-amber-400',
            text: 'text-amber-400',
          }}
          onClick={() => navigate('/reports/sales')}
        />
        <KpiCard
          label="Total with GST"
          value={formatCurrency(sales.total_with_gst)}
          sub={`${sales.confirmed_bills || 0} confirmed bills`}
          icon={Receipt}
          color={{
            bg:   'bg-emerald-500/10',
            icon: 'text-emerald-400',
            text: 'text-emerald-400',
          }}
          onClick={() => navigate('/bills')}
        />
        {isAdminOrAbove && (
          <KpiCard
            label="Net Profit"
            value={formatCurrency(profit.net_profit)}
            sub={`Labour: ${formatCurrency(profit.labour_cost)}`}
            icon={BarChart3}
            color={{
              bg:   'bg-blue-500/10',
              icon: 'text-blue-400',
              text: 'text-blue-400',
            }}
            onClick={() => navigate('/reports/pnl')}
          />
        )}
        <KpiCard
          label="Total Pieces"
          value={formatNumber(sales.total_pieces, 0)}
          sub={`${monthName(month)} ${year}`}
          icon={ClipboardCheck}
          color={{
            bg:   'bg-purple-500/10',
            icon: 'text-purple-400',
            text: 'text-purple-400',
          }}
        />
      </div>

      {/* Bill status row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Confirmed',
            value: sales.confirmed_bills || 0,
            cls:   'text-emerald-400',
            bg:    'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'Drafts',
            value: sales.draft_bills || 0,
            cls:   'text-amber-400',
            bg:    'bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'Cancelled',
            value: sales.cancelled_bills || 0,
            cls:   'text-red-400',
            bg:    'bg-red-500/10 border-red-500/20',
          },
        ].map((s) => (
          <div
            key={s.label}
            onClick={() => navigate('/bills')}
            className={`card border px-4 py-3 flex items-center
                        justify-between cursor-pointer hover:opacity-80
                        transition-opacity ${s.bg}`}
          >
            <p className="text-xs text-gray-600 font-medium">{s.label}</p>
            <p className={`text-xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tables row */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <SectionHeader
              title="Top Products"
              action="View Sales"
              onAction={() => navigate('/reports/sales')}
            />
          </div>
          <div className="divide-y divide-zinc-800/50">
            {products.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">
                No data for this month
              </p>
            ) : (
              products.map((p, i) => (
                <div
                  key={p.product_name}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-4">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {p.product_name}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatNumber(p.total_qty, 0)} units
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-amber-400">
                    {formatCurrency(p.total_amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <SectionHeader
              title="Top Clients"
              action="View Clients"
              onAction={() => navigate('/admin/masters/clients')}
            />
          </div>
          <div className="divide-y divide-zinc-800/50">
            {clients.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">
                No data for this month
              </p>
            ) : (
              clients.map((c, i) => (
                <div
                  key={c.client_name}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-4">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {c.client_name}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {c.bill_count} bill{c.bill_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(c.total_with_gst)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'New Bill',
            desc:  'Create invoice',
            path:  '/bills/new',
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            icon:  FileText,
          },
          {
            label: 'Attendance',
            desc:  'Mark today',
            path:  '/attendance',
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            icon:  ClipboardCheck,
          },
          {
            label: 'Sales Report',
            desc:  'This month',
            path:  '/reports/sales',
            color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            icon:  BarChart3,
          },
          ...(isAdminOrAbove ? [{
            label: 'P&L Report',
            desc:  'Profit & Loss',
            path:  '/reports/pnl',
            color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            icon:  TrendingUp,
          }] : []),
        ].map((q) => (
          <button
            key={q.label}
            onClick={() => navigate(q.path)}
            className={`card border p-4 text-left hover:opacity-80
                        transition-opacity ${q.color}`}
          >
            <q.icon size={20} className="mb-3" />
            <p className="text-sm font-semibold">{q.label}</p>
            <p className="text-xs opacity-60 mt-0.5">{q.desc}</p>
          </button>
        ))}
      </div>

    </div>
  )
}