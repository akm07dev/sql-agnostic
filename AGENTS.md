## Tech Stack

- **Frontend**: Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui)
- **Backend**: Python FastAPI (SQLGlot transpilation, Groq AI refinement)
- **State Management**: Custom React Hooks (`useAuth`, `useSql`)
- **API Strategy**: Singleton Service Layer (`src/services/sqlService.ts`)
- **UI Components**: Modular architecture (`src/components/layout`, `src/components/editor`)
- **Optimization**: Next.js optimized `<Image />` rendering

## Architecture Overview

SQLAgnostic follows a **Service-Hook-Component** design pattern:

1.  **Service Layer**: `sqlService.ts` encapsulates all network logic. Components never call `fetch` directly.
2.  **Hooks Layer**: Custom hooks (`useSql`, `useAuth`) manage complex state and lifecycle, consuming the Service layer.
3.  **Components**: Pure UI components (Navbar, Footer, Editor) consume hooks and props.
4.  **Constants & Types**: Centralized configuration in `lib/constants.ts` (Frontend) and `CONFIG` dictionary (Backend).

## Key Patterns

### Global Configuration (Parity)
- **Frontend**: `APP_CONFIG` and `SQL_LIMITS` in `src/lib/constants.ts`.
- **Backend**: `CONFIG` dictionary in `api/index.py`.
- *Crucial*: Character limits (100k for transpilation, 10k for AI) and AI model lists must be kept in sync across both layers.

### Authentication Flow
1. User sign-in managed via `src/hooks/useAuth.ts`.
2. Supabase session state is abstracted from the UI components.
3. API endpoints secure access via `Depends(verify_jwt_cookie)`.

### Component Modularization
- Do not add complex logic or massive UI blocks to `src/app/page.tsx`.
- Extract layout elements to `src/components/layout/`.
- Extract editor-specific tools to `src/components/editor/`.

### AI Refinement Pipeline
- AI refinement uses a **Guard Mode** (security) followed by **Executive Logic** (translation).
- Model fallbacks are managed in the backend `CONFIG["AI_MODELS"]`.
- Always provide JSON-formatted instructions to the AI to ensure consistent parsing.

## Common Tasks

### Adding a new API endpoint
1. Add the endpoint in `api/index.py`.
2. Define the Request/Response types in `src/types/`.
3. Add a method to `src/services/sqlService.ts`.
4. Consume via a custom hook or directly in the component if simple.

### Modifying AI Behavior
Update the prompts or model lists in `api/index.py`. Keep the `GUARD_MODELS` and `AI_MODELS` lists separate for security.

### Deploying
The project is built for Vercel. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `GROQ_API_KEY` are set in production env vars.
