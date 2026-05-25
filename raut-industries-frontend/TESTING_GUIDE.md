# Testing Guide - Raut Industries Login Fix

## Prerequisites

- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5174`
- Test credentials: `admin@rautindustries.com` / `Admin@123`

---

## Test 1: Login Without Infinite Renders

### Steps:
1. Open browser to `http://localhost:5174/login`
2. Enter email: `admin@rautindustries.com`
3. Enter password: `Admin@123`
4. Click "Sign In"

### Expected Behavior:
- ✅ Login button shows loading spinner
- ✅ No console errors
- ✅ Redirects to dashboard once
- ✅ NO infinite page refreshes
- ✅ Dashboard loads with data

### Check DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by `auth/login`
4. Should see exactly 1 POST request (not multiple)
5. Response should have status 200 and token

---

## Test 2: API Endpoints Working

### Steps:
1. Login successfully
2. Navigate to `/dashboard`
3. Open DevTools Network tab
4. Watch API calls

### Expected Results:
```
GET http://localhost:8000/api/reports/dashboard?month=5&year=2026
Status: 200
Response: Dashboard data with sales, profit, etc.
```

**NOT**:
```
GET http://localhost:8000/api/api/reports/dashboard  ❌
Status: 404
```

---

## Test 3: Session Persistence

### Steps:
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Verify these keys exist:
   - `raut_token` (JWT token)
   - `raut_user` (JSON with user info)
   - `session` (JSON with token and user)

### Expected:
```javascript
{
  raut_token: "eyJhbGciOiJIUzI1NiIs...",
  raut_user: '{"id":"7943c6ff...","name":"Super Admin",...}',
  session: '{"token":"eyJhbGciOiJIUzI1NiIs...","user":{...}}'
}
```

---

## Test 4: Page Refresh Session

### Steps:
1. Login successfully and reach dashboard
2. Refresh page (Ctrl+R or Cmd+R)
3. Wait for page to load

### Expected:
- ✅ Dashboard loads immediately (no redirect to login)
- ✅ User remains logged in
- ✅ No 401 errors in console
- ✅ Data loads correctly

---

## Test 5: Invalid Token Handling

### Steps:
1. Open DevTools → Application → Local Storage
2. Manually change `raut_token` to something invalid
3. Refresh page
4. Try to access any protected route

### Expected:
- ✅ Redirects to login once
- ✅ No infinite redirect loops
- ✅ No console errors
- ✅ Login page renders cleanly

---

## Test 6: Logout & Re-login

### Steps:
1. Click logout (if available in NavBar)
2. Should redirect to login
3. Login again with credentials

### Expected:
- ✅ Old session cleared from localStorage
- ✅ New login works smoothly
- ✅ New token generated
- ✅ No console errors

---

## Test 7: 404 Handling

### Steps:
1. Try to access non-existent route: `http://localhost:5174/non-existent`
2. Should render NotFound component

### Expected:
- ✅ NotFound component displays
- ✅ Can navigate back via link or browser back

---

## Test 8: Protected Routes Without Auth

### Steps:
1. Clear localStorage completely
2. Try to access `http://localhost:5174/dashboard` directly
3. Check what happens

### Expected:
- ✅ Redirects to `/login`
- ✅ Login page displays
- ✅ No errors in console

---

## Curl Command Tests

### Test Login API:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rautindustries.com","password":"Admin@123"}' | jq .
```

**Expected Status**: 200
**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "7943c6ff-61ca-4356-bac4-8f880637b2db",
      "name": "Super Admin",
      "email": "admin@rautindustries.com",
      "role": "SuperAdmin"
    }
  }
}
```

### Test Dashboard API with Token:
```bash
TOKEN="<paste_token_from_above>"

curl -X GET "http://localhost:8000/api/reports/dashboard?month=5&year=2026" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```

**Expected Status**: 200
**Expected Response**: Dashboard data with sales, profit, etc.

### Test Invalid Token (401):
```bash
curl -X GET "http://localhost:8000/api/reports/dashboard" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" | jq .
```

**Expected Status**: 401
**Expected Response**: Unauthorized error

---

## Troubleshooting

### Issue: Still seeing `/api/api` in network requests
**Solution**: 
- Check `.env` file in RI_Frontend
- Make sure `VITE_API_BASE_URL=http://localhost:8000/api` (with `/api`)
- Restart dev server: `npm run dev`

### Issue: Login redirects to `/login` immediately
**Solution**:
- Check localStorage keys are `raut_token` and `raut_user` (not `token`, `user`)
- Check `helpers.js` `loadSession()` function
- Clear localStorage and try again

### Issue: Dashboard doesn't load after login
**Solution**:
- Check DevTools Network tab for failed API calls
- Check if endpoints have correct URL (no `/api/api`)
- Verify backend is running and accessible

### Issue: Infinite page refreshes in browser
**Solution**:
- This means the Connector 401 fix didn't apply
- Clear browser cache and local storage
- Restart dev server with `npm run dev`
- Check Connector.js has the new code (persistent flag, no 3s timeout)

---

## Success Criteria

All tests pass when:
- [ ] Login works without infinite renders
- [ ] Dashboard loads after login
- [ ] API endpoints use correct URL (no `/api/api`)
- [ ] Session persists after page refresh
- [ ] Invalid tokens redirect once (not loops)
- [ ] 401 errors handled gracefully
- [ ] No console errors
- [ ] Network requests show proper status codes (200, 401, etc.)

---

**Status**: Ready for testing ✅
