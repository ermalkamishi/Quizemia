export type OptionShape = "triangle" | "diamond" | "circle" | "square";
export type OptionColor = "red" | "blue" | "yellow" | "green";

export interface QuestionOption {
  id: string; // e.g. "a", "b", "c", "d"
  text: string;
  is_correct: boolean;
  color: OptionColor;
  shape: OptionShape;
}

export interface Question {
  id?: string;
  quiz_id?: string;
  question_text: string;
  media_url?: string;
  time_limit: number; // in seconds, default 20
  points: number; // default 1000
  order_index: number;
  options: QuestionOption[];
}

export interface Quiz {
  id: string;
  user_id?: string | null;
  creator_email?: string | null;
  title: string;
  description?: string;
  category?: string;
  is_public: boolean;
  cover_image?: string;
  play_count: number;
  created_at?: string;
  updated_at?: string;
  questions?: Question[];
}

export interface CreateQuizInput {
  title: string;
  description: string;
  category: string;
  is_public: boolean;
  cover_image?: string;
  questions: Omit<Question, "id" | "quiz_id">[];
}

export interface QuizAttemptResult {
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_count: number;
  streak: number;
  time_taken_seconds: number;
}
