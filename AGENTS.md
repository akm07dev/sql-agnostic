# AGENTS.md — AI Agent Context for SQLAgnostic

**Author:** akm07 (https://akm07.dev)  
**Repository:** https://github.com/akm07dev/sql-agnostic  
**License:** MIT

This file provides context for AI coding agents working on this codebase.

## Tech Stack

- **Frontend**: Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui)
- **Backend**: Python FastAPI with SQLGlot for SQL transpilation, Groq SDK for AI refinement
- **Auth**: Supabase Auth (Google SSO + email/password), managed via HttpOnly cookies
- **Email**: Resend (configured as SMTP in Supabase Dashboard, not in code)
- **UI Components**: shadcn/ui with Base UI primitives, Monaco Editor (desktop), CodeMirror (mobile)

## Architecture Overview

Next.js acts as a BFF (Backend-for-Frontend). The `src/proxy.ts` file (Next.js 16's replacement for `middleware.ts`) handles Supabase session refresh on every request. All `/api/*` routes are rewritten to FastAPI (`http://127.0.0.1:53321`) in development via `next.config.ts`.

FastAPI independently verifies Supabase JWTs using RS256 asymmetric verification via the JWKS endpoint. It never needs the JWT secret — only the public key.

## Key Patterns

### Authentication Flow
1. User signs in via Google SSO or email/password on `/login`
2. Supabase sets HttpOnly `sb-<ref>-auth-token` cookies
3. `proxy.ts` refreshes tokens on every request and mutates headers for downstream forwarding
4. FastAPI reads these cookies, reassembles chunked values, and verifies via JWKS

### Rate Limiting Strategy
- `/api/translate`: **5/min anonymous** (by IP), **20/min authenticated** (by user ID)
- `/api/refine`: **5/min authenticated only** — requires valid JWT cookie + CSRF header

### API Endpoint Naming Convention
Endpoints are prefixed by data scope to avoid confusion:
- `GET /api/public/feedback` — global aggregate metrics, no auth required
- `GET /api/personal/feedback` — current user's feedback stats, auth required
- `GET /api/personal/transactions` — current user's translation history, auth required

### Session Persistence (Guest → Auth Handoff)
`useSql.ts` continuously writes all editor state to `sessionStorage`. On mount, it hydrates from sessionStorage. This means a guest who is redirected to `/login` for AI refinement will have their full query, dialect selection, and transpiled output restored when they return to `/`.

### useRef Guards for Dashboard Fetches
The dashboard (`src/app/dashboard/page.tsx`) uses `useRef` flags (`hasFetchedPublic`, `hasFetchedPersonal`, `lastFetchedPage`) to prevent duplicate API calls caused by React 18 Strict Mode / Supabase auth state changes.

### CSRF Protection
All mutating endpoints require `X-Requested-With: XMLHttpRequest` header. Browsers enforce CORS preflight on custom headers, blocking cross-origin form attacks.

### Suspense Boundary Requirement
Next.js App Router requires `useSearchParams()` to be wrapped in a `<Suspense>` boundary. If a Client Component uses this hook, it must be isolated into an inner component and wrapped within the page-level export to avoid build-time deoptimization (CSR bailout).

### Adaptive Editor
`AdaptiveEditor.tsx` selects the SQL editor implementation based on `useIsMobile()`:
- **Desktop**: Monaco Editor (VS Code engine, full IntelliSense)
- **Mobile/Tablet**: CodeMirror (lightweight, touch-friendly)

## File Conventions

- `src/proxy.ts` — This is **not** custom middleware. It's Next.js 16's renamed `middleware.ts` (the export is `proxy` instead of `middleware`).
- `src/app/login/actions.ts` — Server actions for auth (signUp, signIn, signOut, resetPassword, updatePassword)
- `src/app/login/reset/` — Password reset flow page
- `src/app/login/update-password/` — Password update flow page
- `src/app/auth/callback/` — OAuth callback handler
- `src/app/metrics/page.tsx` — Redirects to `/dashboard` (legacy route alias)
- `api/index.py` — Single FastAPI file containing all endpoints, auth, rate limiting, and AI logic
- `src/app/icon.tsx` — Dynamic favicon via Next.js `ImageResponse` (edge runtime). Replaces static `icon.png`/`favicon.ico`.
- `src/app/opengraph-image.tsx` / `twitter-image.tsx` — Dynamic branded OG/Twitter card images (Zinc-950 dark theme, Blue-600 logo)

## Environment Variables

All environment variables are in `.env.local` at the project root. Both Next.js and FastAPI load from this file.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GROQ_API_KEY
NEXT_PUBLIC_SITE_URL
```

## Common Tasks

### Adding a new API endpoint
1. Add the endpoint in `api/index.py`
2. It's automatically proxied via the `/api/*` rewrite in `next.config.ts`
3. Prefix the route: `/api/public/` for unauthenticated data, `/api/personal/` for user-scoped data
4. If it requires auth, use `Depends(verify_jwt_cookie)`
5. If it requires CSRF, add `Depends(verify_csrf)`
6. Add rate limiting with `@limiter.limit("X/minute", key_func=...)`

### Adding a new SQL dialect
1. Add it to `src/lib/dialects.ts` — both the type union and the categorized list
2. SQLGlot handles the actual transpilation; just ensure the dialect name matches SQLGlot's expected value

### Modifying rate limits
1. Update `CONFIG["LIMITS"]` in `api/index.py`
2. Update `SQL_LIMITS` in `src/lib/constants.ts` if frontend validation needed
3. Update user-facing messages in `AUTH_MESSAGES` constant

### Updating AI prompts
1. Guard model prompt: Search for "strict security module" in `api/index.py`
2. Refinement model prompt: Search for "expert SQL translation agent" in `api/index.py`
3. Models are defined in `CONFIG["AI"]["GUARD_MODELS"]` and `CONFIG["AI"]["REFINE_MODELS"]`

### Adding a new component
1. Use shadcn/ui CLI: `npx shadcn add <component>`
2. Import from `@/components/ui/<component>`
3. Follow existing dark mode patterns with `dark:` prefixes

### Running the project
```bash
npm run dev  # Starts both Next.js and FastAPI via concurrently
```

## File Relationships

```
User Request
    ↓
[proxy.ts] - Session refresh, header mutation
    ↓
Next.js App Router
    ↓
page.tsx → useSql.ts (sessionStorage cache) → sqlService.ts → /api/* (next.config.ts rewrite)
    ↓
api/index.py (FastAPI)
    ├── /api/translate        → sqlglot.transpile()
    ├── /api/refine           → Guard Model → Refinement Model → Groq
    ├── /api/public/feedback  → Supabase RPC (SECURITY DEFINER, bypasses RLS)
    ├── /api/personal/feedback → Supabase RPC (auth-scoped, via user JWT)
    └── /api/personal/transactions → Supabase (paginated, auth-scoped)
    ↓
Response → useSql.ts state update → React re-render
```

## Component Map

```
src/components/
├── layout/
│   ├── Navbar.tsx            — Top nav with auth state, dark mode toggle
│   └── Footer.tsx            — Built-by links, GitHub/LinkedIn
├── editor/
│   ├── AdaptiveEditor.tsx    — Switches between Monaco (desktop) and CodeMirror (mobile)
│   ├── DesktopMonacoEditor.tsx
│   ├── MobileCodeMirrorEditor.tsx
│   ├── EditorToolbar.tsx     — Dialect selectors, action buttons
│   └── AIMetadataPanel.tsx   — AI explanation panel shown after refinement
├── dashboard/
│   ├── FeedbackSection.tsx   — 4-column KPI grid: Global vs You metric cards
│   ├── MetricCard.tsx        — Reusable metric card (single value, icon, loading state)
│   ├── FeedbackChart.tsx     — Recharts pie chart for feedback distribution
│   ├── TransactionsList.tsx  — Paginated translation history with skeleton loader
│   ├── TransactionItem.tsx   — Single row with SQL preview and expand button
│   └── QueryModal.tsx        — Full SQL view modal with Copy + Close buttons
└── seo/
    └── JsonLd.tsx            — Structured data (schema.org) for SEO
```

## Services & Hooks

```
src/services/
├── sqlService.ts   — API client: translate(), refine() — singleton pattern
└── dbService.ts    — Supabase client: saveTranslation(), updateTranslation(), saveFeedback()

src/hooks/
├── useAuth.ts      — Supabase auth state (user, authLoading, signOut)
├── useSql.ts       — Full SQL workflow: state + sessionStorage persistence + API calls
└── useIsMobile.ts  — Responsive breakpoint detection for editor switching
```

## Supabase Migrations

```
supabase/migrations/
├── 0001_profiles_table.sql        — profiles table + handle_new_user trigger
├── 0002_translations_table.sql    — translations table + compound index (user_id, created_at DESC)
├── 0003_feedback_table.sql        — feedback table (normalized, one per translation)
└── 0004_feedback_aggregates.sql   — RPCs with SECURITY DEFINER to bypass RLS for global counts
```

> **Important:** `get_public_feedback_metrics` and `get_public_rating_metrics` RPCs must use `SECURITY DEFINER` + `SET search_path = public` to correctly count global rows without being restricted by RLS. The `get_user_feedback_metrics` and `get_user_rating_metrics` RPCs are user-scoped and called via an authenticated Supabase client.

> **Note:** There is no `0005` or `0006` migration file in this repo. Files listed in older docs were from a prior iteration.

## Troubleshooting

### "Unauthorized: Missing authentication cookies" (401)
- Check Supabase session is valid
- Verify `sb-<ref>-auth-token` cookie exists in browser dev tools
- Ensure `proxy.ts` is running (not bypassed)

### Rate limit errors (429)
- Guest users: 5 req/min for `/api/translate`
- Authenticated: 20 req/min for `/api/translate`, 5 req/min for `/api/refine`
- Check `X-Forwarded-For` header is passing through proxy

### AI refinement fails with "CSRF check failed"
- Verify `X-Requested-With: XMLHttpRequest` header is sent in fetch request
- Check `sqlService.ts` for correct header implementation

### SQLGlot parse errors
- Verify source dialect matches SQLGlot's expected names (all lowercase)
- Check SQL syntax validity independently
- Some dialect features may not be supported by SQLGlot

### Development server issues
- Ensure Python virtual environment is activated
- Check FastAPI port 53321 is not in use
- Verify `.env.local` exists with correct values
