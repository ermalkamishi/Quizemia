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
    ('11111111-1111-1111-1111-111111111111', 'World Geography & Epic Wonders', 'Challenge your geographical IQ across famous continents, ocean depths, and historic capitals.', 'Geography', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80', 342),
    ('22222222-2222-2222-2222-222222222222', 'Cosmic Odyssey & Astrophysics', 'Explore planetary orbits, black holes, neutron stars, and modern space exploration.', 'Science', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', 279),
    ('33333333-3333-3333-3333-333333333333', 'AI Revolution & Next-Gen Computing', 'From Turing tests and Neural Networks to Transformer models and autonomous agents.', 'Technology', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 418),
    ('44444444-4444-4444-4444-444444444444', 'Ancient Civilizations & World Empires', 'Journey through the Pharaohs, Spartan warriors, Roman emperors, and ancient wonders.', 'History', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', 215),
    ('55555555-5555-5555-5555-555555555555', 'Pop Culture & Blockbuster Cinema', 'Test your movie buffs and music lore across epic franchises, Oscar winners, and iconic chart-toppers.', 'Pop Culture', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80', 367),
    ('66666666-6666-6666-6666-666666666666', 'Human Body & Biological Wonders', 'Discover organs, genetic codes, neural pathways, and physiological wonders of the human organism.', 'Science', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80', 295),
    ('77777777-7777-7777-7777-777777777777', 'Great Inventions & World Milestones', 'From the printing press to the lunar landing—celebrating humanity''s greatest scientific leaps.', 'General', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', 254),
    ('88888888-8888-8888-8888-888888888888', 'Gjeografia, Historia & Kultura Shqiptare', 'Një kuiz magjepsës mbi qytetet historike, natyrën e mrekullueshme dhe trashëgiminë e lavdishme shqiptare.', 'History', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1687294088591-5e434c105bc1?auto=format&fit=crop&w=800&q=80', 312),
    ('99999999-9999-9999-9999-999999999999', 'Македонска Култура, Природа & Историја', 'Проверете го вашето знаење за македонските езера, знаменитости, историски личности и културно наследство.', 'History', 'Quizemia Official', true, 'https://images.unsplash.com/photo-1611845528017-75215e6d662c?auto=format&fit=crop&w=800&q=80', 289)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (quiz_id, question_text, time_limit, points, order_index, options)
VALUES
    -- Geography
    ('11111111-1111-1111-1111-111111111111', 'Which is the largest ocean on Planet Earth?', 20, 1000, 0, '[
        {"id": "a", "text": "Pacific Ocean", "is_correct": true, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Atlantic Ocean", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Indian Ocean", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Arctic Ocean", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('11111111-1111-1111-1111-111111111111', 'What is the official capital city of Australia?', 15, 1000, 1, '[
        {"id": "a", "text": "Sydney", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Melbourne", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Canberra", "is_correct": true, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Perth", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('11111111-1111-1111-1111-111111111111', 'Mount Kilimanjaro is situated on which continent?', 20, 1000, 2, '[
        {"id": "a", "text": "South America", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Asia", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Europe", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Africa", "is_correct": true, "color": "green", "shape": "square"}
    ]'),
    ('11111111-1111-1111-1111-111111111111', 'What is recognized as the longest river in the world?', 20, 1000, 3, '[
        {"id": "a", "text": "Amazon River", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Nile River", "is_correct": true, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Yangtze River", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Mississippi River", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('11111111-1111-1111-1111-111111111111', 'Which country has the highest total number of natural lakes in the world?', 20, 1000, 4, '[
        {"id": "a", "text": "Canada", "is_correct": true, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Russia", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "United States", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Finland", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('11111111-1111-1111-1111-111111111111', 'The ancient rock-carved city of Petra is located in which modern nation?', 20, 1000, 5, '[
        {"id": "a", "text": "Egypt", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Greece", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Jordan", "is_correct": true, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Turkey", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    -- Science: Cosmic
    ('22222222-2222-2222-2222-222222222222', 'Which planet is affectionately nicknamed the ''Red Planet''?', 15, 1000, 0, '[
        {"id": "a", "text": "Mars", "is_correct": true, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Jupiter", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Venus", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Mercury", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('22222222-2222-2222-2222-222222222222', 'What celestial object has gravitational pull so strong that even light cannot escape?', 20, 1000, 1, '[
        {"id": "a", "text": "Supernova", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Black Hole", "is_correct": true, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "White Dwarf", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Pulsar", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('22222222-2222-2222-2222-222222222222', 'Approximately how long does sunlight take to reach Planet Earth?', 15, 1000, 2, '[
        {"id": "a", "text": "Instantaneous", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "30 seconds", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "8 minutes and 20 seconds", "is_correct": true, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "1 hour", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('22222222-2222-2222-2222-222222222222', 'What is the closest known star system to our Solar System?', 20, 1000, 3, '[
        {"id": "a", "text": "Sirius", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Alpha Centauri", "is_correct": true, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Betelgeuse", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Polaris", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    -- Technology: AI
    ('33333333-3333-3333-3333-333333333333', 'What does the ''T'' stand for in the popular LLM architecture ''GPT''?', 20, 1000, 0, '[
        {"id": "a", "text": "Translation", "is_correct": false, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "Tokenizer", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Transformer", "is_correct": true, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Tensor", "is_correct": false, "color": "green", "shape": "square"}
    ]'),
    ('33333333-3333-3333-3333-333333333333', 'Which pioneer formulated the standard ''Imitation Game'' to evaluate machine intelligence?', 20, 1000, 1, '[
        {"id": "a", "text": "Alan Turing", "is_correct": true, "color": "red", "shape": "triangle"},
        {"id": "b", "text": "John von Neumann", "is_correct": false, "color": "blue", "shape": "diamond"},
        {"id": "c", "text": "Claude Shannon", "is_correct": false, "color": "yellow", "shape": "circle"},
        {"id": "d", "text": "Ada Lovelace", "is_correct": false, "color": "green", "shape": "square"}
    ]')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 9. Competitive Leaderboard Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    avatar_url TEXT,
    total_points INTEGER NOT NULL DEFAULT 0,
    quizzes_played INTEGER NOT NULL DEFAULT 0,
    quizzes_created INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_answers INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON public.leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard(user_id);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Leaderboard is public for everyone to view
CREATE POLICY "Leaderboard viewable by everyone"
    ON public.leaderboard
    FOR SELECT
    USING (true);

-- Authenticated users can insert/update their own leaderboard score
CREATE POLICY "Users can insert their own leaderboard score"
    ON public.leaderboard
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own leaderboard score"
    ON public.leaderboard
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

