# Deployment

This project is deployed on Vercel and integrated with Supabase + Resend.

## Production URL

- [https://sql-agnostic.akm07.dev/](https://sql-agnostic.akm07.dev/)

## Platform Setup

- Frontend and API hosting: Vercel
- Database and auth: Supabase
- Email provider: Resend (via Supabase SMTP configuration)
- SSO provider: Google (configured in Supabase Auth)
- Mail sender branding: custom domain configured in Resend

## Environment Variables (Vercel)

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`

Optional:

- `SUPABASE_URL`

`SUPABASE_URL` is optional in this codebase because backend auth setup falls back to `NEXT_PUBLIC_SUPABASE_URL` when it is not present.

## Runtime Notes

- Next.js app and Python backend are packaged for Vercel deployment.
- AI requests are rate limited and authenticated on backend.
- Keep-warm workflow can be used to reduce cold-start latency.

## Verification Checklist

1. Open app URL and verify workbench loads.
2. Confirm `/api/health` returns status `ok`.
3. Test guest transpilation and authenticated refinement.
4. Validate email/password auth email delivery uses your custom sender domain.
5. Validate Google SSO callback flow.
