# FinTrackAI Secure Deployment Runbook

Use this runbook for the upgraded release.

## 1. Pre-release local verification

Run:

```bash
cd backend && npm test
cd ../frontendpart && npm run build
```

Expected:
- backend smoke tests pass
- frontend production build passes

## 2. Prepare deployment environment

Backend must have:
- `MONGODB_URI`
- `JWT_SECRET` or secret helper source
- `FRONTEND_URL`
- `BACKEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY` optional

Frontend must have:
- `VITE_API_URL`

## 3. Deploy backend first

After backend deploy, verify:

```bash
curl -i https://YOUR_BACKEND_DOMAIN/health
curl -i https://YOUR_BACKEND_DOMAIN/api/auth/google/url
curl -i https://YOUR_BACKEND_DOMAIN/api/insights/dashboard
```

Expected:
- `/health` returns `200`
- `/api/auth/google/url` returns `200`
- `/api/insights/dashboard` returns `401` without auth

## 4. Deploy frontend second

After frontend deploy, manually verify:
- login page loads
- signup page loads
- Google button appears
- existing dashboard loads after login

## 5. Functional production test

1. Log in with a test user
2. Upload `test_transactions.csv`
3. Confirm validation summary appears
4. Confirm report generation still works
5. Confirm dashboard enhanced analytics render
6. Confirm insights page still works

## 6. Authenticated API verification

```bash
export TOKEN="YOUR_JWT_TOKEN"

curl -i https://YOUR_BACKEND_DOMAIN/api/insights/summary \
  -H "Authorization: Bearer $TOKEN"

curl -i https://YOUR_BACKEND_DOMAIN/api/insights/categories \
  -H "Authorization: Bearer $TOKEN"

curl -i https://YOUR_BACKEND_DOMAIN/api/insights/savings \
  -H "Authorization: Bearer $TOKEN"

curl -i "https://YOUR_BACKEND_DOMAIN/api/insights/dashboard?range=30d" \
  -H "Authorization: Bearer $TOKEN"
```

## 7. Rollback sequence

If something goes wrong:

1. Roll back frontend first
2. Keep backend additive routes in place if old flows still work
3. Roll back backend only if a newly added module is causing failures

## 8. Known watch items

- local Google OAuth callback port handling
- PDF layout variability across banks
- browser-level staging E2E still pending
