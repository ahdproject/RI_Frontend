import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight,
  ArrowLeft, Loader2, Download,
} from 'lucide-react'
import AttendanceRepo from '../../../../services/repository/Manager/AttendanceRepo'
import {
  LoadingState, ErrorState,
  EmptyState, Toast,
} from '../../Admin/Masters/_components/MasterPageWrapper'
import {
  formatCurrency, monthName, extractError,
} from '../../../../utils/helpers'

// ─── Constants ────────────────────────────────────────────────
const DEPARTMENTS = [
  '', 'Production', 'Processing', 'QC',
  'Stores', 'Admin', 'Accounts', 'Maintenance',
]

// ─── Stat badge helper ────────────────────────────────────────
const StatPill = ({ value, label, color }) => (
  <div className="text-center">
    <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
    <p className="text-[10px] text-gray-600 mt-1">{label}</p>
  </div>
)

// ─── Progress bar ─────────────────────────────────────────────
const ProgressBar = ({ pct, color = 'bg-emerald-500' }) => (
  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
    <div
      className={`h-full ${color} rounded-full transition-all duration-300`}
      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
    />
  </div>
)

// ─── Attendance percentage colour ─────────────────────────────
const pctColor = (pct) => {
  if (pct >= 80) return { text: 'text-emerald-400', bar: 'bg-emerald-500' }
  if (pct >= 60) return { text: 'text-amber-400',   bar: 'bg-amber-500'   }
  return          { text: 'text-red-400',            bar: 'bg-red-500'     }
}

// ─── AttendanceSummary ────────────────────────────────────────
export default function AttendanceSummary() {
  const navigate = useNavigate()
  const now      = new Date()

  const [month,      setMonth]      = useState(now.getMonth() + 1)
  const [year,       setYear]       = useState(now.getFullYear())
  const [department, setDepartment] = useState('')

  const [summary,  setSummary]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [toast,    setToast]    = useState({ type: '', message: '' })
  const [viewMode, setViewMode] = useState('cards') // cards | table

  // ── Load ─────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await AttendanceRepo.getSummary(month, year, department)
      setSummary(res.data || [])
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }, [month, year, department])

  useEffect(() => { load() }, [load])

  // ── Month navigation ──────────────────────────────────────
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  // ── Aggregates ────────────────────────────────────────────
  const totals = summary.reduce(
    (acc, emp) => ({
      payable:       acc.payable       + (emp.payable_salary    || 0),
      present:       acc.present       + (emp.present_count     || 0),
      absent:        acc.absent        + (emp.absent_count      || 0),
      half_day:      acc.half_day      + (emp.half_day_count    || 0),
      leave:         acc.leave         + (emp.leave_count       || 0),
      monthly_total: acc.monthly_total + (emp.monthly_salary    || 0),
    }),
    { payable: 0, present: 0, absent: 0,
      half_day: 0, leave: 0, monthly_total: 0 }
  )

  // ── Department groups ─────────────────────────────────────
  const byDept = summary.reduce((acc, emp) => {
    const d = emp.department || 'Other'
    if (!acc[d]) acc[d] = []
    acc[d].push(emp)
    return acc
  }, {})

  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/attendance')}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-gray-600 hover:text-gray-900 hover:bg-gray-100
                       transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Attendance Summary
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {monthName(month)} {year}
              {department ? ` · ${department}` : ' · All Departments'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Month navigator */}
          <div className="flex items-center gap-1 card px-3 py-2">
            <button
              onClick={prevMonth}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-900 w-28
                             text-center">
              {monthName(month)} {year}
            </span>
            <button
              onClick={nextMonth}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Department filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="select-field w-44 text-xs"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d || 'All Departments'}
              </option>
            ))}
          </select>

          {/* View mode */}
          {['cards', 'table'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border
                          capitalize transition-colors
                          ${viewMode === mode
                            ? 'bg-amber-500 text-gray-900 border-amber-500'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-500'
                          }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Totals bar */}
      {!loading && summary.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: 'Employees',
              value: summary.length,
              color: 'text-gray-900',
            },
            {
              label: 'Total Present',
              value: totals.present,
              color: 'text-emerald-400',
            },
            {
              label: 'Total Absent',
              value: totals.absent,
              color: 'text-red-400',
            },
            {
              label: 'Half Days',
              value: totals.half_day,
              color: 'text-amber-400',
            },
            {
              label: 'On Leave',
              value: totals.leave,
              color: 'text-blue-400',
            },
            {
              label: 'Total Payable',
              value: formatCurrency(totals.payable),
              color: 'text-amber-400 text-base',
            },
          ].map((s) => (
            <div key={s.label} className="card px-4 py-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading
        ? <LoadingState />
        : summary.length === 0
          ? <EmptyState message="No attendance data for this period" />
          : (
            <>
              {/* ── Card View ───────────────────────────────── */}
              {viewMode === 'cards' && (
                <div className="space-y-6">
                  {Object.entries(byDept).map(([dept, emps]) => (
                    <div key={dept}>
                      {/* Department header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="badge-info text-xs">{dept}</span>
                        <span className="text-xs text-gray-600">
                          {emps.length} employee{emps.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-amber-400 font-medium">
                          {formatCurrency(
                            emps.reduce((s, e) => s + (e.payable_salary || 0), 0)
                          )}
                        </span>
                      </div>

                      {/* Employee cards */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {emps.map((emp) => {
                          const pct = emp.total_marked_days > 0
                            ? Math.round(
                                ((emp.present_count + emp.half_day_count * 0.5)
                                  / emp.total_marked_days) * 100
                              )
                            : 0
                          const colors = pctColor(pct)

                          return (
                            <div
                              key={emp.employee_id}
                              className="card p-4 space-y-3"
                            >
                              {/* Name + attendance % */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-semibold
                                               text-gray-900 leading-tight">
                                    {emp.employee_name}
                                  </p>
                                  <p className="text-[11px] text-gray-600 mt-0.5">
                                    {emp.emp_code} · {emp.role}
                                  </p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5
                                                  rounded-full border
                                                  ${colors.text}
                                                  bg-current/10
                                                  border-current/20`}>
                                  {pct}%
                                </span>
                              </div>

                              {/* Progress bar */}
                              <ProgressBar pct={pct} color={colors.bar} />

                              {/* Stat pills */}
                              <div className="grid grid-cols-4 gap-1">
                                <StatPill
                                  value={emp.present_count}
                                  label="P"
                                  color="text-emerald-400"
                                />
                                <StatPill
                                  value={emp.absent_count}
                                  label="A"
                                  color="text-red-400"
                                />
                                <StatPill
                                  value={emp.half_day_count}
                                  label="H"
                                  color="text-amber-400"
                                />
                                <StatPill
                                  value={emp.leave_count}
                                  label="L"
                                  color="text-blue-400"
                                />
                              </div>

                              {/* Payroll */}
                              <div className="bg-gray-100/50 rounded-xl px-3
                                              py-2 space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    Monthly Salary
                                  </span>
                                  <span className="text-gray-600">
                                    {formatCurrency(emp.monthly_salary)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    Effective Days
                                  </span>
                                  <span className="text-gray-600">
                                    {emp.effective_days}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs
                                                border-t border-gray-200/50 pt-1.5">
                                  <span className="text-gray-600 font-medium">
                                    Payable
                                  </span>
                                  <span className="text-amber-400 font-bold">
                                    {formatCurrency(emp.payable_salary)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Table View ──────────────────────────────── */}
              {viewMode === 'table' && (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-100/40">
                          {[
                            'Code', 'Name', 'Dept',
                            'P', 'A', 'H', 'L',
                            'Eff. Days', 'Att. %',
                            'Salary', 'Payable',
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs
                                         text-gray-600 font-semibold
                                         uppercase tracking-wide whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {summary.map((emp) => {
                          const pct = emp.total_marked_days > 0
                            ? Math.round(
                                ((emp.present_count + emp.half_day_count * 0.5)
                                  / emp.total_marked_days) * 100
                              )
                            : 0
                          const colors = pctColor(pct)

                          return (
                            <tr key={emp.employee_id} className="table-row-hover">
                              <td className="px-4 py-2.5 font-mono text-xs
                                             text-gray-600">
                                {emp.emp_code}
                              </td>
                              <td className="px-4 py-2.5">
                                <p className="font-semibold text-gray-900">
                                  {emp.employee_name}
                                </p>
                                <p className="text-[10px] text-gray-600 mt-0.5">
                                  {emp.role}
                                </p>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="badge-info text-xs">
                                  {emp.department}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-emerald-400
                                             font-bold">
                                {emp.present_count}
                              </td>
                              <td className="px-4 py-2.5 text-red-400
                                             font-bold">
                                {emp.absent_count}
                              </td>
                              <td className="px-4 py-2.5 text-amber-400
                                             font-medium">
                                {emp.half_day_count}
                              </td>
                              <td className="px-4 py-2.5 text-blue-400
                                             font-medium">
                                {emp.leave_count}
                              </td>
                              <td className="px-4 py-2.5 text-gray-900">
                                {emp.effective_days}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-16">
                                    <ProgressBar
                                      pct={pct}
                                      color={colors.bar}
                                    />
                                  </div>
                                  <span className={`text-xs font-bold
                                                    ${colors.text}`}>
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-gray-600">
                                {formatCurrency(emp.monthly_salary)}
                              </td>
                              <td className="px-4 py-2.5 font-bold
                                             text-amber-400">
                                {formatCurrency(emp.payable_salary)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>

                      {/* Totals footer */}
                      <tfoot className="border-t-2 border-gray-200
                                        bg-gray-100/40">
                        <tr>
                          <td colSpan={3}
                            className="px-4 py-3 text-xs font-bold
                                       text-gray-900 uppercase tracking-wide">
                            Totals
                          </td>
                          <td className="px-4 py-3 text-emerald-400
                                         font-bold">
                            {totals.present}
                          </td>
                          <td className="px-4 py-3 text-red-400 font-bold">
                            {totals.absent}
                          </td>
                          <td className="px-4 py-3 text-amber-400
                                         font-medium">
                            {totals.half_day}
                          </td>
                          <td className="px-4 py-3 text-blue-400
                                         font-medium">
                            {totals.leave}
                          </td>
                          <td className="px-4 py-3 text-gray-900">—</td>
                          <td className="px-4 py-3">—</td>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            {formatCurrency(totals.monthly_total)}
                          </td>
                          <td className="px-4 py-3 font-bold text-amber-400
                                         text-base">
                            {formatCurrency(totals.payable)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )
      }
    </div>
  )
}