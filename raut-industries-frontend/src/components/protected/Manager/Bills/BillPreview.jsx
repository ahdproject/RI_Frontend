import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft, Pencil, CheckCircle,
  XCircle, Printer, Loader2,
} from 'lucide-react'
import BillsRepo from '../../../../services/repository/Manager/BillsRepo'
import {
  LoadingState, ErrorState,
  Toast, ConfirmModal,
} from '../../Admin/Masters/_components/MasterPageWrapper'
import {
  formatCurrency, formatDate, formatNumber,
  billStatusBadge, extractError,
  hasRole, ROLES,
} from '../../../../utils/helpers'
import { selectUser } from '../../../../app/DashboardSlice'

// ─── Row helper ───────────────────────────────────────────────
const Row = ({ label, value, highlight = false, border = false }) => (
  <div className={`flex justify-between items-center py-2
                   ${border ? 'border-t border-gray-200 mt-1 pt-3' : ''}`}>
    <span className="text-xs text-gray-600">{label}</span>
    <span className={`text-sm font-semibold
                      ${highlight ? 'text-amber-400 text-base' : 'text-gray-900'}`}>
      {value}
    </span>
  </div>
)

export default function BillPreview() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const user     = useSelector(selectUser)
  const isAdmin  = hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN)

  const [bill,    setBill]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [toast,   setToast]   = useState({ type: '', message: '' })
  const [confirm, setConfirm] = useState(null)
  const [acting,  setActing]  = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await BillsRepo.getById(id)
      setBill(res.data)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleAction = async () => {
    if (!confirm) return
    setActing(true)
    try {
      if (confirm.action === 'confirm') {
        await BillsRepo.confirm(id)
        setToast({ type: 'success', message: 'Bill confirmed successfully' })
      } else {
        await BillsRepo.cancel(id)
        setToast({ type: 'success', message: 'Bill cancelled' })
      }
      setConfirm(null)
      load()
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) })
      setConfirm(null)
    } finally {
      setActing(false)
    }
  }

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />
  if (!bill)   return null

  const isDraft     = bill.status === 'draft'
  const isCancelled = bill.status === 'cancelled'

  return (
    <div className="max-w-4xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bills')}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-gray-600 hover:text-gray-900 hover:bg-gray-100
                       transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Bill #{bill.bill_no}
              </h1>
              <span className={billStatusBadge(bill.status)}>
                {bill.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-0.5">
              {bill.client_name} · {formatDate(bill.bill_date)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isDraft && (
            <button
              onClick={() => navigate(`/bills/${id}/edit`)}
              className="btn-secondary text-xs"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
          {isDraft && (
            <button
              onClick={() => setConfirm({ action: 'confirm' })}
              className="btn-primary text-xs"
            >
              <CheckCircle size={13} /> Confirm
            </button>
          )}
          {isAdmin && !isCancelled && (
            <button
              onClick={() => setConfirm({ action: 'cancel' })}
              className="btn-danger text-xs"
            >
              <XCircle size={13} /> Cancel
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs"
          >
            <Printer size={13} /> Print
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

      {confirm && (
        <ConfirmModal
          message={
            confirm.action === 'confirm'
              ? 'Confirm this bill? It cannot be edited afterwards.'
              : 'Cancel this bill? This cannot be undone.'
          }
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={acting}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left: Bill body ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Client + Bill info */}
          <div className="card p-5 grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <p className="text-xs text-gray-600 uppercase tracking-wide
                            font-semibold mb-3">
                Bill To
              </p>
              <p className="font-bold text-gray-900">{bill.client_name}</p>
              {bill.client_address && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {bill.client_address}
                </p>
              )}
              {bill.client_gstin && (
                <p className="text-xs font-mono text-gray-600">
                  GST: {bill.client_gstin}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-600 uppercase tracking-wide
                            font-semibold mb-3">
                Bill Info
              </p>
              {[
                { l: 'Invoice No.',    v: `#${bill.bill_no}` },
                { l: 'Date',          v: formatDate(bill.bill_date) },
                { l: 'Transport',     v: bill.transport_mode  || '—' },
                { l: 'Vehicle',       v: bill.vehicle_number  || '—' },
                { l: 'Place of Supply', v: bill.place_of_supply || '—' },
                { l: 'Ref / PO',      v: bill.ref_number      || '—' },
                { l: 'Payment Terms', v: bill.payment_terms   || '—' },
              ].map((r) => (
                <div key={r.l} className="flex justify-between text-xs">
                  <span className="text-gray-600">{r.l}</span>
                  <span className="text-gray-900">{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line items table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase
                            tracking-wide">
                Line Items
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100/30">
                    {['#', 'Description', 'HSN', 'Qty', 'Rate',
                      'Amount', 'CGST', 'SGST', 'IGST', 'Total'].map((h) => (
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
                  {bill.line_items?.map((li, i) => (
                    <tr key={li.id} className="table-row-hover">
                      <td className="px-4 py-2.5 text-gray-600 text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-900 text-xs">
                          {li.description || li.product_name}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {li.product_name}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-600">
                        {li.hsn_code}
                      </td>
                      <td className="px-4 py-2.5 text-gray-900 text-xs">
                        {formatNumber(li.qty, 0)} {li.product_unit}
                      </td>
                      <td className="px-4 py-2.5 text-gray-900 text-xs">
                        ₹{formatNumber(li.rate)}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-gray-900 text-xs">
                        {formatCurrency(li.amount)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">
                        {li.cgst_rate > 0
                          ? `${formatCurrency(li.cgst_amount)} (${li.cgst_rate}%)`
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">
                        {li.sgst_rate > 0
                          ? `${formatCurrency(li.sgst_amount)} (${li.sgst_rate}%)`
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">
                        {li.igst_rate > 0
                          ? `${formatCurrency(li.igst_amount)} (${li.igst_rate}%)`
                          : '—'}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-amber-400 text-xs">
                        {formatCurrency(li.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Other charges */}
          {bill.other_charges?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase
                              tracking-wide">
                  Other Charges
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100/30">
                    {['Description', 'Qty', 'Rate', 'Amount'].map((h) => (
                      <th key={h}
                        className="px-4 py-2.5 text-left text-xs text-gray-600
                                   font-semibold uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {bill.other_charges.map((oc) => (
                    <tr key={oc.id} className="table-row-hover">
                      <td className="px-4 py-2.5 font-medium text-gray-900 text-xs">
                        {oc.charge_type_name || oc.custom_name}
                      </td>
                      <td className="px-4 py-2.5 text-gray-900 text-xs">
                        {formatNumber(oc.qty, 0)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-900 text-xs">
                        ₹{formatNumber(oc.rate)}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-400 text-xs">
                        {formatCurrency(oc.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes */}
          {bill.notes && (
            <div className="card px-5 py-4">
              <p className="text-xs text-gray-600 uppercase tracking-wide
                            font-semibold mb-2">Notes</p>
              <p className="text-sm text-gray-600">{bill.notes}</p>
            </div>
          )}

        </div>

        {/* ── Right: Totals ───────────────────────────────── */}
        <div className="space-y-4">

          {/* Calculation summary */}
          <div className="card p-5 space-y-1">
            <p className="text-xs font-semibold text-gray-600 uppercase
                          tracking-wide mb-3">
              Bill Summary
            </p>
            <Row label="Subtotal"          value={formatCurrency(bill.subtotal)}           />
            <Row label="CGST"              value={formatCurrency(bill.cgst_total)}          />
            <Row label="SGST"              value={formatCurrency(bill.sgst_total)}          />
            {parseFloat(bill.igst_total) > 0 && (
              <Row label="IGST"            value={formatCurrency(bill.igst_total)}          />
            )}
            <Row label="Total GST"         value={formatCurrency(bill.gst_total)}           />
            <Row
              label="Total with GST"
              value={formatCurrency(bill.total_with_gst)}
              border
            />
          </div>

          {/* Difference & Per Piece */}
          <div className="card p-5 space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase
                          tracking-wide mb-1">
              Analysis
            </p>
            <div className="bg-gray-100/50 rounded-xl px-4 py-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(bill.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Other Charges</span>
                <span className="text-gray-900">
                  − {formatCurrency(bill.other_charges_total)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold
                              border-t border-gray-200 pt-2">
                <span className="text-gray-900">Difference</span>
                <span className="text-emerald-400">
                  {formatCurrency(bill.difference_amount)}
                </span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20
                            rounded-xl px-4 py-3 flex items-center
                            justify-between">
              <div>
                <p className="text-xs text-amber-400 font-semibold">
                  Per Piece Value
                </p>
                <p className="text-[10px] text-amber-400/60 mt-0.5">
                  Difference ÷ {formatNumber(bill.total_pieces, 0)} pcs
                </p>
              </div>
              <p className="text-xl font-black text-amber-400">
                {formatCurrency(bill.per_piece_value)}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="card p-5 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase
                          tracking-wide mb-1">
              Meta
            </p>
            {[
              { l: 'Created by', v: bill.created_by_name },
              { l: 'Created at', v: formatDate(bill.created_at) },
              { l: 'Status',     v: bill.status },
            ].map((r) => (
              <div key={r.l} className="flex justify-between text-xs">
                <span className="text-gray-600">{r.l}</span>
                <span className="text-gray-900 capitalize">{r.v}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}