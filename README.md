# SQLAgnostic

A high-performance, database-agnostic SQL dialect translator with AI-powered refinement.

**Deterministic Translation** via [SQLGlot](https://github.com/tobymao/sqlglot) · **AI Refinement** via [Groq](https://groq.com/) (DeepSeek-R1) · **Auth** via [Supabase](https://supabase.com/)

## Architecture

```
┌──────────────┐     rewrites /api/*     ┌──────────────────┐
│  Next.js 16  │ ──────────────────────► │  FastAPI (Python) │
│  Frontend    │                         │                   │
│  + Proxy     │  ◄───── cookies ──────  │  SQLGlot engine   │
│  + Auth SSR  │                         │  Groq AI refine   │
└──────────────┘                         │  JWT verification │
                                         │  Rate limiting    │
                                         └──────────────────┘
```

- **Next.js 16** — Frontend UI, Supabase SSR auth, cookie-based session management, token rotation
- **FastAPI** — Deterministic SQL transpilation (SQLGlot), AI refinement (Groq/DeepSeek-R1), RS256 JWT verification via JWKS, CSRF protection, tiered rate limiting

## Features

| Feature | Details |
|---|---|
| SQL Translation | 20+ SQL dialects via SQLGlot (PostgreSQL, MySQL, T-SQL, BigQuery, Snowflake, etc.) |
| AI Refinement | DeepSeek-R1 via Groq for reasoning-based SQL correction |
| Auth | Google SSO (primary) + email/password with Resend SMTP |
| Rate Limiting | Anonymous: 5/min translate. Authenticated: 20/min translate, 5/min AI |
| Security | RS256 JWKS JWT verification, CSRF protection, HttpOnly cookies |

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Supabase project (free tier works)

### 1. Clone & Install

```bash
git clone <repo-url>
cd sql-agnostic

# Frontend
npm install

# Backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

Create `backend/.env`:

```env
SUPABASE_URL="https://your-project.supabase.co"
GROQ_API_KEY="your-groq-api-key"
```

### 3. Supabase Configuration

#### Auth Providers (Dashboard → Auth → Providers)
- **Google**: Add your Google OAuth Client ID and Secret
- **Email**: Enabled by default

#### SMTP for Emails (Dashboard → Auth → SMTP Settings)
Configure Resend as your email provider:
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: your Resend API key
- Sender email: your verified Resend domain email

### 4. Run

```bash
npm run dev
```

This starts both Next.js (port 3000) and FastAPI (port 53321) via `concurrently`.

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
sql-agnostic/
├── backend/
│   ├── main.py              # FastAPI app (translate, refine, auth, rate limiting)
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main translator UI (auth-aware)
│   │   ├── layout.tsx        # Root layout
│   │   ├── login/
│   │   │   ├── page.tsx      # Login (Google SSO + email/password)
│   │   │   ├── actions.ts    # Server actions (signUp, signIn, resetPassword, etc.)
│   │   │   ├── reset/        # Password reset request page
│   │   │   └── update-password/  # Set new password page
│   │   └── auth/
│   │       └── callback/     # OAuth callback handler
│   ├── lib/
│   │   └── dialects.ts       # SQL dialect definitions
│   ├── utils/
│   │   └── supabase/         # Supabase client helpers (browser, server, middleware)
│   └── proxy.ts              # Next.js 16 proxy (session refresh + cookie forwarding)
├── .env.local                # Frontend env vars (gitignored)
└── next.config.ts            # API rewrites to FastAPI
```

## Security Model

- **JWT Verification**: FastAPI verifies Supabase JWTs using asymmetric RS256 via the JWKS endpoint — no shared secrets
- **CSRF Protection**: All mutating API calls require `X-Requested-With: XMLHttpRequest` header
- **Rate Limiting**: IP-based for anonymous users, user-ID-based for authenticated (via `X-Forwarded-For`)
- **Token Rotation**: Next.js proxy silently refreshes expired tokens and forwards fresh cookies to FastAPI
- **HttpOnly Cookies**: All auth tokens managed server-side, never exposed to client JavaScript

## License

MIT
