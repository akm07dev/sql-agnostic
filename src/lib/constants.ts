/**
 * Application-wide constants and configuration.
 */

export const APP_CONFIG = {
  NAME: "SQLAgnostic",
  VERSION: "1.0.0",
};

export const APP_LINKS = {
  GITHUB: "https://github.com/akm07dev",
  LINKEDIN: "https://www.linkedin.com/in/ankitkm07/",
  SITE: "https://sql-agnostic.akm07.dev",
};

export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
};

export const SQL_LIMITS = {
  TRANSPILATION_MAX_CHARS: 100000,
  AI_REFINEMENT_MAX_CHARS: 10000,
};

export const SQL_DEFAULTS = {
  SOURCE_SQL: "-- Enter your SQL here\nSELECT * FROM users;",
  SOURCE_DIALECT: "postgres",
  TARGET_DIALECT: "mysql",
} as const;

export const STORAGE_KEYS = {
  SOURCE_DIALECT: "sqlagnostic_source",
  TARGET_DIALECT: "sqlagnostic_target",
};

export const API_ENDPOINTS = {
  TRANSLATE: "/api/translate",
  REFINE: "/api/refine",
};

export const AUTH_MESSAGES = {
  RATE_LIMIT_GUEST: "Rate limit exceeded (5/minute for guests). Sign in for higher limits!",
  RATE_LIMIT_USER: "Rate limit exceeded (20/minute). Please wait a moment.",
  REFINEMENT_REQUIRED: "Please sign in to use AI refinement.",
  REFINEMENT_FAILED: "Refinement failed.",
  REFINEMENT_EXECUTION_FAILED: "Refinement execution failed.",
  FETCH_FAILED: "Fetch Error: Connection failed",
  SOURCE_LIMIT_EXCEEDED: `Source SQL exceeds limit of ${SQL_LIMITS.TRANSPILATION_MAX_CHARS} chars.`,
  AI_CONTEXT_LIMIT_EXCEEDED: `Source SQL exceeds context limit of ${SQL_LIMITS.AI_REFINEMENT_MAX_CHARS} chars.`,
};
