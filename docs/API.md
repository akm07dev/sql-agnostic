# API Reference

Base path: `/api`

## `GET /api/health`

Health check endpoint for uptime and warmup jobs.

### Response

```json
{
  "status": "ok",
  "message": "Serverless function is warm"
}
```

## `POST /api/translate`

Deterministic SQL transpilation via SQLGlot.

### Request

```json
{
  "sql": "SELECT * FROM users",
  "source_dialect": "postgres",
  "target_dialect": "mysql"
}
```

### Response (success)

```json
{
  "transpiled_sql": "SELECT * FROM users",
  "error": null
}
```

### Response (parse error)

```json
{
  "transpiled_sql": "",
  "error": "...parse details..."
}
```

### Limits

- Guest: 5 requests/minute
- Authenticated: 20 requests/minute

## `POST /api/refine`

AI refinement endpoint for semantic polishing after deterministic transpilation.

### Requirements

- Authenticated Supabase JWT cookie
- `X-Requested-With: XMLHttpRequest` header

### Request

```json
{
  "source_dialect": "postgres",
  "target_dialect": "mysql",
  "sourceSql": "SELECT * FROM users",
  "sqlGlotOutput": "SELECT * FROM users",
  "userInstructions": "Use explicit aliases"
}
```

### Response (success)

```json
{
  "success": true,
  "sql": "SELECT ...",
  "explanation": "Summary of semantic edits"
}
```

### Response (failure)

```json
{
  "success": false,
  "error": "...error reason..."
}
```

### Limits

- Authenticated: 5 requests/minute

## Dialects

Frontend-supported dialect options are defined in:

- `src/lib/dialects.ts`
