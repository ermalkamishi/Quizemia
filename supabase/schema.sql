-- ==============================================================================
-- Supabase SQL Schema for AI-Powered Interactive Quiz Platform (Kahoot-inspired)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_email TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    is_public BOOLEAN NOT NULL DEFAULT true,
    cover_image TEXT,
    play_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast filtering on public quizzes and user dashboard
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_public ON public.quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON public.quizzes(created_at DESC);

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    media_url TEXT,
    time_limit INTEGER NOT NULL DEFAULT 20, -- Seconds per question
    points INTEGER NOT NULL DEFAULT 1000,
    order_index INTEGER NOT NULL DEFAULT 0,
    -- JSONB options array: [ { "id": "a", "text": "...", "is_correct": true, "color": "red", "shape": "triangle" }, ... ]
    options JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON public.questions(quiz_id, order_index ASC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Quizzes
-- Anyone can view public quizzes OR their own quizzes
CREATE POLICY "Public quizzes are viewable by everyone"
    ON public.quizzes
    FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

-- Logged-in users can create quizzes
CREATE POLICY "Users can create their own quizzes"
    ON public.quizzes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Users can update only their own quizzes
CREATE POLICY "Users can update their own quizzes"
    ON public.quizzes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own quizzes
CREATE POLICY "Users can delete their own quizzes"
    ON public.quizzes
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies for Questions
-- Questions are viewable if the parent quiz is viewable
CREATE POLICY "Questions are viewable if quiz is viewable"
    ON public.questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
            AND (q.is_public = true OR q.user_id = auth.uid())
        )
    );

-- Users can insert questions for their own quizzes
CREATE POLICY "Users can insert questions into their own quizzes"
    ON public.questions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
            AND (q.user_id = auth.uid() OR auth.uid() IS NOT NULL)
        )
    );

-- Users can update questions in their own quizzes
CREATE POLICY "Users can update questions in their own quizzes"
    ON public.questions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
            AND q.user_id = auth.uid()
        )
    );

-- Users can delete questions from their own quizzes
CREATE POLICY "Users can delete questions from their own quizzes"
    ON public.questions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
            AND q.user_id = auth.uid()
        )
    );

-- 7. Helper RPC function to increment play count atomically
CREATE OR REPLACE FUNCTION public.increment_quiz_plays(target_quiz_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.quizzes
    SET play_count = play_count + 1
    WHERE id = target_quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Sample Seed Data (Public Starter Quizzes)
INSERT INTO public.quizzes (id, title, description, category, creator_email, is_public, cover_image, play_count)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'World Geography & Wonders', 'Test your knowledge on capital cities, landmarks, and continents!', 'Geography', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80', 142),
    ('22222222-2222-2222-2222-222222222222', 'Science & Space Odyssey', 'Explore planetary facts, physics mysteries, and periodic elements.', 'Science', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', 98),
    ('33333333-3333-3333-3333-333333333333', 'Tech & AI Revolutions', 'How well do you know computer algorithms, AI milestones, and coding languages?', 'Technology', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 215)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (quiz_id, question_text, time_limit, points, order_index, options)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Which is the largest ocean on Earth?', 20, 1000, 0, '[
        {"id": "a", "text": "Pacific Ocean", "is_correct": true, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Atlantic Ocean", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Indian Ocean", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Arctic Ocean", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('11111111-1111-1111-1111-111111111111', 'What is the capital city of Australia?', 15, 1000, 1, '[
        {"id": "a", "text": "Sydney", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Melbourne", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Canberra", "is_correct": true, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Brisbane", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('22222222-2222-2222-2222-222222222222', 'Which planet is known as the Red Planet?', 20, 1000, 0, '[
        {"id": "a", "text": "Mars", "is_correct": true, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Jupiter", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Venus", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Mercury", "is_correct": false, "color": "green", "shape": "square"}
    ]')
ON CONFLICT DO NOTHING;
