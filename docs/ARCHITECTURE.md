# Architecture

This document explains the core system architecture of SQLAgnostic.

## High-Level Flow

1. User writes source SQL in Monaco editor.
2. Frontend sends request to `/api/translate`.
3. FastAPI runs SQLGlot deterministic transpilation.
4. User can optionally trigger `/api/refine` for AI enhancement.
5. FastAPI runs guard-model check + refinement-model fallback chain.
6. UI shows SQL output and optional diff/AI explanation.

## Frontend Architecture

Pattern: Service-Hook-Component.

- Service:
  - `src/services/sqlService.ts`
  - Handles request transport and response/error normalization.
- Hooks:
  - `src/hooks/useAuth.ts` for auth session state.
  - `src/hooks/useSql.ts` for SQL session workflow state.
- Components:
  - `src/app/page.tsx` main workbench composition.
  - `src/components/layout/*` branding/layout concerns.

## Backend Architecture

Main file: `api/index.py`.

Responsibilities:

- JWT extraction from Supabase auth cookies
- JWKS-based verification for trustable auth identity
- CSRF requirement for refine endpoint
- Rate limiting (guest vs authenticated)
- SQLGlot transpilation
- AI guard and refinement orchestration

## Configuration Strategy

- Frontend constants: `src/lib/constants.ts`
- Backend configuration dictionary: `CONFIG` in `api/index.py`

This reduces hardcoded values and keeps behavior explicit.

## Security Controls

- Auth: Supabase JWT verification via JWKS
- CSRF: `X-Requested-With` check on mutating AI endpoint
- Throttling:
  - `/api/translate`: lower guest limit, higher authenticated limit
  - `/api/refine`: authenticated-only constrained limit

## Deployment Topology

- Frontend + Python serverless functions: Vercel
- Auth and DB: Supabase
- Email: Resend configured through Supabase SMTP
- SSO: Google OAuth via Supabase
