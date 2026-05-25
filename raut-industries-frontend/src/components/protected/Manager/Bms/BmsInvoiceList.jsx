import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, X, RefreshCw,
  Eye, Download, Send, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Connector from '../../../../services/Connector'
import Apis from '../../../../services/Apis'
import {
  ListPageWrapper, LoadingState, ErrorState, EmptyState, Toast,
} from '../../Admin/Masters/_components/MasterPageWrapper'
import { extractError } from '../../../../utils/helpers'
import BmsInvoiceSendModal from './_components/BmsInvoiceSendModal'

const STATUS_STYLE = {
  DRAFT:     'bg-yellow-100 text-yellow-700',
  SENT:      'bg-blue-100 text-blue-700',
  PAID:      'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  OVERDUE:   'bg-orange-100 text-orange-700',
}

const fmtD = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const fmt = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

export default function BmsInvoiceList() {
  const navigate = useNavigate()

  const [invoices, setInvoices] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [toast,    setToast]    = useState({ type: '', message: '' })
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [page,     setPage]     = useState(1)
  const [sendTarget, setSendTarget] = useState(null)
  const [downloading, setDownloading] = useState(null)

  const LIMIT = 15

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await Connector.get(Apis.bmsInvoices, {
        params: {
          page, limit: LIMIT,
          search: search || undefined,
          status: status || undefined,
        },
      })
      const d = res.data?.data
      setInvoices(Array.isArray(d?.invoices) ? d.invoices : Array.isArray(d) ? d : [])
      setTotal(d?.pagination?.total || d?.total || 0)
    } catch (e) {
      setError(extractError(e))
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  const handleDownload = async (inv) => {
    const id = inv.invoice_id || inv.id
    setDownloading(id)
    try {
      const res = await Connector.get(Apis.bmsInvoicePdf(id), { responseType: 'arraybuffer' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${inv.invoice_number || 'invoice'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setToast({ type: 'error', message: 'PDF download failed' })
    } finally {
      setDownloading(null)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  if (error) return <ErrorState message={error} />

  return (
    <>
      <ListPageWrapper
        title="BMS Invoices"
        subtitle={`${total} invoices from BMS`}
        action={
          <button
            onClick={() => navigate('/bms/invoices/new')}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> Create Invoice
          </button>
        }
      >
        {toast.message && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ type: '', message: '' })}
          />
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search invoice or client…"
              className="input-field pl-8 pr-8 w-52"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="select-field w-36"
          >
            <option value="">All Status</option>
            {['DRAFT','SENT','PAID','OVERDUE','CANCELLED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? <LoadingState /> : invoices.length === 0 ? (
          <EmptyState message="No BMS invoices found" />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100/40">
                    {['Invoice #', 'Client', 'Date', 'Due Date', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-semibold uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {invoices.map(inv => {
                    const id = inv.invoice_id || inv.id
                    return (
                      <tr key={id} className="table-row-hover cursor-pointer"
                        onClick={() => navigate(`/bms/invoices/${id}`)}>
                        <td className="px-4 py-3 font-mono text-xs font-bold"
                          style={{ color: 'var(--brand-primary)' }}>
                          {inv.invoice_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium" style={{ color: 'var(--text-main)' }}>{inv.client_name}</p>
                          {inv.client_email && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{inv.client_email}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fmtD(inv.invoice_date)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{fmtD(inv.due_date)}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-main)' }}>
                          {fmt(inv.total_amount || inv.grand_total)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[inv.status] || STATUS_STYLE.DRAFT}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => navigate(`/bms/invoices/${id}`)}
                              className="text-xs px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                              style={{ color: 'var(--brand-primary)' }}>
                              <Eye size={13} />
                            </button>
                            {inv.status !== 'CANCELLED' && (
                              <button onClick={() => setSendTarget(inv)}
                                className="text-xs px-2 py-1 rounded hover:bg-green-500/10 transition-colors text-emerald-500">
                                <Send size={13} />
                              </button>
                            )}
                            <button onClick={() => handleDownload(inv)}
                              disabled={downloading === id}
                              className="text-xs px-2 py-1 rounded hover:bg-gray-500/10 transition-colors disabled:opacity-40"
                              style={{ color: 'var(--text-muted)' }}>
                              <Download size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t text-xs"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}>
                <span>Showing {(page-1)*LIMIT+1}–{Math.min(page*LIMIT,total)} of {total}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                    className="p-1.5 rounded border disabled:opacity-40"
                    style={{ borderColor: 'var(--surface-border)' }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3 py-1 rounded border"
                    style={{ borderColor: 'var(--surface-border)' }}>
                    {page} / {totalPages}
                  </span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                    className="p-1.5 rounded border disabled:opacity-40"
                    style={{ borderColor: 'var(--surface-border)' }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </ListPageWrapper>

      {sendTarget && (
        <BmsInvoiceSendModal
          invoice={sendTarget}
          onClose={() => setSendTarget(null)}
          onSent={() => { setSendTarget(null); load() }}
        />
      )}
    </>
  )
}