# SQLAgnostic Walkthrough

This document explains the most important engineering decisions in SQLAgnostic.

## 1. Hybrid SQL Conversion Pipeline

The conversion flow is intentionally two-stage:

1. SQLGlot first performs deterministic syntax transpilation.
2. AI refinement is optional and only runs when the user asks for improvements.

This design keeps the baseline conversion stable while allowing semantic tuning when needed.

## 2. Authentication and Trust Boundary

The app uses Supabase auth cookies in the browser, but verification happens again in FastAPI.

- Frontend holds session cookies managed by Supabase.
- Backend extracts and verifies JWTs via Supabase JWKS.
- Refinement endpoint requires both valid auth and CSRF header.

This avoids trusting browser-only session state for privileged backend actions.

## 3. Rate Limiting Strategy

Rate limits are role-aware:

- Guests get lower throughput on transpilation.
- Authenticated users get higher throughput.
- AI refinement is restricted and authenticated.

This keeps costs and abuse under control without hurting normal usage.

## 4. Model Fallback Resilience

AI refinement uses fallback model chains.

- Guard-model chain checks for prompt-injection style input.
- Refinement-model chain retries with alternate models on failure.

Result: fewer hard failures when individual models are throttled or unavailable.

## 5. Frontend Separation of Concerns

The frontend uses three layers:

- `sqlService`: request orchestration and transport concerns
- `useSql` / `useAuth`: state and lifecycle logic
- Components: rendering and user interaction

This separation keeps page-level files focused on UI, not networking internals.

## 6. Configuration Discipline

Shared values are centralized:

- Frontend constants in `src/lib/constants.ts`
- Backend runtime config in `api/index.py` (`CONFIG` dictionary)

This reduces hidden magic numbers and makes behavior easier to explain in interviews.

## 7. Product UX choices

The UI intentionally exposes the workflow:

- Source and output editors are side-by-side
- Diff view shows AI deltas explicitly
- Manual feedback controls capture confidence signals

This emphasizes trust and inspectability over black-box output.
