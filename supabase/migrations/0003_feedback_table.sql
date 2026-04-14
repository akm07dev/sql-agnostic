-- supabase/migrations/0003_feedback_table.sql
-- Create normalized feedback table (depends on translations table)

-- Drop table if exists
DROP TABLE IF EXISTS public.feedback CASCADE;

-- Create feedback table with normalized structure
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id UUID REFERENCES public.translations(id) ON DELETE CASCADE,
    is_positive BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(translation_id) -- Ensure one feedback per translation
);

-- No RLS needed - feedback is public data with upsert logic

-- Indexes for performance
CREATE INDEX idx_feedback_translation_id ON public.feedback(translation_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);

