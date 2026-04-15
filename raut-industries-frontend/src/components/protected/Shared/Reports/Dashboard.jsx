import { useEffect, useState } from 'react'
import { useNavigate as useNav } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowRight, TrendingUp, FileText, BarChart3, ClipboardCheck } from 'lucide-react'
import ReportsRepo from '../../../../services/repository/Shared/ReportsRepo'
import {
  ReportPage, MonthYearPicker,
  ReportKpi, ReportSection,
} from './_components/ReportWrapper'
import {
  formatCurrency, formatNumber,
  monthName, hasRole, ROLES, extractError,
} from '../../../../utils/helpers'
import { selectUser } from '../../../../app/DashboardSlice'

export default function Dashboard() {
  const navigate    = useNav()
  const user        = useSelector(selectUser)
  const isAdmin     = hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN)
  const now         = new Date()

  const [month,   setMonth]   = useState(now.getMonth() + 1)
  const [year,    setYear]    = useState(now.getFullYear())
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
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

  const sales   = data?.sales   || {}
  const profit  = data?.profit  || {}
  const products = data?.top_products || []
  const clients  = data?.top_clients  || []

  return (
    <ReportPage
      title={`Good ${now.getHours() < 12 ? 'Morning' : 'Afternoon'}, ${user?.name?.split(' ')[0]} `}
      subtitle={`${monthName(month)} ${year} · Raut Industries`}
      loading={loading}
      error={error}
      controls={
        <>
          <MonthYearPicker
            month={month}
            year={year}
            onChange={(m, y) => { setMonth(m); setYear(y) }}
          />
          <button
            onClick={() => navigate('/bills/new')}
            className="btn-primary text-xs"
          >
            <FileText size={14} /> New Bill
          </button>
        </>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpi
          label="Total Sales"
          value={formatCurrency(sales.total_subtotal)}
          sub="excl. GST"
          color="text-amber-400"
        />
        <ReportKpi
          label="Total with GST"
          value={formatCurrency(sales.total_with_gst)}
          sub={`${sales.confirmed_bills || 0} confirmed bills`}
          color="text-emerald-400"
        />
        {isAdmin && (
          <ReportKpi
            label="Net Profit"
            value={formatCurrency(profit.net_profit)}
            sub={`Labour: ${formatCurrency(profit.labour_cost)}`}
            color="text-blue-400"
          />
        )}
        <ReportKpi
          label="Total Pieces"
          value={formatNumber(sales.total_pieces, 0)}
          sub={`${monthName(month)} ${year}`}
          color="text-purple-400"
        />
      </div>

      {/* Status row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Confirmed', value: sales.confirmed_bills || 0,
            cls: 'text-emerald-400', bg: 'border-emerald-500/20' },
          { label: 'Drafts',    value: sales.draft_bills     || 0,
            cls: 'text-amber-400',   bg: 'border-amber-500/20'   },
          { label: 'Cancelled', value: sales.cancelled_bills || 0,
            cls: 'text-red-400',     bg: 'border-red-500/20'     },
        ].map((s) => (
          <div
            key={s.label}
            onClick={() => navigate('/bills')}
            className={`card border px-4 py-3 flex items-center
                        justify-between cursor-pointer
                        hover:opacity-80 transition-opacity ${s.bg}`}
          >
            <p className="text-xs text-gray-600">{s.label}</p>
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top tables */}
      <div className="grid lg:grid-cols-2 gap-5">
        <ReportSection title="Top Products">
          <div className="divide-y divide-zinc-800/50">
            {products.length === 0
              ? <p className="text-sm text-gray-600 text-center py-8">
                  No data for this month
                </p>
              : products.map((p, i) => (
                <div key={p.product_name}
                  className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-700 w-4">{i + 1}</span>
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
            }
          </div>
        </ReportSection>

        <ReportSection title="Top Clients">
          <div className="divide-y divide-zinc-800/50">
            {clients.length === 0
              ? <p className="text-sm text-gray-600 text-center py-8">
                  No data for this month
                </p>
              : clients.map((c, i) => (
                <div key={c.client_name}
                  className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-700 w-4">{i + 1}</span>
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
            }
          </div>
        </ReportSection>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'New Bill',     path: '/bills/new',          color: 'text-amber-400  bg-amber-500/10  border-amber-500/20',  icon: FileText       },
          { label: 'Attendance',   path: '/attendance',          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: ClipboardCheck },
          { label: 'Sales Report', path: '/reports/sales',       color: 'text-blue-400   bg-blue-500/10   border-blue-500/20',   icon: BarChart3      },
          ...(isAdmin ? [
            { label: 'P&L Report', path: '/reports/pnl',         color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: TrendingUp     },
          ] : []),
        ].map((q) => (
          <button
            key={q.label}
            onClick={() => navigate(q.path)}
            className={`card border p-4 text-left hover:opacity-80
                        transition-opacity ${q.color}`}
          >
            <q.icon size={20} className="mb-3" />
            <p className="text-sm font-semibold">{q.label}</p>
            <ArrowRight size={12} className="mt-2 opacity-50" />
          </button>
        ))}
      </div>
    </ReportPage>
  )
}