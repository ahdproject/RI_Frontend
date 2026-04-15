import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

// ─── Page wrapper used by all List pages ─────────────────────
export const ListPageWrapper = ({ title, subtitle, action, children }) => (
  <div className="space-y-5">
    <div className="page-header">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
    {children}
  </div>
)

// ─── Page wrapper used by all Form pages ─────────────────────
export const FormPageWrapper = ({ title, subtitle, backPath, children }) => {
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(backPath)}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-600 hover:text-gray-900 hover:bg-gray-100
                     transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Loading state ────────────────────────────────────────────
export const LoadingState = () => (
  <div className="flex items-center justify-center h-48">
    <Loader2 size={28} className="animate-spin text-amber-500" />
  </div>
)

// ─── Error state ──────────────────────────────────────────────
export const ErrorState = ({ message }) => (
  <div className="flex items-start gap-3 bg-red-500/10 border
                  border-red-500/30 rounded-xl p-5 max-w-lg">
    <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-sm font-semibold text-red-400">
        Failed to load data
      </p>
      <p className="text-xs text-red-400/70 mt-1">{message}</p>
    </div>
  </div>
)

// ─── Empty state ──────────────────────────────────────────────
export const EmptyState = ({ message = 'No records found' }) => (
  <div className="text-center py-16">
    <p className="text-gray-600 text-sm">{message}</p>
  </div>
)

// ─── Toast (inline feedback bar) ─────────────────────────────
export const Toast = ({ type, message, onClose }) => {
  if (!message) return null
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error:   'bg-red-500/10 border-red-500/30 text-red-400',
  }
  return (
    <div className={`flex items-center justify-between gap-3
                     border rounded-xl px-4 py-3 ${styles[type]}`}>
      <p className="text-sm">{message}</p>
      <button
        onClick={onClose}
        className="text-xs opacity-60 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  )
}

// ─── Confirm modal ────────────────────────────────────────────
export const ConfirmModal = ({ message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center
                  p-4 bg-white/80 backdrop-blur-sm">
    <div className="card w-full max-w-sm p-6 space-y-4
                    shadow-2xl shadow-black/40">
      <p className="text-sm text-gray-900 leading-relaxed">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="btn-secondary text-xs"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="btn-danger text-xs"
          disabled={loading}
        >
          {loading
            ? <><Loader2 size={12} className="animate-spin" /> Processing...</>
            : 'Confirm'
          }
        </button>
      </div>
    </div>
  </div>
)