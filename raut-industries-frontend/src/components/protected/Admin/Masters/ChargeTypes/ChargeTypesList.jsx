import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Loader2, AlertCircle, Tag } from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import { extractError } from '../../../../../utils/helpers'

export default function ChargeTypesList() {
  const navigate = useNavigate()

  const [types,   setTypes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await MastersRepo.getAllChargeTypes()
        setTypes(res.data)
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-amber-500" />
    </div>
  )

  return (
    <div className="space-y-5">

      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Charge Types</h1>
          <p className="text-gray-600 text-sm mt-1">
            Optional charges added to bills (Packing, Labour, Transport etc.)
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/masters/charge-types/new')}
          className="btn-primary"
        >
          <Plus size={16} /> Add Charge Type
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border
                        border-red-500/30 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Grid cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.length === 0 ? (
          <div className="col-span-3 card p-10 text-center">
            <p className="text-sm text-gray-600">
              No charge types found. Add your first one.
            </p>
          </div>
        ) : (
          types.map((type) => (
            <div key={type.id} className="card p-4 flex items-center
                                           justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 border
                                border-gray-200 flex items-center justify-center">
                  <Tag size={15} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {type.name}
                  </p>
                  <span className={type.is_active
                    ? 'badge-success' : 'badge-neutral'}>
                    {type.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  navigate(`/admin/masters/charge-types/${type.id}/edit`)
                }
                className="opacity-0 group-hover:opacity-100 flex items-center
                           gap-1.5 text-xs text-blue-400 hover:text-blue-300
                           transition-all font-medium"
              >
                <Pencil size={12} /> Edit
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}