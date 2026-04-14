import { createClient } from "@/utils/supabase/client";
import { SqlDialect } from "@/lib/dialects";

export const dbService = {
  /**
   * Insert a new translation record into the database
   */
  saveTranslation: async (
    userId: string | null,
    input: string,
    output: string,
    sourceDial: SqlDialect,
    targetDial: SqlDialect,
    aiInstructions?: string,
    wasRefined?: boolean
  ): Promise<string | null> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("translations")
      .insert({
        user_id: userId,
        input_sql: input,
        output_sql: output,
        source_dialect: sourceDial,
        target_dialect: targetDial,
        ai_instructions: aiInstructions || null,
        was_ai_refined: wasRefined || false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save translation:", error);
      return null;
    }

    return data?.id || null;
  },

  /**
   * Update an existing translation record
   */
  updateTranslation: async (
    translationId: string,
    updates: {
      ai_instructions?: string;
      was_ai_refined?: boolean;
      rating?: number;
    }
  ): Promise<boolean> => {
    const supabase = createClient();
    const { error } = await supabase
      .from("translations")
      .update(updates)
      .eq("id", translationId);

    if (error) {
      console.error("Failed to update translation:", error);
      return false;
    }

    return true;
  },

  /**
   * Save or update feedback for a translation
   */
  saveFeedback: async (
    translationId: string,
    isPositive: boolean
  ): Promise<boolean> => {
    const supabase = createClient();
    const { error } = await supabase
      .from('feedback')
      .upsert({
        translation_id: translationId,
        is_positive: isPositive
      }, {
        onConflict: 'translation_id'
      });

    if (error) {
      console.error("Feedback save failed:", error);
      return false;
    }
    
    return true;
  }
};
