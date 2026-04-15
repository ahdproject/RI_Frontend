import { useEffect, useState } from 'react'
import ReportsRepo from '../../../../services/repository/Shared/ReportsRepo'
import {
  ReportPage, MonthYearPicker,
  ReportKpi, ReportSection,
} from './_components/ReportWrapper'
import {
  formatCurrency, formatNumber,
  formatDate, monthName,
  billStatusBadge, extractError,
} from '../../../../utils/helpers'

export default function SalesReport() {
  const now = new Date()

  const [month,   setMonth]   = useState(now.getMonth() + 1)
  const [year,    setYear]    = useState(now.getFullYear())
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState('overview') // overview | products | clients | bills

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await ReportsRepo.getSales(month, year)
        setData(res.data)
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [month, year])

  const overview  = data?.overview   || {}
  const products  = data?.by_product || []
  const clients   = data?.by_client  || []
  const topBills  = data?.top_bills  || []
  const billList  = data?.bill_list  || []

  const TABS = [
    { key: 'overview',  label: 'Overview'  },
    { key: 'products',  label: 'By Product' },
    { key: 'clients',   label: 'By Client'  },
    { key: 'bills',     label: 'All Bills'  },
  ]

  return (
    <ReportPage
      title="Sales Report"
      subtitle={`${monthName(month)} ${year} · ${overview.confirmed_bills || 0} confirmed bills`}
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
          label="Subtotal"
          value={formatCurrency(overview.total_subtotal)}
          sub="excl. GST"
          color="text-gray-900"
        />
        <ReportKpi
          label="GST"
          value={formatCurrency(overview.total_gst)}
          color="text-blue-400"
        />
        <ReportKpi
          label="Total with GST"
          value={formatCurrency(overview.total_with_gst)}
          sub={`${overview.confirmed_bills || 0} bills`}
          color="text-amber-400"
        />
        <ReportKpi
          label="Total Pieces"
          value={formatNumber(overview.total_pieces, 0)}
          color="text-purple-400"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 card p-1 w-fit overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-xs font-semibold px-4 py-2 rounded-lg
                        transition-colors whitespace-nowrap
                        ${tab === key
                          ? 'bg-amber-500 text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <ReportSection title="Bill Status">
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Confirmed Bills', value: overview.confirmed_bills || 0, color: 'text-emerald-400' },
                { label: 'Draft Bills',     value: overview.draft_bills     || 0, color: 'text-amber-400'   },
                { label: 'Cancelled Bills', value: overview.cancelled_bills || 0, color: 'text-red-400'     },
                { label: 'Total Bills',     value: overview.total_bills     || 0, color: 'text-gray-900'    },
              ].map((r) => (
                <div key={r.label}
                  className="flex justify-between items-center
                             border-b border-gray-200/40 pb-3">
                  <span className="text-sm text-gray-600">{r.label}</span>
                  <span className={`text-sm font-bold ${r.color}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="Top 10 Bills by Value">
            <div className="divide-y divide-zinc-800/50">
              {topBills.slice(0, 10).map((b, i) => (
                <div key={b.bill_no}
                  className="px-5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-700 w-4">{i + 1}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        #{b.bill_no} — {b.client_name}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        {formatDate(b.bill_date)} ·{' '}
                        {formatNumber(b.total_pieces, 0)} pcs
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-amber-400">
                    {formatCurrency(b.total_with_gst)}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>
        </div>
      )}

      {/* Products tab */}
      {tab === 'products' && (
        <ReportSection title="Sales by Product">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/30">
                  {['#', 'Product', 'HSN', 'Bills', 'Qty',
                    'Amount', 'GST', 'Total'].map((h) => (
                    <th key={h}
                      className="px-4 py-2.5 text-left text-xs text-gray-600
                                 font-semibold uppercase tracking-wide
                                 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {products.map((p, i) => (
                  <tr key={p.product_id} className="table-row-hover">
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">
                      {p.product_name}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">
                      {p.hsn_code}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {p.bill_count}
                    </td>
                    <td className="px-4 py-2.5 text-gray-900">
                      {formatNumber(p.total_qty, 0)} {p.unit}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {formatCurrency(p.total_amount)}
                    </td>
                    <td className="px-4 py-2.5 text-blue-400 text-xs">
                      {formatCurrency(
                        parseFloat(p.total_cgst || 0) +
                        parseFloat(p.total_sgst || 0) +
                        parseFloat(p.total_igst || 0)
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-amber-400">
                      {formatCurrency(p.total_line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      )}

      {/* Clients tab */}
      {tab === 'clients' && (
        <ReportSection title="Sales by Client">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/30">
                  {['#', 'Client', 'GSTIN', 'Bills',
                    'Subtotal', 'GST', 'Total', 'Pieces'].map((h) => (
                    <th key={h}
                      className="px-4 py-2.5 text-left text-xs text-gray-600
                                 font-semibold uppercase tracking-wide
                                 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {clients.map((c, i) => (
                  <tr key={c.client_id} className="table-row-hover">
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">
                      {c.client_name}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">
                      {c.gstin || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {c.bill_count}
                    </td>
                    <td className="px-4 py-2.5 text-gray-900">
                      {formatCurrency(c.total_subtotal)}
                    </td>
                    <td className="px-4 py-2.5 text-blue-400 text-xs">
                      {formatCurrency(c.total_gst)}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-amber-400">
                      {formatCurrency(c.total_with_gst)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {formatNumber(c.total_pieces, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      )}

      {/* All Bills tab */}
      {tab === 'bills' && (
        <ReportSection
          title={`All Bills — ${monthName(month)} ${year}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/30">
                  {['Bill No', 'Date', 'Client', 'Pieces',
                    'Subtotal', 'GST', 'Total', 'Status'].map((h) => (
                    <th key={h}
                      className="px-4 py-2.5 text-left text-xs text-gray-600
                                 font-semibold uppercase tracking-wide
                                 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {billList.map((b) => (
                  <tr key={b.bill_no} className="table-row-hover">
                    <td className="px-4 py-2.5 font-mono text-xs
                                   text-gray-900 font-semibold">
                      #{b.bill_no}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {formatDate(b.bill_date)}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900 text-xs">
                        {b.client_name}
                      </p>
                      {b.client_gstin && (
                        <p className="text-[10px] text-gray-600 font-mono">
                          {b.client_gstin}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {formatNumber(b.total_pieces, 0)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-900 text-xs">
                      {formatCurrency(b.subtotal)}
                    </td>
                    <td className="px-4 py-2.5 text-blue-400 text-xs">
                      {formatCurrency(b.gst_total)}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-amber-400">
                      {formatCurrency(b.total_with_gst)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={billStatusBadge(b.status)}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals footer */}
              <tfoot className="border-t-2 border-gray-200 bg-gray-100/40">
                <tr>
                  <td colSpan={3}
                    className="px-4 py-3 text-xs font-bold text-gray-900
                               uppercase tracking-wide">
                    Totals
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {formatNumber(overview.total_pieces, 0)}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {formatCurrency(overview.total_subtotal)}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-400">
                    {formatCurrency(overview.total_gst)}
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-400 text-base">
                    {formatCurrency(overview.total_with_gst)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </ReportSection>
      )}
    </ReportPage>
  )
}