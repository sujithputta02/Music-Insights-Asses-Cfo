# Quick Start Guide

Get Music Insights running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- Code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies (1 min)

```bash
cd music-insights
npm install
```

### 2. Set Up Database (2 min)

```bash
# Create database
createdb music_insights

# Or using psql
psql -U postgres
CREATE DATABASE music_insights;
\q

# Copy environment file
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/music_insights"
JWT_SECRET="your-secret-key-at-least-32-characters-long"
OPENAI_API_KEY="sk-..." # Optional - only needed for AI recommendations
```

### 3. Initialize Database (1 min)

```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server (1 min)

```bash
npm run dev
```

Visit: http://localhost:3000

## First Steps

1. **Create Account**: Click "Get Started" → Fill form → Register
2. **Search Albums**: Click "Search" → Type artist name (e.g., "Coldplay")
3. **Add to Library**: Click "Add to Library" on album cards
4. **Rate Albums**: Go to "Library" → Click stars to rate
5. **Add Notes**: Click "Add note" → Write your thoughts
6. **View Analytics**: Go to "Analytics" → See charts (need 5+ albums)
7. **Get AI Insights**: Go to "AI Insights" → Generate recommendations (need 3+ albums)

## Troubleshooting

### Can't connect to database
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d music_insights
```

### Prisma errors
```bash
# Regenerate client
npx prisma generate

# Reset database (⚠️ deletes data)
npx prisma db push --force-reset
```

### Port 3000 already in use
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Vercel
- Explore the codebase and customize features

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes
npm run db:studio       # Open Prisma Studio GUI

# Linting
npm run lint            # Run ESLint
```

## Demo Data (Optional)

Want to test with sample data? Use Prisma Studio:

```bash
npm run db:studio
```

Manually add albums through the UI for the best experience!

---

**Need Help?** Check the main [README.md](./README.md) for detailed documentation.
