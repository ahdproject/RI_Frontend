import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, Loader2, AlertCircle,
  Building2, Search, MapPin,
} from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import { extractError } from '../../../../../utils/helpers'

export default function ClientsList() {
  const navigate = useNavigate()

  const [clients, setClients] = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = async (q = '') => {
    try {
      setLoading(true)
      const res = await MastersRepo.getAllClients(q)
      setClients(res.data)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    load(e.target.value)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-amber-500" />
    </div>
  )

  return (
    <div className="space-y-5">

      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 text-sm mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2
                                          -translate-y-1/2 text-gray-600" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search clients…"
              className="input-field pl-8 w-44 text-xs"
            />
          </div>
          <button
            onClick={() => navigate('/admin/masters/clients/new')}
            className="btn-primary"
          >
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border
                        border-red-500/30 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/40">
                {['#', 'Client Name', 'GSTIN', 'State', 'Phone', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                                         text-gray-600 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center
                                              text-sm text-gray-600">
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((c, i) => (
                  <tr key={c.id} className="table-row-hover">
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10
                                        border border-blue-500/20 flex items-center
                                        justify-center shrink-0">
                          <Building2 size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {c.name}
                          </p>
                          {c.address && (
                            <p className="text-xs text-gray-600 flex items-center
                                          gap-1 mt-0.5">
                              <MapPin size={10} />
                              {c.address.substring(0, 40)}
                              {c.address.length > 40 ? '…' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {c.gstin || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.state_code}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.phone || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={c.is_active
                        ? 'badge-success' : 'badge-neutral'}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          navigate(`/admin/masters/clients/${c.id}/edit`)
                        }
                        className="flex items-center gap-1.5 text-xs text-blue-400
                                   hover:text-blue-300 transition-colors font-medium"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}