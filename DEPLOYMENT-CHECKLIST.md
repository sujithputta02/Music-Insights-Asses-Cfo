# Vercel Deployment Checklist - Quick Fix

## 🚨 IMMEDIATE ACTION REQUIRED

Your 500 error is most likely due to **missing environment variables** in Vercel.

---

## Step 1: Add Environment Variables to Vercel (CRITICAL)

1. Go to: https://vercel.com → Your Project → Settings → Environment Variables

2. Add these 4 variables (copy exactly as shown):

### Variable 1: DATABASE_URL
```
DATABASE_URL
```
Value: (copy from your local .env file - contains your database password)
```
postgresql://postgres:YOUR_PASSWORD@your-project.supabase.co:5432/postgres
```

### Variable 2: GROQ_API_KEY
```
GROQ_API_KEY
```
Value: (copy from your local .env file)
```
gsk_YOUR_ACTUAL_GROQ_API_KEY_HERE
```

### Variable 3: JWT_SECRET
```
JWT_SECRET
```
Value: (copy from your local .env file)
```
YOUR_JWT_SECRET_HERE
```

### Variable 4: NEXT_PUBLIC_APP_URL
```
NEXT_PUBLIC_APP_URL
```
Value:
```
https://music-insights-asses-cfo.vercel.app
```

**IMPORTANT:** 
- Apply to: Production, Preview, AND Development
- Don't add quotes around values
- Make sure there are no trailing spaces

---

## Step 2: Push Database Schema

Run this locally (one time only):
```bash
cd music-insights
npx prisma db push
```

This creates the `users` and `albums` tables in your Supabase database.

---

## Step 3: Redeploy

### Option A: Vercel Dashboard
1. Go to Deployments tab
2. Click three dots on latest deployment
3. Click "Redeploy"
4. **UNCHECK** "Use existing Build Cache"

### Option B: Command Line
```bash
cd music-insights
vercel --prod
```

---

## Step 4: Test

### Test 1: Database Connection
Visit: https://music-insights-asses-cfo.vercel.app/api/test-db

Should return:
```json
{
  "success": true,
  "message": "Database connected successfully",
  "userCount": 0
}
```

### Test 2: Registration
```bash
curl -X POST https://music-insights-asses-cfo.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

Should return success with user data and token.

---

## Step 5: Check Logs (if still failing)

1. Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Click "Functions" tab
4. Click on `/api/auth/register`
5. Look at the error logs

The enhanced error logging will now show the exact error message.

---

## Common Issues

### ❌ "Environment variable not found: DATABASE_URL"
**Fix:** You forgot Step 1 - add environment variables in Vercel

### ❌ "Can't reach database server"
**Fix:** 
- Check Supabase is running: https://supabase.com/dashboard
- Verify DATABASE_URL is correct (check for typos)

### ❌ "Table `users` does not exist"
**Fix:** Run Step 2 - `npx prisma db push`

### ❌ "PrismaClient initialization error"
**Fix:** Redeploy without build cache (Step 3)

---

## Quick Diagnosis

If you see the error in your browser console, check:

1. **Network tab** → Click the failed request → **Response** tab
   - This will show the actual error message

2. **Vercel Function Logs** (as described in Step 5)
   - This shows server-side errors with full stack traces

---

## Success Criteria

✅ `/api/test-db` returns success  
✅ User registration works in the UI  
✅ No 500 errors in console  
✅ Can log in after registering  

---

## Need More Info?

The enhanced error logging now includes:
- Error message
- Error name
- Stack trace
- Development-mode error details

Check the Vercel function logs and share the error message for more specific help.
