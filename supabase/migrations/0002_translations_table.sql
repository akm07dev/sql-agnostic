-- supabase/migrations/0002_translations_table.sql
-- Create translations table (depends on auth.users via user_id foreign key)

-- Drop table if exists
DROP TABLE IF EXISTS public.translations CASCADE;

-- Create translations table
CREATE TABLE public.translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Can be NULL for guests
    input_sql TEXT NOT NULL,
    output_sql TEXT NOT NULL,
    source_dialect TEXT NOT NULL,
    target_dialect TEXT NOT NULL,
    ai_instructions TEXT,
    was_ai_refined BOOLEAN DEFAULT FALSE,
    rating SMALLINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for translations
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can select own translations" ON public.translations
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own translations" ON public.translations
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own translations" ON public.translations
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own translations" ON public.translations
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_translations_user_id ON public.translations(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON public.translations(created_at DESC);

-- Compound index to optimize the dashboard transaction fetching and pagination:
-- eq('user_id') + order('created_at', desc)
CREATE INDEX IF NOT EXISTS idx_translations_user_id_created_at ON public.translations(user_id, created_at DESC);

-- Partial index to strictly speed up AI Refinement boolean counting logic
CREATE INDEX IF NOT EXISTS idx_translations_was_ai_refined ON public.translations(was_ai_refined) WHERE was_ai_refined = TRUE;
