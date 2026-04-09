# SQLAgnostic: Developer Walkthrough 🛠️

This document explains the technical decisions, architecture, and "Why" behind the SQLAgnostic platform.

## 1. The Core Problem
LLMs (like Llama or GPT) are great at SQL but often "hallucinate" syntax or miss subtle dialect-specific rules (like MySQL session variables vs PostgreSQL window functions). 

**SQLAgnostic** solves this by using a **Two-Layer Translation Pipeline**:
1.  **Deterministic Layer (SQLGlot)**: First, we use a formal parser to change the structure.
2.  **AI Layer (Groq)**: Then, we use AI to refine the logic and ensure semantic parity.

## 2. Frontend Architecture: "Standard over Custom"
We avoid the "Vibe-Coding" trap by using a strict **Service-Hook-Component** pattern.

### The Service Layer (`src/services/sqlService.ts`)
We use a singleton `SQLService` class to handle all API logic. This ensures that the UI never knows about `fetch` or HTTP headers. If we change our API structure, we only update it here.

### The Hooks Layer (`src/hooks/useSql.ts`)
This hook manages the "State of the Workbench." It handles the source SQL, target SQL, loading states, and coordination between the Deterministic and AI layers.

### The UI Layer (`src/app/page.tsx`)
The main page is now a "clean orchestrator." It imports modular components like `Navbar`, `Footer`, and `DialectSelector`, making the UI easy to test and maintain.

## 3. Backend Architecture: FastAPI & Groq
The backend is a high-performance Python service that manages:
- **Rate Limiting**: Tiered limits (20/min for users, 5/min for guests).
- **Security Guard**: A dedicated AI pass to detect "Prompt Injection" or malicious SQL.
- **Model Fallbacks**: A prioritized list of models to ensure the system stays online even during API outages.

## 4. Design Philosophy: "Demure & Mindful"
The UI uses **Glassmorphism** and a strict **Indigo/Zinc** palette to maintain a premium feel. We use Next.js's `<Image />` component for optimized branding and a custom SVG-based Icon system for sub-components.

## 5. Deployment & Persistence
- **Hosting**: Deployed on **Vercel** with a keep-warm strategy to prevent cold starts.
- **Monitoring**: Integration with **Vercel Analytics** and a local `feedback` telemetry system using Supabase.

---

*This project was built to demonstrate how to combine deterministic software engineering with modern AI capabilities.*
