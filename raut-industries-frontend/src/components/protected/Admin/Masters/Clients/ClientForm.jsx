import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import { extractError } from '../../../../../utils/helpers'

const EMPTY = {
  name:       '',
  address:    '',
  gstin:      '',
  state_code: '27',
  phone:      '',
  is_active:  true,
}

export default function ClientForm() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  const [form,     setForm]     = useState(EMPTY)
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const res = await MastersRepo.getClientById(id)
        const c   = res.data
        setForm({
          name:       c.name,
          address:    c.address    || '',
          gstin:      c.gstin      || '',
          state_code: c.state_code || '27',
          phone:      c.phone      || '',
          is_active:  c.is_active,
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
        name:       form.name,
        address:    form.address    || null,
        gstin:      form.gstin      || null,
        state_code: form.state_code,
        phone:      form.phone      || null,
        ...(isEdit && { is_active: form.is_active }),
      }
      if (isEdit) {
        await MastersRepo.updateClient(id, payload)
        setSuccess('Client updated successfully.')
      } else {
        await MastersRepo.createClient(payload)
        setSuccess('Client created successfully.')
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

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/masters/clients')}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Client' : 'Add Client'}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            Client details used on GST invoices
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
          <label className="label">Client Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. PVR Controls"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Full address"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">GSTIN</label>
            <input
              name="gstin"
              value={form.gstin}
              onChange={handleChange}
              placeholder="27AASFP5102C1ZE"
              maxLength={15}
              className="input-field font-mono text-xs"
            />
          </div>
          <div>
            <label className="label">State Code *</label>
            <input
              name="state_code"
              value={form.state_code}
              onChange={handleChange}
              placeholder="27"
              maxLength={2}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="9876543210"
            maxLength={15}
            className="input-field"
          />
        </div>

        {isEdit && (
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-900">Active</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Inactive clients won't appear in bill dropdown
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
            onClick={() => navigate('/admin/masters/clients')}
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
              : <><Save size={15} /> {isEdit ? 'Save Changes' : 'Create Client'}</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}