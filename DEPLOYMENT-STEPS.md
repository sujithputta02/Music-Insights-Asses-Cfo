# Deployment Steps - Fix 500 Error

## Quick Checklist

### ☐ Step 1: Update Vercel Environment Variables

1. Go to: https://vercel.com/settings/[your-project]/environment-variables

2. Add or update these two variables:

   **DATABASE_URL** (Connection Pooling - Port 6543):
   ```
   postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```

   **DIRECT_DATABASE_URL** (Direct Connection - Port 5432):
   ```
   postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:5432/postgres?sslmode=require
   ```

3. Apply to: ✓ Production, ✓ Preview, ✓ Development

### ☐ Step 2: Commit and Push Changes

```bash
# Check what files changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: Add Supabase connection pooling for Vercel serverless"

# Push to trigger deployment
git push origin main
```

### ☐ Step 3: Wait for Deployment

- Go to: https://vercel.com/[username]/music-insights
- Watch the deployment progress
- Should take 1-3 minutes

### ☐ Step 4: Test the Fix

1. **Navigate to your production app**:
   ```
   https://music-insights-asses-cfo-amber.vercel.app
   ```

2. **Test the workflow**:
   - ✓ Log in
   - ✓ Go to Search page
   - ✓ Search for an album (e.g., "Abbey Road")
   - ✓ Click "Add to Library"
   - ✓ Should succeed without 500 error
   - ✓ Album should appear in Library page

3. **Check if errors are gone**:
   - Open browser DevTools (F12)
   - Look at Network tab
   - POST to `/api/library` should return 201 (success)
   - No more 500 errors!

### ☐ Step 5: Monitor Logs (Optional)

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# View live logs
vercel logs --follow

# Or check logs in Vercel Dashboard:
# https://vercel.com/[username]/music-insights/logs
```

## What Was Changed

### Files Modified:
1. ✅ `.env` - Added connection pooling URLs
2. ✅ `.env.example` - Updated with proper configuration
3. ✅ `prisma/schema.prisma` - Added directUrl for migrations
4. ✅ `app/api/library/route.ts` - Enhanced error handling
5. ✅ `lib/db.ts` - Simplified database client

### Key Changes:
- **Connection Pooling**: Now using Supabase's PgBouncer (port 6543)
- **Error Handling**: Better error reporting for debugging
- **Configuration**: Proper separation of pooled vs direct connections

## Expected Results

### Before Fix:
- ❌ 500 Internal Server Error when adding albums
- ❌ Poor error messages
- ❌ Connection pool exhaustion

### After Fix:
- ✅ 201 Created - Albums add successfully
- ✅ Clear error messages if something fails
- ✅ Efficient connection pooling
- ✅ No connection exhaustion

## Troubleshooting

### If still getting 500 errors:

1. **Verify Vercel environment variables**:
   - Check both `DATABASE_URL` and `DIRECT_DATABASE_URL` are set
   - Verify port 6543 for DATABASE_URL
   - Verify port 5432 for DIRECT_DATABASE_URL

2. **Check Vercel function logs**:
   ```bash
   vercel logs --follow
   ```
   Look for specific error messages

3. **Verify Supabase pooler is enabled**:
   - Go to: Supabase Dashboard → Settings → Database
   - Check "Connection Pooling" is enabled

4. **Try regenerating Prisma client**:
   ```bash
   npx prisma generate
   git add .
   git commit -m "chore: Regenerate Prisma client"
   git push
   ```

### If local development breaks:

Your local `.env` should have the pooling URL too:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@HOST.supabase.co:5432/postgres?sslmode=require"
```

Then:
```bash
npx prisma generate
npm run dev
```

## Need Help?

- **Detailed Fix Documentation**: See `500-ERROR-FIX.md`
- **Vercel Database Guide**: See `VERCEL-DATABASE-FIX.md`
- **Supabase Docs**: https://supabase.com/docs/guides/database/connecting-to-postgres
- **Prisma Docs**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

## Success Criteria

You'll know it's working when:
- ✅ Albums add to library without errors
- ✅ Network tab shows 201 status codes
- ✅ No 500 errors in console
- ✅ Albums appear in Library page immediately
- ✅ Vercel logs show successful database operations

---

**Time to complete**: ~5-10 minutes
**Difficulty**: Easy (just update env vars and deploy)
