## Summary

This PR upgrades **FinTrackAI_Secure** incrementally toward the target MERN financial analytics platform without breaking existing deployed flows.

The work was done additively:
- existing JWT auth was preserved
- existing Google OAuth route/callback were preserved
- existing upload, reports, transactions, and dashboard flows were preserved
- new ingestion, categorization, and analytics capabilities were added as modular routes/services

## What was added

### Auth
- Google OAuth metadata endpoint for safer frontend initiation
- frontend Google login/signup now use metadata first and fallback to the legacy route

### File ingestion
- validated CSV/PDF ingestion pipeline
- ingestion job tracking with status, preview, warnings, and row counts
- structured storage metadata on transactions

### Categorization
- lightweight ML-style TF-IDF scoring
- rule-based fallback categorization
- preview + run categorization endpoints

### Insights / analytics
- additive analytics engine for:
  - summary metrics
  - category insights
  - savings opportunities
  - dashboard-ready analytics payload

### Dashboard
- enhanced dashboard cards for savings, category intelligence, and time-range analytics
- upload page validation summary + ingestion preview

## New endpoints

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

## Backward compatibility

The following were intentionally left intact:
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/google`
- `/api/auth/google/callback`
- `/api/upload/file`
- `/api/upload/transactions`
- `/api/reports/generate`
- `/api/transactions/*`
- existing dashboard / reports / insights routes

## Verification

- backend syntax checks passed
- frontend production build passed
- backend smoke tests passed via `npm test`
- OAuth metadata endpoint responded successfully
- new protected endpoints returned `401` without auth as expected

## Risk level

**Moderate but controlled**

Reason:
- schema changes are additive
- routes are additive
- legacy flows remain available
- frontend falls back to legacy upload/auth flows where needed

## Follow-ups

- align local Google OAuth callback port handling for development
- expand PDF parser support for more statement layouts
- add browser-level E2E checks against a staging deployment
