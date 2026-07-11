# SportShoot - Ultimate Shooting Tracker

A production-ready web application for tracking shooting sessions, analysing target scores, and competing on leaderboards. Built with Next.js, Turso SQLite, GitHub image storage, and deployed on Vercel.

## Features

- **User Authentication** — Email/password registration and login with JWT sessions
- **Shooting Sessions** — Complete wizard-driven workflow for recording shooting sessions
- **Before & After Capture** — Camera-based target image capture with standardised 2-metre photo distance
- **Automatic Bullet Hole Detection** — Image analysis engine detects and scores bullet holes (mock implementation, ready for OpenCV integration)
- **Distance-Based Scoring** — Configurable distance multipliers with smooth interpolation
- **Grouping Bonus** — Automatic group size calculation with bonus points
- **Historical Sessions** — Permanent storage of all completed sessions
- **Progress Tracking** — View improvement trends, personal bests, and statistics
- **Leaderboards** — Dynamic leaderboards by period (today, weekly, monthly, yearly, all-time)
- **GitHub Image Storage** — Only the latest before/after images are stored per user
- **Responsive UI** — Mobile-first design with desktop sidebar navigation
- **Admin Dashboard** — User management and application monitoring

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with App Router, server components, and API routes |
| **React 19** | UI component library |
| **TypeScript** | Type-safe development |
| **Turso SQLite** | Edge-hosted SQLite database for persistence |
| **@libsql/client** | Turso database driver |
| **NextAuth.js v5** | Authentication with JWT sessions |
| **bcryptjs** | Password hashing |
| **GitHub API** | Image storage via GitHub Contents API |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Zustand** | State management for wizard flow |
| **React Query** | Server state management |
| **Zod** | Schema validation |
| **date-fns** | Date formatting |
| **lucide-react** | Icon library |
| **Vercel** | Hosting and deployment |

### Why This Architecture?

- **Turso over traditional SQLite**: Edge-hosted with HTTP access, perfect for serverless Vercel deployments. No connection pooling needed.
- **GitHub for images**: Cost-effective, no separate storage service. Only the latest images are kept, minimising storage.
- **NextAuth.js**: Built for Next.js, supports credentials provider with JWT, works seamlessly with server components and middleware.
- **API Routes over direct DB access**: Clean separation of concerns, authentication enforced at the API layer.

## Folder Structure

```
sportshoot/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── admin/               # Admin dashboard and management
│   │   ├── api/                 # API routes
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── sessions/        # Shooting sessions CRUD
│   │   │   ├── leaderboard/     # Leaderboard queries
│   │   │   ├── statistics/      # User statistics
│   │   │   ├── users/           # User profile management
│   │   │   ├── github/upload/   # Image upload to GitHub
│   │   │   └── migrate/         # Database migration endpoint
│   │   ├── dashboard/           # Main dashboard page
│   │   ├── firearms/            # Firearm management
│   │   ├── leaderboard/         # Leaderboard view
│   │   ├── login/               # Login page
│   │   ├── progress/            # Progress tracking
│   │   ├── register/            # Registration page
│   │   └── sessions/new/        # New session wizard
│   ├── components/              # Shared UI components
│   │   ├── shared/              # Reusable components (navbar, cards, etc.)
│   │   └── ui/                  # Base UI components (button, etc.)
│   ├── engine/                  # Business logic
│   │   └── scoring.ts           # Scoring engine with distance multipliers
│   ├── lib/                     # Core libraries
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── auth/password-utils.ts  # Password hashing
│   │   ├── turso/               # Database layer
│   │   │   ├── client.ts        # Turso connection
│   │   │   ├── schema.ts        # Database schema & migrations
│   │   │   └── queries.ts       # All database queries
│   │   └── github/              # GitHub image service
│   │       └── image-service.ts # Image upload/overwrite logic
│   ├── stores/                  # Zustand state stores
│   │   ├── auth-store.ts        # Authentication state
│   │   └── session-wizard-store.ts  # Session wizard state
│   └── middleware.ts            # Next.js middleware for auth
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── tailwind.config.ts           # Tailwind CSS configuration
```

## Database Schema

### Entity Relationship Diagram

```
users (1) ──< shooting_sessions (N)
users (1) ──< user_firearms (N)
shooting_ranges (1) ──< shooting_sessions (N)
user_firearms (1) ──< shooting_sessions (N)
manufacturers (1) ──< firearm_models (N)
```

### Tables

**users**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | UUID primary key |
| email | TEXT (UNIQUE) | User's email address |
| display_name | TEXT | Display name shown on leaderboards |
| password_hash | TEXT | bcrypt hashed password |
| profile_image_url | TEXT | Avatar URL (nullable) |
| role | TEXT | 'user' or 'admin' |
| country | TEXT | Country (nullable) |
| province | TEXT | Province/state (nullable) |
| city | TEXT | City (nullable) |
| club_name | TEXT | Shooting club (nullable) |
| created_at | TEXT | ISO 8601 timestamp |
| updated_at | TEXT | ISO 8601 timestamp |

**shooting_sessions**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | UUID primary key |
| user_id | TEXT (FK) | References users(id) |
| shooting_range_id | TEXT (FK) | References shooting_ranges(id) |
| firearm_id | TEXT (FK) | References user_firearms(id) |
| calibre | TEXT | Calibre name |
| shooting_distance | REAL | Distance in metres |
| number_of_shots | INTEGER | Number of shots fired |
| raw_target_score | REAL | Raw score from target |
| distance_multiplier | REAL | Calculated multiplier |
| group_size_mm | REAL | Group size in millimetres |
| grouping_bonus | INTEGER | Bonus points for tight grouping |
| final_score | REAL | (raw × multiplier) + bonus |
| before_image_url | TEXT | GitHub URL for before image |
| after_image_url | TEXT | GitHub URL for after image |
| status | TEXT | 'completed' or 'rejected' |
| shot_datetime | TEXT | When the shooting occurred |
| timezone | TEXT | User's timezone at time of shooting |
| created_at | TEXT | ISO 8601 timestamp |

**Indexes**: `idx_users_email`, `idx_shooting_sessions_user_id`, `idx_shooting_sessions_created_at`, `idx_shooting_sessions_final_score`, `idx_shooting_sessions_distance`, `idx_user_firearms_user_id`

## API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | POST | Sign in with credentials |
| `/api/auth/signout` | POST | Sign out |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/csrf` | GET | Get CSRF token |

### Sessions

**POST /api/sessions** — Create a new shooting session
- Auth: Required
- Body: `{ shooting_range_id, firearm_id, calibre, shooting_distance, number_of_shots, raw_target_score, group_size_mm, before_image_url, after_image_url, shot_datetime, timezone }`
- Response: `{ session, scoring }`

**GET /api/sessions** — Get user's sessions
- Auth: Required
- Query: `?id={id}` (single session) or `?limit=50&offset=0`
- Response: `{ sessions }` or `{ session }`

### Leaderboard

**GET /api/leaderboard** — Get leaderboard entries
- Auth: Required
- Query: `?period=today|weekly|monthly|yearly|all_time&distance=10&calibre=9mm&limit=50`
- Response: `{ entries }`

### Statistics

**GET /api/statistics** — Get user statistics
- Auth: Required
- Query: `?type=history` for historical sessions
- Response: `{ stats }` or `{ history }`

### Users

**GET /api/users** — Get user profile
- Auth: Required
- Query: `?admin=true` for all users (admin only)
- Response: `{ user }` or `{ users }`

**PUT /api/users** — Update user profile
- Auth: Required
- Body: `{ display_name, country, province, city, club_name, profile_image_url }`

### GitHub Upload

**POST /api/github/upload** — Upload session images
- Auth: Required
- Body: `{ beforeImage: base64, afterImage: base64 }`
- Response: `{ beforeUrl, afterUrl }`

### Migration

**POST /api/migrate** — Run database migrations
- Auth: MIGRATION_SECRET header required
- Response: `{ success: true }`

## Scoring Engine

### Distance Multipliers

| Distance | Multiplier |
|----------|-----------:|
| 5 m | 1.00 |
| 7 m | 1.20 |
| 10 m | 1.50 |
| 12 m | 1.70 |
| 15 m | 2.00 |
| 20 m | 2.50 |
| 25 m | 3.00 |
| 30 m | 3.50 |
| 40 m | 4.50 |
| 50 m | 5.50 |

Distances between these values are interpolated smoothly.

### Grouping Bonus

| Group Size | Bonus |
|------------|------:|
| Under 20 mm | +20 |
| Under 30 mm | +15 |
| Under 40 mm | +10 |
| Under 50 mm | +5 |
| Above 50 mm | +0 |

### Final Score Formula

```
Final Score = (Raw Target Score × Distance Multiplier) + Grouping Bonus
```

### Worked Examples

**Example 1**: 5 metres, raw score 85, group size 15mm
- Multiplier: 1.00
- Grouping Bonus: +20
- Final Score: (85 × 1.00) + 20 = **105**

**Example 2**: 15 metres, raw score 78, group size 35mm
- Multiplier: 2.00
- Grouping Bonus: +10
- Final Score: (78 × 2.00) + 10 = **166**

**Example 3**: 8 metres (interpolated), raw score 90, group size 22mm
- Multiplier: 1.35 (between 1.20 at 7m and 1.50 at 10m)
- Grouping Bonus: +15
- Final Score: (90 × 1.35) + 15 = **136.5**

## Image Analysis

The application supports automated target image analysis:

1. **Before Image** — Photo of clean target taken before shooting (always from approx. 2 metres)
2. **After Image** — Photo of completed target taken after shooting (always from approx. 2 metres)
3. **Bullet Hole Detection** — Image processing to identify and score each shot
4. **Group Calculation** — Maximum centre-to-centre distance between any two shots

The current implementation uses mock processing. The architecture is designed for OpenCV.js integration for real bullet hole detection.

### Why 2 Metres?

Standardising the photo distance ensures consistent image quality for analysis. The 2-metre distance provides a full target view at sufficient resolution for bullet hole detection. This photo distance is independent of the actual shooting distance used for scoring.

## Installation Guide

### Prerequisites
- Node.js 18+ 
- npm
- A Turso account (free tier available)
- A GitHub account
- A Vercel account (for deployment)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/sportshoot.git
cd sportshoot
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Turso

1. Install the Turso CLI:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. Login and create a database:
```bash
turso auth login
turso db create sportshoot
turso db show sportshoot --url  # Copy the URL
turso db tokens create sportshoot  # Copy the token
```

### Step 4: Configure GitHub

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Create a token with `Contents` read/write permission for your repository
3. Copy the token

### Step 5: Configure Authentication

Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```

### Step 6: Set Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Authentication
AUTH_SECRET=your-generated-secret
AUTH_URL=http://localhost:3000

# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token

# GitHub Image Storage
GITHUB_TOKEN=your-github-token
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-repo-name
GITHUB_BRANCH=main

# Migration Protection
MIGRATION_SECRET=your-migration-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Ultimate Shooting Tracker
```

### Step 7: Run Migrations

```bash
curl -X POST http://localhost:3000/api/migrate \
  -H "Authorization: Bearer your-migration-secret"
```

### Step 8: Run Locally
```bash
npm run dev
```

### Step 9: Build for Production
```bash
npm run build
npm start
```

## Configuration Guide

### Environment Variables

| Variable | Required | Description | Where to Get It |
|----------|----------|-------------|----------------|
| `AUTH_SECRET` | Yes | NextAuth encryption secret | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Application URL | Your deployment URL |
| `TURSO_DATABASE_URL` | Yes | Turso database URL | `turso db show <name> --url` |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token | `turso db tokens create <name>` |
| `GITHUB_TOKEN` | Yes | GitHub PAT | GitHub Settings → Developer settings |
| `GITHUB_REPO_OWNER` | Yes | GitHub username/org | Your GitHub username |
| `GITHUB_REPO_NAME` | Yes | Repository name | Your repository name |
| `GITHUB_BRANCH` | No | Branch for uploads | Defaults to `main` |
| `MIGRATION_SECRET` | No | Protects migration endpoint | Any strong password |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL | Your deployment URL |
| `NEXT_PUBLIC_APP_NAME` | No | App display name | Default: "Ultimate Shooting Tracker" |

## GitHub Setup Guide

### Creating a Personal Access Token

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Give it a name (e.g., "SportShoot Image Storage")
4. Set expiration as appropriate
5. Under "Repository access", select "Only select repositories" and choose your repo
6. Under "Permissions", set "Contents" to "Read and write"
7. Click "Generate token"
8. Copy the token immediately (shown once)

### Repository Setup

The repository must exist and have an initial commit. The application will create files in:
```
shooting-images/user-{userId}/before.jpg
shooting-images/user-{userId}/after.jpg
```

### Security Recommendations

- Use a separate GitHub account or a machine user for API tokens
- Set token expiration to 90 days maximum
- Restrict repository access to only the storage repository
- Never commit tokens to the codebase

## Turso Setup Guide

### Step 1: Create Account
1. Go to [turso.tech](https://turso.tech) and sign up (free tier: 500 databases, 9GB storage)
2. Verify your email

### Step 2: Install CLI
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### Step 3: Login
```bash
turso auth login
```

### Step 4: Create Database
```bash
turso db create sportshoot
```

### Step 5: Get Credentials
```bash
turso db show sportshoot --url
# Output: libsql://sportshoot-username.turso.io

turso db tokens create sportshoot
# Output: eyJ... (long token)
```

### Step 6: Run Migrations
```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer your-migration-secret"
```

## Vercel Deployment Guide

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the repository

### Step 2: Configure Environment Variables
Add all variables from `.env.local` to Vercel's environment variable settings.

### Step 3: Deploy
Click "Deploy". Vercel will automatically:
- Detect Next.js
- Install dependencies
- Build the application
- Deploy to a URL

### Step 4: Automatic Deployments
Every push to the main branch triggers an automatic deployment. Preview deployments are created for pull requests.

### Step 5: Post-Deployment
```bash
# Run migrations on production
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer your-migration-secret"
```

## User Guide

### Dashboard
- View total sessions, shots, average score, and best score
- See current ranking
- Access recent sessions
- Start a new session

### New Session Wizard
1. **Select Range** — Choose your shooting range
2. **Select Firearm** — Choose your registered firearm
3. **Select Distance** — Select shooting distance (5-50 metres)
4. **Select Target** — Choose target type
5. **Enter Shots** — How many shots you plan to fire
6. **Capture Before** — Take photo of clean target from 2 metres
7. **Shoot** — Complete your course of fire
8. **Capture After** — Take photo of completed target from 2 metres
9. **Processing** — Automatic target analysis
10. **Validation** — Confirm shot count
11. **Review** — Check results and save
12. **Complete** — Session saved

### Progress
- View personal best, average scores, best group size
- See improvement trend over last 10 sessions
- Browse complete session history

### Leaderboards
- Filter by period: Today, Weekly, Monthly, Yearly, All Time
- See your ranking compared to all users
- Highlighted if you appear on the leaderboard

### Firearms
- Register firearms with manufacturer, model, calibre, type
- Add optional nickname and notes
- Delete firearms no longer in use

### Admin Dashboard
- View all registered users
- See user statistics (total, active, new today)
- Navigate to range management

## Shooting Session Walkthrough

1. **Register** at `/register` with display name, email, and password
2. **Login** at `/login` with email and password
3. Navigate to **New Session** via the + button or `/sessions/new`
4. **Select Range** — Choose from available shooting ranges
5. **Select Firearm** — Choose a registered firearm
6. **Select Distance** — Choose shooting distance
7. **Select Target** — Choose target type
8. **Enter Shots** — Enter the number of shots
9. **Capture Before** — Stand 2 metres from target, take photo
10. **Complete Shooting** — Fire your rounds
11. **Capture After** — Stand 2 metres from target, take photo
12. **Wait for Analysis** — Processing simulates (real analysis pending)
13. **Review Score** — Check raw score, accuracy, group size
14. **Save Session** — Permanent storage in Turso
15. **View Dashboard** — Updated stats and recent sessions
16. **View Progress** — Historical data and improvement trends
17. **View Leaderboard** — See your ranking

## Administrator Guide

### Managing Users
- Access `/admin` to view all registered users
- See user roles, locations, and registration dates
- Admin role can be assigned via database directly

### Viewing Statistics
- Total user count
- Active users (non-admin)
- Admin count
- New users today

### Troubleshooting
- Monitor API responses for error codes
- Check Turso database logs
- Verify GitHub token permissions
- Review Vercel deployment logs

## Troubleshooting Guide

### GitHub Upload Failed
- Verify `GITHUB_TOKEN` has correct permissions (Contents: read/write)
- Check repository exists and has initial commit
- Ensure images are valid JPEG files under 10MB

### Turso Connection Failed
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
- Check if database exists: `turso db list`
- Regenerate token if expired: `turso db tokens create <name>`

### Authentication Issues
- Ensure `AUTH_SECRET` is set and consistent across deployments
- Check `AUTH_URL` matches your deployment URL
- Clear browser cookies and retry

### Image Analysis Failed
- Photos must be taken from approximately 2 metres
- Target must be well-lit and in focus
- Target should fill most of the frame

### Vercel Deployment Failed
- Check build logs for errors
- Verify all environment variables are set
- Ensure Node.js version is 18+

## Security

### Authentication
- JWT sessions with 30-day expiry
- Passwords hashed with bcrypt (12 salt rounds)
- CSRF protection via NextAuth

### Authorisation
- Middleware enforces protected routes
- API routes validate session on every request
- Admin routes verify role before access

### GitHub Token Security
- Token stored as environment variable, never in code
- Fine-grained tokens with minimum required permissions
- Token scoped to single repository

### SQL Injection Prevention
- All queries use parameterised statements
- No string concatenation for SQL queries
- Input validation at API layer

### Input Validation
- Required fields validated before database operations
- Image type validation (JPEG magic bytes check)
- Numeric range validation for scores and distances

### Image Validation
- Base64 decoding validation
- JPEG format verification via magic bytes
- Size limits applied (10MB max per image)

## Future Enhancements

- **Multiple Targets** — Support for multiple target types per session
- **IPSC Mode** — International Practical Shooting Confederation scoring
- **Steel Challenge** — Steel target competition mode
- **Competition Mode** — Organised competitions with multiple participants
- **AI Coaching** — Personalised training recommendations
- **Wind Compensation** — Weather-aware scoring adjustments
- **Firearm Analytics** — Per-firearm performance tracking
- **Club Management** — Team and club leaderboards
- **Offline Mode** — PWA with offline session recording
- **Mobile Application** — Native mobile app
- **QR Code Target** — Automated target identification
- **Export to PDF** — Session reports
- **Export to Excel** — Data export for analysis

## License

MIT