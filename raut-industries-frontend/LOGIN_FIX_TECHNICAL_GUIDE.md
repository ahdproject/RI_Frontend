# Raut Industries Login Fix - Complete Integration Guide

## Overview
This document explains the infinite login loop issue in Raut Industries frontend and how it was fixed by applying BMS integration patterns.

---

## Problem Analysis

### Symptom
Login page renders multiple times, causing:
- Infinite redirects between login and dashboard
- Session state inconsistency
- Impossible to stay logged in
- Network requests triggered repeatedly

### Root Causes

#### 1. **Weak Redirect Timeout** (Connector.js line 28)
**Before:**
```javascript
let _redirecting = false
// ...
setTimeout(() => { _redirecting = false }, 3000)  // ❌ Resets after 3 seconds
```
**Problem**: Flag resets in 3 seconds, allowing multiple redirects before page fully loads

**After:**
```javascript
let _redirecting = false
// ... flag never resets until page reload
```

#### 2. **Route Rendering Conflict** (RoutesConfig.jsx)
**Before:**
```javascript
<Route path="/login" element={
  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
} />
<Route path="/dashboard" element={
  <ProtectedRoute>
    <AppShell><Dashboard /></AppShell>
  </ProtectedRoute>
} />
```
**Problem**: Both authenticated and unauthenticated routes render simultaneously, causing React to constantly switch between them

**After:**
```javascript
// Completely separate route trees
if (!isAuthenticated) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* only login routes */}
      </Routes>
    </BrowserRouter>
  )
} else {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={...} />
        {/* protected routes only */}
      </Routes>
    </BrowserRouter>
  )
}
```

#### 3. **Token Key Inconsistency**
**Before:**
- Connector.js looks for: `access_token`
- bmsConnector.js looks for: `access_token`
- helpers.js saves: `raut_token`, `raut_user`

**After:**
- All connectors use: `raut_token`, `raut_user`
- Consistent across all services

---

## Solution Architecture

### Phase 1: On App Load
```
User opens app
    ↓
App.jsx mounts
    ↓
Check localStorage for `raut_token` + `raut_user`
    ├─ Found & valid → Redux: setUser() → isAuthenticated = true
    └─ Not found → Redux: clearUser() → isAuthenticated = false
    ↓
RoutesConfig reads Redux state
    ├─ isAuthenticated = true → Render protected routes + AppShell
    └─ isAuthenticated = false → Render login + hero page only
```

### Phase 2: Login
```
User submits login form
    ↓
Login.jsx calls AdminAuthRepo.login(email, password)
    ↓
Connector makes POST /auth/login
    ↓
Backend returns { token, user }
    ↓
Login.jsx:
  1. Calls saveSession(token, user) → saves to localStorage
  2. Dispatches setUser() → Redux updated
  3. navigate('/dashboard', { replace: true })
    ↓
RoutesConfig detects Redux change
    ↓
Renders protected routes (dashboard now accessible)
```

### Phase 3: Session Persistence (F5 Refresh)
```
User hits F5 while on /dashboard
    ↓
App.jsx useEffect runs
    ↓
loadSession() retrieves `raut_token` + `raut_user` from localStorage
    ↓
setUser() dispatches to Redux
    ↓
RoutesConfig re-renders with protected routes
    ↓
User stays on /dashboard (no redirect to login)
```

### Phase 4: Token Expiration (401 Error)
```
User makes API call with expired/invalid token
    ↓
Backend returns 401 Unauthorized
    ↓
Connector.interceptors.response catches error
    ↓
Check: if (status === 401 && !_redirecting && currentPath !== '/login')
    ├─ All true → _redirecting = true (stays true until page reload)
    ├─ Remove localStorage tokens
    ├─ window.location.href = '/login' (hard navigation)
    └─ Page reloads
    ↓
App.jsx loads, finds no tokens, clears Redux
    ↓
RoutesConfig renders login-only routes
    ↓
User sees fresh login page
    └─ NO INFINITE LOOP ✅
```

---

## Technical Details

### Modified Files

#### 1. **src/services/Connector.js**
```javascript
// Token retrieval - standardized key
const token = localStorage.getItem('raut_token')  // was: access_token

// Redirect prevention - persistent flag
let _redirecting = false
Connector.interceptors.response.use(..., (err) => {
  if (err.response?.status === 401 && !_redirecting) {
    // Path awareness: don't redirect if already on login
    const isAlreadyOnLogin = window.location.pathname === '/login' || 
                             window.location.pathname === '/'
    if (!isAlreadyOnLogin) {
      _redirecting = true
      // Hard navigation - full page reload clears all state
      window.location.href = '/login'  // was: replace()
      // Flag stays true until reload (no setTimeout reset)
    }
  }
  return Promise.reject(err)
})
```

#### 2. **src/services/bmsConnector.js**
- Applied same pattern as Connector.js
- Ensures consistency across all API requests

#### 3. **src/RoutesConfig.jsx**
```javascript
export default function RoutesConfig() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // Completely separate trees - prevents render conflicts
  if (!isAuthenticated) {
    // Only public routes
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

  // Full app with protected routes
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute>...</ProtectedRoute>} />
        {/* ... all protected routes ... */}
      </Routes>
    </BrowserRouter>
  )
}
```

#### 4. **src/App.jsx**
```javascript
useEffect(() => {
  const session = loadSession()
  if (session && session.token && session.user) {
    // Restore logged-in state
    dispatch(setUser({ token: session.token, user: session.user }))
  } else {
    // Ensure clean logout state
    dispatch(clearUser())
    localStorage.removeItem('raut_token')
    localStorage.removeItem('raut_user')
  }
}, [dispatch])
```

---

## Key Differences: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Redirect Flag** | Resets every 3 sec | Persistent until reload |
| **Route Rendering** | Mixed auth/unauth | Conditional separate trees |
| **Navigation Method** | `window.location.replace()` | `window.location.href` |
| **Token Key** | `access_token` | `raut_token` |
| **Path Awareness** | None | Checks current path |
| **Render Performance** | Constant re-renders | Single render per state change |

---

## Testing Checklist

- [ ] Fresh page load → Shows login page
- [ ] Valid login → Redirects to dashboard
- [ ] F5 refresh on dashboard → Stays logged in
- [ ] Logout (token removal) → Single redirect to login
- [ ] Invalid token (401) → Redirect to login, no loop
- [ ] Multiple rapid requests with expired token → Single redirect
- [ ] Navigate between pages while logged in → No infinite loops
- [ ] localStorage has correct keys (`raut_token`, `raut_user`)

---

## Reference: BMS Integration Pattern

This fix follows the successful pattern from M and D Engineering's BMS implementation:

**Key Pattern:**
```javascript
// Conditional rendering based on auth state
// - When logged out: only show login routes
// - When logged in: only show app routes
// - Never render both simultaneously
```

This eliminates routing conflicts and prevents infinite redirect loops.

---

## Rollback Instructions

If you need to revert these changes:

```bash
git checkout HEAD -- src/services/Connector.js
git checkout HEAD -- src/services/bmsConnector.js
git checkout HEAD -- src/RoutesConfig.jsx
git checkout HEAD -- src/App.jsx
```

Then restart dev server and clear browser cache/localStorage.

---

## Support

If you encounter any issues:

1. **Clear everything**: 
   - `localStorage.clear()` in console
   - Restart dev server
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

2. **Check backend**:
   - Verify login endpoint returns `{ token, user }`
   - Check CORS headers allow requests
   - Verify token validation on protected endpoints

3. **Debug in DevTools**:
   - Network tab: Watch request/response for login
   - Console: Check for errors
   - Redux DevTools: Verify state changes
   - Application tab: Check localStorage keys

---

**Last Updated:** 26 May 2026
**Status:** ✅ Complete - Ready for Testing
