import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import { extractError } from '../../../../../utils/helpers'

const EMPTY = {
  label:     '',
  cgst_rate: '',
  sgst_rate: '',
  igst_rate: '',
  is_active: true,
}

export default function GstSlabForm() {
  const navigate    = useNavigate()
  const { id }      = useParams()
  const isEdit      = Boolean(id)

  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [fetching,setFetching]= useState(isEdit)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  // Load existing slab for edit
  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const res = await MastersRepo.getGstSlabById(id)
        const s   = res.data
        setForm({
          label:     s.label,
          cgst_rate: s.cgst_rate,
          sgst_rate: s.sgst_rate,
          igst_rate: s.igst_rate,
          is_active: s.is_active,
        })
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
        label:     form.label,
        cgst_rate: parseFloat(form.cgst_rate),
        sgst_rate: parseFloat(form.sgst_rate),
        igst_rate: parseFloat(form.igst_rate),
        ...(isEdit && { is_active: form.is_active }),
      }
      if (isEdit) {
        await MastersRepo.updateGstSlab(id, payload)
        setSuccess('GST slab updated successfully.')
      } else {
        await MastersRepo.createGstSlab(payload)
        setSuccess('GST slab created successfully.')
        setForm(EMPTY)
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

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/masters/gst-slabs')}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit GST Slab' : 'Add GST Slab'}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {isEdit ? 'Update slab rates' : 'Configure a new GST slab'}
          </p>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* Label */}
        <div>
          <label className="label">Slab Label *</label>
          <input
            name="label"
            value={form.label}
            onChange={handleChange}
            placeholder="e.g. GST 12%"
            className="input-field"
            required
          />
        </div>

        {/* Rates */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'cgst_rate', label: 'CGST Rate %' },
            { name: 'sgst_rate', label: 'SGST Rate %' },
            { name: 'igst_rate', label: 'IGST Rate %' },
          ].map((f) => (
            <div key={f.name}>
              <label className="label">{f.label} *</label>
              <input
                type="number"
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                className="input-field"
                required
              />
            </div>
          ))}
        </div>

        {/* Preview */}
        {(form.cgst_rate || form.sgst_rate) && (
          <div className="bg-gray-100/50 border border-gray-200/50
                          rounded-lg px-4 py-3 flex items-center
                          justify-between">
            <p className="text-xs text-gray-600">
              Total GST (Same State)
            </p>
            <p className="text-sm font-bold text-amber-400">
              {(parseFloat(form.cgst_rate || 0) +
                parseFloat(form.sgst_rate || 0)).toFixed(2)}%
            </p>
          </div>
        )}

        {/* Active toggle (edit only) */}
        {isEdit && (
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-900">Active</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Inactive slabs cannot be assigned to new products
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

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/masters/gst-slabs')}
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
              : <><Save size={15} /> {isEdit ? 'Save Changes' : 'Create Slab'}</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}