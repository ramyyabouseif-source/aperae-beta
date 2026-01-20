# Render Service Configuration Guide

## Quick Setup for New Production Service

### Service Type
**Web Service**

### Basic Settings
```
Name: aperae-backend-production
Region: Choose closest to your users (us-east, us-west, etc.)
Branch: main
Root Directory: backend
Runtime: Node
Instance Type: Starter ($7/month) or Standard ($25/month) - depends on usage
```

### Build Command
```bash
npm install && npx prisma generate
```

### Start Command
```bash
npm start
```

## Required Environment Variables

Copy these from your staging service or set them manually:

### Core Configuration
```env
NODE_ENV=production
PORT=10000
```

### Database
```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### Authentication
```env
JWT_SECRET=<your-jwt-secret-key>
REFRESH_SECRET=<your-refresh-secret-key>
```

### API Keys
```env
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

### CORS Configuration
```env
ALLOWED_ORIGINS=https://www.aperae.com,https://aperae.com
```

### Optional/Feature Flags
```env
MOCK_MODE=false
ENABLE_V7_PROMPT=true
LOG_LEVEL=info
```

### Rate Limiting (Optional - defaults exist)
```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## Custom Domain Setup

1. In Render dashboard, go to your service
2. Go to "Settings" → "Custom Domains"
3. Add custom domain: `api.aperae.com`
4. Render will provide DNS instructions
5. Update your DNS provider with the CNAME record

**DNS Configuration:**
```
Type: CNAME
Name: api
Value: <render-provided-hostname>
TTL: 3600 (or default)
```

## Health Check Endpoint

Render automatically monitors:
- `GET /api/health`

Make sure this endpoint returns 200 status for the service to stay healthy.

## Auto-Deploy Settings

**Enable Auto-Deploy:**
- ✅ Auto-deploy on git push
- Branch: `main` (or your production branch)

**Manual Deploy:**
- You can manually trigger deployments from Render dashboard
- Useful for testing before production deploy

## Monitoring & Logs

**View Logs:**
- Render dashboard → Your service → Logs tab
- Real-time logs are available
- Logs are retained for a period (check Render documentation)

**Set up Alerts:**
- Configure email alerts for service failures
- Monitor response times
- Set up uptime monitoring

## Backup Strategy

1. **Database:** Supabase handles backups automatically
2. **Code:** Git repository is the source of truth
3. **Environment Variables:** Document all values securely (use password manager)
4. **Service Configuration:** Document in this file or similar

## Troubleshooting

### Service Won't Start
- Check logs for errors
- Verify all environment variables are set
- Verify DATABASE_URL is correct
- Check build command completes successfully

### Database Connection Errors
- Verify DATABASE_URL format
- Check Supabase database is accessible
- Verify IP allowlist (if applicable)
- Check connection pooling settings

### Prisma Client Errors
- Ensure `npx prisma generate` is in build command
- Verify Prisma schema is in repository
- Check DATABASE_URL is correct

### CORS Errors
- Verify ALLOWED_ORIGINS includes all domains
- Check CORS middleware configuration
- Verify custom domain is set correctly

## Cost Estimation

**Starter Plan ($7/month):**
- 512 MB RAM
- 0.1 CPU
- Good for low-medium traffic

**Standard Plan ($25/month):**
- 2 GB RAM
- 1 CPU
- Better for production workloads

Choose based on your expected traffic and response time requirements.




