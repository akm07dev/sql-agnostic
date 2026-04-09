import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { SqlDialect } from "@/lib/dialects";
import { sqlService } from "@/services/sqlService";
import { SQL_LIMITS, AUTH_MESSAGES, SQL_DEFAULTS } from "@/lib/constants";

interface UseSqlProps {
  user: User | null;
}

/**
 * Custom hook to manage the lifecycle of a SQL translation session.
 */
export function useSql({ user }: UseSqlProps) {
  const [sourceCode, setSourceCode] = useState(SQL_DEFAULTS.SOURCE_SQL);
  const [targetCode, setTargetCode] = useState("");
  const [aiRefinedCode, setAiRefinedCode] = useState("");
  const [targetView, setTargetView] = useState<"sqlglot" | "ai" | "diff">("sqlglot");
  const [sourceDialect, setSourceDialect] = useState<SqlDialect>(SQL_DEFAULTS.SOURCE_DIALECT);
  const [targetDialect, setTargetDialect] = useState<SqlDialect>(SQL_DEFAULTS.TARGET_DIALECT);
  const [isTranspiling, setIsTranspiling] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [lastRefineKey, setLastRefineKey] = useState("");

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return AUTH_MESSAGES.REFINEMENT_EXECUTION_FAILED;
  };

  const handleTranspile = async () => {
    if (sourceCode.length > SQL_LIMITS.TRANSPILATION_MAX_CHARS) {
      setTargetCode(`-- Error: ${AUTH_MESSAGES.SOURCE_LIMIT_EXCEEDED}`);
      return;
    }

    setIsTranspiling(true);
    try {
      const data = await sqlService.translate({
        sql: sourceCode,
        source_dialect: sourceDialect,
        target_dialect: targetDialect,
      });

      if (data.error) {
        setTargetCode(`-- Parsing Error:\n-- ${data.error}`);
        setAiRefinedCode("");
        setTargetView("sqlglot");
      } else {
        setTargetCode(data.transpiled_sql);
        setAiRefinedCode("");
        setTargetView("sqlglot");
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      if (message === "RATE_LIMIT") {
        setTargetCode(`-- ${user ? AUTH_MESSAGES.RATE_LIMIT_USER : AUTH_MESSAGES.RATE_LIMIT_GUEST}`);
      } else {
        setTargetCode(`-- ${AUTH_MESSAGES.FETCH_FAILED}`);
      }
    } finally {
      setIsTranspiling(false);
    }
  };

  const handleRefine = async (instructions: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (sourceCode.length > SQL_LIMITS.AI_REFINEMENT_MAX_CHARS) {
      alert(AUTH_MESSAGES.AI_CONTEXT_LIMIT_EXCEEDED);
      return;
    }

    const refineKey = `${sourceCode}|${sourceDialect}|${targetDialect}|${instructions}`;
    if (refineKey === lastRefineKey) return;

    setIsRefining(true);
    try {
      const response = await sqlService.refine({
        source_dialect: sourceDialect,
        target_dialect: targetDialect,
        sourceSql: sourceCode,
        sqlGlotOutput: targetCode,
        userInstructions: instructions,
      });

      if (response.success && response.sql) {
        setAiRefinedCode(response.sql);
        setAiExplanation(response.explanation || "");
        setTargetView("ai");
        setLastRefineKey(refineKey);
        return;
      }

      alert(`${AUTH_MESSAGES.REFINEMENT_FAILED}: ${response.error || "Unknown error"}`);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      if (message === "AI_RATE_LIMIT") {
        alert("AI rate limit exceeded. Please wait.");
      } else if (message === "UNAUTHORIZED") {
        alert(AUTH_MESSAGES.REFINEMENT_REQUIRED);
      } else {
        alert(AUTH_MESSAGES.REFINEMENT_EXECUTION_FAILED);
      }
    } finally {
      setIsRefining(false);
    }
  };

  return {
    sourceCode,
    setSourceCode,
    targetCode,
    setTargetCode,
    aiRefinedCode,
    setAiRefinedCode,
    targetView,
    setTargetView,
    sourceDialect,
    setSourceDialect,
    targetDialect,
    setTargetDialect,
    isTranspiling,
    isRefining,
    aiExplanation,
    handleTranspile,
    handleRefine,
  };
}
