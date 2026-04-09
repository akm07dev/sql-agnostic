/**
 * SQLService - Handles all network interactions with the backend API.
 * This abstracts away the complexity of fetch requests, headers, and response parsing.
 */

import { API_ENDPOINTS } from "@/lib/constants";
import { 
  TranslationRequest, 
  TranslationResponse, 
  RefinementRequest, 
  RefinementResponse 
} from "@/types/sql";

class SQLService {
  /**
   * Deterministically transpiles SQL from one dialect to another.
   */
  async translate(payload: TranslationRequest): Promise<TranslationResponse> {
    const response = await fetch(API_ENDPOINTS.TRANSLATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }

    return response.json();
  }

  /**
   * Uses AI to refine the transpiled output based on user instructions.
   */
  async refine(payload: RefinementRequest): Promise<RefinementResponse> {
    const response = await fetch(API_ENDPOINTS.REFINE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("AI_RATE_LIMIT");
      if (response.status === 401) throw new Error("UNAUTHORIZED");
      throw new Error("REFINEMENT_FAILED");
    }

    return response.json();
  }
}

export const sqlService = new SQLService();
