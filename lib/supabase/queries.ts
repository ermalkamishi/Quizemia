import { supabase } from "./client";
import { Quiz, Question, CreateQuizInput } from "@/types/quiz";

// Resilient default seed data in case Supabase table hasn't been migrated yet
export const DEFAULT_PUBLIC_QUIZZES: Quiz[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "World Geography & Epic Wonders",
    description: "Challenge your geographical IQ across famous continents, ocean depths, and historic capitals.",
    category: "Geography",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
    play_count: 248,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    questions: [
      {
        question_text: "Which is the largest ocean on Planet Earth?",
        time_limit: 20,
        points: 1000,
        order_index: 0,
        media_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        options: [
          { id: "a", text: "Pacific Ocean", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Atlantic Ocean", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Indian Ocean", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Arctic Ocean", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What is the official capital city of Australia?",
        time_limit: 15,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Sydney", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Melbourne", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Canberra", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Perth", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "Mount Kilimanjaro is situated on which continent?",
        time_limit: 20,
        points: 1000,
        order_index: 2,
        options: [
          { id: "a", text: "South America", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Asia", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Europe", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Africa", is_correct: true, color: "green", shape: "square" },
        ],
      },
    ],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Cosmic Odyssey & Astrophysics",
    description: "Explore planetary orbits, black holes, neutron stars, and modern space exploration.",
    category: "Science",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    play_count: 184,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    questions: [
      {
        question_text: "Which planet is affectionately nicknamed the 'Red Planet'?",
        time_limit: 15,
        points: 1000,
        order_index: 0,
        media_url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
        options: [
          { id: "a", text: "Mars", is_correct: true, color: "red", shape: "triangle" },
          { id: "b", text: "Jupiter", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Venus", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Mercury", is_correct: false, color: "green", shape: "square" },
        ],
      },
      {
        question_text: "What celestial object has gravitational pull so strong that even light cannot escape?",
        time_limit: 20,
        points: 1000,
        order_index: 1,
        options: [
          { id: "a", text: "Supernova", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Black Hole", is_correct: true, color: "blue", shape: "diamond" },
          { id: "c", text: "White Dwarf", is_correct: false, color: "yellow", shape: "circle" },
          { id: "d", text: "Pulsar", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "AI Revolution & Next-Gen Computing",
    description: "From Turing tests and Neural Networks to Transformer models and autonomous agents.",
    category: "Technology",
    creator_email: "Quizemia Official",
    is_public: true,
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    play_count: 312,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    questions: [
      {
        question_text: "What does the 'T' stand for in the popular LLM architecture 'GPT'?",
        time_limit: 20,
        points: 1000,
        order_index: 0,
        options: [
          { id: "a", text: "Translation", is_correct: false, color: "red", shape: "triangle" },
          { id: "b", text: "Tokenizer", is_correct: false, color: "blue", shape: "diamond" },
          { id: "c", text: "Transformer", is_correct: true, color: "yellow", shape: "circle" },
          { id: "d", text: "Tensor", is_correct: false, color: "green", shape: "square" },
        ],
      },
    ],
  },
];

// Helper to get local stored quizzes (for offline / instant fallback)
function getLocalQuizzes(): Quiz[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("kahoot_local_quizzes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalQuiz(quiz: Quiz) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalQuizzes();
    const updated = [quiz, ...list.filter((q) => q.id !== quiz.id)];
    localStorage.setItem("kahoot_local_quizzes", JSON.stringify(updated));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

function deleteLocalQuiz(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalQuizzes().filter((q) => q.id !== id);
    localStorage.setItem("kahoot_local_quizzes", JSON.stringify(list));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

/**
 * Fetch all public quizzes for the Dashboard
 */
export async function fetchPublicQuizzes(): Promise<Quiz[]> {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, questions(*)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Merge default public with any user-created public quizzes in localStorage
      const localPublic = getLocalQuizzes().filter((q) => q.is_public);
      return [...localPublic, ...DEFAULT_PUBLIC_QUIZZES];
    }

    return data as Quiz[];
  } catch (err) {
    console.warn("Using fallback public quizzes:", err);
    const localPublic = getLocalQuizzes().filter((q) => q.is_public);
    return [...localPublic, ...DEFAULT_PUBLIC_QUIZZES];
  }
}

/**
 * Fetch quizzes created by the logged-in user for MyQuizzes
 */
export async function fetchUserQuizzes(userId?: string | null): Promise<Quiz[]> {
  const localList = getLocalQuizzes();
  if (!userId) {
    // Return all locally created quizzes if guest/unauthenticated
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, questions(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return localList.filter((q) => q.user_id === userId || !q.user_id);
    }

    // Merge with any local quizzes that match this user
    const dbIds = new Set(data.map((q) => q.id));
    const extraLocal = localList.filter((q) => !dbIds.has(q.id) && (q.user_id === userId || !q.user_id));
    return [...data, ...extraLocal] as Quiz[];
  } catch (err) {
    console.warn("Using local user quizzes:", err);
    return localList;
  }
}

/**
 * Fetch single quiz with its full list of questions for gameplay
 */
export async function fetchQuizById(quizId: string): Promise<Quiz | null> {
  // Check local first
  const localMatch = getLocalQuizzes().find((q) => q.id === quizId);
  if (localMatch && localMatch.questions && localMatch.questions.length > 0) {
    return localMatch;
  }

  // Check default public quizzes
  const defaultMatch = DEFAULT_PUBLIC_QUIZZES.find((q) => q.id === quizId);
  if (defaultMatch) {
    return defaultMatch;
  }

  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, questions(*)")
      .eq("id", quizId)
      .single();

    if (error || !data) {
      return null;
    }

    // Sort questions by order_index
    if (data.questions && Array.isArray(data.questions)) {
      data.questions.sort((a: Question, b: Question) => a.order_index - b.order_index);
    }

    return data as Quiz;
  } catch (err) {
    console.error("Error fetching quiz:", err);
    return null;
  }
}

/**
 * Create a new quiz with its list of questions
 */
export async function createQuizWithQuestions(
  input: CreateQuizInput,
  userId?: string | null,
  userEmail?: string | null
): Promise<{ success: boolean; quiz?: Quiz; error?: string }> {
  const quizId = crypto.randomUUID();
  const newQuiz: Quiz = {
    id: quizId,
    user_id: userId || null,
    creator_email: userEmail || "Anonymous Creator",
    title: input.title,
    description: input.description,
    category: input.category || "General",
    is_public: input.is_public,
    cover_image:
      input.cover_image ||
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
    play_count: 0,
    created_at: new Date().toISOString(),
    questions: input.questions.map((q, idx) => ({
      ...q,
      id: crypto.randomUUID(),
      quiz_id: quizId,
      order_index: idx,
    })),
  };

  // Always save locally so the user can immediately play/test even without Supabase migration
  saveLocalQuiz(newQuiz);

  try {
    const { error: quizError } = await supabase.from("quizzes").insert([
      {
        id: quizId,
        user_id: userId || null,
        creator_email: userEmail || null,
        title: input.title,
        description: input.description,
        category: input.category,
        is_public: input.is_public,
        cover_image: newQuiz.cover_image,
        play_count: 0,
      },
    ]);

    if (!quizError && input.questions.length > 0) {
      const questionsToInsert = newQuiz.questions!.map((q) => ({
        id: q.id,
        quiz_id: quizId,
        question_text: q.question_text,
        media_url: q.media_url || null,
        time_limit: q.time_limit,
        points: q.points,
        order_index: q.order_index,
        options: q.options,
      }));

      await supabase.from("questions").insert(questionsToInsert);
    }

    return { success: true, quiz: newQuiz };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sync to database";
    console.warn("Saved locally, DB sync failed:", message);
    return { success: true, quiz: newQuiz };
  }
}

/**
 * Delete quiz
 */
export async function deleteQuiz(quizId: string): Promise<boolean> {
  deleteLocalQuiz(quizId);
  try {
    await supabase.from("quizzes").delete().eq("id", quizId);
    return true;
  } catch {
    return true;
  }
}

/**
 * Increment play count for quiz
 */
export async function incrementQuizPlayCount(quizId: string): Promise<void> {
  // Update local
  const list = getLocalQuizzes();
  const target = list.find((q) => q.id === quizId);
  if (target) {
    target.play_count += 1;
    saveLocalQuiz(target);
  }

  try {
    await supabase.rpc("increment_quiz_plays", { target_quiz_id: quizId });
  } catch {
    // Ignore RPC failure if migration not executed
  }
}
