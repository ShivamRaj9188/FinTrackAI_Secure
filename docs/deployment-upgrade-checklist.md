# FinTrackAI Secure Upgrade Deployment Checklist

This checklist is for deploying the additive MERN financial analytics upgrade safely without breaking the already-live application.

## 1. Pre-deploy checks

- Confirm current production environment is healthy.
- Confirm MongoDB is reachable from the deployed backend.
- Confirm current JWT login, signup, dashboard, upload, and reports still work before rollout.
- Ensure the frontend and backend are deployed from the same compatible revision.

## 2. Required environment variables

### Backend

- `MONGODB_URI`
- `JWT_SECRET` or the secret source used by `utils/secretHelper.js`
- `FRONTEND_URL`
- `BACKEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY` (optional but recommended for AI insight generation)

### Frontend

- `VITE_API_URL`

## 3. New additive backend capabilities included

### Auth
- `GET /api/auth/google/url`

### Ingestion
- `POST /api/ingestion/upload`
- `GET /api/ingestion/:id`

### Categorization
- `POST /api/categorization/preview`
- `POST /api/categorization/run`

### Analytics
- `GET /api/insights/summary`
- `GET /api/insights/categories`
- `GET /api/insights/savings`
- `GET /api/insights/dashboard`

## 4. Backward-compatibility expectations

These existing flows must continue to work unchanged:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `POST /api/upload/file`
- `POST /api/upload/transactions`
- `GET|POST /api/reports/generate`
- `GET|POST|PUT|DELETE /api/transactions`
- Existing dashboard and insights pages

## 5. Database impact

### Existing collection updated
`transactions`

New additive fields:
- `balance`
- `ingestionJob`
- `source`
- `sourceType`
- `sourceFileName`
- `validationStatus`
- `validationNotes`
- `categorySource`
- `categoryConfidence`

### New collection
`ingestionjobs`

Used for:
- structured file ingestion status
- validation summaries
- preview data
- upload tracking for plan limits

## 6. Recommended deployment order

1. Deploy backend
2. Verify backend health endpoint
3. Verify new auth metadata endpoint
4. Deploy frontend
5. Verify login/signup/dashboard/upload flows
6. Verify new analytics widgets render without blocking old pages

## 7. Post-deploy smoke checks

### Backend
- `GET /health`
- `GET /api/auth/google/url`
- confirm protected endpoints return `401` without token:
  - `/api/insights/dashboard`
  - `/api/ingestion/:id`

### Frontend
- Login page loads
- Signup page loads
- Google button renders on login/signup
- Dashboard page loads for existing user
- Upload page accepts CSV/PDF
- Reports page still opens
- Insights page still opens

## 8. Functional checks after deployment

### Auth
- email/password login works
- Google OAuth login redirects back correctly

### Upload + ingestion
- upload a sample CSV
- confirm ingestion summary appears
- confirm report generation still works

### Categorization
- uploaded rows receive categories
- existing manual transactions remain intact

### Analytics
- dashboard shows savings/category widgets
- no blank-screen failure if analytics endpoint is unavailable

## 9. Rollback strategy

Because the upgrade is additive:

- frontend can be rolled back independently if needed
- backend can keep the new routes without affecting old routes
- old upload/report/auth flows remain usable during rollback

If rollback is needed:

1. Revert frontend to previous build
2. Revert backend only if a new route or schema usage is causing issues
3. Keep MongoDB data; new transaction fields are additive and should not break old readers

## 10. Known follow-up items

- local Google OAuth dev callback still points to port `8000` in existing auth code
- PDF parsing may need bank-specific tuning for additional statement formats
- browser-level E2E coverage is still a future improvement
