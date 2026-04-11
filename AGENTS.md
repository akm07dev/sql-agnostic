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

### Suspense Boundary Requirement
Next.js App Router requires `useSearchParams()` to be wrapped in a `<Suspense>` boundary. If a Client Component uses this hook, it must be isolated into an inner component and wrapped within the page-level export to avoid build-time deoptimization (CSR bailout).

## File Conventions

- `src/proxy.ts` — This is **not** custom middleware. It's Next.js 16's renamed `middleware.ts` (the export is `proxy` instead of `middleware`).
- `src/app/login/actions.ts` — Server actions for auth (signUp, signIn, signOut, resetPassword, updatePassword)
- `api/index.py` — Single FastAPI file containing all endpoints, auth, rate limiting, and AI logic

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
3. If it requires auth, use `Depends(verify_jwt_cookie)`
4. If it requires CSRF, add `Depends(verify_csrf)`
5. Add rate limiting with `@limiter.limit("X/minute", key_func=...)`

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
page.tsx → useSql.ts → sqlService.ts → /api/* (next.config.ts rewrite)
    ↓
api/index.py (FastAPI)
    ├── /api/translate → sqlglot.transpile()
    └── /api/refine → Guard Model → Refinement Model → Groq
    ↓
Response → useSql.ts state update → React re-render
```

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
- Verify `.env.local` and `api/.env` files exist with correct values
