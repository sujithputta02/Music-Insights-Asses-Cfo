# Deployment Checklist

## Pre-Deployment

- [ ] All features tested locally
- [ ] Database migrations work (`npx prisma db push`)
- [ ] Environment variables documented in `.env.example`
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] Git repository initialized

## Vercel Deployment Steps

### 1. Database Setup (Choose One)

#### Option A: Vercel Postgres (Recommended for Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create Database
3. Select **Postgres**
4. Note the connection string

#### Option B: Neon (Free Tier, Generous Limits)
1. Visit [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string
4. Format: `postgresql://user:pass@host/db?sslmode=require`

#### Option C: Railway
1. Visit [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string

### 2. Push Code to GitHub

```bash
cd music-insights

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Music Insights Platform"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/music-insights.git

# Push to main
git push -u origin main
```

### 3. Deploy to Vercel

1. Visit [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 4. Environment Variables

Add these in Vercel project settings:

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Required for AI features
OPENAI_API_KEY=sk-proj-...

# Optional
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Important**: 
- Use a strong JWT_SECRET (32+ characters)
- Never commit `.env` to git
- Vercel encrypts environment variables

### 5. Deploy

1. Click **Deploy**
2. Wait for build to complete (2-3 minutes)
3. Vercel will provide a URL: `https://your-app-name.vercel.app`

### 6. Run Database Migrations

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull

# Run migrations
npx prisma db push

# (Optional) Seed data or open Prisma Studio
npx prisma studio
```

**Option B: Manual Connection**
```bash
# Copy DATABASE_URL from Vercel dashboard
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma db push
```

### 7. Test Production Deployment

- [ ] Visit deployed URL
- [ ] Register new account
- [ ] Login works
- [ ] Search albums (try: "Coldplay", "Taylor Swift")
- [ ] Add albums to library
- [ ] Edit ratings and notes
- [ ] View analytics (need 5+ albums)
- [ ] Generate AI recommendations (need 3+ albums)
- [ ] Logout and verify redirect

## Post-Deployment

### Update README
```bash
# Edit README.md and add live demo URL
🔗 **Live Demo**: https://your-app-name.vercel.app
```

### Configure Custom Domain (Optional)
1. Go to Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning

### Monitor Application
- Check Vercel deployment logs
- Monitor function execution times
- Check database connection pooling
- Review error logs in Vercel dashboard

## Troubleshooting

### Build Fails with Prisma Error
```bash
# Ensure prisma generate runs before build
# Already configured in package.json: "postinstall": "prisma generate"
```

### Database Connection Fails
- Verify DATABASE_URL format includes `?sslmode=require` for cloud databases
- Check IP allowlisting (Neon/Railway may require this)
- Test connection locally: `npx prisma db push`

### Environment Variables Not Working
- Redeploy after adding environment variables
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Check variables are set in correct environment (Production/Preview/Development)

### AI Recommendations Not Working
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI account has credits
- Review function logs in Vercel dashboard

### Slow Cold Starts
- Vercel free tier has cold starts (~1-2 seconds)
- Upgrade to Pro for faster Edge Functions
- Consider using ISR (Incremental Static Regeneration) for static pages

## Rollback Strategy

### Rollback to Previous Deployment
1. Go to Vercel project dashboard
2. Navigate to **Deployments**
3. Find previous successful deployment
4. Click **⋯** → **Promote to Production**

### Rollback Database (⚠️ Destructive)
```bash
# Only if you have a backup
pg_restore -d $DATABASE_URL backup.sql
```

## Production Optimization

### Performance
- [ ] Enable Next.js Image Optimization
- [ ] Add Redis for iTunes API caching (replace in-memory)
- [ ] Implement database connection pooling (PgBouncer)
- [ ] Add CDN for static assets
- [ ] Enable compression

### Security
- [ ] Rate limiting on API routes
- [ ] CORS configuration
- [ ] Security headers (helmet.js)
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles this)

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics (Vercel Analytics)
- [ ] Monitor API usage (OpenAI costs)
- [ ] Database performance monitoring
- [ ] Uptime monitoring

## Cost Estimation

### Free Tier (Vercel Hobby Plan)
- ✅ Hosting: Free
- ✅ Bandwidth: 100GB/month
- ✅ Deployments: Unlimited
- ✅ Functions: 1M executions/month
- ✅ Team size: 1 user

### Database Costs
- **Neon Free**: 3GB storage, 0.5GB RAM (sufficient for demo)
- **Vercel Postgres**: $0.10/GB storage, $0.24/GB RAM
- **Railway**: $5/month credit (includes Postgres)

### OpenAI Costs (GPT-4o-mini)
- Input: $0.150 / 1M tokens (~$0.001 per request)
- Output: $0.600 / 1M tokens (~$0.005 per request)
- **Average**: ~$0.01-0.02 per recommendation generation

**Total**: ~$0-5/month for demo usage

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Review database connection in Prisma Studio
3. Test API routes with Postman/Thunder Client
4. Check environment variables are set correctly
5. Review GitHub Issues (if public repo)

---

**Deployment Guide Version**: 1.0
**Last Updated**: 2026-07-31
