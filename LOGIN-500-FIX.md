# Login 500 Error - FIXED ✅

## Problem
The login endpoint `/api/auth/login` was returning a **500 Internal Server Error** in production on Vercel.

```
Error: Can't reach database server
PrismaClientInitializationError: Invalid prisma.user.findUnique() invocation
```

## Root Cause
The `DATABASE_URL` was using the **incorrect Supabase connection string format**. 

### What Was Wrong
- Used: `db.tgolowaqpssvwfhasleu.supabase.co:6543` (direct database host)
- Needed: `aws-0-ap-southeast-2.pooler.supabase.com:5432` (Supabase pooler)

Vercel's serverless functions couldn't reach the database because we weren't using Supabase's connection pooler correctly.

## Solution - Use Supabase CLI to Get Correct Connection String

### Step 1: Link Your Supabase Project
```bash
cd your-project
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Get the Pooler URL
The Supabase CLI creates a `.temp/pooler-url` file with the correct connection string:
```bash
cat supabase/.temp/pooler-url
```

This reveals the **correct pooler connection string format**:
```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

### Step 3: Update Vercel Environment Variables

### Step 3: Update Vercel Environment Variables

```bash
# Remove old DATABASE_URL
vercel env rm DATABASE_URL production

# Add correct pooler URL
echo "postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres" | vercel env add DATABASE_URL production
```

**For this project:**
```bash
vercel env add DATABASE_URL production
# When prompted, enter:
postgresql://postgres.tgolowaqpssvwfhasleu:v1HaHGfvs9Cxkvxv@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres
```

### Step 4: Deploy
```bash
git commit --allow-empty -m "Fix database connection with Supabase pooler"
git push
```

## What Was Fixed

### Before ❌
- Using: `db.tgolowaqpssvwfhasleu.supabase.co:6543`  
- Username: `postgres`
- Error: "Can't reach database server"
- Login returned 500 errors

### After ✅
- Using: `aws-0-ap-southeast-2.pooler.supabase.com:5432`
- Username: `postgres.tgolowaqpssvwfhasleu` 
- Database connection works perfectly
- Login returns proper authentication responses

## Key Learnings

1. **Use Supabase CLI** - The CLI provides the correct connection string format automatically
2. **Pooler URL Format** - Supabase pooler uses a different hostname and username format:
   - Username includes project ref: `postgres.PROJECT_REF`
   - Hostname: `aws-0-REGION.pooler.supabase.com`
3. **Port 5432** - Supabase pooler uses standard PostgreSQL port (5432), not 6543
4. **No special parameters** - No need for `pgbouncer=true` or `sslmode=require`

## Testing

✅ **Registration works:**
```bash
curl -X POST https://music-insights-asses-cfo-amber.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test"}'
```

✅ **Login works:**
```bash
curl -X POST https://music-insights-asses-cfo-amber.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## Summary

The 500 error was caused by using an incorrect Supabase connection string format. The solution was to:
1. Use `supabase link` to connect to the project
2. Get the correct pooler URL from `supabase/.temp/pooler-url`
3. Update Vercel's `DATABASE_URL` with the correct pooler connection string
4. Redeploy

**Status**: ✅ **FIXED AND WORKING**
