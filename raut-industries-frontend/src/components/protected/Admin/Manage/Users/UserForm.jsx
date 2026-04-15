import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Loader2, KeyRound } from 'lucide-react'
import UserManagementRepo from '../../../../../services/repository/Admin/UserManagementRepo'
import {
  FormPageWrapper, LoadingState, Toast,
} from '../../Masters/_components/MasterPageWrapper'
import {
  extractError, hasRole, ROLES,
} from '../../../../../utils/helpers'
import { selectUser } from '../../../../../app/DashboardSlice'

const ROLES_LIST = ['SuperAdmin', 'Admin', 'Manager']

const EMPTY_USER = {
  name: '', email: '', password: '', role: 'Manager',
}

const EMPTY_PWD = {
  current_password: '', new_password: '', confirm_password: '',
}

export default function UserForm() {
  const navigate    = useNavigate()
  const { id }      = useParams()
  const isEdit      = Boolean(id)
  const currentUser = useSelector(selectUser)
  const isSuperAdmin = hasRole(currentUser, ROLES.SUPER_ADMIN)
  const isSelf      = id === currentUser?.id

  const [form,       setForm]       = useState(EMPTY_USER)
  const [pwdForm,    setPwdForm]    = useState(EMPTY_PWD)
  const [showPwdTab, setShowPwdTab] = useState(false)
  const [loading,    setLoading]    = useState(isEdit)
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState({ type: '', message: '' })

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const res = await UserManagementRepo.getById(id)
        const d   = res.data
        setForm({
          name:     d.name  || '',
          email:    d.email || '',
          password: '',
          role:     d.role  || 'Manager',
        })
      } catch (err) {
        setToast({ type: 'error', message: extractError(err) })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handlePwdChange = (e) => {
    setPwdForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  // ── Save user details ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        const payload = {
          name: form.name.trim(),
          role: form.role,
        }
        await UserManagementRepo.update(id, payload)
        setToast({ type: 'success', message: 'User updated successfully' })
      } else {
        await UserManagementRepo.create({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
          role:     form.role,
        })
        navigate('/admin/users')
      }
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) })
    } finally {
      setSaving(false)
    }
  }

  // ── Change password ────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setToast({ type: 'error', message: 'New passwords do not match' })
      return
    }
    setSaving(true)
    try {
      await UserManagementRepo.changePassword(
        pwdForm.current_password,
        pwdForm.new_password
      )
      setToast({ type: 'success', message: 'Password changed successfully' })
      setPwdForm(EMPTY_PWD)
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <FormPageWrapper
      title={isEdit ? 'Edit User' : 'Add User'}
      subtitle={isEdit ? form.email : 'Create a new system user'}
      backPath="/admin/users"
    >
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Tabs — only in edit mode */}
      {isEdit && (
        <div className="flex gap-1 card p-1 w-fit">
          {[
            { key: false, label: 'Details'  },
            { key: true,  label: 'Change Password' },
          ].map(({ key, label }) => (
            <button
              key={String(key)}
              onClick={() => setShowPwdTab(key)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg
                          transition-colors
                          ${showPwdTab === key
                            ? 'bg-amber-500 text-gray-900'
                            : 'text-gray-600 hover:text-gray-900'
                          }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── User Details Form ──────────────────────────────── */}
      {!showPwdTab && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="label">Full Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Sachin Patil"
              required
              className="input-field"
            />
          </div>

          {/* Email — disabled on edit */}
          <div>
            <label className="label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="sachin@rautindustries.com"
              required
              disabled={isEdit}
              className="input-field disabled:opacity-50
                         disabled:cursor-not-allowed"
            />
            {isEdit && (
              <p className="text-xs text-gray-600 mt-1.5">
                Email cannot be changed after account creation
              </p>
            )}
          </div>

          {/* Password — only on create */}
          {!isEdit && (
            <div>
              <label className="label">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="input-field"
              />
            </div>
          )}

          {/* Role — SuperAdmin only can assign SuperAdmin role */}
          <div>
            <label className="label">Role *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="select-field"
            >
              {ROLES_LIST.filter((r) =>
                isSuperAdmin ? true : r !== 'SuperAdmin'
              ).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1.5">
              {form.role === 'SuperAdmin' && 'Full access to all modules'}
              {form.role === 'Admin'      && 'Masters management + all reports'}
              {form.role === 'Manager'    && 'Bills + attendance entry'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn-secondary flex-1 justify-center"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 justify-center"
              disabled={saving}
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                : isEdit ? 'Save Changes' : 'Create User'
              }
            </button>
          </div>
        </form>
      )}

      {/* ── Change Password Form ───────────────────────────── */}
      {showPwdTab && (
        <form onSubmit={handleChangePassword} className="card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b
                          border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border
                            border-amber-500/20 flex items-center
                            justify-center">
              <KeyRound size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Change Password
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                You can only change your own password
              </p>
            </div>
          </div>

          {!isSelf && (
            <div className="bg-gray-100/50 border border-gray-200/50
                            rounded-xl px-4 py-3">
              <p className="text-xs text-gray-600">
                Password changes can only be made by the account owner.
                This user must log in and change their own password.
              </p>
            </div>
          )}

          {isSelf && (
            <>
              <div>
                <label className="label">Current Password *</label>
                <input
                  type="password"
                  name="current_password"
                  value={pwdForm.current_password}
                  onChange={handlePwdChange}
                  placeholder="Enter current password"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">New Password *</label>
                <input
                  type="password"
                  name="new_password"
                  value={pwdForm.new_password}
                  onChange={handlePwdChange}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={pwdForm.confirm_password}
                  onChange={handlePwdChange}
                  placeholder="Re-enter new password"
                  required
                  className="input-field"
                />
                {pwdForm.confirm_password &&
                  pwdForm.new_password !== pwdForm.confirm_password && (
                  <p className="text-xs text-red-400 mt-1.5">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPwdForm(EMPTY_PWD)}
                  className="btn-secondary flex-1 justify-center"
                  disabled={saving}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center"
                  disabled={
                    saving ||
                    pwdForm.new_password !== pwdForm.confirm_password
                  }
                >
                  {saving
                    ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                    : 'Change Password'
                  }
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </FormPageWrapper>
  )
}