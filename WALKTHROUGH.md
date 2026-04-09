# Project Walkthrough: How SQLAgnostic Works 🧠

If you are a recruiter or a developer looking at this code, this guide explains the most interesting architectural decisions behind the project.

## 1. The Hybrid Transpilation Pipeline
SQLAgnostic doesn't rely solely on AI. Why? Because LLMs can be hallucination-prone for large SQL structures.
- **Layer 1 (Deterministic)**: We first use **SQLGlot** to parse and transpile the query. This handles 90% of syntax changes with 100% accuracy.
- **Layer 2 (AI Refinement)**: If the user is unsatisfied, we send the "delta" (Source vs. SQLGlot output) to **Groq**. The AI acts as a logical auditor, looking for semantic divergences like specific dialect-based performance hints or session-local variable behaviors.

## 2. Secure "BFF" (Backend-for-Frontend) Auth
The authentication doesn't just happen in the browser.
- **Next.js Middleware**: Refreshes Supabase sessions and forwards JWTs to the backend via HttpOnly cookies.
- **FastAPI Asymmetric Verification**: The Python backend doesn't store a "secret key" for JWTs. Instead, it hits the Supabase **JWKS (JSON Web Key Set)** endpoint to fetch the public RSA key. It then verifies the incoming cookies' signatures. This is the enterprise standard for decoupling auth from business logic.

## 3. Resilience and Fallbacks
The `api/index.py` implements a "Cascading Model Fallback" strategy. If a high-tier model like `llama-3.3-70b` is rate-limited or down:
1. It catches the error.
2. It automatically retries with a smaller, more available model (like `llama-3.1-8b`).
3. This ensures that the user's experience is never interrupted.

## 4. Performance Optimization
- **Monaco Editor Integration**: Using standard editor protocols for a high-end IDE experience (multi-cursor support, semantic highlighting).
- **Vercel Serverless Optimization**: The Python backend is optimized for cold starts by using lightweight libraries and a dedicated "warming" schedule via GitHub Actions.
- **Diff Engine**: Custom logic to ensure that logic changes are highlighted while ignoring minor whitespace differences between SQLGlot and the AI.

## 5. Security & Rate Limiting
- **Tiered Permissions**: Anonymous users can translate basic queries with strict limits. Authenticated users get higher throughput and access to the Refinement engine.
- **CSRF Guard**: All mutating endpoints require `X-Requested-With: XMLHttpRequest`. This forces a CORS preflight in modern browsers, effectively killing cross-origin form-submit attacks.
