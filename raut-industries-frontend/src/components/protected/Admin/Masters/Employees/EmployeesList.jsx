import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, Loader2, AlertCircle,
  UserSquare2, Search,
} from 'lucide-react'
import MastersRepo from '../../../../../services/repository/Admin/MastersRepo'
import { formatCurrency, formatDate, extractError } from '../../../../../utils/helpers'

const DEPARTMENTS = [
  '', 'Production', 'Processing', 'QC',
  'Stores', 'Admin', 'Accounts', 'Maintenance',
]

export default function EmployeesList() {
  const navigate = useNavigate()

  const [employees, setEmployees] = useState([])
  const [search,    setSearch]    = useState('')
  const [dept,      setDept]      = useState('')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  const load = async (q = '', d = '') => {
    try {
      setLoading(true)
      const res = await MastersRepo.getAllEmployees(q, d)
      setEmployees(res.data)
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
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 text-sm mt-1">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2
                                          -translate-y-1/2 text-gray-600" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                load(e.target.value, dept)
              }}
              placeholder="Search name…"
              className="input-field pl-8 w-36 text-xs"
            />
          </div>
          <select
            value={dept}
            onChange={(e) => {
              setDept(e.target.value)
              load(search, e.target.value)
            }}
            className="select-field w-36 text-xs"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d || 'All Depts'}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate('/admin/masters/employees/new')}
            className="btn-primary"
          >
            <Plus size={16} /> Add Employee
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
                {['Code','Name','Role','Department',
                  'Joining Date','Salary','Status',''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                                         text-gray-600 uppercase tracking-wide
                                         whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center
                                              text-sm text-gray-600">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="table-row-hover">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {emp.emp_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10
                                        border border-purple-500/20 flex items-center
                                        justify-center shrink-0">
                          <span className="text-purple-400 font-bold text-xs">
                            {emp.name.charAt(0)}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {emp.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {emp.role}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-neutral">{emp.department}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {formatDate(emp.joining_date)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">
                      {formatCurrency(emp.salary)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={emp.is_active
                        ? 'badge-success' : 'badge-neutral'}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          navigate(`/admin/masters/employees/${emp.id}/edit`)
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