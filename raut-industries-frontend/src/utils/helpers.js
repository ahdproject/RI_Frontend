// ─── Number Formatting ────────────────────────────────────────

/**
 * Format number as Indian currency
 * e.g. 125000 → ₹1,25,000
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format number with commas (no currency symbol)
 * e.g. 99806.63 → 99,806.63
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '—'
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format quantity (removes trailing zeros)
 * e.g. 60.000 → 60, 24.500 → 24.5
 */
export const formatQty = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  return parseFloat(Number(value).toFixed(3)).toString()
}

// ─── Date Formatting ─────────────────────────────────────────

/**
 * Format ISO date string to DD/MM/YYYY
 * e.g. 2025-12-04 → 04/12/2025
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  })
}

/**
 * Format ISO date string to DD MMM YYYY
 * e.g. 2025-12-04 → 04 Dec 2025
 */
export const formatDateLong = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

/**
 * Get today's date as YYYY-MM-DD string
 * Used as default value for date inputs
 */
export const todayISO = () => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get month name from number
 * e.g. 12 → December
 */
export const monthName = (monthNum) => {
  const months = [
    'January','February','March','April',
    'May','June','July','August',
    'September','October','November','December',
  ]
  return months[parseInt(monthNum) - 1] || '—'
}

// ─── String Helpers ───────────────────────────────────────────

/**
 * Truncate long strings
 * e.g. truncate("Hello World", 8) → "Hello Wo..."
 */
export const truncate = (str, maxLength = 30) => {
  if (!str) return '—'
  return str.length > maxLength
    ? `${str.substring(0, maxLength)}...`
    : str
}

/**
 * Capitalize first letter of each word
 */
export const titleCase = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Convert snake_case to Title Case
 * e.g. half_day → Half Day
 */
export const snakeToTitle = (str) => {
  if (!str) return ''
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Auth / Storage Helpers ───────────────────────────────────

/**
 * Save auth session to localStorage
 */
export const saveSession = (token, user) => {
  localStorage.setItem('raut_token', token)
  localStorage.setItem('raut_user', JSON.stringify(user))
}

/**
 * Load auth session from localStorage
 * Returns { token, user } or null
 */
export const loadSession = () => {
  const token = localStorage.getItem('raut_token')
  const user  = localStorage.getItem('raut_user')
  if (!token || !user) return null
  try {
    return { token, user: JSON.parse(user) }
  } catch {
    return null
  }
}

/**
 * Clear auth session from localStorage
 */
export const clearSession = () => {
  localStorage.removeItem('raut_token')
  localStorage.removeItem('raut_user')
}

// ─── Role Helpers ─────────────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN:       'Admin',
  MANAGER:     'Manager',
}

/**
 * Check if user has required role
 */
export const hasRole = (user, ...roles) => {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Check if user is admin or above
 */
export const isAdmin = (user) => {
  return hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN)
}

/**
 * Check if user is SuperAdmin
 */
export const isSuperAdmin = (user) => {
  return hasRole(user, ROLES.SUPER_ADMIN)
}

// ─── Bill / Finance Helpers ───────────────────────────────────

/**
 * Map bill status to badge class
 */
export const billStatusBadge = (status) => {
  const map = {
    confirmed: 'badge-success',
    draft:     'badge-warning',
    cancelled: 'badge-danger',
  }
  return map[status] || 'badge-neutral'
}

/**
 * Map attendance status to badge class
 */
export const attendanceBadge = (status) => {
  const map = {
    present:  'badge-success',
    absent:   'badge-danger',
    half_day: 'badge-warning',
    leave:    'badge-info',
  }
  return map[status] || 'badge-neutral'
}

/**
 * Map attendance status to short label
 */
export const attendanceShort = (status) => {
  const map = {
    present:  'P',
    absent:   'A',
    half_day: 'H',
    leave:    'L',
  }
  return map[status] || '—'
}

/**
 * Calculate GST amounts from base amount and rates
 */
export const calcGst = (amount, cgstRate, sgstRate, igstRate) => {
  const cgst  = parseFloat((amount * cgstRate / 100).toFixed(2))
  const sgst  = parseFloat((amount * sgstRate / 100).toFixed(2))
  const igst  = parseFloat((amount * igstRate / 100).toFixed(2))
  const total = parseFloat((cgst + sgst + igst).toFixed(2))
  return { cgst, sgst, igst, total }
}

// ─── Error Extraction ─────────────────────────────────────────

/**
 * Extracts a clean error message from an axios error
 */
export const extractError = (err) => {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  )
}