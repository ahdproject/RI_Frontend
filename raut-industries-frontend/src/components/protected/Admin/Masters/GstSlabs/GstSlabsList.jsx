import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import {
  ListPageWrapper, LoadingState, ErrorState,
  EmptyState, Toast, ConfirmModal,
} from '../_components/MasterPageWrapper'
import { extractError } from '../../../../../utils/helpers'

export default function GstSlabsList() {
  const navigate = useNavigate()

  const [slabs,   setSlabs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [toast,   setToast]   = useState({ type: '', message: '' })
  const [confirm, setConfirm] = useState(null) // { id, is_active }
  const [saving,  setSaving]  = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await MastersRepo.getAllGstSlabs()
      setSlabs(res.data || [])
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleToggle = async () => {
    if (!confirm) return
    setSaving(true)
    try {
      await MastersRepo.updateGstSlab(confirm.id, {
        is_active: !confirm.is_active,
      })
      setToast({
        type: 'success',
        message: `GST slab ${confirm.is_active ? 'deactivated' : 'activated'} successfully`,
      })
      setConfirm(null)
      load()
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) })
      setConfirm(null)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  return (
    <ListPageWrapper
      title="GST Slabs"
      subtitle={`${slabs.length} slabs configured`}
      action={
        <button
          onClick={() => navigate('/admin/masters/gst-slabs/new')}
          className="btn-primary text-xs"
        >
          <Plus size={14} /> Add Slab
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

      {confirm && (
        <ConfirmModal
          message={`Are you sure you want to ${confirm.is_active
            ? 'deactivate' : 'activate'} this GST slab?`}
          onConfirm={handleToggle}
          onCancel={() => setConfirm(null)}
          loading={saving}
        />
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/40">
                {['Label', 'CGST %', 'SGST %', 'IGST %', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs
                                         text-gray-600 font-semibold
                                         uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {slabs.length === 0
                ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState message="No GST slabs found" />
                    </td>
                  </tr>
                )
                : slabs.map((slab) => (
                  <tr key={slab.id} className="table-row-hover">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {slab.label}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {slab.cgst_rate}%
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {slab.sgst_rate}%
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {slab.igst_rate}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={slab.is_active
                        ? 'badge-success' : 'badge-neutral'}>
                        {slab.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(
                            `/admin/masters/gst-slabs/${slab.id}/edit`
                          )}
                          className="w-7 h-7 flex items-center justify-center
                                     rounded-lg text-gray-600 hover:text-amber-400
                                     hover:bg-amber-500/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setConfirm({
                            id: slab.id,
                            is_active: slab.is_active,
                          })}
                          className="w-7 h-7 flex items-center justify-center
                                     rounded-lg text-gray-600 hover:text-red-400
                                     hover:bg-red-500/10 transition-colors"
                          title={slab.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {slab.is_active
                            ? <ToggleRight size={14} />
                            : <ToggleLeft  size={14} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </ListPageWrapper>
  )
}