import bmsConnector from '../../bmsConnector';

// ─── BMS Clients ─────────────────────────────────────────────────
export const listBmsClientsApi = (params = {}) =>
  bmsConnector.get('/clients', { params });

export const createBmsClientApi = (data) =>
  bmsConnector.post('/clients', data);

// ─── BMS Templates ────────────────────────────────────────────────
export const listBmsTemplatesApi = (params = {}) =>
  bmsConnector.get('/templates', { params });

// ─── BMS Tax Rates ────────────────────────────────────────────────
export const listBmsGstRatesApi = (params = {}) =>
  bmsConnector.get('/tax-rates', { params });

// ─── BMS Particulars ─────────────────────────────────────────────
export const listBmsParticularsApi = (params = {}) =>
  bmsConnector.get('/particulars', { params });

// ─── BMS Invoices ────────────────────────────────────────────────
export const listBmsInvoicesApi = (params = {}) =>
  bmsConnector.get('/invoices', { params });

export const createBmsInvoiceApi = (data) =>
  bmsConnector.post('/invoices', data);

export const getBmsInvoiceByIdApi = (id) =>
  bmsConnector.get(`/invoices/${id}`);

export const sendBmsInvoiceApi = (id, data) =>
  bmsConnector.post(`/invoices/${id}/send`, data);

export const downloadBmsInvoicePdf = (id) =>
  bmsConnector.get(`/invoices/${id}/pdf`, { responseType: 'blob' });

// ─── BMS Payments ─────────────────────────────────────────────────
export const createBmsPaymentApi = (data) =>
  bmsConnector.post('/payments', data);

export const listBmsPaymentModesApi = (params = {}) =>
  bmsConnector.get('/payment-modes', { params });

// ─── BMS Payment Modes ───────────────────────────────────────────
export const listBmsPaymentModesApiAlt = (params = {}) =>
  bmsConnector.get('/payment-modes', { params });