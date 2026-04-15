import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight,
  Save, Loader2, Users,
  BarChart3, RefreshCw,
} from 'lucide-react'
import AttendanceRepo from '../../../../services/repository/Manager/AttendanceRepo'
import MastersRepo    from '../../../../services/repository/Admin/MastersRepo'
import {
  LoadingState, ErrorState, Toast,
} from '../../Admin/Masters/_components/MasterPageWrapper'
import {
  extractError, attendanceShort, monthName,
} from '../../../../utils/helpers'

// ─── Status cycle order ───────────────────────────────────────
const STATUS_CYCLE  = ['present', 'absent', 'half_day', 'leave']
const STATUS_STYLES = {
  present:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30',
  absent:   'bg-red-500/20     text-red-400     border-red-500/30     hover:bg-red-500/30',
  half_day: 'bg-amber-500/20   text-amber-400   border-amber-500/30   hover:bg-amber-500/30',
  leave:    'bg-blue-500/20    text-blue-400    border-blue-500/30    hover:bg-blue-500/30',
  unmarked: 'bg-gray-100/60   text-gray-600    border-gray-200/30    hover:bg-gray-700/40',
}

// ─── Days in a month ──────────────────────────────────────────
const getDaysInMonth = (month, year) =>
  new Date(year, month, 0).getDate()

// ─── Day of week (0=Sun) ──────────────────────────────────────
const getDow = (day, month, year) =>
  new Date(year, month - 1, day).getDay()

// ─── Status Cell ──────────────────────────────────────────────
const StatusCell = ({ status, onClick, disabled }) => {
  const s    = status || 'unmarked'
  const cls  = STATUS_STYLES[s]
  const text = status ? attendanceShort(status) : '—'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={s}
      className={`w-8 h-8 rounded-lg text-xs font-bold border
                  transition-colors select-none
                  ${cls}
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {text}
    </button>
  )
}

// ─── Legend ───────────────────────────────────────────────────
const Legend = () => (
  <div className="flex items-center gap-3 flex-wrap">
    <span className="text-xs text-gray-600 font-medium">Legend:</span>
    {[
      { status: 'present',  label: 'Present'  },
      { status: 'absent',   label: 'Absent'   },
      { status: 'half_day', label: 'Half Day' },
      { status: 'leave',    label: 'Leave'    },
    ].map(({ status, label }) => (
      <div key={status} className="flex items-center gap-1.5">
        <div className={`w-5 h-5 rounded text-[10px] font-bold border
                         flex items-center justify-center
                         ${STATUS_STYLES[status]}`}>
          {attendanceShort(status)}
        </div>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
    ))}
    <span className="text-xs text-gray-600 ml-1">
      · Click cell to cycle status
    </span>
  </div>
)

// ─── AttendanceGrid ───────────────────────────────────────────
export default function AttendanceGrid() {
  const navigate = useNavigate()

  const now = new Date()

  const [month,     setMonth]     = useState(now.getMonth() + 1)
  const [year,      setYear]      = useState(now.getFullYear())

  // employees list
  const [employees, setEmployees] = useState([])

  // attendance map: { empId: { 'YYYY-MM-DD': status } }
  const [attMap,    setAttMap]    = useState({})

  // pending local changes: { empId: { 'YYYY-MM-DD': status } }
  const [pending,   setPending]   = useState({})

  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [toast,     setToast]     = useState({ type: '', message: '' })

  const daysCount = getDaysInMonth(month, year)
  const days      = Array.from({ length: daysCount }, (_, i) => i + 1)

  // ── Helpers ─────────────────────────────────────────────────
  const dateKey = (day) => {
    const mm = String(month).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  const getStatus = (empId, day) => {
    const key = dateKey(day)
    // pending overrides saved
    return pending[empId]?.[key] ?? attMap[empId]?.[key] ?? null
  }

  const isPendingChange = (empId, day) => {
    const key = dateKey(day)
    return pending[empId]?.[key] !== undefined
  }

  // ── Load employees + attendance ──────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setPending({})

      const [empRes, attRes] = await Promise.all([
        MastersRepo.getAllEmployees({ activeOnly: true }),
        AttendanceRepo.getMonthly(month, year),
      ])

      const emps = empRes.data || []
      setEmployees(emps)

      // Build attendance map from flat array
      const map = {}
      emps.forEach((e) => { map[e.id] = {} })
      ;(attRes.data || []).forEach((rec) => {
        // Fix timezone issue when splitting ISO string. 
        // We create a local date from the UTC string.
        if (rec.date && map[rec.employee_id]) {
          const d = new Date(rec.date);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;
          
          map[rec.employee_id][dateStr] = rec.status
        }
      })
      setAttMap(map)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  // ── Cycle status on click ───────────────────────────────
  const handleCellClick = (empId, day) => {
    const key     = dateKey(day)
    const current = getStatus(empId, day)
    const idx     = STATUS_CYCLE.indexOf(current)
    const next    = idx === -1
      ? STATUS_CYCLE[0]
      : STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]

    setPending((prev) => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [key]: next,
      },
    }))
  }

  // ── Mark all employees for a day ─────────────────────────
  const markAllDay = (day, status) => {
    const key = dateKey(day)
    const updates = {}
    employees.forEach((e) => {
      updates[e.id] = {
        ...(pending[e.id] || {}),
        [key]: status,
      }
    })
    setPending((prev) => {
      const next = { ...prev }
      employees.forEach((e) => {
        next[e.id] = { ...(next[e.id] || {}), [key]: status }
      })
      return next
    })
  }

  // ── Save all pending changes ──────────────────────────────
  const handleSave = async () => {
    const hasPending = Object.values(pending).some(
      (days) => Object.keys(days).length > 0
    )
    if (!hasPending) {
      setToast({ type: 'success', message: 'No changes to save' })
      return
    }

    setSaving(true)
    try {
      // Group by date for bulk API calls
      const byDate = {}
      Object.entries(pending).forEach(([empId, dates]) => {
        Object.entries(dates).forEach(([date, status]) => {
          if (!byDate[date]) byDate[date] = []
          byDate[date].push({ employee_id: empId, status })
        })
      })

      // Fire one bulk call per date
      for (const [date, records] of Object.entries(byDate)) {
        await AttendanceRepo.bulkMark({ date, records })
      }

      setToast({
        type: 'success',
        message: `Saved ${Object.values(pending).reduce(
          (s, d) => s + Object.keys(d).length, 0
        )} attendance records`,
      })
      setPending({})
      load()
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) })
    } finally {
      setSaving(false)
    }
  }

  // ── Month navigation ──────────────────────────────────────
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  // ── Pending count ─────────────────────────────────────────
  const pendingCount = Object.values(pending).reduce(
    (s, d) => s + Object.keys(d).length, 0
  )

  // ── Employee row summary ──────────────────────────────────
  const rowSummary = (empId) => {
    let P = 0, A = 0, H = 0, L = 0
    days.forEach((d) => {
      const s = getStatus(empId, d)
      if (s === 'present')  P++
      else if (s === 'absent')   A++
      else if (s === 'half_day') H++
      else if (s === 'leave')    L++
    })
    return { P, A, H, L }
  }

  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Attendance Register
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {monthName(month)} {year} · {employees.length} employees
          </p>
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

          {/* Reload */}
          <button
            onClick={load}
            className="btn-secondary text-xs"
          >
            <RefreshCw size={13} /> Reload
          </button>

          {/* Summary page link */}
          <button
            onClick={() => navigate('/attendance/summary')}
            className="btn-secondary text-xs"
          >
            <BarChart3 size={13} /> Summary
          </button>

          {/* Save pending */}
          <button
            onClick={handleSave}
            disabled={saving || pendingCount === 0}
            className="btn-primary text-xs disabled:opacity-50"
          >
            {saving
              ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
              : <>
                  <Save size={13} />
                  Save{pendingCount > 0 ? ` (${pendingCount})` : ''}
                </>
            }
          </button>
        </div>
      </div>

      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Pending changes banner */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between
                        bg-amber-500/10 border border-amber-500/30
                        rounded-xl px-4 py-3">
          <p className="text-sm text-amber-400 font-medium">
            {pendingCount} unsaved change{pendingCount !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPending({})}
              className="text-xs text-gray-600 hover:text-gray-900
                         transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-xs py-1.5"
            >
              {saving
                ? <><Loader2 size={12} className="animate-spin" /> Saving...</>
                : <><Save size={12} /> Save All</>
              }
            </button>
          </div>
        </div>
      )}

      <Legend />

      {/* Grid */}
      {loading
        ? <LoadingState />
        : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100/60 border-b border-gray-200">

                    {/* Employee column header */}
                    <th className="sticky left-0 z-20 bg-gray-100
                                   px-4 py-3 text-left text-gray-600
                                   font-semibold uppercase tracking-wide
                                   min-w-[180px] border-r border-gray-200
                                   whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users size={13} />
                        Employee
                      </div>
                    </th>

                    {/* Day headers */}
                    {days.map((d) => {
                      const dow       = getDow(d, month, year)
                      const isWeekend = dow === 0 || dow === 6
                      const isToday   =
                        d         === now.getDate()   &&
                        month     === now.getMonth() + 1 &&
                        year      === now.getFullYear()
                      return (
                        <th
                          key={d}
                          className={`px-1 py-2 text-center min-w-[36px]
                                      whitespace-nowrap
                                      ${isWeekend ? 'bg-gray-100/80' : ''}
                                      ${isToday
                                        ? 'text-amber-400'
                                        : isWeekend
                                          ? 'text-gray-600'
                                          : 'text-gray-600'
                                      }`}
                        >
                          <div className="font-bold">{d}</div>
                          <div className="text-[9px] text-gray-600 mt-0.5">
                            {'SMTWTFS'[dow]}
                          </div>
                          {/* Quick mark all present for this day */}
                          <button
                            type="button"
                            onClick={() => markAllDay(d, 'present')}
                            title={`Mark all present on ${d}`}
                            className="mt-1 text-[9px] text-gray-700
                                       hover:text-emerald-400 transition-colors
                                       block w-full text-center"
                          >
                            ✓
                          </button>
                        </th>
                      )
                    })}

                    {/* Summary header */}
                    <th className="sticky right-0 z-20 bg-gray-100
                                   px-3 py-3 text-center text-gray-600
                                   font-semibold uppercase tracking-wide
                                   border-l border-gray-200 min-w-[90px]">
                      Summary
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((emp) => {
                    const { P, A, H, L } = rowSummary(emp.id)
                    const hasPending = Object.keys(
                      pending[emp.id] || {}
                    ).length > 0

                    return (
                      <tr
                        key={emp.id}
                        className={`border-b border-gray-200/40
                                    transition-colors
                                    ${hasPending
                                      ? 'bg-amber-500/5'
                                      : 'hover:bg-gray-100/20'
                                    }`}
                      >
                        {/* Employee name */}
                        <td className="sticky left-0 z-10 bg-gray-100
                                       border-r border-gray-200 px-4 py-2.5">
                          <p className="font-semibold text-gray-900 whitespace-nowrap">
                            {emp.name}
                            {hasPending && (
                              <span className="ml-2 text-[9px] text-amber-400
                                               font-bold">
                                UNSAVED
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-600 mt-0.5">
                            {emp.department}
                          </p>
                        </td>

                        {/* Day cells */}
                        {days.map((d) => {
                          const dow       = getDow(d, month, year)
                          const isWeekend = dow === 0 || dow === 6
                          const isFuture  =
                            new Date(year, month - 1, d) > new Date()
                          const status    = getStatus(emp.id, d)
                          const changed   = isPendingChange(emp.id, d)

                          return (
                            <td
                              key={d}
                              className={`px-0.5 py-1.5 text-center
                                          ${isWeekend ? 'bg-gray-100/20' : ''}
                                          ${changed ? 'bg-amber-500/5' : ''}`}
                            >
                              <div className="relative inline-block">
                                <StatusCell
                                  status={status}
                                  onClick={() =>
                                    !isFuture && handleCellClick(emp.id, d)
                                  }
                                  disabled={isFuture}
                                />
                                {/* Dot indicator for pending changes */}
                                {changed && (
                                  <span className="absolute -top-0.5 -right-0.5
                                                   w-1.5 h-1.5 rounded-full
                                                   bg-amber-400" />
                                )}
                              </div>
                            </td>
                          )
                        })}

                        {/* Row summary */}
                        <td className="sticky right-0 z-10 bg-gray-100
                                       border-l border-gray-200 px-3 py-2.5
                                       text-center">
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-center
                                            gap-2">
                              <span className="text-emerald-400 font-bold">
                                {P}P
                              </span>
                              <span className="text-red-400 font-bold">
                                {A}A
                              </span>
                            </div>
                            <div className="flex items-center justify-center
                                            gap-2">
                              {H > 0 && (
                                <span className="text-amber-400 font-medium">
                                  {H}H
                                </span>
                              )}
                              {L > 0 && (
                                <span className="text-blue-400 font-medium">
                                  {L}L
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {/* Department quick-mark section */}
      {!loading && employees.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase
                        tracking-wide mb-3">
            Quick Mark — Today ({now.getDate()} {monthName(month)})
          </p>
          <div className="flex flex-wrap gap-2">
            {['present', 'absent', 'half_day', 'leave'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  // Only mark today if we're in current month
                  if (
                    month === now.getMonth() + 1 &&
                    year  === now.getFullYear()
                  ) {
                    markAllDay(now.getDate(), s)
                  }
                }}
                disabled={
                  month !== now.getMonth() + 1 ||
                  year  !== now.getFullYear()
                }
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg
                            border capitalize transition-colors
                            disabled:opacity-30 disabled:cursor-not-allowed
                            ${STATUS_STYLES[s]}`}
              >
                Mark all {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          {(month !== now.getMonth() + 1 || year !== now.getFullYear()) && (
            <p className="text-xs text-gray-600 mt-2">
              Quick mark is only available for the current month
            </p>
          )}
        </div>
      )}

    </div>
  )
}