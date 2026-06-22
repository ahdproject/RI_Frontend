import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import {
  FormPageWrapper, Toast, ConfirmModal,
} from '../../../protected/Admin/Masters/_components/MasterPageWrapper'
import {
  extractError, formatCurrency,
} from '../../../../utils/helpers'

export default function OrderForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    order_no: '',
    client_id: '',
    raw_materials_cost: 0,
    commission_charges: 0,
    order_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [confirmAction, setConfirmAction] = useState({ show: false, onConfirm: null })

  // ── Fetch order if editing ────────────────────────────────────────
  useEffect(() => {
    if (isEditMode) {
      const fetchOrder = async () => {
        setLoading(true)
        try {
          // TODO: Replace with actual API call
          // const res = await OrdersRepo.getById(id)
          // setFormData(res.data)
        } catch (e) {
          setError(extractError(e) || 'Failed to load order')
        } finally {
          setLoading(false)
        }
      }
      fetchOrder()
    }
  }, [isEditMode, id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'raw_materials_cost' || name === 'commission_charges'
        ? parseFloat(value) || 0
        : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setConfirmAction({
      show: true,
      onConfirm: async () => {
        setLoading(true)
        try {
          // TODO: Replace with actual API call
          // if (isEditMode) {
          //   await OrdersRepo.update(id, formData)
          // } else {
          //   await OrdersRepo.create(formData)
          // }
          
          setToast({
            show: true,
            message: isEditMode ? 'Order updated successfully' : 'Order created successfully',
            type: 'success'
          })
          setTimeout(() => navigate('/orders'), 2000)
        } catch (e) {
          setToast({ show: true, message: extractError(e) || 'Failed to save order', type: 'error' })
        } finally {
          setLoading(false)
          setConfirmAction({ show: false, onConfirm: null })
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? `Edit Order #${formData.order_no}` : 'Create New Order'}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border p-6" style={{ borderColor: 'var(--surface-border)' }}>
        {loading && <div className="text-center py-8">Loading...</div>}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Number and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                  Order Number
                </label>
                <input
                  type="text"
                  name="order_no"
                  value={formData.order_no}
                  onChange={handleChange}
                  placeholder="e.g., ORD-001"
                  required
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                  Order Date
                </label>
                <input
                  type="date"
                  name="order_date"
                  value={formData.order_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                Client
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              >
                <option value="">Select a client...</option>
                {/* TODO: Fetch actual clients from API */}
              </select>
            </div>

            {/* Raw Materials Cost */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                Raw Materials Cost
              </label>
              <input
                type="number"
                name="raw_materials_cost"
                value={formData.raw_materials_cost}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              />
            </div>

            {/* Commission Charges */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                Commission Charges
              </label>
              <input
                type="number"
                name="commission_charges"
                value={formData.commission_charges}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t" style={{ borderColor: 'var(--surface-border)' }}>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="px-4 py-2 rounded-lg border transition"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                {isEditMode ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          </form>
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {confirmAction.show && (
        <ConfirmModal
          title={`${isEditMode ? 'Update' : 'Create'} Order?`}
          onConfirm={() => confirmAction.onConfirm?.()}
          onCancel={() => setConfirmAction({ show: false, onConfirm: null })}
        />
      )}
    </div>
  )
}
