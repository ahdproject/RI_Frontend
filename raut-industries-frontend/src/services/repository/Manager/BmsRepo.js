// raut-industries-frontend/src/services/repository/Manager/BmsRepo.js
import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL: BASE })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('raut_token') || localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS  →  Raut Industries /api/clients
// Response shape the component expects: res.value.data?.data → array of
// { client_id, client_name, client_code, email, phone, gstin, billing_address }
// ─────────────────────────────────────────────────────────────────────────────
export const listBmsClientsApi = async (params = {}) => {
  const res = await api.get('/clients', { params })
  const raw = res.data?.data ?? []
  const mapped = raw.map(c => ({
    client_id:       c.id,
    client_name:     c.name,
    client_code:     c.gstin ? c.gstin.slice(0, 6) : String(c.id),
    email:           c.email  || '',
    phone:           c.phone  || '',
    gstin:           c.gstin  || '',
    pan:             '',
    billing_address: c.address || '',
    state_code:      c.state_code || '',
  }))
  return { data: { success: true, data: mapped } }
}

// CREATE client → saves to Raut Industries DB (not BMS directly)
// Component expects: res.data.success && res.data.data?.data || res.data.data
// with { client_id, client_name } on the result
export const createBmsClientApi = async (data) => {
  // Extract state_code from GSTIN (first 2 chars) or fallback to '27' (Maharashtra)
  const state_code = data.gstin?.length >= 2 ? data.gstin.slice(0, 2) : '27'
  const res = await api.post('/clients', {
    name:       data.client_name,
    address:    data.billing_address || null,
    gstin:      data.gstin   || null,
    phone:      data.phone   || null,
    state_code,
  })
  const c = res.data?.data ?? res.data
  // Return in BMS-like shape so component's res.data.data?.data works
  return {
    data: {
      success: true,
      data: {
        data: {
          client_id:       c.id,
          client_name:     c.name,
          email:           data.email || '',
          phone:           c.phone   || data.phone || '',
          gstin:           c.gstin   || '',
          billing_address: c.address || '',
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GST RATES  →  Raut Industries /api/gst-slabs
// Component expects: res.value.data?.data → array of { tax_rate_id, rate }
// ─────────────────────────────────────────────────────────────────────────────
export const listBmsGstRatesApi = async () => {
  const res = await api.get('/gst-slabs', { params: { active: 'true' } })
  const raw = res.data?.data ?? []
  const mapped = raw.map(s => ({
    tax_rate_id: s.id,
    rate:        (parseFloat(s.cgst_rate) + parseFloat(s.sgst_rate)) || parseFloat(s.igst_rate) || 0,
    label:       s.label,
    cgst_rate:   s.cgst_rate,
    sgst_rate:   s.sgst_rate,
    igst_rate:   s.igst_rate,
  }))
  return { data: { success: true, data: mapped } }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICULARS  →  Raut Industries /api/products  (shown as "Products" in sidebar)
// Component expects: res.value.data?.data → array of { particular_id, name, default_rate, rate }
// ─────────────────────────────────────────────────────────────────────────────
export const listBmsParticularsApi = async () => {
  const res = await api.get('/products', { params: { activeOnly: true } })
  const raw = res.data?.data ?? []
  const mapped = raw.map(p => ({
    particular_id: p.id,
    name:          p.name,
    description:   p.description,
    hsn_code:      p.hsn_code,
    unit:          p.unit,
    default_rate:  p.default_rate,
    rate:          p.default_rate,   // alias used in component
    cgst_rate:     p.cgst_rate,
    sgst_rate:     p.sgst_rate,
    igst_rate:     p.igst_rate,
  }))
  return { data: { success: true, data: mapped } }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT MODES  →  /api/bms/payment-modes  (static list from backend)
// Component expects: res.value.data?.data → array of { payment_mode_id, mode_name }
// ─────────────────────────────────────────────────────────────────────────────
export const listBmsPaymentModesApi = async () => {
  const res = await api.get('/bms/payment-modes')
  const raw = res.data?.data ?? []
  const mapped = raw.map(m => ({
    payment_mode_id: m.id,
    mode_name:       m.name,
  }))
  return { data: { success: true, data: mapped } }
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICES  →  BMS via /api/bms/invoices
// ─────────────────────────────────────────────────────────────────────────────
export const listBmsInvoicesApi = (params = {}) =>
  api.get('/bms/invoices', { params })

export const getBmsInvoiceByIdApi = (id) =>
  api.get(`/bms/invoices/${id}`)

export const createBmsInvoiceApi = (data) =>
  api.post('/bms/invoices', data)

// Component calls: sendBmsInvoiceApi(id, { email, send_copy_to, message })
export const sendBmsInvoiceApi = (id, body) =>
  api.post(`/bms/invoices/${id}/send`, body)

// PDF download — returns axios response with blob data
export const downloadBmsInvoicePdf = (id) =>
  api.get(`/bms/invoices/${id}/pdf`, { responseType: 'arraybuffer' })

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS  →  BMS via /api/bms/payments
// Component calls: createBmsPaymentApi({ invoice_id, amount, payment_date, ... })
// ─────────────────────────────────────────────────────────────────────────────
export const createBmsPaymentApi = (data) =>
  api.post('/bms/payments', data)