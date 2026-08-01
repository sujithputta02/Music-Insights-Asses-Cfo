# Vercel Deployment Fix for 500 Error on POST /api/library

## Problem
The POST endpoint to `/api/library` returns a 500 Internal Server Error on the deployed Vercel instance, while GET requests work fine.

## Root Cause
The issue is likely caused by one or more of the following:
1. Prisma client not properly generated in the production build
2. Database schema not pushed/synced with the production database
3. Missing or incorrect environment variables on Vercel

## Solution

### Step 1: Update Build Configuration

The `package.json` has been updated to include database push in the build process:

```json
"scripts": {
  "build": "prisma generate && prisma db push --accept-data-loss && next build",
  "vercel-build": "prisma generate && prisma db push --accept-data-loss && next build"
}
```

### Step 2: Verify Environment Variables on Vercel

Make sure these environment variables are set in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Ensure the following are set:

```
DATABASE_URL=<your-database-url>
GROQ_API_KEY=<your-groq-api-key>
JWT_SECRET=<your-jwt-secret>
NEXT_PUBLIC_APP_URL=https://music-insights-asses-cfo-amber.vercel.app
```

**Note:** Use the same values from your `.env` file. These should already be configured in Vercel.

### Step 3: Redeploy

After making these changes:

1. Commit the changes:
```bash
git add .
git commit -m "fix: Update build process to sync database schema on deployment"
git push
```

2. Vercel will automatically redeploy
3. Or manually trigger a redeploy from the Vercel dashboard

### Step 4: Monitor Deployment Logs

1. Go to Vercel dashboard → Deployments
2. Click on the latest deployment
3. Check the build logs for:
   - `✓ Generated Prisma Client`
   - `The database is already in sync with the Prisma schema` or `🚀 Your database is now in sync`

### Step 5: Test the Fix

After deployment, test the POST endpoint:

```bash
# Replace with your actual JWT token
curl -X POST https://music-insights-asses-cfo-amber.vercel.app/api/library \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "appleCatalogId": "123456",
    "title": "Test Album",
    "artistName": "Test Artist",
    "genre": "Rock",
    "releaseDate": "2024-01-01",
    "trackCount": 10,
    "artworkUrl": "https://example.com/art.jpg",
    "collectionPrice": 9.99
  }'
```

## Additional Improvements Made

### 1. Enhanced Error Logging
The POST handler now includes comprehensive error logging to help diagnose issues:
- Logs received body
- Logs validated data
- Logs detailed error information

### 2. Better Null Handling
Updated the validation schema and data handling to properly distinguish between `undefined`, `null`, and empty strings.

### 3. Improved Validation
The `addAlbumSchema` now properly handles optional and nullable fields:
- Allows empty strings for `artworkUrl`
- Properly handles `null` values for optional fields

## Verification Checklist

- [ ] Environment variables are set on Vercel
- [ ] Build logs show Prisma client generation
- [ ] Build logs show database sync
- [ ] Deployment completes successfully
- [ ] GET /api/library works (returns empty array or user's albums)
- [ ] POST /api/library works (adds album successfully)
- [ ] Check Vercel Function logs for any runtime errors

## If the Issue Persists

If you still see 500 errors after deployment:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for errors in the function logs
   - The enhanced logging should show exactly where the failure occurs

2. **Verify Database Connection:**
   - Check if the DATABASE_URL is correct
   - Verify the database is accessible from Vercel (Supabase should be)
   - Try accessing the database through Prisma Studio locally

3. **Check Prisma Client:**
   - In build logs, confirm `prisma generate` runs successfully
   - Check for any Prisma-related errors

4. **Test Locally:**
   - Run `npm run build` locally to simulate production build
   - Check if any errors occur during build

## Contact Support

If none of the above works, check:
- Vercel deployment logs for specific error messages
- Supabase database logs
- Console logs in the browser developer tools for client-side errors
