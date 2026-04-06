-- Create the feedback analytics table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional (null for guests)
    is_positive BOOLEAN NOT NULL,
    source_code TEXT NOT NULL,
    target_code TEXT NOT NULL,
    source_dialect TEXT NOT NULL,
    target_dialect TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect table with RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow ANY user (authenticated or anonymous) to insert feedback
CREATE POLICY "Allow public inserts to feedback"
    ON public.feedback
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Explicitly deny broad select/update access (only service role or admin dashboard should see this)
CREATE POLICY "Deny general select" ON public.feedback FOR SELECT USING (false);
CREATE POLICY "Deny general update" ON public.feedback FOR UPDATE USING (false);
CREATE POLICY "Deny general delete" ON public.feedback FOR DELETE USING (false);
