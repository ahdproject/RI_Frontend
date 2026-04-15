import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, Loader2, AlertCircle,
  Package, Search,
} from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import { formatCurrency, extractError } from '../../../../../utils/helpers'

export default function ProductsList() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const load = async (q = '') => {
    try {
      setLoading(true)
      const res = await MastersRepo.getAllProducts(q)
      setProducts(res.data)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-amber-500" />
    </div>
  )

  return (
    <div className="space-y-5">

      <div className="page-header">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 text-sm mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} in master
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2
                                          -translate-y-1/2 text-gray-600" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                load(e.target.value)
              }}
              placeholder="Search products…"
              className="input-field pl-8 w-44 text-xs"
            />
          </div>
          <button
            onClick={() => navigate('/admin/masters/products/new')}
            className="btn-primary"
          >
            <Plus size={16} /> Add Product
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
                {['#','Product Name','HSN','Unit','Default Rate',
                  'GST Slab','Status',''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs
                                         font-semibold text-gray-600
                                         uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center
                                              text-sm text-gray-600">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10
                                        border border-amber-500/20 flex items-center
                                        justify-center shrink-0">
                          <Package size={14} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {p.description.substring(0, 40)}
                              {p.description.length > 40 ? '…' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {p.hsn_code}
                    </td>
                    <td className="px-4 py-3 text-gray-600 uppercase text-xs">
                      {p.unit}
                    </td>
                    <td className="px-4 py-3 font-semibold text-amber-400">
                      {formatCurrency(p.default_rate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-info">
                        {p.gst_slab_label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.is_active
                        ? 'badge-success' : 'badge-neutral'}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          navigate(`/admin/masters/products/${p.id}/edit`)
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