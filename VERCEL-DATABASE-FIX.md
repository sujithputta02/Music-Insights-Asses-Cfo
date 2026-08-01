# Vercel Database Connection Fix

## Problem
Getting 500 errors when adding albums to library in production (Vercel deployment).

## Root Cause
Serverless environments like Vercel need connection pooling to handle database connections efficiently. Without proper pooling, Prisma can exhaust database connections quickly.

## Solution

### 1. Database Connection Pooling
Supabase provides two connection modes:
- **Direct connection** (port 5432): For migrations and local development
- **Transaction pooling** (port 6543): For serverless environments with PgBouncer

### 2. Environment Variables to Set in Vercel

Go to your Vercel project settings → Environment Variables and update:

```bash
# Transaction pooling for Vercel serverless (port 6543)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

# Direct connection for migrations (port 5432)
DIRECT_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:5432/postgres?sslmode=require

# Your other environment variables
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. Code Changes Made

#### Updated `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

#### Updated `lib/db.ts`:
- Added explicit datasources configuration
- Added graceful disconnect on process termination for production
- Optimized for serverless environments

#### Updated `app/api/library/route.ts`:
- Added comprehensive error handling
- Better error reporting for debugging
- Database connection checks
- Separated validation, query, and create errors

### 4. Steps to Deploy

1. **Update Vercel Environment Variables**:
   ```bash
   # Go to: https://vercel.com/[your-username]/music-insights/settings/environment-variables
   # Add both DATABASE_URL and DIRECT_DATABASE_URL with the values above
   ```

2. **Trigger a new deployment**:
   ```bash
   git add .
   git commit -m "fix: Add connection pooling for Vercel serverless"
   git push
   ```

3. **Or manually redeploy**:
   - Go to Vercel dashboard
   - Click "Deployments"
   - Click "Redeploy" on the latest deployment

### 5. Verify the Fix

After deployment, check:
- ✅ Albums can be added to library without 500 errors
- ✅ Vercel function logs show successful database connections
- ✅ No connection pool exhaustion errors

### 6. Additional Optimizations

If you still experience issues:

1. **Increase connection timeout**:
   ```typescript
   // In lib/db.ts
   new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
     log: ['error'],
     // Add connection timeout
     __internal: {
       engine: {
         connect_timeout: 10000,
       },
     },
   })
   ```

2. **Check Supabase connection pooler settings**:
   - Go to Supabase Dashboard → Settings → Database
   - Verify PgBouncer is enabled
   - Check max connections (default is usually fine)

3. **Monitor Vercel function logs**:
   ```bash
   vercel logs --follow
   ```

## Testing

Test the fix locally first:
```bash
# Update your local .env with the pooling URL
npm run dev

# Try adding an album to library
# Check console for any errors
```

Then test on Vercel after deployment.

## References
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Vercel Serverless Functions Best Practices](https://vercel.com/docs/functions/serverless-functions)
