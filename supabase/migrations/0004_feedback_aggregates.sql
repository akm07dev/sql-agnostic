-- supabase/migrations/0004_feedback_aggregates.sql
-- Database-side aggregation helpers for feedback metrics.

DROP FUNCTION IF EXISTS public.get_public_feedback_metrics();
DROP FUNCTION IF EXISTS public.get_user_feedback_metrics(UUID);
DROP FUNCTION IF EXISTS public.get_public_rating_metrics();
DROP FUNCTION IF EXISTS public.get_user_rating_metrics(UUID);

-- Public aggregate feedback metrics
CREATE OR REPLACE FUNCTION public.get_public_feedback_metrics()
RETURNS TABLE(
    total_feedback INT,
    positive_feedback INT,
    negative_feedback INT,
    positive_percentage NUMERIC,
    ai_refined_count INT
)
LANGUAGE SQL
STABLE
AS $$
SELECT
    COUNT(f.id) FILTER (WHERE f.is_positive IS NOT NULL)::INT AS total_feedback,
    COUNT(f.id) FILTER (WHERE f.is_positive = TRUE)::INT AS positive_feedback,
    COUNT(f.id) FILTER (WHERE f.is_positive = FALSE)::INT AS negative_feedback,
    COALESCE(
      ROUND(
        CASE WHEN COUNT(f.id) FILTER (WHERE f.is_positive IS NOT NULL) > 0
          THEN COUNT(f.id) FILTER (WHERE f.is_positive = TRUE) * 100.0 / COUNT(f.id) FILTER (WHERE f.is_positive IS NOT NULL)
          ELSE 0
        END,
      1),
      0
    ) AS positive_percentage,
    (SELECT COUNT(id) FROM public.translations WHERE was_ai_refined = TRUE)::INT AS ai_refined_count
FROM public.feedback f;
$$;

-- User-scoped feedback metrics, filtered through private transactions
CREATE OR REPLACE FUNCTION public.get_user_feedback_metrics(uid UUID)
RETURNS TABLE(
    total_feedback INT,
    positive_feedback INT,
    negative_feedback INT,
    positive_percentage NUMERIC,
    ai_refined_count INT
)
LANGUAGE SQL
STABLE
AS $$
SELECT
    COUNT(f.id) FILTER (WHERE f.is_positive IS NOT NULL)::INT AS total_feedback,
    COUNT(f.id) FILTER (WHERE f.is_positive = TRUE)::INT AS positive_feedback,
    COUNT(f.id) FILTER (WHERE f.is_positive = FALSE)::INT AS negative_feedback,
    COALESCE(
      ROUND(
        CASE WHEN COUNT(f.id) FILTER (WHERE f.is_positive IS NOT NULL) > 0
          THEN COUNT(f.id) FILTER (WHERE f.is_positive = TRUE) * 100.0 / COUNT(f.id) FILTER (WHERE f.is_positive IS NOT NULL)
          ELSE 0
        END,
      1),
      0
    ) AS positive_percentage,
    COUNT(t.id) FILTER (WHERE t.was_ai_refined = TRUE)::INT AS ai_refined_count
FROM public.translations t
LEFT JOIN public.feedback f ON t.id = f.translation_id
WHERE t.user_id = uid;
$$;

-- Fallback metrics derived from legacy translation ratings when explicit feedback rows are absent.
CREATE OR REPLACE FUNCTION public.get_public_rating_metrics()
RETURNS TABLE(
    total_feedback INT,
    positive_feedback INT,
    negative_feedback INT,
    positive_percentage NUMERIC,
    ai_refined_count INT
)
LANGUAGE SQL
STABLE
AS $$
SELECT
    COUNT(*) FILTER (WHERE rating IS NOT NULL)::INT AS total_feedback,
    COUNT(*) FILTER (WHERE rating = 1)::INT AS positive_feedback,
    COUNT(*) FILTER (WHERE rating = -1)::INT AS negative_feedback,
    COALESCE(
      ROUND(
        CASE WHEN COUNT(*) FILTER (WHERE rating IS NOT NULL) > 0
          THEN COUNT(*) FILTER (WHERE rating = 1) * 100.0 / COUNT(*) FILTER (WHERE rating IS NOT NULL)
          ELSE 0
        END,
      1),
      0
    ) AS positive_percentage,
    COUNT(*) FILTER (WHERE was_ai_refined = TRUE)::INT AS ai_refined_count
FROM public.translations;
$$;

CREATE OR REPLACE FUNCTION public.get_user_rating_metrics(uid UUID)
RETURNS TABLE(
    total_feedback INT,
    positive_feedback INT,
    negative_feedback INT,
    positive_percentage NUMERIC,
    ai_refined_count INT
)
LANGUAGE SQL
STABLE
AS $$
SELECT
    COUNT(*) FILTER (WHERE rating IS NOT NULL)::INT AS total_feedback,
    COUNT(*) FILTER (WHERE rating = 1)::INT AS positive_feedback,
    COUNT(*) FILTER (WHERE rating = -1)::INT AS negative_feedback,
    COALESCE(
      ROUND(
        CASE WHEN COUNT(*) FILTER (WHERE rating IS NOT NULL) > 0
          THEN COUNT(*) FILTER (WHERE rating = 1) * 100.0 / COUNT(*) FILTER (WHERE rating IS NOT NULL)
          ELSE 0
        END,
      1),
      0
    ) AS positive_percentage,
    COUNT(*) FILTER (WHERE was_ai_refined = TRUE)::INT AS ai_refined_count
FROM public.translations
WHERE user_id = uid;
$$;
