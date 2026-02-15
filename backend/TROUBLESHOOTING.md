# Backend Troubleshooting

## Menu Screen Restaurant Pairing Assistant Not Working

### Symptom
User takes photo of wine list, OCR extracts text, menu wines are stored, but wine recommendations return **400 "Request ID must be a valid UUID"**.

### Root Cause
The menu flow generates a `requestId` to link parsed menu wines with recommendations. The frontend was generating base64url-style IDs (e.g. `hdLi5vvO__b941-w`), while the recommendations endpoint validated `requestId` as UUID only.

### Fix (applied)
- **Frontend** (`src/services/menuAnalysisService.ts`): `generateRequestId()` now produces UUID v4 format.
- **Backend** (`backend/validation.js`): Validation accepts both UUID and menu-style IDs (alphanumeric + `-_`, 10–64 chars) for backward compatibility.

---

## Database Connection Failures (Supabase)

### Symptom
```
Can't reach database server at `aws-1-us-east-2.pooler.supabase.com:6543`
```
or
```
Timed out fetching a new connection from the connection pool (connection limit: 5)
```

### Possible Causes
1. **Supabase outage or maintenance** – Check [Supabase Status](https://status.supabase.com).
2. **IP allowlist** – Render’s IPs may not be allowed. In Supabase: Settings → Database → Connection pooling, verify "Restrict connections" or allow Render’s egress IPs.
3. **Connection string** – Ensure `DATABASE_URL` uses the **pooler** URL (port 6543) for serverless/pooled connections, not the direct port (5432).
4. **Pool exhaustion** – If many long-running requests hold connections, increase pool settings in `DATABASE_URL`, e.g. `?connection_limit=10` (Supabase free tier limits apply).

### Recommendations
- Use Supabase connection pooler URL (port 6543) in production.
- Add Supabase to your monitoring/alerting so you’re notified of outages.
- Ensure recommendation/wine storage failures are non-blocking where possible (recommendations can still return when DB is down; storage is best-effort).
