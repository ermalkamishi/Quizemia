import { Quiz, Question, QuestionOption } from "@/types/quiz";
import { calculateAnswerPoints } from "@/lib/leaderboard";

export interface LivePlayer {
  id: string;
  nickname: string;
  score: number;
  streak: number;
  lastPointsEarned?: number;
  lastAnswerCorrect?: boolean;
  selectedOptionId?: string | null;
  answeredAt?: number;
}

export type LiveGameStatus =
  | "lobby"
  | "countdown"
  | "question"
  | "review"
  | "leaderboard"
  | "finished";

export interface LiveRoom {
  pin: string;
  hostId: string;
  hostNickname: string;
  quiz: Quiz;
  status: LiveGameStatus;
  currentQuestionIdx: number;
  questionStartTime?: number;
  questionTimeLimit: number;
  players: LivePlayer[];
  answerCounts: Record<string, number>;
  createdAt: number;
  updatedAt: number;
}

// In-memory global registry of active live rooms
declare global {
  // eslint-disable-next-line no-var
  var __quizemia_live_rooms: Map<string, LiveRoom> | undefined;
}

function getRoomsMap(): Map<string, LiveRoom> {
  if (!globalThis.__quizemia_live_rooms) {
    globalThis.__quizemia_live_rooms = new Map<string, LiveRoom>();
  }
  return globalThis.__quizemia_live_rooms;
}

/**
 * Generates an intuitive 6-digit numeric PIN
 */
export function generateGamePin(): string {
  const rooms = getRoomsMap();
  let pin = "";
  for (let i = 0; i < 10; i++) {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    if (!rooms.has(pin)) {
      return pin;
    }
  }
  return pin;
}

/**
 * Creates and registers a new live game room
 */
export function createLiveRoom(
  quiz: Quiz,
  hostId: string,
  hostNickname: string
): LiveRoom {
  const rooms = getRoomsMap();
  const pin = generateGamePin();

  const firstQ = quiz.questions?.[0];
  const timeLimit = firstQ?.time_limit || 20;

  const room: LiveRoom = {
    pin,
    hostId,
    hostNickname: hostNickname || "Host",
    quiz,
    status: "lobby",
    currentQuestionIdx: 0,
    questionTimeLimit: timeLimit,
    players: [],
    answerCounts: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  rooms.set(pin, room);
  return room;
}

/**
 * Retrieves a live room by PIN
 */
export function getLiveRoom(pin: string): LiveRoom | null {
  const rooms = getRoomsMap();
  const cleanPin = pin.trim().replace(/\s+/g, "");
  return rooms.get(cleanPin) || null;
}

/**
 * Sanitizes room state for players so answer keys are not leaked in DevTools during active questions
 */
export function sanitizeRoomForPlayer(room: LiveRoom, playerId?: string) {
  const currentQ = room.quiz.questions?.[room.currentQuestionIdx];
  const isQuestionActive = room.status === "question" || room.status === "countdown";

  let safeQuestion: Question | undefined = undefined;
  if (currentQ) {
    safeQuestion = {
      ...currentQ,
      options: currentQ.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        shape: opt.shape,
        color: opt.color,
        is_correct: isQuestionActive ? false : opt.is_correct, // Hide truth during active timer
      })),
    };
  }

  const currentPlayer = room.players.find((p) => p.id === playerId);

  return {
    pin: room.pin,
    status: room.status,
    currentQuestionIdx: room.currentQuestionIdx,
    totalQuestions: room.quiz.questions?.length || 0,
    quizTitle: room.quiz.title,
    category: room.quiz.category,
    questionStartTime: room.questionStartTime,
    questionTimeLimit: room.questionTimeLimit,
    question: safeQuestion,
    playersCount: room.players.length,
    answerCounts: isQuestionActive ? undefined : room.answerCounts,
    currentPlayer: currentPlayer
      ? {
          id: currentPlayer.id,
          nickname: currentPlayer.nickname,
          score: currentPlayer.score,
          streak: currentPlayer.streak,
          lastPointsEarned: currentPlayer.lastPointsEarned,
          lastAnswerCorrect: currentPlayer.lastAnswerCorrect,
          selectedOptionId: currentPlayer.selectedOptionId,
        }
      : undefined,
    topPlayers: room.players
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((p, idx) => ({
        rank: idx + 1,
        id: p.id,
        nickname: p.nickname,
        score: p.score,
        streak: p.streak,
      })),
  };
}

/**
 * Adds a player to a room
 */
export function joinLiveRoom(
  pin: string,
  player: { id: string; nickname: string }
): { success: boolean; room?: LiveRoom; error?: string } {
  const room = getLiveRoom(pin);
  if (!room) {
    return { success: false, error: "Room not found." };
  }
  if (room.status !== "lobby") {
    return { success: false, error: "Game has already started." };
  }

  // Check if player is already in room
  const existingIdx = room.players.findIndex((p) => p.id === player.id);
  if (existingIdx >= 0) {
    room.players[existingIdx].nickname = player.nickname;
  } else {
    room.players.push({
      id: player.id,
      nickname: player.nickname,
      score: 0,
      streak: 0,
    });
  }

  room.updatedAt = Date.now();
  return { success: true, room };
}

/**
 * Handles a player's answer submission
 */
export function submitPlayerAnswer(
  pin: string,
  playerId: string,
  optionId: string
): { success: boolean; pointsEarned?: number; isCorrect?: boolean; error?: string } {
  const room = getLiveRoom(pin);
  if (!room || room.status !== "question") {
    return { success: false, error: "Question is not currently active." };
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { success: false, error: "Player not in room." };
  }

  if (player.selectedOptionId) {
    return { success: false, error: "Already answered." };
  }

  const currentQ = room.quiz.questions?.[room.currentQuestionIdx];
  if (!currentQ) {
    return { success: false, error: "Invalid question." };
  }

  const selectedOpt = currentQ.options.find((o) => o.id === optionId);
  const isCorrect = Boolean(selectedOpt?.is_correct);

  // Calculate speed and points
  const elapsedSeconds = room.questionStartTime
    ? Math.max(0, (Date.now() - room.questionStartTime) / 1000)
    : 0;
  const timeLeft = Math.max(0, room.questionTimeLimit - elapsedSeconds);

  let pointsEarned = 0;
  if (isCorrect) {
    const { total } = calculateAnswerPoints(timeLeft, room.questionTimeLimit, player.streak);
    pointsEarned = total;
    player.score += pointsEarned;
    player.streak += 1;
  } else {
    player.streak = 0;
  }

  player.selectedOptionId = optionId;
  player.lastPointsEarned = pointsEarned;
  player.lastAnswerCorrect = isCorrect;
  player.answeredAt = Date.now();

  // Track answer distribution for host review bar
  room.answerCounts[optionId] = (room.answerCounts[optionId] || 0) + 1;
  room.updatedAt = Date.now();

  return { success: true, pointsEarned, isCorrect };
}

/**
 * Updates room phase: lobby -> countdown -> question -> review -> leaderboard -> finished
 */
export function advanceRoomPhase(
  pin: string,
  action: "start" | "next_question" | "show_review" | "show_leaderboard" | "finish"
): { success: boolean; room?: LiveRoom; error?: string } {
  const room = getLiveRoom(pin);
  if (!room) return { success: false, error: "Room not found." };

  if (action === "start") {
    room.status = "question";
    room.currentQuestionIdx = 0;
    room.questionStartTime = Date.now();
    const q = room.quiz.questions?.[0];
    room.questionTimeLimit = q?.time_limit || 20;
    room.answerCounts = {};
    room.players.forEach((p) => {
      p.selectedOptionId = null;
      p.lastPointsEarned = 0;
    });
  } else if (action === "show_review") {
    room.status = "review";
  } else if (action === "show_leaderboard") {
    room.status = "leaderboard";
  } else if (action === "next_question") {
    const nextIdx = room.currentQuestionIdx + 1;
    const totalQ = room.quiz.questions?.length || 0;
    if (nextIdx < totalQ) {
      room.currentQuestionIdx = nextIdx;
      room.status = "question";
      room.questionStartTime = Date.now();
      const nextQ = room.quiz.questions?.[nextIdx];
      room.questionTimeLimit = nextQ?.time_limit || 20;
      room.answerCounts = {};
      room.players.forEach((p) => {
        p.selectedOptionId = null;
        p.lastPointsEarned = 0;
      });
    } else {
      room.status = "finished";
    }
  } else if (action === "finish") {
    room.status = "finished";
  }

  room.updatedAt = Date.now();
  return { success: true, room };
}
