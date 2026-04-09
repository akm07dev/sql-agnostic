import { SqlDialect } from "@/lib/dialects";

export interface TranslationRequest {
  sql: string;
  source_dialect: SqlDialect;
  target_dialect: SqlDialect;
}

export interface TranslationResponse {
  transpiled_sql: string;
  error?: string;
}

export interface RefinementRequest {
  source_dialect: SqlDialect;
  target_dialect: SqlDialect;
  sourceSql: string;
  sqlGlotOutput: string;
  userInstructions: string;
}

export interface RefinementResponse {
  success: boolean;
  sql?: string;
  explanation?: string;
  error?: string;
}
