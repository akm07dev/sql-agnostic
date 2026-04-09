/**
 * Application-wide constants and configuration.
 */

export const APP_CONFIG = {
  NAME: "SQLAgnostic",
  VERSION: "1.0.0",
  GITHUB_URL: "https://github.com/akm07dev",
  LINKEDIN_URL: "https://www.linkedin.com/in/akm07dev/",
};

export const SQL_LIMITS = {
  TRANSPILATION_MAX_CHARS: 100000,
  AI_REFINEMENT_MAX_CHARS: 10000,
};

export const API_ENDPOINTS = {
  TRANSLATE: "/api/translate",
  REFINE: "/api/refine",
};

export const AUTH_MESSAGES = {
  RATE_LIMIT_GUEST: "Rate limit exceeded (5/minute for guests). Sign in for higher limits!",
  RATE_LIMIT_USER: "Rate limit exceeded (20/minute). Please wait a moment.",
  REFINEMENT_REQUIRED: "Please sign in to use AI refinement.",
};
