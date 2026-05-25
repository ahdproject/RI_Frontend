import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import Connector from '../../../../services/Connector'
import Apis from '../../../../services/Apis'
import { extractError } from '../../../../utils/helpers'

const fmt = (n) => Number(n || 0).toFixed(2)

export default function BmsCreateInvoice() {
  const navigate = useNavigate()

  const [clients,    setClients]    = useState([])
  const [taxRates,   setTaxRates]   = useState([])
  const [particulars,setParticulars]= useState([])
  const [loading,    setLoading]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const due30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)

  const [form, setForm] = useState({
    client_id:    '',
    invoice_date: today,
    due_date:     due30,
    notes:        '',
  })

  const [items, setItems] = useState([{
    particular_id: '', item_name: '', hsn_sac_code: '',
    quantity: 1, unit_price: 0, uom: 'NOS',
    tax_rate_id: '', tax_percentage: 0, discount_percentage: 0,
  }])

  // Load master data from BMS
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [c, t, p] = await Promise.all([
          Connector.get(Apis.bmsClients,      { params: { limit: 200 } }),
          Connector.get(Apis.bmsTaxRates,     { params: { limit: 50  } }),
          Connector.get(Apis.bmsParticulars,  { params: { limit: 200 } }),
        ])
        const extract = (res) => {
          const d = res.data?.data
          return Array.isArray(d?.clients)     ? d.clients
               : Array.isArray(d?.tax_rates)  ? d.tax_rates
               : Array.isArray(d?.particulars)? d.particulars
               : Array.isArray(d)             ? d
               : []
        }
        setClients(extract(c))
        setTaxRates(extract(t))
        setParticulars(extract(p))
      } catch (e) {
        setError('Failed to load BMS masters: ' + extractError(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addItem = () => setItems(p => [...p, {
    particular_id: '', item_name: '', hsn_sac_code: '',
    quantity: 1, unit_price: 0, uom: 'NOS',
    tax_rate_id: '', tax_percentage: 0, discount_percentage: 0,
  }])

  const removeItem = (i) => setItems(p => p.filter((_, j) => j !== i))

  const updateItem = (i, key, val) => {
    setItems(p => {
      const rows = [...p]
      rows[i] = { ...rows[i], [key]: val }

      if (key === 'particular_id') {
        const pt = particulars.find(x => String(x.particular_id) === String(val))
        if (pt) Object.assign(rows[i], {
          item_name:     pt.particular_name,
          hsn_sac_code:  pt.hsn_sac_code || '',
          unit_price:    parseFloat(pt.default_unit_price || 0),
          uom:           pt.uom || 'NOS',
          tax_rate_id:   pt.tax_rate_id || '',
          tax_percentage: taxRates.find(x => x.tax_rate_id === pt.tax_rate_id)?.tax_percentage || 0,
        })
      }
      if (key === 'tax_rate_id') {
        const tr = taxRates.find(x => String(x.tax_rate_id) === String(val))
        rows[i].tax_percentage = tr ? parseFloat(tr.tax_percentage) : 0
      }
      return rows
    })
  }

  // Compute totals
  const computed = items.map(r => {
    const amount  = r.quantity * r.unit_price * (1 - (r.discount_percentage || 0) / 100)
    const gstAmt  = amount * r.tax_percentage / 100
    return { ...r, amount, gstAmt, total: amount + gstAmt }
  })
  const subtotal   = computed.reduce((s, r) => s + r.amount,  0)
  const totalGST   = computed.reduce((s, r) => s + r.gstAmt,  0)
  const grandTotal = subtotal + totalGST

  const handleSave = async () => {
    if (!form.client_id)       return setError('Select a client')
    if (items.some(r => !r.item_name)) return setError('All items need a description')

    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await Connector.post(Apis.bmsInvoices, {
        client_id:    parseInt(form.client_id),
        invoice_date: form.invoice_date,
        due_date:     form.due_date,
        notes:        form.notes || null,
        items: computed.map(r => ({
          particular_id:        r.particular_id ? parseInt(r.particular_id) : null,
          item_name:            r.item_name,
          hsn_sac_code:         r.hsn_sac_code || null,
          quantity:             r.quantity,
          unit_price:           r.unit_price,
          uom:                  r.uom,
          tax_rate_id:          r.tax_rate_id ? parseInt(r.tax_rate_id) : null,
          discount_percentage:  r.discount_percentage || 0,
        })),
      })
      const inv = res.data?.data?.invoice || res.data?.data
      setSuccess(`Invoice ${inv?.invoice_number || ''} created in BMS!`)
      setTimeout(() => navigate('/bms/invoices'), 1500)
    } catch (e) {
      setError('BMS Error: ' + extractError(e))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-sm"
      style={{ color: 'var(--text-muted)' }}>
      Loading BMS masters…
    </div>
  )

  const inp = 'w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2'
  const inpStyle = {
    backgroundColor: 'var(--surface-bg)',
    borderColor:     'var(--surface-border)',
    color:           'var(--text-main)',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/bms/invoices')}
            className="p-2 rounded-lg hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              Create BMS Invoice
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Uses BMS clients, particulars, tax rates and template
            </p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50">
          <Save size={14} />
          {saving ? 'Creating…' : 'Create Invoice'}
        </button>
      </div>

      {error   && <div className="mb-4 p-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-700">{success}</div>}

      <div className="space-y-5">
        {/* Header fields */}
        <div className="card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Client (from BMS) <span className="text-red-500">*</span>
            </label>
            <select value={form.client_id}
              onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              className={inp} style={inpStyle}>
              <option value="">— Select BMS Client —</option>
              {clients.map(c => (
                <option key={c.client_id || c.id} value={c.client_id || c.id}>
                  {c.client_name || c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Invoice Date</label>
            <input type="date" value={form.invoice_date}
              onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))}
              className={inp} style={inpStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Due Date</label>
            <input type="date" value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              className={inp} style={inpStyle} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes / Terms</label>
            <textarea rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Payment terms, delivery info…"
              className={inp + ' resize-none'} style={inpStyle} />
          </div>
        </div>

        {/* Line items */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
              Line Items
            </h3>
            <button onClick={addItem} className="btn-primary text-xs flex items-center gap-1">
              <Plus size={12} /> Add Item
            </button>
          </div>

          {items.map((row, i) => (
            <div key={i} className="mb-4 p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold" style={{ color: 'var(--brand-primary)' }}>
                  Line #{i + 1}
                </span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="col-span-2 md:col-span-3">
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Particular (BMS)</label>
                  <select value={row.particular_id}
                    onChange={e => updateItem(i, 'particular_id', e.target.value)}
                    className={inp} style={inpStyle}>
                    <option value="">— Select or type description below —</option>
                    {particulars.map(p => (
                      <option key={p.particular_id} value={p.particular_id}>
                        {p.particular_code ? `${p.particular_code} — ` : ''}{p.particular_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Description</label>
                  <input value={row.item_name}
                    onChange={e => updateItem(i, 'item_name', e.target.value)}
                    placeholder="Item description"
                    className={inp} style={inpStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>HSN/SAC</label>
                  <input value={row.hsn_sac_code}
                    onChange={e => updateItem(i, 'hsn_sac_code', e.target.value)}
                    className={inp + ' font-mono'} style={inpStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Qty</label>
                  <input type="number" min="0.01" step="0.01" value={row.quantity}
                    onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                    className={inp} style={inpStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>UOM</label>
                  <input value={row.uom}
                    onChange={e => updateItem(i, 'uom', e.target.value)}
                    className={inp} style={inpStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Rate (₹)</label>
                  <input type="number" min="0" step="0.01" value={row.unit_price}
                    onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                    className={inp} style={inpStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tax Rate (BMS)</label>
                  <select value={row.tax_rate_id}
                    onChange={e => updateItem(i, 'tax_rate_id', e.target.value)}
                    className={inp} style={inpStyle}>
                    <option value="">No Tax</option>
                    {taxRates.map(t => (
                      <option key={t.tax_rate_id} value={t.tax_rate_id}>
                        {t.tax_name} ({t.tax_percentage}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Discount %</label>
                  <input type="number" min="0" max="100" step="0.5" value={row.discount_percentage}
                    onChange={e => updateItem(i, 'discount_percentage', parseFloat(e.target.value) || 0)}
                    className={inp} style={inpStyle} />
                </div>

                {/* Row totals */}
                <div className="col-span-2 md:col-span-3 flex gap-4 text-xs pt-1"
                  style={{ color: 'var(--text-muted)' }}>
                  <span>Amount: <strong style={{ color: 'var(--text-main)' }}>₹{fmt(computed[i]?.amount)}</strong></span>
                  <span>GST: <strong className="text-amber-500">₹{fmt(computed[i]?.gstAmt)}</strong></span>
                  <span>Total: <strong className="text-green-600">₹{fmt(computed[i]?.total)}</strong></span>
                </div>
              </div>
            </div>
          ))}

          {/* Grand total */}
          {items.length > 0 && (
            <div className="flex justify-between items-center p-3 rounded-xl text-sm mt-2"
              style={{ backgroundColor: 'var(--surface-bg)' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Subtotal: <strong style={{ color: 'var(--text-main)' }}>₹{fmt(subtotal)}</strong>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                GST: <strong className="text-amber-500">₹{fmt(totalGST)}</strong>
              </span>
              <span className="font-bold text-base" style={{ color: 'var(--brand-primary)' }}>
                Grand Total: ₹{fmt(grandTotal)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}