AI-assisted development guidelines for SportShoot.

## Architecture
- Next.js App Router with server components and API routes
- Turso SQLite for persistence (edge-hosted, HTTP access)
- NextAuth.js v5 for authentication (Credentials provider, JWT sessions)
- GitHub Contents API for target image storage
- Tailwind CSS for styling

## Coding Standards
- TypeScript strict mode enabled
- All database queries use parameterised SQL (no string concatenation)
- API routes validate authentication via `auth()` from `@/lib/auth`
- Client components use `'use client'` directive
- Components in `src/components/shared/` for reusable UI

## Folder Conventions
- `src/lib/turso/` — Database layer (client, schema, queries)
- `src/lib/auth/` — Authentication utilities
- `src/lib/github/` — Image storage service
- `src/engine/` — Business logic (scoring)
- `src/app/api/` — API route handlers
- `src/stores/` — Zustand state management

## Security Requirements
- Passwords hashed with bcryptjs
- JWT sessions with 30-day expiry
- GitHub tokens stored only in environment variables
- SQL injection prevented via parameterised queries
- Image validation (JPEG magic bytes)

## Naming Conventions
- PascalCase for components and types
- camelCase for functions and variables
- kebab-case for file names
- UPPER_CASE for environment variables

## Testing Expectations
- Build must pass (`npm run build`)
- Lint must pass (`npm run lint`)
- No Supabase dependencies (migrated to Turso)