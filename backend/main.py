import os
import json
import jwt
from jwt import PyJWKClient
from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
import sqlglot
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from groq import Groq
from dotenv import load_dotenv
import urllib.parse
import base64
import os

# Load .env first, if not found or incomplete, load .env.local 
load_dotenv()
load_dotenv(".env.local")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_real_ip(req: Request) -> str:
    """Extract the real client IP from X-Forwarded-For (set by Next.js proxy)."""
    forwarded = req.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return req.client.host if req.client else "unknown"


def _extract_jwt_from_cookies(request: Request) -> str | None:
    """
    Parse the Supabase auth cookie (possibly chunked by Next.js SSR)
    and return the raw access_token string, or None.
    """
    base_name = None

    for key in request.cookies.keys():
        if key.startswith("sb-") and "-auth-token" in key:
            if key.endswith("-auth-token"):
                base_name = key
                break
            elif "." in key and key.rsplit(".", 1)[-1].isdigit():
                base_name = key.rsplit(".", 1)[0]
                break

    if not base_name:
        return None

    # Single cookie or chunked
    if base_name in request.cookies:
        raw_val = request.cookies[base_name]
    else:
        chunks = []
        for i in range(10):
            chunk_name = f"{base_name}.{i}"
            if chunk_name in request.cookies:
                chunks.append(request.cookies[chunk_name])
            else:
                break
        if not chunks:
            return None
        raw_val = "".join(chunks)

    try:
        raw_val = urllib.parse.unquote(raw_val)
        if raw_val.startswith("base64-"):
            b64_str = raw_val[7:]
            # Next.js/Supabase uses base64url encoding, which Python's strict b64 needs padded and chars replaced
            b64_str = b64_str.replace("-", "+").replace("_", "/")
            b64_str += "=" * ((4 - len(b64_str) % 4) % 4)
            raw_val = base64.b64decode(b64_str).decode("utf-8")
        
        token_data = json.loads(raw_val)
        if isinstance(token_data, list):
            return token_data[0]
        elif isinstance(token_data, dict):
            return token_data.get("access_token")
    except Exception:
        return raw_val

    return None


# ---------------------------------------------------------------------------
# JWKS setup
# ---------------------------------------------------------------------------

supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
jwks_client: PyJWKClient | None = None
if supabase_url:
    jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    jwks_client = PyJWKClient(jwks_url)


def _decode_jwt(token: str) -> dict:
    """Verify and decode a Supabase JWT using RS256 JWKS."""
    if not jwks_client:
        raise HTTPException(status_code=500, detail="Server not configured for JWT auth (Missing SUPABASE_URL)")
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256", "HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: Invalid token ({e})")


# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------

def verify_jwt_cookie(request: Request) -> dict:
    """Strict JWT dependency — raises 401 if not authenticated."""
    token = _extract_jwt_from_cookies(request)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing authentication cookies.")
    return _decode_jwt(token)


def try_verify_jwt_cookie(request: Request) -> dict | None:
    """Optional JWT dependency — returns None for anonymous users."""
    token = _extract_jwt_from_cookies(request)
    if not token:
        return None
    try:
        return _decode_jwt(token)
    except HTTPException:
        return None


def verify_csrf(request: Request):
    """Reject requests missing the custom CSRF header."""
    if request.headers.get("x-requested-with") != "XMLHttpRequest":
        raise HTTPException(status_code=403, detail="CSRF check failed: Missing X-Requested-With header.")


# ---------------------------------------------------------------------------
# Rate-limit key functions
# ---------------------------------------------------------------------------

def _translate_key(request: Request) -> str:
    """
    Keying strategy for /api/translate:
    - Authenticated → 'user:<sub>'   (gets 20/min)
    - Anonymous    → 'anon:<ip>'     (gets 5/min)
    """
    user = try_verify_jwt_cookie(request)
    if user and user.get("sub"):
        return f"user:{user['sub']}"
    return f"anon:{get_real_ip(request)}"


def _translate_limit(request: Request) -> str:
    """Dynamic limit value: check if the user has a valid JWT cookie."""
    user = try_verify_jwt_cookie(request)
    if user and user.get("sub"):
        return "20/minute"
    return "5/minute"


def _refine_key(request: Request) -> str:
    """AI refine is always keyed by user sub (auth required)."""
    user = verify_jwt_cookie(request)
    return f"user:{user['sub']}"


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

limiter = Limiter(key_func=get_real_ip)  # default fallback

app = FastAPI(docs_url=None, redoc_url=None)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "dummy"))

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class TranspileRequest(BaseModel):
    sql: str
    source_dialect: str
    target_dialect: str

class TranspileResponse(BaseModel):
    transpiled_sql: str
    error: str | None = None

class RefineRequest(BaseModel):
    source_dialect: str
    target_dialect: str
    sqlGlotOutput: str
    sourceSql: str | None = None
    userInstructions: str | None = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/translate", response_model=TranspileResponse)
@limiter.limit("20/minute", key_func=_translate_key)
def translate_sql(request: Request, req: TranspileRequest):
    try:
        read_dialect = req.source_dialect.lower() if req.source_dialect else None
        write_dialect = req.target_dialect.lower() if req.target_dialect else None

        transpiled_sql = sqlglot.transpile(
            req.sql,
            read=read_dialect,
            write=write_dialect,
            pretty=True,
        )

        return TranspileResponse(
            transpiled_sql=";\n".join(transpiled_sql),
            error=None,
        )
    except sqlglot.errors.ParseError as e:
        return TranspileResponse(transpiled_sql="", error=str(e))
    except Exception as e:
        return TranspileResponse(transpiled_sql="", error=str(e))


@app.post("/api/refine")
@limiter.limit("5/minute", key_func=_refine_key)
def refine_sql(
    request: Request,
    req: RefineRequest,
    user_payload: dict = Depends(verify_jwt_cookie),
    csrf: None = Depends(verify_csrf),
):
    try:
        user_instructions = req.userInstructions.strip() if req.userInstructions else ""
        source_hint = f"Original Source SQL:\n{req.sourceSql}\n\n" if req.sourceSql else ""
        
        base_context = (
            f"The user wants to convert {req.source_dialect} to {req.target_dialect}. "
            f"{source_hint}"
            f"SQLGlot initially produced this translation:\n{req.sqlGlotOutput}\n\n"
        )
        
        if user_instructions:
            prompt = (
                base_context + 
                f"The user is not satisfied and provided these specific instructions: {user_instructions}. "
                f"Please provide the corrected SQL only."
            )
        else:
            prompt = (
                base_context + 
                f"The user is not satisfied. Please review the SQLGlot output. Identify any semantic divergence from the original source logic and fix it. "
                f"Return ONLY the finalized, corrected SQL query block."
            )

        models_to_try = [
            "llama-3.3-70b-versatile",
            "openai/gpt-oss-120b",
            "qwen/qwen3-32b",
            "llama-3.1-8b-instant",
            "openai/gpt-oss-20b"
        ]
        
        chat_completion = None
        last_error = None
        
        for target_model in models_to_try:
            try:
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are an expert SQL translation agent executing a raw pipeline. "
                                "You MUST return the raw SQL query and absolutely nothing else. "
                                "CRITICAL: Always preserve and map the user's original SQL comments in your final output. "
                                "CRITICAL: If you make a highly complex logical shift (e.g. replacing a function not supported by the target dialect), add brief, helpful inline SQL comments (`--`) explaining why. "
                                "CRITICAL: DO NOT wrap your response in markdown backticks (```). "
                                "CRITICAL: DO NOT include any conversational text or explanations outside of SQL comments. "
                                "If you include anything other than raw SQL code, the CI/CD pipeline will fail."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    model=target_model,
                    temperature=0.1,
                )
                break  # Successful request, drop out of fallback loop
            except Exception as e:
                last_error = e
                # If error is a rate limit, immediately escalate instead of hammering the API
                error_msg = str(e).lower()
                if "rate limit" in error_msg or "429" in error_msg:
                    raise e
                continue
                
        if not chat_completion:
            raise Exception(f"All model fallbacks failed. Groq may be experiencing an outage. Last error: {last_error}")

        refined_sql = chat_completion.choices[0].message.content or ""
        refined_sql = refined_sql.strip()
        
        # Strip markdown syntax if the model ignores the system prompt
        if refined_sql.startswith("```"):
            lines = refined_sql.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            refined_sql = "\n".join(lines).strip()

        # Force structural formatting parity with SQLGlot so the Diff Viewer isolates logic changes, not whitespace changes
        try:
            formatted_sql = sqlglot.transpile(
                refined_sql,
                read=req.target_dialect.lower(),
                write=req.target_dialect.lower(),
                pretty=True
            )
            refined_sql = ";\n".join(formatted_sql)
        except Exception:
            pass # Fall back to raw AI output if SQLGlot refuses to parse the AI's structure

        return {"success": True, "sql": refined_sql}
    except Exception as e:
        return {"success": False, "error": str(e)}
