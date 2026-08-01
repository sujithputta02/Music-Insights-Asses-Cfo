# 500 Error Fix for /api/library POST Endpoint

## Issue
The application was throwing a 500 Internal Server Error when trying to add albums to the library in production (Vercel).

## Root Causes Identified

1. **Connection Pooling**: Serverless environments (Vercel) require connection pooling to avoid exhausting database connections
2. **Supabase Configuration**: Need to use different ports for pooled vs direct connections
3. **Error Handling**: Insufficient error reporting made debugging difficult

## Changes Made

### 1. Database Connection Configuration

#### Updated `.env` and `.env.example`
```env
# Transaction pooling for Vercel serverless (port 6543)
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection for migrations (port 5432)
DIRECT_DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres?sslmode=require"
```

**Why this matters**:
- Port 6543: Supabase's PgBouncer connection pooler (for serverless)
- Port 5432: Direct PostgreSQL connection (for migrations)
- `pgbouncer=true`: Enables transaction pooling mode
- `connection_limit=1`: Limits connections per serverless function

#### Updated `prisma/schema.prisma`
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

**Why this matters**:
- Prisma uses `url` for queries (pooled connection)
- Prisma uses `directUrl` for migrations (direct connection)
- This separation is required for proper Supabase pooling

### 2. Enhanced Error Handling in `app/api/library/route.ts`

Added detailed error handling for:
- JSON parsing errors
- Validation errors
- Database query errors  
- Database creation errors
- Unexpected errors

Each error type now:
- Logs specific error details
- Returns appropriate HTTP status codes
- Provides helpful error messages
- Shows details in development mode only

### 3. Simplified Database Client (`lib/db.ts`)

Removed unnecessary complexity:
- Removed manual `$connect()` calls (Prisma handles this)
- Removed process termination handlers (unnecessary in serverless)
- Kept simple, clean configuration

## Deployment Steps

### Step 1: Update Vercel Environment Variables

1. Go to: https://vercel.com/[username]/music-insights/settings/environment-variables

2. Add/Update these variables:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   
   DIRECT_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:5432/postgres?sslmode=require
   ```

3. Apply to: **Production**, **Preview**, and **Development** environments

### Step 2: Deploy Changes

```bash
# Commit all changes
git add .
git commit -m "fix: Add connection pooling and improve error handling for Vercel"

# Push to trigger deployment
git push
```

Or manually redeploy from Vercel dashboard:
- Go to Deployments tab
- Click "Redeploy" on latest deployment

### Step 3: Verify the Fix

1. **Test adding an album**:
   - Go to search page
   - Search for an album
   - Click "Add to Library"
   - Should succeed without 500 error

2. **Check Vercel logs**:
   ```bash
   vercel logs --follow
   ```
   Look for:
   - ✅ No database connection errors
   - ✅ Successful album creation logs
   - ✅ Proper error messages if issues occur

3. **Check Supabase logs**:
   - Go to Supabase Dashboard → Logs
   - Verify connections are using pooler (port 6543)

## What This Fixes

### Before
- ❌ 500 errors when adding albums
- ❌ Connection pool exhaustion
- ❌ Unclear error messages
- ❌ Database timeouts in serverless

### After
- ✅ Albums add successfully
- ✅ Efficient connection pooling
- ✅ Clear, actionable error messages
- ✅ Optimized for serverless environments
- ✅ Better debugging capabilities

## Testing Locally

Update your local `.env` file with the pooling URL:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:5432/postgres?sslmode=require"
```

Then:
```bash
npm run dev
# Test adding albums locally
```

## Troubleshooting

### If you still get 500 errors:

1. **Check Vercel logs**:
   ```bash
   vercel logs music-insights-asses-cfo-amber --follow
   ```

2. **Verify environment variables in Vercel**:
   - Both `DATABASE_URL` and `DIRECT_DATABASE_URL` should be set
   - URLs should use port 6543 for DATABASE_URL
   - URLs should use port 5432 for DIRECT_DATABASE_URL

3. **Check Supabase pooler status**:
   - Go to Supabase Dashboard → Settings → Database
   - Verify "Connection Pooling" is enabled
   - Check that you're not hitting connection limits

4. **Regenerate Prisma client**:
   ```bash
   npx prisma generate
   git add prisma/
   git commit -m "chore: Regenerate Prisma client"
   git push
   ```

### If migrations fail:

Use the direct URL for migrations:
```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:5432/postgres?sslmode=require" npx prisma db push
```

## Additional Resources

- [Supabase Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

## Summary

The fix involves three key changes:
1. **Connection Pooling**: Use Supabase's PgBouncer (port 6543) for serverless
2. **Error Handling**: Better error tracking and reporting
3. **Configuration**: Proper separation of pooled vs direct connections

After deploying these changes and updating Vercel environment variables, the 500 errors should be resolved.
