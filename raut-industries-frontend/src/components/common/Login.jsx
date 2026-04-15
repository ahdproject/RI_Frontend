import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { setUser } from '../../app/DashboardSlice'
import { saveSession, extractError } from '../../utils/helpers'
import AdminAuthRepo from '../../services/repository/Admin/AdminAuthRepo'

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => {
    setError('')
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await AdminAuthRepo.login(form.email, form.password)
      const { token, user } = res.data

      // Persist to localStorage
      saveSession(token, user)

      // Update Redux
      dispatch(setUser({ token, user }))

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">

      {/* Background subtle grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#f59e0b 1px, transparent 1px),
                            linear-gradient(90deg, #f59e0b 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14
                          bg-amber-500 rounded-2xl mb-4 shadow-lg shadow-amber-500/20">
            <span className="text-gray-900 font-black text-xl tracking-tight">RI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Raut Industries
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            ERP System · Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="card p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border
                              border-red-500/30 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@rautindustries.com"
                autoComplete="email"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="input-field pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-600 hover:text-gray-900 transition-colors"
                  tabIndex={-1}
                >
                  {showPass
                    ? <EyeOff size={16} />
                    : <Eye size={16} />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : 'Sign In'
              }
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Raut Industries ERP · Khairane MIDC, Navi Mumbai
        </p>

      </div>
    </div>
  )
}