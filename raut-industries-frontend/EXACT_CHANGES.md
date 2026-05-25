# Exact Code Changes Made

## 1. Connector.js - 401 Redirect Loop Fix

**Old Code (Problematic)**:
```javascript
let _redirecting = false
Connector.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !_redirecting) {
      _redirecting = true
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.replace('/login')
      setTimeout(() => { _redirecting = false }, 3000)  // ❌ Resets too soon!
    }
    return Promise.reject(err)
  }
)
```

**New Code (Fixed)**:
```javascript
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
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('session')
        // Use window.location.href for hard navigation to clear all state
        window.location.href = '/login'
        // Flag persists for the duration - will reset on new page load
      }
    }
    return Promise.reject(err)
  }
)
```

---

## 2. bmsConnector.js - Same 401 Fix

**Old Code (Problematic)**:
```javascript
let _redirecting = false;

bmsConnector.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !_redirecting) {
      _redirecting = true;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('account');
      localStorage.removeItem('userAccess');
      window.location.replace('/login');
      setTimeout(() => { _redirecting = false; }, 3000);  // ❌ Resets too soon!
    }
    return Promise.reject(error);
  }
);
```

**New Code (Fixed)**:
```javascript
// ── Response: handle 401 without importing DashboardSlice ────────────────────
let _redirecting = false;

bmsConnector.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !_redirecting) {
      const currentPath = window.location.pathname
      const isAlreadyOnLogin = currentPath === '/login' || currentPath === '/'
      
      if (!isAlreadyOnLogin) {
        _redirecting = true;
        // Clear all auth keys
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('account');
        localStorage.removeItem('userAccess');
        localStorage.removeItem('session');
        // Use window.location.href for hard navigation to clear all state
        window.location.href = '/login';
        // Flag persists for the duration - will reset on new page load
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 3. RoutesConfig.jsx - Conditional Route Rendering

**Old Code (Problematic)**:
```javascript
export default function RoutesConfig() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ─────────────────────────────────────── */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <HeroPage />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />
        {/* ── Protected routes rendered even when not authenticated ─ */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell><Dashboard /></AppShell>
          </ProtectedRoute>
        } />
        {/* ... more routes ... */}
      </Routes>
    </BrowserRouter>
  )
}
```

**New Code (Fixed)**:
```javascript
export default function RoutesConfig() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  // If not authenticated, only render login/auth routes
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // If authenticated, render full app with protected routes
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public → redirect to dashboard ─────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />

        {/* ── Shared — All Authenticated Roles ───────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell><Dashboard /></AppShell>
          </ProtectedRoute>
        } />
        {/* ... more routes ... */}
      </Routes>
    </BrowserRouter>
  )
}
```

---

## 4. App.jsx - Better Session Handling

**Old Code**:
```javascript
export default function App() {
  const dispatch = useDispatch()

  // Rehydrate auth state from localStorage on refresh
  useEffect(() => {
    const session = loadSession()
    if (session) {
      dispatch(setUser({ token: session.token, user: session.user }))
    }
  }, [dispatch])

  return <RoutesConfig />
}
```

**New Code (Fixed)**:
```javascript
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUser, clearUser } from './app/DashboardSlice'  // ✅ Added clearUser
import { loadSession } from './utils/helpers'
import RoutesConfig from './RoutesConfig'

export default function App() {
  const dispatch = useDispatch()

  // Rehydrate auth state from localStorage on refresh
  useEffect(() => {
    const session = loadSession()
    if (session && session.token && session.user) {  // ✅ Better validation
      dispatch(setUser({ token: session.token, user: session.user }))
    } else {
      // Ensure clean state if no session
      dispatch(clearUser())  // ✅ Clear state if invalid
      // Clear any orphaned tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('session')
    }
  }, [dispatch])

  return <RoutesConfig />
}
```

---

## 5. Apis.js - Removed Duplicate /api Prefix

**Environment Setting**:
```properties
VITE_API_BASE_URL=http://localhost:8000/api
```

**Old Code (Creates /api/api URLs)**:
```javascript
const Apis = {
  login:      '/api/auth/login',              // ❌ Double /api
  getMe:      '/api/auth/me',
  users:      '/api/users',
  // ... rest with /api/ prefix
}
```

**New Code (Correct)**:
```javascript
const Apis = {
  login:      '/auth/login',                  // ✅ Single /api from baseURL
  getMe:      '/auth/me',
  users:      '/users',
  
  // ... all other endpoints without /api/ prefix since baseURL includes it
  
  // ── Auth ────────────────────────────────────────────────────
  login:      '/auth/login',
  getMe:      '/auth/me',

  // ── Users ───────────────────────────────────────────────────
  users:           '/users',
  userById:        (id) => `/users/${id}`,
  changePassword:  '/users/change-password/me',

  // ── Reports ─────────────────────────────────────────────────
  reportDashboard:  '/reports/dashboard',
  reportPnl:        '/reports/pnl',
  reportGst:        '/reports/gst',
  reportSales:      '/reports/sales',
}
```

**Result**:
- Connector baseURL: `http://localhost:8000/api`
- Apis endpoint: `/auth/login`
- Final URL: `http://localhost:8000/api/auth/login` ✅

---

## 6. bmsConnector.js - Correct Base URL

**Old Code**:
```javascript
const BMS_BASE_URL = `${
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
}/api/bms`;  // ❌ Creates /api/api/bms
```

**New Code**:
```javascript
const BMS_BASE_URL = `${
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '')
}/bms`;  // ✅ Correct: /api/bms
```

**Result**:
- VITE_API_BASE_URL: `http://localhost:8000/api`
- BMS_BASE_URL: `http://localhost:8000/api/bms` ✅

---

## Summary Table

| Component | Problem | Solution |
|-----------|---------|----------|
| Connector.js | 3s timeout resets flag | Persistent flag + path check |
| bmsConnector.js | Same as Connector | Apply same solution |
| RoutesConfig.jsx | Routes render simultaneously | Conditional rendering |
| App.jsx | No fallback for invalid session | Clear state if invalid |
| Apis.js | `/api/api/...` double prefix | Remove `/api/` from routes |
| bmsConnector.js | `/api/api/bms` | Use `VITE_API_BASE_URL` with `/api` |

---

**All changes applied and tested ✅**
