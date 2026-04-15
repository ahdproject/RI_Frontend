import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Loader2, RefreshCw } from 'lucide-react'
import BillsRepo   from '../../../../services/repository/Manager/BillsRepo'
import MastersRepo from '../../../../services/repository/Admin/MastersRepo'
import {
  FormPageWrapper, LoadingState, Toast,
} from '../../Admin/Masters/_components/MasterPageWrapper'
import {
  formatCurrency, formatNumber,
  extractError, todayISO,
} from '../../../../utils/helpers'

// ─── Empty line item & charge ──────────────────────────────────
const emptyLine = () => ({
  _key:        Date.now() + Math.random(),
  product_id:  '',
  description: '',
  qty:         '',
  rate:        '',
})

const emptyCharge = () => ({
  _key:           Date.now() + Math.random(),
  charge_type_id: '',
  custom_name:    '',
  qty:            '',
  rate:           '',
})

// ─── Preview Panel ────────────────────────────────────────────
const PreviewPanel = ({ preview, calculating }) => {
  if (!preview && !calculating) return null

  return (
    <div className="card p-5 space-y-3 sticky top-20">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Live Calculation
        </p>
        {calculating && (
          <Loader2 size={13} className="animate-spin text-amber-400" />
        )}
      </div>

      {preview && (
        <>
          {[
            { label: 'Subtotal (excl. GST)', value: formatCurrency(preview.totals?.subtotal),         color: 'text-gray-900' },
            { label: 'CGST',                 value: formatCurrency(preview.totals?.cgst_total),        color: 'text-gray-600' },
            { label: 'SGST',                 value: formatCurrency(preview.totals?.sgst_total),        color: 'text-gray-600' },
            { label: 'IGST',                 value: formatCurrency(preview.totals?.igst_total),        color: 'text-gray-600' },
            { label: 'Total with GST',        value: formatCurrency(preview.totals?.total_with_gst),   color: 'text-amber-400 font-bold' },
          ].map((r) => (
            <div key={r.label} className="flex justify-between items-center
                                          text-xs border-b border-gray-200/50 pb-2">
              <span className="text-gray-600">{r.label}</span>
              <span className={r.color}>{r.value}</span>
            </div>
          ))}

          <div className="pt-1 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Other Charges</span>
              <span className="text-gray-900">
                {formatCurrency(preview.totals?.other_charges_total)}
              </span>
            </div>
            <div className="flex justify-between text-xs
                            bg-gray-100/50 rounded-lg px-3 py-2">
              <span className="text-gray-600 font-medium">Difference</span>
              <span className="text-emerald-400 font-bold">
                {formatCurrency(preview.totals?.difference_amount)}
              </span>
            </div>
            <div className="flex justify-between text-xs
                            bg-amber-500/10 border border-amber-500/20
                            rounded-lg px-3 py-2">
              <span className="text-amber-400 font-medium">Per Piece</span>
              <span className="text-amber-400 font-bold">
                {formatCurrency(preview.totals?.per_piece_value)}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-gray-600">Total Pieces</span>
              <span className="text-gray-900">
                {formatNumber(preview.totals?.total_pieces, 0)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── BillForm ─────────────────────────────────────────────────
export default function BillForm() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  // Masters data
  const [clients,     setClients]     = useState([])
  const [products,    setProducts]    = useState([])
  const [chargeTypes, setChargeTypes] = useState([])

  // Form state
  const [billDate,    setBillDate]    = useState(todayISO())
  const [clientId,    setClientId]    = useState('')
  const [transport,   setTransport]   = useState('')
  const [vehicle,     setVehicle]     = useState('')
  const [placeOfSupply, setPlaceOfSupply] = useState('')
  const [refNumber,   setRefNumber]   = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [notes,       setNotes]       = useState('')
  const [lineItems,   setLineItems]   = useState([emptyLine()])
  const [otherCharges, setOtherCharges] = useState([])

  // UI state
  const [preview,     setPreview]     = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [nextNo,      setNextNo]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState({ type: '', message: '' })

  // ── Load masters + existing bill ──────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [clientRes, productRes, chargeRes, nextNoRes] =
          await Promise.all([
            MastersRepo.getAllClients(),
            MastersRepo.getAllProducts({ activeOnly: true }),
            MastersRepo.getAllChargeTypes(true),
            BillsRepo.getNextNumber(),
          ])

        setClients(clientRes.data     || [])
        setProducts(productRes.data   || [])
        setChargeTypes(chargeRes.data || [])
        setNextNo(nextNoRes.data?.next_bill_no)

        if (isEdit) {
          const billRes = await BillsRepo.getById(id)
          const b       = billRes.data

          setBillDate(b.bill_date?.split('T')[0] || todayISO())
          setClientId(b.client_id    || '')
          setTransport(b.transport_mode || '')
          setVehicle(b.vehicle_number   || '')
          setPlaceOfSupply(b.place_of_supply || '')
          setRefNumber(b.ref_number    || '')
          setPaymentTerms(b.payment_terms || '')
          setNotes(b.notes            || '')

          setLineItems(
            b.line_items?.map((li) => ({
              _key:        li.id,
              product_id:  li.product_id,
              description: li.description || '',
              qty:         li.qty,
              rate:        li.rate,
            })) || [emptyLine()]
          )

          setOtherCharges(
            b.other_charges?.map((oc) => ({
              _key:           oc.id,
              charge_type_id: oc.charge_type_id || '',
              custom_name:    oc.custom_name    || '',
              qty:            oc.qty,
              rate:           oc.rate,
            })) || []
          )
        }
      } catch (err) {
        setToast({ type: 'error', message: extractError(err) })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  // ── Auto-fill rate when product selected ──────────────────
  const handleProductSelect = (key, productId) => {
    const product = products.find((p) => p.id === productId)
    setLineItems((prev) =>
      prev.map((li) =>
        li._key === key
          ? {
              ...li,
              product_id:  productId,
              description: product?.name || '',
              rate:        product?.default_rate || '',
            }
          : li
      )
    )
  }

  // ── Live preview calculation ───────────────────────────────
  const runPreview = useCallback(async () => {
    if (!clientId) return
    const validLines = lineItems.filter(
      (li) => li.product_id && li.qty && li.rate
    )
    if (validLines.length === 0) return

    setCalculating(true)
    try {
      const payload = {
        client_id: clientId,
        line_items: validLines.map((li) => ({
          product_id:  li.product_id,
          description: li.description || undefined,
          qty:         Number(li.qty),
          rate:        Number(li.rate),
        })),
        other_charges: otherCharges
          .filter((oc) => oc.qty && oc.rate &&
            (oc.charge_type_id || oc.custom_name))
          .map((oc) => ({
            charge_type_id: oc.charge_type_id || undefined,
            custom_name:    oc.custom_name    || undefined,
            qty:            Number(oc.qty),
            rate:           Number(oc.rate),
          })),
      }
      const res = await BillsRepo.preview(payload)
      setPreview(res.data)
    } catch {
      // silently ignore preview errors
    } finally {
      setCalculating(false)
    }
  }, [clientId, lineItems, otherCharges])

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        bill_date:      billDate,
        client_id:      clientId,
        transport_mode: transport   || undefined,
        vehicle_number: vehicle     || undefined,
        place_of_supply: placeOfSupply || undefined,
        ref_number:     refNumber   || undefined,
        payment_terms:  paymentTerms || undefined,
        notes:          notes        || undefined,
        line_items: lineItems
          .filter((li) => li.product_id && li.qty && li.rate)
          .map((li, idx) => ({
            product_id:  li.product_id,
            description: li.description || undefined,
            qty:         Number(li.qty),
            rate:        Number(li.rate),
            sort_order:  idx + 1,
          })),
        other_charges: otherCharges
          .filter((oc) => oc.qty && oc.rate &&
            (oc.charge_type_id || oc.custom_name))
          .map((oc, idx) => ({
            charge_type_id: oc.charge_type_id || undefined,
            custom_name:    oc.custom_name    || undefined,
            qty:            Number(oc.qty),
            rate:           Number(oc.rate),
            sort_order:     idx + 1,
          })),
      }

      if (isEdit) {
        await BillsRepo.update(id, payload)
      } else {
        await BillsRepo.create(payload)
      }
      navigate('/bills')
    } catch (err) {
      setToast({ type: 'error', message: extractError(err) })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bills')}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-gray-600 hover:text-gray-900 hover:bg-gray-100
                       transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? `Edit Bill` : `New Bill`}
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">
              {isEdit
                ? 'Update draft bill'
                : `Bill #${nextNo || '—'} · ${billDate}`
              }
            </p>
          </div>
        </div>
        <button
          onClick={runPreview}
          className="btn-secondary text-xs"
          type="button"
        >
          <RefreshCw size={13} /> Recalculate
        </button>
      </div>

      {toast.message && (
        <div className="mb-5">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ type: '', message: '' })}
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: Form ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bill header */}
            <div className="card p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase
                            tracking-wide">
                Bill Details
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="label">Bill Date *</label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>

                {/* Client */}
                <div>
                  <label className="label">Client *</label>
                  <select
                    value={clientId}
                    onChange={(e) => {
                      setClientId(e.target.value)
                      setPreview(null)
                    }}
                    required
                    className="select-field"
                  >
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transport */}
                <div>
                  <label className="label">Transport Mode</label>
                  <input
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                    placeholder="By Road"
                    className="input-field"
                  />
                </div>

                {/* Vehicle */}
                <div>
                  <label className="label">Vehicle No.</label>
                  <input
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="MH-43-AO-9949"
                    className="input-field"
                  />
                </div>

                {/* Place of Supply */}
                <div>
                  <label className="label">Place of Supply</label>
                  <input
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    placeholder="Pawane"
                    className="input-field"
                  />
                </div>

                {/* Ref Number */}
                <div>
                  <label className="label">PO / Ref No.</label>
                  <input
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="PO-120"
                    className="input-field"
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="label">Payment Terms</label>
                  <input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="30 Days"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600 uppercase
                              tracking-wide">
                  Line Items
                </p>
                <button
                  type="button"
                  onClick={() => setLineItems((p) => [...p, emptyLine()])}
                  className="btn-secondary text-xs py-1.5"
                >
                  <Plus size={13} /> Add Row
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((li, idx) => (
                  <div
                    key={li._key}
                    className="grid grid-cols-12 gap-2 items-start
                               bg-gray-100/30 rounded-xl p-3"
                  >
                    {/* Product */}
                    <div className="col-span-5">
                      {idx === 0 && (
                        <label className="label mb-1">Product *</label>
                      )}
                      <select
                        value={li.product_id}
                        onChange={(e) =>
                          handleProductSelect(li._key, e.target.value)
                        }
                        required
                        className="select-field text-xs"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="col-span-3">
                      {idx === 0 && (
                        <label className="label mb-1">Description</label>
                      )}
                      <input
                        value={li.description}
                        onChange={(e) =>
                          setLineItems((prev) =>
                            prev.map((l) =>
                              l._key === li._key
                                ? { ...l, description: e.target.value }
                                : l
                            )
                          )
                        }
                        placeholder="Optional"
                        className="input-field text-xs"
                      />
                    </div>

                    {/* Qty */}
                    <div className="col-span-1">
                      {idx === 0 && (
                        <label className="label mb-1">Qty *</label>
                      )}
                      <input
                        type="number"
                        value={li.qty}
                        onChange={(e) =>
                          setLineItems((prev) =>
                            prev.map((l) =>
                              l._key === li._key
                                ? { ...l, qty: e.target.value }
                                : l
                            )
                          )
                        }
                        placeholder="0"
                        min="0"
                        step="any"
                        required
                        className="input-field text-xs text-center"
                      />
                    </div>

                    {/* Rate */}
                    <div className="col-span-2">
                      {idx === 0 && (
                        <label className="label mb-1">Rate (₹) *</label>
                      )}
                      <input
                        type="number"
                        value={li.rate}
                        onChange={(e) =>
                          setLineItems((prev) =>
                            prev.map((l) =>
                              l._key === li._key
                                ? { ...l, rate: e.target.value }
                                : l
                            )
                          )
                        }
                        placeholder="0"
                        min="0"
                        step="any"
                        required
                        className="input-field text-xs"
                      />
                    </div>

                    {/* Amount preview */}
                    <div className="col-span-1 flex flex-col justify-end
                                    pb-0.5">
                      {idx === 0 && (
                        <label className="label mb-1 invisible">Amt</label>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-400 font-medium">
                          {li.qty && li.rate
                            ? `₹${(Number(li.qty) * Number(li.rate)).toLocaleString('en-IN')}`
                            : '—'
                          }
                        </span>
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setLineItems((prev) =>
                                prev.filter((l) => l._key !== li._key)
                              )
                            }
                            className="text-gray-600 hover:text-red-400
                                       transition-colors ml-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Recalculate after editing */}
              {lineItems.some((li) => li.product_id && li.qty && li.rate) && (
                <button
                  type="button"
                  onClick={runPreview}
                  className="text-xs text-amber-400 hover:text-amber-300
                             flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} /> Update Calculation
                </button>
              )}
            </div>

            {/* Other Charges */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase
                                tracking-wide">
                    Other Charges
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Optional — Packing, Labour, Transport, Nails etc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOtherCharges((p) => [...p, emptyCharge()])
                  }
                  className="btn-secondary text-xs py-1.5"
                >
                  <Plus size={13} /> Add Charge
                </button>
              </div>

              {otherCharges.length === 0 ? (
                <p className="text-xs text-gray-700 italic py-2">
                  No other charges added
                </p>
              ) : (
                <div className="space-y-3">
                  {otherCharges.map((oc, idx) => (
                    <div
                      key={oc._key}
                      className="grid grid-cols-12 gap-2 items-start
                                 bg-gray-100/30 rounded-xl p-3"
                    >
                      {/* Charge type */}
                      <div className="col-span-4">
                        {idx === 0 && (
                          <label className="label mb-1">Charge Type</label>
                        )}
                        <select
                          value={oc.charge_type_id}
                          onChange={(e) =>
                            setOtherCharges((prev) =>
                              prev.map((c) =>
                                c._key === oc._key
                                  ? {
                                      ...c,
                                      charge_type_id: e.target.value,
                                      custom_name: '',
                                    }
                                  : c
                              )
                            )
                          }
                          className="select-field text-xs"
                        >
                          <option value="">Custom / Other</option>
                          {chargeTypes.map((ct) => (
                            <option key={ct.id} value={ct.id}>
                              {ct.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Custom name if no type selected */}
                      <div className="col-span-3">
                        {idx === 0 && (
                          <label className="label mb-1">Custom Name</label>
                        )}
                        <input
                          value={oc.custom_name}
                          onChange={(e) =>
                            setOtherCharges((prev) =>
                              prev.map((c) =>
                                c._key === oc._key
                                  ? { ...c, custom_name: e.target.value }
                                  : c
                              )
                            )
                          }
                          placeholder={oc.charge_type_id ? '—' : 'e.g. Nails'}
                          disabled={Boolean(oc.charge_type_id)}
                          className="input-field text-xs
                                     disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Qty */}
                      <div className="col-span-2">
                        {idx === 0 && (
                          <label className="label mb-1">Qty</label>
                        )}
                        <input
                          type="number"
                          value={oc.qty}
                          onChange={(e) =>
                            setOtherCharges((prev) =>
                              prev.map((c) =>
                                c._key === oc._key
                                  ? { ...c, qty: e.target.value }
                                  : c
                              )
                            )
                          }
                          placeholder="0"
                          min="0"
                          step="any"
                          className="input-field text-xs text-center"
                        />
                      </div>

                      {/* Rate */}
                      <div className="col-span-2">
                        {idx === 0 && (
                          <label className="label mb-1">Rate (₹)</label>
                        )}
                        <input
                          type="number"
                          value={oc.rate}
                          onChange={(e) =>
                            setOtherCharges((prev) =>
                              prev.map((c) =>
                                c._key === oc._key
                                  ? { ...c, rate: e.target.value }
                                  : c
                              )
                            )
                          }
                          placeholder="0"
                          min="0"
                          step="any"
                          className="input-field text-xs"
                        />
                      </div>

                      {/* Amount + delete */}
                      <div className="col-span-1 flex items-end
                                      justify-between pb-0.5">
                        {idx === 0 && (
                          <label className="label mb-1 invisible">×</label>
                        )}
                        <span className="text-xs text-emerald-400 font-medium">
                          {oc.qty && oc.rate
                            ? `₹${(Number(oc.qty) * Number(oc.rate))
                                .toLocaleString('en-IN')}`
                            : '—'
                          }
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setOtherCharges((prev) =>
                              prev.filter((c) => c._key !== oc._key)
                            )
                          }
                          className="text-gray-600 hover:text-red-400
                                     transition-colors ml-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="card p-5">
              <label className="label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes (optional)"
                rows={2}
                className="input-field resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/bills')}
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
                  : isEdit ? 'Save Changes' : 'Create Bill'
                }
              </button>
            </div>

          </div>

          {/* ── Right: Live Preview ─────────────────────────── */}
          <div className="lg:col-span-1">
            <PreviewPanel preview={preview} calculating={calculating} />
          </div>

        </div>
      </form>
    </div>
  )
}