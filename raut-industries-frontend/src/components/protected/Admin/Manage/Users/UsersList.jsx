import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import UserManagementRepo from '../../../../../services/repository/Admin/UserManagementRepo'
import {
  ListPageWrapper, LoadingState, ErrorState,
  EmptyState, Toast, ConfirmModal,
} from '../../Masters/_components/MasterPageWrapper'
import {
  extractError, formatDate,
  hasRole, ROLES,
} from '../../../../../utils/helpers'
import { selectUser } from '../../../../../app/DashboardSlice'

// ─── Role badge ───────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    SuperAdmin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Admin:      'bg-blue-500/20   text-blue-400   border-blue-500/30',
    Manager:    'bg-amber-500/20  text-amber-400  border-amber-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                      text-xs font-semibold border
                      ${map[role] || 'bg-gray-700/50 text-gray-600 border-gray-600'}`}>
      {role}
    </span>
  )
}

export default function UsersList() {
  const navigate    = useNavigate()
  const currentUser = useSelector(selectUser)
  const isSuperAdmin = hasRole(currentUser, ROLES.SUPER_ADMIN)

  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [toast,   setToast]   = useState({ type: '', message: '' })
  const [confirm, setConfirm] = useState(null)
  const [saving,  setSaving]  = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await UserManagementRepo.getAll()
      setUsers(res.data || [])
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
      await UserManagementRepo.update(confirm.id, {
        is_active: !confirm.is_active,
      })
      setToast({
        type: 'success',
        message: `User ${confirm.is_active ? 'deactivated' : 'activated'} successfully`,
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
      title="User Management"
      subtitle={`${users.length} users`}
      action={
        isSuperAdmin && (
          <button
            onClick={() => navigate('/admin/users/new')}
            className="btn-primary text-xs"
          >
            <Plus size={14} /> Add User
          </button>
        )
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
            ? 'deactivate' : 'activate'} ${confirm.name}?`}
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
                {['#', 'Name', 'Email', 'Role',
                  'Last Login', 'Status', ''].map((h) => (
                  <th key={h}
                    className="px-4 py-3 text-left text-xs text-gray-600
                               font-semibold uppercase tracking-wide
                               whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {users.length === 0
                ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState message="No users found" />
                    </td>
                  </tr>
                )
                : users.map((u, i) => (
                  <tr key={u.id} className="table-row-hover">
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100
                                        border border-gray-200 flex items-center
                                        justify-center shrink-0">
                          <span className="text-xs font-bold text-gray-600">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="ml-2 text-[10px] text-amber-400
                                               font-normal">
                                (you)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {u.last_login_at
                        ? formatDate(u.last_login_at)
                        : 'Never'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.is_active
                        ? 'badge-success' : 'badge-neutral'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() =>
                            navigate(`/admin/users/${u.id}/edit`)
                          }
                          className="w-7 h-7 flex items-center justify-center
                                     rounded-lg text-gray-600 hover:text-amber-400
                                     hover:bg-amber-500/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        {/* Cannot deactivate yourself */}
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => setConfirm({
                              id:        u.id,
                              name:      u.name,
                              is_active: u.is_active,
                            })}
                            className="w-7 h-7 flex items-center justify-center
                                       rounded-lg text-gray-600 hover:text-red-400
                                       hover:bg-red-500/10 transition-colors"
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {u.is_active
                              ? <ToggleRight size={14} />
                              : <ToggleLeft  size={14} />
                            }
                          </button>
                        )}
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