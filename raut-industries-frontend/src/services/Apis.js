const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

// ── Dashboard endpoints (Raut Industries backend) ────────────────────────────
export const dashboardEndpoints = {
  GET_DASHBOARD_STATS:          { type: 'GET', url: `${BASE}/reports/dashboard` },
  GET_RECENT_ACTIVITY:          { type: 'GET', url: `${BASE}/reports/dashboard` },
  GET_CHARTS:                   { type: 'GET', url: `${BASE}/reports/dashboard` },
  GET_UPCOMING_DUE:             { type: 'GET', url: `${BASE}/reports/dashboard` },
  GET_TOP_CLIENTS:              { type: 'GET', url: `${BASE}/reports/dashboard` },
  GET_CASH_FLOW_SUMMARY:        { type: 'GET', url: `${BASE}/reports/dashboard` },
  GET_INVOICE_STATUS_BREAKDOWN: { type: 'GET', url: `${BASE}/reports/dashboard` },
}

// ── Report endpoints (Raut Industries backend) ───────────────────────────────
export const reportEndpoints = {
  GET_INVOICE_REGISTER:         { type: 'GET', url: `${BASE}/reports/sales`      },
  GET_PAYMENT_REGISTER:         { type: 'GET', url: `${BASE}/reports/pnl`        },
  GET_OUTSTANDING_RECEIVABLES:  { type: 'GET', url: `${BASE}/reports/dashboard`  },
  GET_AGING_REPORT:             { type: 'GET', url: `${BASE}/reports/dashboard`  },
  GET_TAX_SUMMARY:              { type: 'GET', url: `${BASE}/reports/gst`        },
  GET_REVENUE_REPORT:           { type: 'GET', url: `${BASE}/reports/sales`      },
  GET_COLLECTION_REPORT:        { type: 'GET', url: `${BASE}/reports/dashboard`  },
  GET_CLIENT_WISE_SUMMARY:      { type: 'GET', url: `${BASE}/reports/sales`      },
  GET_PARTICULAR_WISE_SUMMARY:  { type: 'GET', url: `${BASE}/reports/sales`      },
}

export const exportEndpoints = {
  EXPORT_INVOICE_REGISTER:      { type: 'GET', url: `${BASE}/reports/sales`      },
  EXPORT_PAYMENT_REGISTER:      { type: 'GET', url: `${BASE}/reports/pnl`        },
  EXPORT_OUTSTANDING_RECEIVABLES:{ type: 'GET', url: `${BASE}/reports/dashboard` },
  EXPORT_AGING_REPORT:          { type: 'GET', url: `${BASE}/reports/dashboard`  },
  EXPORT_CLIENT_WISE_SUMMARY:   { type: 'GET', url: `${BASE}/reports/sales`      },
  EXPORT_TALLY:                 { type: 'GET', url: `${BASE}/reports/sales`      },
}
const Apis = {

  // ── Auth ────────────────────────────────────────────────────
  login:      '/auth/login',
  getMe:      '/auth/me',

  // ── Users ───────────────────────────────────────────────────
  users:           '/users',
  userById:        (id) => `/users/${id}`,
  changePassword:  '/users/change-password/me',

  // ── GST Slabs ───────────────────────────────────────────────
  gstSlabs:        '/gst-slabs',
  gstSlabById:     (id) => `/gst-slabs/${id}`,

  // ── Charge Types ────────────────────────────────────────────
  chargeTypes:     '/charge-types',
  chargeTypeById:  (id) => `/charge-types/${id}`,

  // ── Clients ─────────────────────────────────────────────────
  clients:         '/clients',
  clientById:      (id) => `/clients/${id}`,

  // ── Products ────────────────────────────────────────────────
  products:        '/products',
  productById:     (id) => `/products/${id}`,

  // ── Bills ───────────────────────────────────────────────────
  bills:           '/bills',
  billById:        (id) => `/bills/${id}`,
  billNextNumber:  '/bills/next-number',
  billPreview:     '/bills/preview',
  confirmBill:     (id) => `/bills/${id}/confirm`,
  cancelBill:      (id) => `/bills/${id}/cancel`,
  sendBillEmail:   '/bills/send-email',

  // ── Employees ───────────────────────────────────────────────
  employees:       '/employees',
  employeeById:    (id) => `/employees/${id}`,

  // ── Attendance ──────────────────────────────────────────────
  attendance:           '/attendance',
  attendanceBulk:       '/attendance/bulk',
  attendanceById:       (id) => `/attendance/${id}`,
  attendanceSummary:    '/attendance/summary',
  attendanceDaily:      (date) => `/attendance/daily/${date}`,
  attendanceEmployee:   (id) => `/attendance/employee/${id}`,

  // ── Reports ─────────────────────────────────────────────────
  reportDashboard:  '/reports/dashboard',
  reportPnl:        '/reports/pnl',
  reportGst:        '/reports/gst',
  reportSales:      '/reports/sales',
  reportAttendance: '/reports/attendance',
  sendReportEmail:  '/reports/send-email',

  // ── BMS Integration ─────────────────────────────────────────
  bms:             '/bms',
  bmsInvoices:     '/bms/invoices',
  bmsInvoiceById:  (id) => `/bms/invoices/${id}`,
  bmsSendInvoice:  (id) => `/bms/invoices/${id}/send`,
  bmsInvoicePdf:   (id) => `/bms/invoices/${id}/pdf`,
  bmsPayments:     '/bms/payments',
  bmsPaymentModes: '/bms/payment-modes',
  bmsTemplates:    '/bms/templates',
  bmsTaxRates:     '/bms/tax-rates',
  bmsParticulars:  '/bms/particulars',
  bmsClients:      '/bms/clients',
  bmsSendBill:     '/bms/send-bill',  
}

export default Apis
