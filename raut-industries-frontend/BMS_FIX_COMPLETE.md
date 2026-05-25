# BMS Authentication Issue - Complete Analysis & Fix

## Issue Summary

When users access the BMS section, they get logged out (401 error) instead of seeing BMS data.

## Root Cause

BMS uses **separate authentication** from Raut Industries:
- **Raut**: JWT token (from email/password login)
- **OctaBMS**: API Key + Secret (different system)

Frontend was sending Raut token to BMS endpoints, but should go through backend proxy.

## Architecture

**Correct Flow:**
```
Frontend + raut_token
    ↓
Backend /api/bms endpoint
    ├─ Validates raut_token (Raut auth)
    └─ Exchanges for OctaBMS token internally
         ↓
OctaBMS API
    └─ Uses API Key + Secret
    ↓
Backend returns data
    ↓
Frontend displays
```

## Solution Applied

✅ **Backend BMS Service** (`src/modules/bms/bms.service.js`):
- Authenticates to OctaBMS using API Key + Secret
- Caches token until expiry
- Forwards requests to OctaBMS
- Retry on 401

✅ **Frontend BMS Connector** (`src/services/bmsConnector.js`):
- Points to `/api/bms` (backend proxy)
- Sends `raut_token`
- Proper 401 handling

✅ **Backend `.env`**:
```
BMS_API_KEY=fc456cbf...
BMS_API_SECRET=a4f83b4e...
BMS_API_URL=https://app.octabms.com/api
```

## How to Test

### 1. Start Backend
```bash
cd /Users/devanshu/Desktop/Raut/raut-industries-backend
npm start
```

### 2. Get Raut Token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rautindustries.com","password":"Admin@123"}'
```

### 3. Test BMS Endpoint
```bash
curl -X GET "http://localhost:8000/api/bms/invoices" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test in Browser
1. Open `http://localhost:5174/login`
2. Login with: `admin@rautindustries.com` / `Admin@123`
3. Go to BMS section
4. Should show data without logout

## What Changed

| Component | Before | After |
|-----------|--------|-------|
| Frontend auth | Raut token | ✅ Raut token |
| Frontend BMS calls | `bmsConnector` pointing wrong place | ✅ Points to `/api/bms` |
| Backend auth | Not checking token | ✅ Validates Raut token |
| Backend BMS auth | No OctaBMS auth | ✅ Uses API Key + Secret |
| Token caching | N/A | ✅ Caches OctaBMS token |

## Architecture Diagram

```
                    FRONTEND
                        ↑↓
                    Login: ✅
                    Token: raut_token
                        ↓
    ┌───────────────────────────────────┐
    │      RAUT BACKEND (8000)           │
    ├───────────────────────────────────┤
    │ /api/auth/login                   │ JWT Auth
    │ /api/dashboard                    │
    │ /api/users                        │
    │ /api/bills                        │
    │ /api/bms/* ← Backend Proxy ←────┐ │
    │   ├─ Validate raut_token         │ │
    │   ├─ Get OctaBMS token          │ │
    │   └─ Forward to OctaBMS         │ │
    └───────────────────────────────────┘ │
                                          │
        ┌─────────────────────────────────┘
        │
        ↓
    ┌───────────────────────────────────┐
    │      OCTABMS (app.octabms.com)     │
    ├───────────────────────────────────┤
    │ /api/v1/auth/login                │ API Key Auth
    │ /api/v1/invoices                  │
    │ /api/v1/clients                   │
    │ /api/v1/templates                 │
    │ /api/v1/tax-rates                 │
    │ /api/v1/particulars               │
    │ /api/v1/payments                  │
    └───────────────────────────────────┘
```

## Key Files

**Backend**:
- ✅ `.env` - BMS credentials
- ✅ `src/modules/bms/bms.service.js` - Token + proxy logic
- ✅ `src/modules/bms/bms.controller.js` - Request handler
- ✅ `src/modules/bms/bms.routes.js` - Routes

**Frontend**:
- ✅ `src/services/bmsConnector.js` - HTTP client
- ✅ `src/services/repository/Manager/BmsRepo.js` - API calls
- ✅ `src/components/protected/Manager/Bms/` - UI components

## Troubleshooting

**Issue**: Still getting 401 when accessing BMS
**Fix**: 
- Check backend `.env` has credentials
- Restart backend: `npm start`
- Clear browser cache
- Re-login

**Issue**: 422 Validation Error from OctaBMS
**Fix**:
- Check API request format
- Verify BMS token is valid
- Check OctaBMS API documentation for endpoint requirements

**Issue**: BMS data not loading
**Fix**:
- Check Network tab in DevTools
- Verify no `/api/api/bms` double prefix
- Ensure token is being sent
- Check backend logs

## Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5174
- [ ] `.env` has BMS credentials
- [ ] Can login with admin@rautindustries.com / Admin@123
- [ ] Dashboard loads successfully
- [ ] BMS menu appears in sidebar
- [ ] Can click BMS section without logout
- [ ] BMS data displays
- [ ] No console errors
- [ ] Network calls show `/api/bms` (not `/api/api/bms`)

## Status

✅ **Backend**: Ready
✅ **Frontend**: Ready
✅ **Configuration**: Ready
⏳ **Testing**: Ready to test in browser

---

**Next**: Test the complete flow in browser to verify BMS access works without logout
