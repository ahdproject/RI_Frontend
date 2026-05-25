import axios from 'axios'

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

// ── Default axios instance ───────────────────────────────────────────────────
const Connector = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
Connector.interceptors.request.use((config) => {
  const token = localStorage.getItem('raut_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Prevent 401 redirect loop with persistent flag (until page reload)
let _redirecting = false
Connector.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect on 401 if not already redirecting and on an authenticated page
    if (err.response?.status === 401 && !_redirecting) {
      const currentPath = window.location.pathname
      const isAlreadyOnLogin = currentPath === '/login' || currentPath === '/'
      
      if (!isAlreadyOnLogin) {
        _redirecting = true
        localStorage.removeItem('raut_token')
        localStorage.removeItem('raut_user')
        // Use window.location.href for hard navigation to clear all state
        window.location.href = '/login'
        // Flag persists for the duration - will reset on new page load
      }
    }
    return Promise.reject(err)
  }
)

export default Connector

// ── Named export: apiConnector ───────────────────────────────────────────────
// ReportsRepo.js, DashboardRepo.js etc. import { apiConnector } from '../Connector.js'
// This wraps the same Connector so token is always attached
export const apiConnector = (method, url, bodyData, headers, params) => {
  const token = localStorage.getItem('raut_token')

  const config = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    params:  params    || undefined,
    data:    bodyData  !== undefined ? bodyData : undefined,
  }

  // Use base axios (not the Connector instance) so baseURL isn't doubled
  // when url is already a full path like  BaseURL + '/reports/dashboard'
  return axios(config)
}

// Also export axiosInstance alias for any code that imports it
export const axiosInstance = Connector