import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Trash2, Edit, Loader2, AlertCircle,
  CheckCircle, XCircle,
} from 'lucide-react'
import {
  formatCurrency, formatDate, formatNumber,
  extractError, hasRole, ROLES,
} from '../../../../utils/helpers'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../../app/DashboardSlice'

export default function OrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [confirmAction, setConfirmAction] = useState({ show: false, title: '', onConfirm: null })

  const user = useSelector(selectUser)
  const navigate = useNavigate()

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // TODO: Replace with actual API call
      // const res = await OrdersRepo.getAll()
      // const data = res.data?.data || res.data || []
      // setOrders(Array.isArray(data) ? data : [])
      
      // Mock data for now
      setOrders([])
    } catch (e) {
      setError(extractError(e) || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter(order =>
    (String(order.order_no || '').toLowerCase()).includes(searchTerm.toLowerCase()) ||
    (order.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleDeleteOrder = (order) => {
    setConfirmAction({
      show: true,
      title: `Delete Order #${order.order_no}?`,
      onConfirm: async () => {
        try {
          // TODO: Replace with actual API call
          // await OrdersRepo.delete(order.id)
          setToast({ show: true, message: 'Order deleted successfully', type: 'success' })
          fetchOrders()
        } catch (e) {
          setToast({ show: true, message: extractError(e) || 'Failed to delete order', type: 'error' })
        }
        setConfirmAction({ show: false, title: '', onConfirm: null })
      }
    })
  }

  return (
    <div className="space-y-5">

      {/* Header with search and action button */}
      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold text-black">Orders</h1>
          <p className="text-gray-600 text-sm mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2
                                          -translate-y-1/2 text-gray-600" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order no, client…"
              className="input-field pl-8 w-44 text-xs"
            />
          </div>
          <button
            onClick={() => navigate('/orders/create')}
            className="btn-primary"
          >
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border
                        border-red-500/30 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchOrders}
            className="ml-auto text-xs text-red-400 hover:text-red-500 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-sm">
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </p>
          {orders.length === 0 && (
            <button
              onClick={() => navigate('/orders/create')}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Create your first order →
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Order No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Raw Materials
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Commission
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-black font-medium">#{order.order_no}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.client?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(order.raw_materials_cost || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(order.commission_charges || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-semibold
                        ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="p-1.5 hover:bg-blue-100 rounded transition text-blue-600"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order)}
                        className="p-1.5 hover:bg-red-100 rounded transition text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 flex items-center justify-between gap-3
                         border rounded-xl px-4 py-3 z-50
                         ${toast.type === 'success' 
                           ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                           : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          <p className="text-sm">{toast.message}</p>
          <button
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirmAction.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 space-y-4 shadow-2xl shadow-black/40">
            <p className="text-sm text-black leading-relaxed">{confirmAction.title}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction({ show: false, title: '', onConfirm: null })}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction.onConfirm?.()}
                className="btn-danger text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
