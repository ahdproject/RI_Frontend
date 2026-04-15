import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import { extractError } from '../../../../../utils/helpers'

const UNITS   = ['nos', 'kgs', 'ltr', 'sqft', 'mtr', 'box']
const EMPTY   = {
  name:         '',
  description:  '',
  hsn_code:     '',
  unit:         'nos',
  default_rate: '',
  gst_slab_id:  '',
  is_active:    true,
}

export default function ProductForm() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  const [form,      setForm]      = useState(EMPTY)
  const [gstSlabs,  setGstSlabs]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(true)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        // Always load GST slabs for dropdown
        const slabsRes = await MastersRepo.getAllGstSlabs(true)
        setGstSlabs(slabsRes.data)

        if (isEdit) {
          const res = await MastersRepo.getProductById(id)
          const p   = res.data
          setForm({
            name:         p.name,
            description:  p.description  || '',
            hsn_code:     p.hsn_code,
            unit:         p.unit,
            default_rate: p.default_rate,
            gst_slab_id:  p.gst_slab_id,
            is_active:    p.is_active,
          })
        }
      } catch (err) {
        setError(extractError(err))
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setError('')
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        name:         form.name,
        description:  form.description  || null,
        hsn_code:     form.hsn_code,
        unit:         form.unit,
        default_rate: parseFloat(form.default_rate),
        gst_slab_id:  form.gst_slab_id,
        ...(isEdit && { is_active: form.is_active }),
      }
      if (isEdit) {
        await MastersRepo.updateProduct(id, payload)
        setSuccess('Product updated successfully.')
      } else {
        await MastersRepo.createProduct(payload)
        setSuccess('Product created successfully.')
        setForm({ ...EMPTY, gst_slab_id: form.gst_slab_id })
      }
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-amber-500" />
    </div>
  )

  return (
    <div className="max-w-lg space-y-6">

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/masters/products')}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            Products appear in bill line item dropdown
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border
                        border-red-500/30 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30
                        rounded-xl p-4">
          <p className="text-sm text-emerald-400">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        <div>
          <label className="label">Product Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Wooden Pallet 45x45"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional product description"
            rows={2}
            className="input-field resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">HSN Code *</label>
            <input
              name="hsn_code"
              value={form.hsn_code}
              onChange={handleChange}
              placeholder="44152000"
              className="input-field font-mono"
              required
            />
          </div>
          <div>
            <label className="label">Unit *</label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="select-field"
              required
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Default Rate (₹) *</label>
            <input
              type="number"
              name="default_rate"
              value={form.default_rate}
              onChange={handleChange}
              placeholder="1450"
              min="0"
              step="0.01"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label">GST Slab *</label>
            <select
              name="gst_slab_id"
              value={form.gst_slab_id}
              onChange={handleChange}
              className="select-field"
              required
            >
              <option value="">Select GST Slab</option>
              {gstSlabs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-900">Active</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Inactive products won't appear in bill dropdown
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none
                              rounded-full peer peer-checked:bg-amber-500
                              transition-colors after:content-[''] after:absolute
                              after:top-0.5 after:left-0.5 after:bg-white
                              after:rounded-full after:h-4 after:w-4
                              after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/masters/products')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : <><Save size={15} /> {isEdit ? 'Save Changes' : 'Create Product'}</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}