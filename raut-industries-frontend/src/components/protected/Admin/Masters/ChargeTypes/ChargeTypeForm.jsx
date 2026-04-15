import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import { extractError } from '../../../../../utils/helpers'

export default function ChargeTypeForm() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  const [form,     setForm]     = useState({ name: '', is_active: true })
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const res = await MastersRepo.getChargeTypeById(id)
        setForm({ name: res.data.name, is_active: res.data.is_active })
      } catch (err) {
        setError(extractError(err))
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (isEdit) {
        await MastersRepo.updateChargeType(id, form)
        setSuccess('Charge type updated successfully.')
      } else {
        await MastersRepo.createChargeType({ name: form.name })
        setSuccess('Charge type created successfully.')
        setForm({ name: '', is_active: true })
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
    <div className="max-w-md space-y-6">

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/masters/charge-types')}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Charge Type' : 'Add Charge Type'}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            These appear as optional charges on bills
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
          <label className="label">Charge Type Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={(e) => {
              setError('')
              setForm((p) => ({ ...p, name: e.target.value }))
            }}
            placeholder="e.g. Packing, Labour Charges, Transport"
            className="input-field"
            required
          />
        </div>

        {isEdit && (
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-900">Active</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Inactive types won't appear in bill forms
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_active: e.target.checked }))
                }
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
            onClick={() => navigate('/admin/masters/charge-types')}
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
              : <><Save size={15} /> {isEdit ? 'Save Changes' : 'Create'}</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}