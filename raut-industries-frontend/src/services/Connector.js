import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const Connector = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// ✅ Read BOTH token keys — Raut uses 'access_token', legacy uses 'md_token'
Connector.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('access_token') ||   // Raut auth stores here
    localStorage.getItem('md_token')          // fallback
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

Connector.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('md_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default Connector