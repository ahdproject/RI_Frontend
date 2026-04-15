import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Logged-in user info
  user: null,
  token: null,
  isAuthenticated: false,

  // UI state
  sidebarOpen: true,
  activeModule: null,

  // Global loading and error
  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,

  reducers: {
    // Auth
    setUser: (state, action) => {
      state.user          = action.payload.user
      state.token         = action.payload.token
      state.isAuthenticated = true
    },

    clearUser: (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      state.activeModule    = null
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },

    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },

    // Active module (for sidebar highlighting)
    setActiveModule: (state, action) => {
      state.activeModule = action.payload
    },

    // Global UI flags
    setLoading: (state, action) => {
      state.loading = action.payload
    },

    setError: (state, action) => {
      state.error = action.payload
    },

    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setUser,
  clearUser,
  toggleSidebar,
  setSidebarOpen,
  setActiveModule,
  setLoading,
  setError,
  clearError,
} = dashboardSlice.actions

// ─── Selectors ────────────────────────────────────────────────
export const selectUser            = (state) => state.dashboard.user
export const selectToken           = (state) => state.dashboard.token
export const selectIsAuthenticated = (state) => state.dashboard.isAuthenticated
export const selectSidebarOpen     = (state) => state.dashboard.sidebarOpen
export const selectActiveModule    = (state) => state.dashboard.activeModule
export const selectLoading         = (state) => state.dashboard.loading
export const selectError           = (state) => state.dashboard.error

export default dashboardSlice.reducer