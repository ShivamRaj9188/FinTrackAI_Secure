# Production Rollout Commands

Use these commands/checks during deployment verification.

> Replace the example URLs and tokens with your production values.

## 1. Backend health

```bash
curl -i https://YOUR_BACKEND_DOMAIN/health
```

Expected:
- HTTP `200`
- JSON health response

## 2. Google OAuth metadata endpoint

```bash
curl -i https://YOUR_BACKEND_DOMAIN/api/auth/google/url
```

Expected:
- HTTP `200`
- JSON with `enabled` and `authUrl`

## 3. Protected endpoint auth guard checks

### Insights dashboard endpoint should reject unauthenticated access

```bash
curl -i https://YOUR_BACKEND_DOMAIN/api/insights/dashboard
```

Expected:
- HTTP `401`

### Ingestion status endpoint should reject unauthenticated access

```bash
curl -i https://YOUR_BACKEND_DOMAIN/api/ingestion/test-id
```

Expected:
- HTTP `401`

## 4. Login flow check

```bash
curl -i -X POST https://YOUR_BACKEND_DOMAIN/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_TEST_USER","password":"YOUR_TEST_PASSWORD"}'
```

Expected:
- HTTP `200`
- JWT token returned

## 5. Authenticated analytics checks

Set a token:

```bash
export TOKEN="YOUR_JWT_TOKEN"
```

### Summary

```bash
curl -i https://YOUR_BACKEND_DOMAIN/api/insights/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Categories

```bash
curl -i https://YOUR_BACKEND_DOMAIN/api/insights/categories \
  -H "Authorization: Bearer $TOKEN"
```

### Savings

```bash
curl -i https://YOUR_BACKEND_DOMAIN/api/insights/savings \
  -H "Authorization: Bearer $TOKEN"
```

### Dashboard analytics

```bash
curl -i "https://YOUR_BACKEND_DOMAIN/api/insights/dashboard?range=30d" \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- HTTP `200`
- structured analytics payload

## 6. Ingestion upload check

```bash
curl -i -X POST https://YOUR_BACKEND_DOMAIN/api/ingestion/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_transactions.csv"
```

Expected:
- HTTP `200`
- `uploadId`
- `jobId`
- validation summary
- preview data

## 7. Ingestion status check

After upload, capture the job id and run:

```bash
curl -i https://YOUR_BACKEND_DOMAIN/api/ingestion/YOUR_JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- HTTP `200`
- ingestion job payload

## 8. Categorization preview check

```bash
curl -i -X POST https://YOUR_BACKEND_DOMAIN/api/categorization/preview \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {
        "description": "Swiggy Order",
        "amount": 450,
        "type": "debit",
        "date": "2025-03-03"
      }
    ]
  }'
```

Expected:
- HTTP `200`
- categorized transaction preview

## 9. Frontend manual checks

- open login page
- open signup page
- verify Google button renders
- log in with an existing test account
- open dashboard
- verify enhanced cards render
- upload a CSV/PDF
- verify validation summary appears
- open reports page
- open insights page

## 10. Rollback note

If a rollout issue occurs:
- frontend can be rolled back first
- backend can retain additive endpoints without breaking old ones
- legacy auth/upload/report routes remain usable
