# Architecture

Visual system architecture and component interactions for SQLAgnostic.

## System Overview

```mermaid
flowchart TD
    subgraph Frontend["Next.js 16 Frontend"]
        UI["React UI<br/>(Monaco Editor)"]
        Hooks["useSql.ts<br/>State Management"]
        Service["sqlService.ts<br/>API Client"]
    end
    
    subgraph Backend["FastAPI Backend"]
        Auth["JWT Verification<br/>(JWKS RS256)"]
        RateLimit["Rate Limiter<br/>(Guest/User)"]
        
        subgraph Translate["/api/translate"]
            SQLGlot["SQLGlot<br/>Transpilation"]
        end
        
        subgraph Refine["/api/refine"]
            CSRF["CSRF Check"]
            Guard["Guard Model<br/>(Prompt Injection Scan)"]
            AI["Refinement Model<br/>(Fallback Chain)"]
        end
    end
    
    subgraph External["External Services"]
        Supabase["Supabase Auth"]
        Groq["Groq AI"]
    end
    
    UI --> Hooks
    Hooks --> Service
    Service --> RateLimit
    RateLimit --> Auth
    Auth --> Translate
    Auth --> Refine
    Refine --> CSRF
    CSRF --> Guard
    Guard --> AI
    AI --> Groq
    Auth -.-> Supabase
    
    style Frontend fill:#e0e7ff,stroke:#4f46e5
    style Backend fill:#dcfce7,stroke:#22c55e
    style External fill:#fef3c7,stroke:#f59e0b
```

## Data Flow

### SQL Translation Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant Service as sqlService.ts
    participant API as FastAPI
    participant SQLGlot as SQLGlot
    
    User->>UI: Type SQL query
    User->>UI: Click Transpile
    UI->>Service: translate(payload)
    Service->>API: POST /api/translate
    API->>API: Rate limit check (IP/User)
    API->>SQLGlot: transpile(sql, source, target)
    SQLGlot-->>API: transpiled SQL
    API-->>Service: {transpiled_sql, error}
    Service-->>UI: Update target editor
    UI-->>User: Show converted SQL
```

### AI Refinement Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant Service as sqlService.ts
    participant API as FastAPI
    participant Guard as Guard Model
    participant AI as Refinement Model
    participant Groq as Groq API
    
    User->>UI: Click AI Refine
    User->>UI: Enter instructions (optional)
    UI->>Service: refine(payload)
    Service->>API: POST /api/refine
    API->>API: Verify JWT (JWKS)
    API->>API: CSRF check
    API->>API: Rate limit check
    
    alt Instructions provided
        API->>Guard: Check for injection
        Guard-->>API: {hacked: true/false}
    end
    
    API->>AI: Refine with instructions
    loop Model Fallback
        AI->>Groq: Request
        Groq-->>AI: Success or Error
    end
    AI-->>API: {sql, explanation}
    API-->>Service: Refined result
    Service-->>UI: Show AI output + diff
    UI-->>User: Display comparison
```

## Frontend Architecture

**Pattern**: Service-Hook-Component separation of concerns.

```mermaid
flowchart LR
    subgraph Component["Component Layer"]
        Page["page.tsx"]
        Navbar["Navbar"]
        Footer["Footer"]
    end
    
    subgraph Hook["Hook Layer"]
        useSql["useSql.ts"]
        useAuth["useAuth.ts"]
    end
    
    subgraph Service["Service Layer"]
        sqlService["sqlService.ts"]
        supabase["Supabase Client"]
    end
    
    Page --> useSql
    Page --> useAuth
    useSql --> sqlService
    useAuth --> supabase
    
    style Component fill:#e0e7ff,stroke:#4f46e5
    style Hook fill:#fce7f3,stroke:#ec4899
    style Service fill:#dcfce7,stroke:#22c55e
```

| Layer | Responsibility | Key Files |
|-------|---------------|-----------|
| **Service** | Network transport, error normalization | `src/services/sqlService.ts` |
| **Hooks** | State management, lifecycle logic | `src/hooks/useSql.ts`, `src/hooks/useAuth.ts` |
| **Components** | Rendering, user interaction | `src/app/page.tsx`, `src/components/layout/*` |

## Backend Architecture

**Entry Point**: `api/index.py` (single FastAPI file)

### Security Model

```mermaid
flowchart TD
    subgraph Request["Incoming Request"]
        Cookie["Cookie: sb-*-auth-token"]
        Header["Header: X-Forwarded-For"]
        CSRF["Header: X-Requested-With"]
    end
    
    subgraph AuthLayer["Authentication"]
        Extract["Extract JWT from cookie"]
        Chunk["Reassemble chunked cookies"]
        JWKS["Verify via JWKS<br/>RS256/ES256/HS256"]
        RateLimit["Rate Limit Check"]
    end
    
    subgraph Endpoints["Endpoints"]
        Translate[/api/translate\]
        Refine[/api/refine\]
    end
    
    Cookie --> Extract
    Extract --> Chunk
    Chunk --> JWKS
    Header --> RateLimit
    JWKS --> RateLimit
    RateLimit --> Translate
    RateLimit --> Refine
    CSRF -.-> Refine
    
    style AuthLayer fill:#fee2e2,stroke:#ef4444
    style Endpoints fill:#dcfce7,stroke:#22c55e
```

### Key Security Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **JWT Verification** | JWKS endpoint (RS256) | Trust boundary - never trust client session |
| **Cookie Chunking** | Reassembly of chunked SSR cookies | Next.js/Supabase compatibility |
| **Rate Limiting** | IP-based (guest) vs User ID (auth) | Cost control and abuse prevention |
| **CSRF Protection** | `X-Requested-With` header | Block cross-origin form attacks |

## Configuration Strategy

Centralized configuration reduces magic numbers and makes behavior explicit.

### Frontend (`src/lib/constants.ts`)

```typescript
export const SQL_LIMITS = {
  TRANSPILATION_MAX_CHARS: 100000,
  AI_REFINEMENT_MAX_CHARS: 10000,
};

export const SQL_DEFAULTS = {
  SOURCE_DIALECT: "postgres",
  TARGET_DIALECT: "mysql",
};
```

### Backend (`api/index.py`)

```python
CONFIG = {
    "LIMITS": {
        "TRANSLATE_AUTH_PER_MINUTE": "20/minute",
        "TRANSLATE_ANON_PER_MINUTE": "5/minute",
        "REFINE_PER_MINUTE": "5/minute",
    },
    "AI": {
        "GUARD_MODELS": ["llama-3.1-8b-instant", "gemma2-9b-it", ...],
        "REFINE_MODELS": ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", ...],
    }
}
```

## Security Controls

| Control | Endpoint | Guest | Authenticated |
|---------|----------|-------|---------------|
| **JWT Required** | `/api/translate` | Optional | Optional |
| **JWT Required** | `/api/refine` | ❌ Blocked | ✅ Required |
| **CSRF Check** | `/api/translate` | ❌ | ❌ |
| **CSRF Check** | `/api/refine` | ❌ | ✅ Required |
| **Rate Limit** | `/api/translate` | 5/min (IP) | 20/min (User ID) |
| **Rate Limit** | `/api/refine` | ❌ | 5/min (User ID) |

### AI Pipeline Security

1. **Guard Model**: Scans user instructions for prompt injection before processing
2. **Input Validation**: 10K character limit for AI refinement context
3. **Output Sanitization**: SQLGlot re-formatting of AI output for structural consistency
4. **Error Handling**: Graceful degradation on AI service failures

## Deployment Topology

```mermaid
flowchart TB
    subgraph Vercel["Vercel Edge Network"]
        NextJS["Next.js 16<br/>Frontend"]
        Python["Python Serverless<br/>FastAPI"]
    end
    
    subgraph Supabase["Supabase"]
        Auth["Auth Service<br/>(JWT/JWKS)"]
        DB["PostgreSQL<br/>User Data"]
    end
    
    subgraph External["External APIs"]
        Groq["Groq AI"]
        Resend["Resend Email"]
        Google["Google OAuth"]
    end
    
    User["User"] --> NextJS
    NextJS --> Python
    Python --> Auth
    Python --> Groq
    Auth --> DB
    Auth --> Resend
    Auth --> Google
    
    style Vercel fill:#e0e7ff,stroke:#4f46e5
    style Supabase fill:#dcfce7,stroke:#22c55e
    style External fill:#fef3c7,stroke:#f59e0b
```

### Environment Variables

All environment variables are in `.env.local` at the project root.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `GROQ_API_KEY` | AI refinement service |

## Technology Choices

| Technology | Rationale |
|------------|-----------|
| **Next.js 16** | App Router, React 19, built-in OG image generation |
| **FastAPI** | Async Python, Pydantic validation, automatic OpenAPI |
| **SQLGlot** | MIT license, 31+ dialect support, deterministic transpilation |
| **Groq** | Fast inference, cheap rates, good model selection |
| **Supabase** | Open source, JWT auth, free tier generous |
| **Monaco Editor** | VS Code editor, SQL syntax highlighting, diff view |
| **Tailwind v4** | Utility-first, dark mode support, shadcn/ui compatible |
