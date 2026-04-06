-- supabase/migrations/0001_initial_schema.sql

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    fav_source_dialect TEXT,
    fav_target_dialect TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profiles
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile for every new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Translations Table
CREATE TABLE public.translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    input_sql TEXT NOT NULL,
    output_sql TEXT NOT NULL,
    source_dialect TEXT,
    target_dialect TEXT,
    ai_instructions TEXT,              -- Nullable: Only filled if refined with AI
    was_ai_refined BOOLEAN DEFAULT FALSE,
    rating SMALLINT,                   -- E.g., 1 for thumbs up, -1 for thumbs down
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for translations
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Allow users to read and manage only their own translations
CREATE POLICY "Users can select own translations" ON public.translations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own translations" ON public.translations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own translations" ON public.translations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own translations" ON public.translations
    FOR DELETE USING (auth.uid() = user_id);
