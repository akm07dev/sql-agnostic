# SQLAgnostic

SQLAgnostic is a web IDE for cross-dialect SQL migration.
It combines deterministic SQL transpilation (SQLGlot) with optional AI refinement (Groq) to help developers move queries between engines with higher confidence.

## Live Production

- App URL: [https://sql-agnostic.akm07.dev/](https://sql-agnostic.akm07.dev/)
- Hosting: Vercel
- Auth + DB: Supabase
- Email/password auth: Supabase Auth with Resend configured as SMTP
- SSO: Google OAuth via Supabase
- Branded mail delivery: Resend custom domain (project domain sender identity)

## Highlights

- Deterministic SQL transpilation across popular dialects
- Optional AI refinement with model fallback strategy
- Monaco editor + diff view for transparent output review
- Supabase cookie auth with backend JWT verification (JWKS)
- Tiered rate limiting for guest vs authenticated usage

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- Backend: FastAPI (Python)
- SQL Engine: SQLGlot
- AI Provider: Groq
- Auth: Supabase
- Deployment target: Vercel

## Architecture

The project uses a Service-Hook-Component pattern on the frontend:

1. Service layer: `src/services/sqlService.ts`
2. Hooks layer: `src/hooks/useAuth.ts`, `src/hooks/useSql.ts`
3. UI layer: `src/components/*` + `src/app/page.tsx`

Backend logic is in `api/index.py`, with centralized `CONFIG` for limits and AI model fallback chains.

For deeper details, see:

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`

## Project Structure

```text
api/
  index.py                 # FastAPI endpoints, auth verification, rate limiting, AI pipeline
docs/
  ARCHITECTURE.md
  API.md
  DEPLOYMENT.md
src/
  app/
    page.tsx               # Main SQL workbench UI
    layout.tsx             # Root app layout
    robots.ts              # Robots metadata
    sitemap.ts             # Sitemap metadata
  components/
    layout/                # Navbar and Footer
  hooks/
    useAuth.ts             # Supabase session hook
    useSql.ts              # SQL translation/refinement session hook
  services/
    sqlService.ts          # API client singleton
  lib/
    constants.ts           # Frontend constants (limits, keys, links, endpoints)
    dialects.ts            # Supported SQL dialect metadata
  types/
    sql.ts                 # API request/response types
```

## Security Model

- FastAPI verifies Supabase JWT cookies via JWKS (RS256 flow)
- `/api/refine` requires authentication and CSRF header (`X-Requested-With`)
- Rate limiting:
  - `/api/translate`: 5/min guest, 20/min authenticated
  - `/api/refine`: 5/min authenticated

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.9+

### Environment variables

Copy `.env.example` to `.env.local` and fill values.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GROQ_API_KEY=...

# Optional override for backend-only usage.
# If omitted, backend falls back to NEXT_PUBLIC_SUPABASE_URL.
SUPABASE_URL=...
```

### Install and run

```bash
npm install
pip install -r requirements.txt
npm run dev
```

`npm run dev` starts both Next.js and FastAPI.

## Why this project is portfolio-ready

- Clear separation of concerns (service vs hook vs component)
- Centralized constants and typed API contracts
- Defensive backend design (auth verification, CSRF, fallback models, throttling)
- Practical developer UX (editor, copy/paste, diff, refinement workflow)

## License

MIT
