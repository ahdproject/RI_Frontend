import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Eye, Trash2, Loader2, AlertCircle,
} from 'lucide-react'
import BillsRepo from '../../../../services/repository/Manager/BillsRepo'
import {
  formatCurrency, formatDate, formatNumber,
  extractError, hasRole, ROLES,
} from '../../../../utils/helpers'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../../app/DashboardSlice'

export default function BillsList() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [filterMonth, setFilterMonth] = useState('May')
  const [filterYear, setFilterYear] = useState('2026')

  const user = useSelector(selectUser)
  const navigate = useNavigate()

  // ── Fetch bills ──────────────────────────────────────────────────────────
  const fetchBills = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await BillsRepo.getAll()
      const data = res.data?.data || res.data || []
      setBills(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(extractError(e) || 'Failed to load bills')
      setBills([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  // ── Filter bills based on criteria ─────────────────────────────────────
  const filteredBills = bills.filter(bill => {
    // Search filter
    const matchesSearch = !search || 
      String(bill.bill_no || '').toLowerCase().includes(search.toLowerCase()) ||
      (bill.client?.name?.toLowerCase() || '').includes(search.toLowerCase())
    
    // Status filter
    const matchesStatus = filterStatus === 'All Status' || bill.status === filterStatus.toLowerCase()
    
    // Date filter
    const billDate = new Date(bill.bill_date)
    const monthMatch = filterMonth === 'May' || billDate.getMonth() === (new Date(`${filterMonth} 1, 2000`).getMonth())
    const yearMatch = filterYear === '2026' || billDate.getFullYear().toString() === filterYear
    
    return matchesSearch && matchesStatus && monthMatch && yearMatch
  })

  // ── Calculate summary stats ────────────────────────────────────────────
  const stats = filteredBills.reduce((acc, bill) => ({
    subtotal: acc.subtotal + (bill.subtotal || 0),
    gst: acc.gst + (bill.total_gst || 0),
    total: acc.total + (bill.total_with_gst || 0),
    pieces: acc.pieces + (bill.total_pieces || 0),
  }), { subtotal: 0, gst: 0, total: 0, pieces: 0 })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Bills</h1>
          <p className="text-gray-600 text-sm mt-1">
            {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''} • {filteredBills.length} confirmed
          </p>
        </div>
        <button
          onClick={() => navigate('/bills/new')}
          className="btn-primary"
        >
          <Plus size={16} /> New Bill
        </button>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client…"
            className="input-field pl-8 w-full"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-3 gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field text-sm"
          >
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Draft</option>
            <option>Cancelled</option>
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input-field text-sm"
          >
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="input-field text-sm"
          >
            <option>2024</option>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4 space-y-1">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Subtotal</p>
            <p className="text-lg font-bold text-black">{formatCurrency(stats.subtotal)}</p>
          </div>
          <div className="card p-4 space-y-1">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">GST</p>
            <p className="text-lg font-bold text-black">{formatCurrency(stats.gst)}</p>
          </div>
          <div className="card p-4 space-y-1">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total</p>
            <p className="text-lg font-bold text-blue-500">{formatCurrency(stats.total)}</p>
          </div>
          <div className="card p-4 space-y-1">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Pieces</p>
            <p className="text-lg font-bold text-black">{formatNumber(stats.pieces, 0)}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-400 font-semibold">Failed to load data</p>
            <p className="text-xs text-red-400/70 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchBills}
            className="ml-auto text-xs text-red-400 hover:text-red-500 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredBills.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-sm">
            {bills.length === 0 ? 'No bills yet' : 'No matching bills'}
          </p>
        </div>
      )}

      {/* Bills Table */}
      {!loading && !error && filteredBills.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Bill No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Pieces</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Subtotal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">GST</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-black font-medium">#{bill.bill_no}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(bill.bill_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{bill.client?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(bill.total_pieces || 0, 0)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(bill.subtotal || 0)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(bill.total_gst || 0)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatCurrency(bill.total_with_gst || 0)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-semibold
                        ${bill.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700'
                          : bill.status === 'draft' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => navigate(`/bills/${bill.id}/preview`)}
                        className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}