# SportShoot Implementation Guide

A complete step-by-step guide for building, deploying, and maintaining the SportShoot shooting tracker application.

## 1. Project Creation

### What We're Building
A web application for tracking shooting sessions with authentication, target image analysis, scoring, leaderboards, and progress tracking.

### Why This Architecture
- **Next.js App Router**: Modern React framework with server components, API routes, and optimal performance
- **Turso SQLite**: Edge-hosted database perfect for serverless deployment
- **GitHub Storage**: Free image hosting with version control
- **NextAuth.js**: Built-in authentication for Next.js
- **Tailwind CSS**: Rapid UI development with utility classes

### Commands
```bash
# Create Next.js project
npx create-next-app@latest sportshoot --typescript --tailwind --eslint --app --src-dir

# Navigate to project
cd sportshoot
```

### Expected Result
A basic Next.js application with TypeScript, Tailwind CSS, and App Router configured.

## 2. Installing Dependencies

### What We're Installing
- `next-auth`: Authentication with JWT sessions
- `@libsql/client`: Turso database driver
- `bcryptjs`: Password hashing
- `uuid`: Generate unique IDs

### Commands
```bash
npm install next-auth@beta @auth/core @libsql/client bcryptjs uuid
npm install @types/bcryptjs @types/uuid --save-dev
```

### Verify
```bash
npm ls next-auth @libsql/client bcryptjs uuid
```

## 3. Creating the Folder Structure

### What We're Creating
A modular folder structure separating concerns:
- `src/lib/auth/` — Authentication utilities
- `src/lib/turso/` — Database layer
- `src/lib/github/` — Image storage service
- `src/engine/` — Business logic (scoring)
- `src/app/api/` — API routes
- `src/app/progress/` — Progress tracking page

### Commands
The folders are created automatically when files are written. The structure should be:

```
src/
├── lib/
│   ├── auth.ts
│   ├── auth/password-utils.ts
│   ├── turso/client.ts
│   ├── turso/schema.ts
│   ├── turso/queries.ts
│   └── github/image-service.ts
├── engine/scoring.ts
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   ├── api/sessions/route.ts
│   ├── api/leaderboard/route.ts
│   ├── api/statistics/route.ts
│   ├── api/users/route.ts
│   ├── api/github/upload/route.ts
│   └── api/migrate/route.ts
└── middleware.ts
```

## 4. Setting Up Authentication

### Files Created
- `src/lib/auth.ts` — NextAuth configuration with Credentials provider
- `src/lib/auth/password-utils.ts` — bcrypt hash and verify functions
- `src/app/api/auth/[...nextauth]/route.ts` — Route handler
- `src/middleware.ts` — Auth middleware for route protection

### What It Does
- Users register with email, password, and display name
- Login with email and password
- JWT sessions stored in cookies
- Protected routes redirect to login
- Admin routes check role

### Key Implementation Details
- Password hashing uses bcrypt with 12 salt rounds
- JWT strategy with 30-day expiry
- Credentials provider handles both login and registration
- Middleware protects `/dashboard`, `/sessions`, `/firearms`, `/admin`, `/progress`, `/statistics`

### Verify
```bash
# Start the dev server
npm run dev

# Test the auth endpoint
curl http://localhost:3000/api/auth/session
```

## 5. Configuring Turso

### Files Created
- `src/lib/turso/client.ts` — Database connection singleton
- `src/lib/turso/schema.ts` — Table definitions and migrations
- `src/lib/turso/queries.ts` — All database operations

### Environment Variables Needed
```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

### Database Tables
1. **users** — User accounts with hashed passwords
2. **shooting_ranges** — Available shooting ranges
3. **manufacturers** — Firearm manufacturers
4. **firearm_models** — Firearm models per manufacturer
5. **calibres** — Available calibres
6. **firearm_types** — Pistol, revolver, rifle, etc.
7. **sight_types** — Iron sights, red dot, etc.
8. **target_types** — ISSF, NRA targets
9. **user_firearms** — User's registered firearms
10. **shooting_sessions** — Completed shooting sessions

### Run Migrations
```bash
curl -X POST http://localhost:3000/api/migrate \
  -H "Authorization: Bearer your-migration-secret"
```

### Verify
```bash
# Check if migration endpoint responds
curl -X POST http://localhost:3000/api/migrate \
  -H "Authorization: Bearer your-migration-secret"
# Expected: {"success":true,"message":"Database migrations completed successfully"}
```

## 6. Creating Database Tables

### What We're Creating
The schema includes seed data for:
- 3 shooting ranges
- 10 manufacturers (Glock, S&W, Sig Sauer, etc.)
- 20 firearm models
- 10 calibres
- 6 firearm types
- 6 sight types
- 10 target types

### Indexes for Performance
- `idx_users_email` — Fast login lookups
- `idx_shooting_sessions_user_id` — User history queries
- `idx_shooting_sessions_created_at` — Time-based queries
- `idx_shooting_sessions_final_score` — Leaderboard ordering
- `idx_shooting_sessions_distance` — Distance filtering

### Common Mistakes
- Forgetting to set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
- Not running migrations before trying to use the app
- Using the wrong Turso database URL format (should start with `libsql://`)

## 7. Implementing GitHub Image Uploads

### Files Created
- `src/lib/github/image-service.ts` — Upload/overwrite logic
- `src/app/api/github/upload/route.ts` — Upload endpoint

### Folder Structure on GitHub
```
shooting-images/
    user-{userId}/
        before.jpg
        after.jpg
```

### How It Works
1. User captures photo on device (base64 format)
2. API endpoint receives both images
3. Checks if files exist on GitHub (gets SHA)
4. Uploads with SHA for overwrite, without SHA for new files
5. Returns raw GitHub URLs for database storage

### Image Validation
- Validates JPEG magic bytes (FF D8 FF)
- Strips data URL prefixes
- Maximum file size handled by client

### Verify
```bash
# Test with a small JPEG (base64 encoded)
curl -X POST http://localhost:3000/api/github/upload \
  -H "Content-Type: application/json" \
  -d '{"beforeImage":"/9j/4AAQSkZJRg...","afterImage":"/9j/4AAQSkZJRg..."}'
```

## 8. Implementing Image Analysis

### Current State
The application includes a mock image analysis implementation in the session wizard (`src/app/sessions/new/page.tsx`). Processing steps:

1. Detecting target
2. Correcting perspective
3. Detecting bullet holes
4. Calculating scores
5. Complete

### Future OpenCV Integration
The mock implementation generates random shot positions and scores. To integrate real analysis:

1. Add OpenCV.js to the project
2. Replace the mock processing function with real image analysis
3. Use the before/after images to detect bullet holes
4. Calculate actual ring scores based on target geometry

## 9. Building the Scoring Engine

### Files Created
- `src/engine/scoring.ts` — Complete scoring calculation

### Features
- Distance multiplier calculation with interpolation
- Grouping bonus calculation
- Final score formula: `(Raw × Distance Multiplier) + Grouping Bonus`

### Distance Multiplier Interpolation
For distances between known values:
```typescript
// Example: 8 metres (between 7m → 1.20 and 10m → 1.50)
// Interpolation: 1.20 + ((8-7)/(10-7)) × (1.50-1.20) = 1.35
```

### Verify
```typescript
import { calculateFinalScore } from './engine/scoring';

// Test: 5m, score 85, group 15mm
const result = calculateFinalScore({
  rawTargetScore: 85,
  distanceMeters: 5,
  groupSizeMm: 15,
});
// Expected: { finalScore: 105, distanceMultiplier: 1.00, groupingBonus: 20 }
```

## 10. Building Statistics

### What We're Building
API endpoint at `/api/statistics` that returns:
- Total sessions count
- Total shots fired
- Average final score
- Average raw score
- Personal best score
- Best group size
- Current ranking

### How It Works
The statistics are calculated directly from the `shooting_sessions` table using SQL aggregation functions (COUNT, SUM, AVG, MAX, MIN).

### Verify
```bash
curl http://localhost:3000/api/statistics
# Expected: { stats: { total_sessions: 0, total_shots: 0, ... } }
```

## 11. Building Leaderboards

### What We're Building
API endpoint at `/api/leaderboard` that supports:
- Period filtering: today, weekly, monthly, yearly, all_time
- Distance filtering
- Calibre filtering

### How It Works
Uses SQL window functions (`ROW_NUMBER() OVER (ORDER BY MAX(final_score) DESC)`) to calculate ranks dynamically. No separate leaderboard table needed.

### Verify
```bash
curl "http://localhost:3000/api/leaderboard?period=all_time&limit=10"
# Expected: { entries: [...] }
```

## 12. Building the Dashboard

### What We're Building
Main dashboard page at `/dashboard` showing:
- Welcome message with user name
- Stat cards: total sessions, total shots, average final score, best score
- Current ranking
- Recent sessions list

### Data Loading
Dashboard fetches from two endpoints:
1. `/api/statistics` — User stats
2. `/api/sessions?limit=10` — Recent sessions

## 13. Building the Progress Page

### What We're Building
Progress tracking at `/progress` showing:
- Personal best, average final score, average raw score, best group
- Improvement trend over last 10 sessions
- Complete session history

### Improvement Calculation
```typescript
const improvement = lastSessionScore - firstSessionScore;
// Positive = improving, Negative = declining
```

## 14. Testing Every Feature

### Test Checklist

#### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Session persists after page refresh
- [ ] Protected routes redirect to login
- [ ] Sign out clears session

#### Database
- [ ] Migrations run successfully
- [ ] Seed data is present (ranges, manufacturers, etc.)
- [ ] Insert and query shooting sessions

#### GitHub Upload
- [ ] Images upload to correct path
- [ ] Images overwrite on subsequent uploads
- [ ] Invalid files return error

#### Scoring
- [ ] Exact distance multipliers match spec
- [ ] Interpolated distances calculated correctly
- [ ] Grouping bonus thresholds correct
- [ ] Final score formula matches examples

#### API
- [ ] All endpoints return correct HTTP status codes
- [ ] Unauthenticated requests return 401
- [ ] Valid responses match expected format

## 15. Deploying to Vercel

### Steps
1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure environment variables
5. Deploy

### Environment Variables on Vercel
All 9 variables from `.env.local` must be set in Vercel project settings.

### Post-Deployment
```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer your-migration-secret"
```

## 16. Verifying Production

### Checklist
- [ ] Application loads at production URL
- [ ] Registration creates account
- [ ] Login redirects to dashboard
- [ ] New session wizard works end-to-end
- [ ] Images upload to GitHub
- [ ] Sessions save to Turso
- [ ] Leaderboards display correctly
- [ ] Statistics calculate properly
- [ ] Admin page accessible for admin users
- [ ] Mobile responsive layout works

## 17. Maintaining the Application

### Regular Tasks
- **Database backups**: Use Turso's built-in backup features
- **Dependency updates**: Run `npm outdated` and update regularly
- **Monitor logs**: Check Vercel deployment logs for errors
- **GitHub token rotation**: Regenerate tokens before expiration

### Monitoring
- Vercel Analytics for page views and performance
- Vercel Logs for error tracking
- Turso dashboard for database metrics

## 18. Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update major versions (use with caution)
npm install next@latest react@latest react-dom@latest
```

### Common Issues
- Breaking changes in Next.js require reading migration guides
- @libsql/client API changes may affect queries
- Check peer dependencies when updating React

## 19. Backing Up the Database

### Turso Backup Options
1. **Export to SQL file**:
```bash
turso db shell sportshoot .dump > backup.sql
```

2. **Create a new database from backup**:
```bash
turso db create sportshoot-backup
cat backup.sql | turso db shell sportshoot-backup
```

3. **Automated backups**:
   - Schedule cron job with `turso db dump`
   - Store in separate GitHub repository or cloud storage

## 20. Future Upgrades

### Planned Features
1. **OpenCV.js Integration** — Replace mock processing with real bullet hole detection
2. **Multiple Targets Support** — Different target types per session
3. **IPSC Scoring Mode** — Practical shooting competition rules
4. **AI Coaching** — Analysis-based training recommendations

### Architecture Changes
- Consider switching to a dedicated image processing service for heavy analysis
- Add Redis caching for leaderboard queries
- Implement WebSocket updates for real-time competition scoring

---

## Common Mistakes Summary

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Missing environment variables | API returns 500 | Check .env.local and Vercel settings |
| Not running migrations | Tables don't exist | POST to /api/migrate |
| Wrong Turso URL format | Connection fails | Ensure it starts with `libsql://` |
| Expired GitHub token | Upload fails | Regenerate token in GitHub settings |
| AUTH_SECRET mismatch | Session doesn't persist | Ensure same secret across deployments |
| Forgetting to set AUTH_URL | Callback errors | Set to full deployment URL |

---

## Quick Reference

### Useful Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/signin | Login |
| POST | /api/auth/signout | Logout |
| GET | /api/auth/session | Get session |
| POST | /api/sessions | Create session |
| GET | /api/sessions | Get sessions |
| GET | /api/leaderboard | Get leaderboard |
| GET | /api/statistics | Get stats |
| GET | /api/users | Get profile |
| PUT | /api/users | Update profile |
| POST | /api/github/upload | Upload images |
| POST | /api/migrate | Run migrations |