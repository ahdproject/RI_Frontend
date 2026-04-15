import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { monthName } from '../../../../../utils/helpers'

// ─── Month/Year picker used by all report pages ───────────────
export const MonthYearPicker = ({ month, year, onChange }) => {
  const prev = () => {
    if (month === 1) onChange(12, year - 1)
    else onChange(month - 1, year)
  }
  const next = () => {
    if (month === 12) onChange(1, year + 1)
    else onChange(month + 1, year)
  }

  return (
    <div className="flex items-center gap-1 card px-3 py-2">
      <button
        onClick={prev}
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-semibold text-gray-900 w-32 text-center">
        {monthName(month)} {year}
      </span>
      <button
        onClick={next}
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─── Standard report page wrapper ────────────────────────────
export const ReportPage = ({
  title, subtitle, controls, loading,
  error, children,
}) => (
  <div className="space-y-5">
    <div className="page-header">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {controls && (
        <div className="flex items-center gap-2 flex-wrap">
          {controls}
        </div>
      )}
    </div>

    {loading
      ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-amber-500" />
        </div>
      )
      : error
        ? (
          <div className="bg-red-500/10 border border-red-500/30
                          rounded-xl px-5 py-4">
            <p className="text-sm text-red-400 font-semibold">
              Failed to load report
            </p>
            <p className="text-xs text-red-400/70 mt-1">{error}</p>
          </div>
        )
        : children
    }
  </div>
)

// ─── KPI card used inside reports ────────────────────────────
export const ReportKpi = ({ label, value, sub, color = 'text-gray-900' }) => (
  <div className="card px-5 py-4 space-y-1">
    <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
      {label}
    </p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-600">{sub}</p>}
  </div>
)

// ─── Section card ─────────────────────────────────────────────
export const ReportSection = ({ title, children }) => (
  <div className="card overflow-hidden">
    <div className="px-5 py-3 border-b border-gray-200">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {title}
      </p>
    </div>
    {children}
  </div>
)

// ─── P&L row ──────────────────────────────────────────────────
export const PLRow = ({
  label, value, color = 'text-gray-900',
  border = false, highlight = false,
}) => (
  <div className={`flex justify-between items-center py-2.5
                   ${border
                     ? 'border-t border-gray-200 mt-1 pt-3'
                     : 'border-b border-gray-200/40'
                   }
                   ${highlight ? 'bg-gray-100/30 px-4 -mx-4 rounded-lg' : ''}`}>
    <span className={`text-sm ${highlight ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
      {label}
    </span>
    <span className={`text-sm font-semibold ${color}`}>{value}</span>
  </div>
)