import { useEffect, useState } from 'react'
import ReportsRepo from '../../../../services/repository/Shared/ReportsRepo'
import {
  ReportPage, MonthYearPicker,
  ReportKpi, ReportSection, PLRow,
} from './_components/ReportWrapper'
import { formatCurrency, monthName, extractError } from '../../../../utils/helpers'

export default function PnlReport() {
  const now = new Date()

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
        const res = await ReportsRepo.getPnl(month, year)
        setData(res.data)
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [month, year])

  const sales    = data?.sales    || {}
  const gst      = data?.gst      || {}
  const expenses = data?.expenses || {}
  const profit   = data?.profit   || {}

  return (
    <ReportPage
      title="Profit & Loss"
      subtitle={`${monthName(month)} ${year} · Raut Industries`}
      loading={loading}
      error={error}
      controls={
        <MonthYearPicker
          month={month}
          year={year}
          onChange={(m, y) => { setMonth(m); setYear(y) }}
        />
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportKpi
          label="Gross Profit"
          value={formatCurrency(profit.gross_profit)}
          sub="Sales excl. GST"
          color="text-emerald-400"
        />
        <ReportKpi
          label="Total Expenses"
          value={formatCurrency(expenses.total_expenses)}
          sub="Labour + other"
          color="text-red-400"
        />
        <ReportKpi
          label="Net Profit"
          value={formatCurrency(profit.net_profit)}
          sub="Gross − Expenses"
          color="text-amber-400"
        />
        <ReportKpi
          label="GST Payable"
          value={formatCurrency(gst.total_gst)}
          sub="Sales GST"
          color="text-blue-400"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">

        {/* Sales breakdown */}
        <ReportSection title="Sales Breakdown">
          <div className="px-5 py-4 space-y-0">
            <PLRow label="Total Bills"       value={sales.confirmed_bills || 0}         />
            <PLRow label="Subtotal (excl. GST)" value={formatCurrency(sales.total_subtotal)} />
            <PLRow label="CGST"              value={formatCurrency(gst.total_cgst)}      />
            <PLRow label="SGST"              value={formatCurrency(gst.total_sgst)}      />
            {parseFloat(gst.total_igst || 0) > 0 && (
              <PLRow label="IGST"            value={formatCurrency(gst.total_igst)}      />
            )}
            <PLRow label="Total GST"         value={formatCurrency(gst.total_gst)}       />
            <PLRow
              label="Total with GST"
              value={formatCurrency(sales.total_with_gst)}
              color="text-amber-400"
              border
            />
          </div>
        </ReportSection>

        {/* Expenses + Net Profit */}
        <ReportSection title="Expenses & Profit">
          <div className="px-5 py-4 space-y-0">
            <PLRow
              label="Gross Profit (Sales)"
              value={formatCurrency(profit.gross_profit)}
              color="text-emerald-400"
            />
            <PLRow label="Labour Cost"       value={formatCurrency(expenses.labour_cost)}     color="text-red-400" />
            <PLRow label="Other Expenses"    value={formatCurrency(expenses.other_expenses)}   color="text-red-400" />
            <PLRow
              label="Total Expenses"
              value={formatCurrency(expenses.total_expenses)}
              color="text-red-400"
              border
            />
            <PLRow
              label="NET PROFIT"
              value={formatCurrency(profit.net_profit)}
              color={parseFloat(profit.net_profit || 0) >= 0
                ? 'text-emerald-400 text-base'
                : 'text-red-400 text-base'
              }
              border
              highlight
            />
          </div>
        </ReportSection>
      </div>

      {/* Total pieces note */}
      <div className="card px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide">
            Total Weight Processed
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Number(sales.total_pieces || 0).toLocaleString('en-IN')} pcs
          </p>
        </div>
        <p className="text-xs text-gray-600">
          {monthName(month)} {year}
        </p>
      </div>
    </ReportPage>
  )
}