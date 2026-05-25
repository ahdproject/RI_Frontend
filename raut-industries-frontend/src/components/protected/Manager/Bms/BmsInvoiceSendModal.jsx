import { useState } from 'react'
import { Send, X, CheckCircle, Loader2 } from 'lucide-react'
import Connector from '../../../../../services/Connector'
import Apis from '../../../../../services/Apis'
import { extractError } from '../../../../../utils/helpers'

export default function BmsInvoiceSendModal({ invoice, onClose, onSent }) {
  const invId = invoice?.invoice_id || invoice?.id

  const [sendForm, setSendForm] = useState({
    email:        invoice?.client_email || '',
    send_copy_to: '',
    message:      '',
  })
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  const handleSend = async () => {
    if (!sendForm.email.trim()) return setError('Recipient email is required')
    setSending(true); setError('')

    try {
      await Connector.post(Apis.bmsSendInvoice(invId), {
        email:        sendForm.email.trim(),
        send_copy_to: sendForm.send_copy_to
          ? sendForm.send_copy_to.split(',').map(e => e.trim()).filter(Boolean)
          : [],
        message: sendForm.message.trim() || undefined,
      })
      setDone(true)
      setTimeout(() => { onSent(); onClose() }, 2000)
    } catch (e) {
      setError(extractError(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="rounded-2xl border w-full max-w-md shadow-xl"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>

        <div className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--surface-border)' }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>Send Invoice</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {invoice?.invoice_number} · BMS emails PDF with your template
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {done ? (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <CheckCircle size={52} className="text-green-500" />
              <p className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>Sent!</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {invoice?.invoice_number} emailed to <strong>{sendForm.email}</strong>
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
              )}

              {[['To (Email) *', 'email', 'email'], ['CC (comma-separated)', 'send_copy_to', 'text']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input type={type} value={sendForm[key]}
                    onChange={e => setSendForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-main)' }} />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Message</label>
                <textarea rows={3} value={sendForm.message}
                  onChange={e => setSendForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Optional message…"
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none focus:ring-2"
                  style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-main)' }} />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button onClick={onClose}
                  className="px-4 py-2 rounded-xl border text-sm"
                  style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}>
                  Cancel
                </button>
                <button onClick={handleSend}
                  disabled={sending || !sendForm.email.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: 'var(--brand-primary)' }}>
                  {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}