import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { SqlDialect } from "@/lib/dialects";
import { sqlService } from "@/services/sqlService";
import { SQL_LIMITS, AUTH_MESSAGES } from "@/lib/constants";

interface UseSqlProps {
  user: User | null;
}

/**
 * Custom hook to manage the lifecycle of a SQL translation session.
 */
export function useSql({ user }: UseSqlProps) {
  const [sourceCode, setSourceCode] = useState("-- Enter your SQL here\nSELECT * FROM users;");
  const [targetCode, setTargetCode] = useState("");
  const [aiRefinedCode, setAiRefinedCode] = useState("");
  const [targetView, setTargetView] = useState<"sqlglot" | "ai" | "diff">("sqlglot");
  const [sourceDialect, setSourceDialect] = useState<SqlDialect>("postgres");
  const [targetDialect, setTargetDialect] = useState<SqlDialect>("mysql");
  const [isTranspiling, setIsTranspiling] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [lastRefineKey, setLastRefineKey] = useState("");

  const handleTranspile = async () => {
    if (sourceCode.length > SQL_LIMITS.TRANSPILATION_MAX_CHARS) {
      setTargetCode(`-- Error: Source SQL exceeds limit of ${SQL_LIMITS.TRANSPILATION_MAX_CHARS} chars.`);
      return;
    }

    setIsTranspiling(true);
    try {
      const data = await sqlService.translate({
        sql: sourceCode,
        source_dialect: sourceDialect,
        target_dialect: targetDialect
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
    } catch (err: any) {
      if (err.message === "RATE_LIMIT") {
        setTargetCode(user ? AUTH_MESSAGES.RATE_LIMIT_USER : AUTH_MESSAGES.RATE_LIMIT_GUEST);
      } else {
        setTargetCode("-- Fetch Error: Connection failed");
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
      alert(`Source SQL code exceeds context limit of ${SQL_LIMITS.AI_REFINEMENT_MAX_CHARS} chars.`);
      return;
    }

    const refineKey = `${sourceCode}|${sourceDialect}|${targetDialect}|${instructions}`;
    if (refineKey === lastRefineKey) return;

    setIsRefining(true);
    try {
      const res = await sqlService.refine({
        source_dialect: sourceDialect,
        target_dialect: targetDialect,
        sourceSql: sourceCode,
        sqlGlotOutput: targetCode,
        userInstructions: instructions,
      });

      if (res.success && res.sql) {
        setAiRefinedCode(res.sql);
        setAiExplanation(res.explanation || "");
        setTargetView("ai");
        setLastRefineKey(refineKey);
      }
    } catch (err: any) {
      alert(err.message === "AI_RATE_LIMIT" ? "AI rate limit exceeded." : "Refinement failed.");
    } finally {
      setIsRefining(false);
    }
  };

  return {
    sourceCode, setSourceCode,
    targetCode, setTargetCode,
    aiRefinedCode, setAiRefinedCode,
    targetView, setTargetView,
    sourceDialect, setSourceDialect,
    targetDialect, setTargetDialect,
    isTranspiling, isRefining,
    aiExplanation,
    handleTranspile, handleRefine
  };
}
