/**
 * Quizemia Competitive Leaderboard & Scoring Engine
 * 
 * Provides a realistic, skill-based points economy where players race against each other:
 * - Base correct answer: 100 pts
 * - Speed bonus: +0 to +50 pts (proportional to quick reflexes)
 * - Streak bonus: +10 to +50 pts (rewarding accuracy streaks)
 * - Completion bonus: +50 to +150 pts (rewarding mastery of full quiz)
 * - Creator bonus: +200 pts (rewarding contributing quizzes to the community)
 */

export interface LeaderboardEntry {
  id: string; // user_id or unique ID
  nickname: string;
  avatar_url?: string;
  total_points: number;
  quizzes_played: number;
  quizzes_created: number;
  correct_answers: number;
  total_answers: number;
  accuracy_percentage: number;
  best_streak: number;
  tier: "legend" | "diamond" | "gold" | "silver" | "bronze";
  tier_title_en: string;
  tier_title_al: string;
  rank?: number;
  is_current_user?: boolean;
  updated_at?: string;
}

export const POINTS_CONFIG = {
  BASE_CORRECT_ANSWER: 100,
  MAX_SPEED_BONUS: 50,
  MAX_STREAK_BONUS: 50,
  STREAK_STEP: 10,
  FLAWLESS_COMPLETION_BONUS: 150, // 100% correct
  GREAT_COMPLETION_BONUS: 100,    // >= 80% correct
  PASS_COMPLETION_BONUS: 50,      // >= 50% correct
  CREATOR_BONUS: 200,             // Publishing a quiz
} as const;

/**
 * Calculates realistic, balanced points for a single correct answer.
 */
export function calculateAnswerPoints(
  timeLeft: number,
  maxTime: number = 20,
  streak: number = 0
): { total: number; base: number; speedBonus: number; streakBonus: number } {
  const base = POINTS_CONFIG.BASE_CORRECT_ANSWER;
  const timeFraction = Math.max(0, Math.min(1, timeLeft / Math.max(1, maxTime)));
  const speedBonus = Math.round(POINTS_CONFIG.MAX_SPEED_BONUS * timeFraction);
  const streakBonus = Math.min(POINTS_CONFIG.MAX_STREAK_BONUS, Math.max(0, streak * POINTS_CONFIG.STREAK_STEP));
  const total = base + speedBonus + streakBonus;

  return { total, base, speedBonus, streakBonus };
}

/**
 * Calculates completion bonus for finishing a full quiz based on accuracy.
 */
export function calculateCompletionBonus(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0 || correctCount <= 0) return 0;
  const accuracy = correctCount / totalQuestions;
  if (accuracy >= 1.0) return POINTS_CONFIG.FLAWLESS_COMPLETION_BONUS;
  if (accuracy >= 0.8) return POINTS_CONFIG.GREAT_COMPLETION_BONUS;
  if (accuracy >= 0.5) return POINTS_CONFIG.PASS_COMPLETION_BONUS;
  return 20; // Participation credit
}

/**
 * Computes rank tier and title from total points.
 */
export function getTierInfo(points: number): {
  tier: "legend" | "diamond" | "gold" | "silver" | "bronze";
  titleEn: string;
  titleAl: string;
  badgeClass: string;
  emoji: string;
  nextTierPoints?: number;
} {
  if (points >= 5000) {
    return {
      tier: "legend",
      titleEn: "Grandmaster",
      titleAl: "Kryemjeshtër",
      badgeClass: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40",
      emoji: "👑",
    };
  }
  if (points >= 3000) {
    return {
      tier: "diamond",
      titleEn: "Diamond Scholar",
      titleAl: "Dijetar Diamanti",
      badgeClass: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40",
      emoji: "💎",
      nextTierPoints: 5000,
    };
  }
  if (points >= 1800) {
    return {
      tier: "gold",
      titleEn: "Gold Master",
      titleAl: "Mjeshtër i Artë",
      badgeClass: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40",
      emoji: "🥇",
      nextTierPoints: 3000,
    };
  }
  if (points >= 800) {
    return {
      tier: "silver",
      titleEn: "Silver Veteran",
      titleAl: "Veteran i Argjendtë",
      badgeClass: "bg-slate-400/20 text-slate-700 dark:text-slate-300 border-slate-400/40",
      emoji: "🥈",
      nextTierPoints: 1800,
    };
  }
  return {
    tier: "bronze",
    titleEn: "Bronze Challenger",
    titleAl: "Sfidues Bronzi",
    badgeClass: "bg-amber-700/20 text-amber-800 dark:text-amber-300 border-amber-700/30",
    emoji: "🥉",
    nextTierPoints: 800,
  };
}

/**
 * Realistic default community champions to seed the leaderboard with active competition.
 */
export const SEED_LEADERBOARD_PLAYERS: LeaderboardEntry[] = [
  {
    id: "champion-1",
    nickname: "Arbër Kastrioti",
    total_points: 4860,
    quizzes_played: 28,
    quizzes_created: 6,
    correct_answers: 136,
    total_answers: 148,
    accuracy_percentage: 92,
    best_streak: 14,
    tier: "diamond",
    tier_title_en: "Diamond Scholar",
    tier_title_al: "Dijetar Diamanti",
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "champion-2",
    nickname: "Elena Vangjeli",
    total_points: 4190,
    quizzes_played: 24,
    quizzes_created: 4,
    correct_answers: 118,
    total_answers: 132,
    accuracy_percentage: 89,
    best_streak: 11,
    tier: "diamond",
    tier_title_en: "Diamond Scholar",
    tier_title_al: "Dijetar Diamanti",
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "champion-3",
    nickname: "Marko Sokolov",
    total_points: 3620,
    quizzes_played: 21,
    quizzes_created: 3,
    correct_answers: 104,
    total_answers: 119,
    accuracy_percentage: 87,
    best_streak: 9,
    tier: "diamond",
    tier_title_en: "Diamond Scholar",
    tier_title_al: "Dijetar Diamanti",
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

// Helper: Local storage key
const LOCAL_LEADERBOARD_KEY = "quizemia_leaderboard_stats";

export function getLocalUserStats(userId: string): LeaderboardEntry | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem(`${LOCAL_LEADERBOARD_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read local stats:", e);
  }
  return null;
}

export function saveLocalUserStats(entry: LeaderboardEntry): void {
  if (typeof window === "undefined" || !entry.id) return;
  try {
    localStorage.setItem(`${LOCAL_LEADERBOARD_KEY}_${entry.id}`, JSON.stringify(entry));
  } catch (e) {
    console.error("Failed to save local stats:", e);
  }
}

/**
 * Records points earned from a completed quiz match and synchronizes to server & local storage.
 */
export async function recordMatchResult(params: {
  userId: string;
  nickname: string;
  matchScore: number;
  correctAnswers: number;
  totalQuestions: number;
  bestStreak: number;
}): Promise<LeaderboardEntry> {
  const { userId, nickname, matchScore, correctAnswers, totalQuestions, bestStreak } = params;

  // Retrieve existing stats
  const existing = getLocalUserStats(userId) || {
    id: userId,
    nickname: nickname || "Player",
    total_points: 0,
    quizzes_played: 0,
    quizzes_created: 0,
    correct_answers: 0,
    total_answers: 0,
    accuracy_percentage: 0,
    best_streak: 0,
    tier: "bronze" as const,
    tier_title_en: "Bronze Challenger",
    tier_title_al: "Sfidues Bronzi",
  };

  const newTotalPoints = existing.total_points + matchScore;
  const newQuizzesPlayed = existing.quizzes_played + 1;
  const newCorrectAnswers = existing.correct_answers + correctAnswers;
  const newTotalAnswers = existing.total_answers + totalQuestions;
  const newAccuracy = newTotalAnswers > 0 ? Math.round((newCorrectAnswers / newTotalAnswers) * 100) : 0;
  const newBestStreak = Math.max(existing.best_streak, bestStreak);

  const tierInfo = getTierInfo(newTotalPoints);

  const updatedEntry: LeaderboardEntry = {
    ...existing,
    nickname: nickname || existing.nickname,
    total_points: newTotalPoints,
    quizzes_played: newQuizzesPlayed,
    correct_answers: newCorrectAnswers,
    total_answers: newTotalAnswers,
    accuracy_percentage: newAccuracy,
    best_streak: newBestStreak,
    tier: tierInfo.tier,
    tier_title_en: tierInfo.titleEn,
    tier_title_al: tierInfo.titleAl,
    updated_at: new Date().toISOString(),
  };

  saveLocalUserStats(updatedEntry);

  // Sync to API
  try {
    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        nickname: updatedEntry.nickname,
        pointsToAdd: matchScore,
        quizCompleted: true,
        correctCount: correctAnswers,
        questionCount: totalQuestions,
        bestStreak: updatedEntry.best_streak,
      }),
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return updatedEntry;
}

/**
 * Awards creator bonus points when a user publishes a quiz.
 */
export async function recordQuizCreatedBonus(userId: string, nickname: string): Promise<LeaderboardEntry> {
  const existing = getLocalUserStats(userId) || {
    id: userId,
    nickname: nickname || "Creator",
    total_points: 0,
    quizzes_played: 0,
    quizzes_created: 0,
    correct_answers: 0,
    total_answers: 0,
    accuracy_percentage: 0,
    best_streak: 0,
    tier: "bronze" as const,
    tier_title_en: "Bronze Challenger",
    tier_title_al: "Sfidues Bronzi",
  };

  const newTotalPoints = existing.total_points + POINTS_CONFIG.CREATOR_BONUS;
  const newQuizzesCreated = existing.quizzes_created + 1;
  const tierInfo = getTierInfo(newTotalPoints);

  const updatedEntry: LeaderboardEntry = {
    ...existing,
    nickname: nickname || existing.nickname,
    total_points: newTotalPoints,
    quizzes_created: newQuizzesCreated,
    tier: tierInfo.tier,
    tier_title_en: tierInfo.titleEn,
    tier_title_al: tierInfo.titleAl,
    updated_at: new Date().toISOString(),
  };

  saveLocalUserStats(updatedEntry);

  // Sync to API
  try {
    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        nickname: updatedEntry.nickname,
        pointsToAdd: POINTS_CONFIG.CREATOR_BONUS,
        quizCreated: true,
      }),
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  return updatedEntry;
}
