# AGENTS.md — AI Agent Context for SQLAgnostic

This file provides context for AI coding agents working on this codebase.

## Tech Stack

- **Frontend**: Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui)
- **Backend**: Python FastAPI with SQLGlot for SQL transpilation, Groq SDK for AI refinement
- **Auth**: Supabase Auth (Google SSO + email/password), managed via HttpOnly cookies
- **Email**: Resend (configured as SMTP in Supabase Dashboard, not in code)
- **UI Components**: shadcn/ui with Base UI primitives, Monaco Editor for SQL editing

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

### CSRF Protection
All mutating endpoints require `X-Requested-With: XMLHttpRequest` header. Browsers enforce CORS preflight on custom headers, blocking cross-origin form attacks.

## File Conventions

- `src/proxy.ts` — This is **not** custom middleware. It's Next.js 16's renamed `middleware.ts` (the export is `proxy` instead of `middleware`).
- `src/app/login/actions.ts` — Server actions for auth (signUp, signIn, signOut, resetPassword, updatePassword)
- `backend/main.py` — Single FastAPI file containing all endpoints, auth, rate limiting, and AI logic

## Environment Variables

### `.env.local` (Next.js)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### `backend/.env` (FastAPI)
```
SUPABASE_URL
GROQ_API_KEY
```

## Common Tasks

### Adding a new API endpoint
1. Add the endpoint in `backend/main.py`
2. It's automatically proxied via the `/api/*` rewrite in `next.config.ts`
3. If it requires auth, use `Depends(verify_jwt_cookie)`
4. If it requires CSRF, add `Depends(verify_csrf)`
5. Add rate limiting with `@limiter.limit("X/minute", key_func=...)`

### Adding a new SQL dialect
1. Add it to `src/lib/dialects.ts` — both the type union and the categorized list
2. SQLGlot handles the actual transpilation; just ensure the dialect name matches SQLGlot's expected value

### Running the project
```bash
npm run dev  # Starts both Next.js and FastAPI via concurrently
```
