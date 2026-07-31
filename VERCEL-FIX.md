# Vercel Deployment Fix Guide

## Issue: 500 Internal Server Error on `/api/auth/register`

### Root Cause
The 500 error is most likely caused by one or more of these issues:
1. **Missing environment variables in Vercel**
2. **Database connection issues**
3. **Prisma Client not properly initialized**

---

## Solution Steps

### 1. Configure Environment Variables in Vercel

Go to your Vercel dashboard: https://vercel.com/your-username/music-insights-asses-cfo/settings/environment-variables

Add ALL of these environment variables:

#### Required Variables:

```bash
# Copy these values from your local .env file
# DO NOT commit actual secrets to Git!

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@your-project.supabase.co:5432/postgres

GROQ_API_KEY=gsk_YOUR_ACTUAL_GROQ_API_KEY_HERE

JWT_SECRET=YOUR_JWT_SECRET_HERE

NEXT_PUBLIC_APP_URL=https://music-insights-asses-cfo.vercel.app
```

**Important Notes:**
- Set these variables for **Production**, **Preview**, and **Development** environments
- The `DATABASE_URL` password contains special characters (`%25` = `%`, `%40` = `@`, `%24` = `$`)
- Make sure there are NO extra spaces or quotes around the values

---

### 2. Verify Supabase Database Connection

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/tgolowaqpssvwfhasleu
2. Navigate to **Settings** → **Database**
3. Verify that:
   - The database is running
   - Connection pooling is enabled
   - You're using the **Transaction mode** connection string for Prisma

**Alternative Connection String (Connection Pooling):**
If the current connection isn't working, try the pooled connection:
```bash
DATABASE_URL=postgresql://postgres.tgolowaqpssvwfhasleu:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

### 3. Run Database Migrations

Your database needs the correct tables. Run this command locally:

```bash
cd music-insights
npx prisma db push
```

This will create the `users` and `albums` tables in your Supabase database.

---

### 4. Trigger a Redeploy in Vercel

After adding environment variables:

1. Go to your Vercel dashboard → **Deployments**
2. Find the latest deployment
3. Click the **three dots** → **Redeploy**
4. Make sure "Use existing Build Cache" is **UNCHECKED**

Or redeploy from CLI:
```bash
vercel --prod
```

---

### 5. Check Vercel Logs

After redeploying, check the logs:

1. Go to your Vercel dashboard
2. Click on **Deployments** → **Latest deployment**
3. Click on **Functions** tab
4. Find `/api/auth/register` and check the logs

Look for specific error messages that will tell you exactly what's wrong.

---

## Common Errors & Solutions

### Error: "PrismaClient is unable to run in the browser"
**Solution:** You're importing Prisma in a client component. Make sure API routes are server-side only.

### Error: "Can't reach database server"
**Solution:** 
- Verify DATABASE_URL is correct in Vercel
- Check Supabase database is running
- Ensure your Supabase project allows connections from Vercel IPs

### Error: "Environment variable not found: DATABASE_URL"
**Solution:** You forgot to add environment variables in Vercel dashboard

### Error: "Invalid `prisma.user.create()` invocation"
**Solution:** Run `npx prisma db push` to sync your database schema

---

## Testing Steps

After deploying:

1. **Test the registration endpoint directly:**
```bash
curl -X POST https://music-insights-asses-cfo.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

2. **Expected success response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Quick Checklist

- [ ] All environment variables added to Vercel
- [ ] Database tables created with `prisma db push`
- [ ] Redeployed without build cache
- [ ] Checked Vercel function logs for specific errors
- [ ] Tested registration endpoint with curl
- [ ] Verified Supabase database is accessible

---

## Still Having Issues?

If you're still getting 500 errors:

1. **Check Vercel Function Logs** - The enhanced error logging will show the exact error
2. **Verify Prisma Client is generated** - Check build logs for "✔ Generated Prisma Client"
3. **Test database connection** - Create a simple test endpoint:

Create `app/api/test-db/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({ success: true, message: 'Database connected' });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit: `https://music-insights-asses-cfo.vercel.app/api/test-db`

---

## Need More Help?

Share the exact error from Vercel function logs and I can provide more specific guidance.
