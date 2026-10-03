"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LiveGameStatus } from "@/lib/liveGame";
import { cn } from "@/lib/utils";

interface LivePlayerProps {
  initialPin?: string;
}

interface PlayerRoomData {
  pin: string;
  status: LiveGameStatus;
  currentQuestionIdx: number;
  totalQuestions: number;
  quizTitle: string;
  category: string;
  questionStartTime?: number;
  questionTimeLimit: number;
  question?: {
    id: string;
    question_text: string;
    media_url?: string;
    time_limit: number;
    options: Array<{
      id: string;
      text: string;
      color?: string;
      shape?: string;
      is_correct?: boolean;
    }>;
  };
  playersCount: number;
  currentPlayer?: {
    id: string;
    nickname: string;
    score: number;
    streak: number;
    lastPointsEarned?: number;
    lastAnswerCorrect?: boolean;
    selectedOptionId?: string | null;
  };
  topPlayers?: Array<{
    rank: number;
    id: string;
    nickname: string;
    score: number;
    streak: number;
  }>;
}

export default function LivePlayer({ initialPin }: LivePlayerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const urlPin = searchParams.get("pin") || initialPin || "";
  const [pin, setPin] = useState(urlPin);
  const [nickname, setNickname] = useState(
    user?.user_metadata?.nickname ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "")
  );

  const [playerId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("quizemia_live_player_id");
      if (stored) return stored;
      const gen = user?.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem("quizemia_live_player_id", gen);
      return gen;
    }
    return `p_${Date.now()}`;
  });

  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomData, setRoomData] = useState<PlayerRoomData | null>(null);

  // Gameplay state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll room state while in game
  const fetchRoomState = async (activePin: string) => {
    try {
      const res = await fetch(
        `/api/live/room?pin=${encodeURIComponent(activePin)}&role=player&playerId=${encodeURIComponent(playerId)}`
      );
      const data = await res.json();
      if (data.success && data.room) {
        setRoomData(data.room);
        if (data.room.status === "question") {
          // Sync timer
          if (data.room.questionStartTime && data.room.questionTimeLimit) {
            const elapsed = Math.max(0, (Date.now() - data.room.questionStartTime) / 1000);
            const remaining = Math.max(0, Math.round(data.room.questionTimeLimit - elapsed));
            setTimeLeft(remaining);
          }
          // If moving to a new question, reset selection state
          if (data.room.currentPlayer?.selectedOptionId === null && hasSubmitted) {
            setSelectedOptionId(null);
            setHasSubmitted(false);
          }
        }
      } else if (!data.success && hasJoined) {
        setErrorMessage(data.error || t.live.invalidPinError);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (hasJoined && pin) {
      fetchRoomState(pin);
      pollIntervalRef.current = setInterval(() => {
        fetchRoomState(pin);
      }, 1000);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [hasJoined, pin, playerId]);

  // Join Room Handler
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().replace(/\s+/g, "");
    const cleanNick = nickname.trim();

    if (!cleanPin || cleanPin.length < 4) {
      setErrorMessage(t.live.noPinError);
      return;
    }
    if (!cleanNick) {
      setErrorMessage(t.live.nicknamePlaceholder);
      return;
    }

    setJoining(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/live/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          pin: cleanPin,
          player: { id: playerId, nickname: cleanNick },
        }),
      });

      const data = await res.json();
      if (data.success && data.room) {
        setPin(cleanPin);
        setRoomData(data.room);
        setHasJoined(true);
      } else {
        setErrorMessage(data.error || t.live.invalidPinError);
      }
    } catch (err: any) {
      setErrorMessage(err.message || t.live.invalidPinError);
    } finally {
      setJoining(false);
    }
  };

  // Submit Answer Option
  const handleSelectOption = async (optionId: string) => {
    if (hasSubmitted || submitting || !pin || roomData?.status !== "question") return;

    setSelectedOptionId(optionId);
    setHasSubmitted(true);
    setSubmitting(true);

    try {
      await fetch("/api/live/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          pin,
          playerId,
          optionId,
        }),
      });
      await fetchRoomState(pin);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Initial Join Form
  if (!hasJoined) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-12 flex flex-col justify-center">
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl bg-white dark:bg-zinc-900">
          <CardHeader className="text-center pb-4 pt-6">
            <CardTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {t.live.enterGameTitle}
            </CardTitle>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {t.live.enterGameSubtitle}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  {t.live.gamePin}
                </label>
                <Input
                  type="text"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-xl sm:text-2xl font-black tracking-widest h-14 rounded-xl uppercase"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  {t.live.nickname}
                </label>
                <Input
                  type="text"
                  maxLength={24}
                  placeholder={t.live.nicknamePlaceholder}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="text-center font-bold text-base h-12 rounded-xl"
                />
              </div>

              {errorMessage && (
                <div className="p-3 text-xs font-semibold rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={joining}
                className="w-full h-12 font-bold text-sm tracking-wide rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all cursor-pointer"
              >
                {joining ? t.common.loading : t.live.joinButton}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Waiting Lobby Phase
  if (roomData?.status === "lobby") {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 w-full space-y-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t.live.gamePin}: {roomData.pin}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {nickname}
          </h2>
          <div className="h-1.5 w-16 bg-blue-600 rounded-full mx-auto animate-pulse" />
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {t.live.waitingForHost}
          </p>
        </div>

        <div className="text-xs font-semibold text-zinc-400">
          {roomData.quizTitle} • {roomData.category}
        </div>
      </div>
    );
  }

  // 3. Question Phase (Live 4-Option Choice for Players)
  if (roomData?.status === "question") {
    const q = roomData.question;
    const currentScore = roomData.currentPlayer?.score || 0;
    const currentStreak = roomData.currentPlayer?.streak || 0;

    return (
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 sm:py-8 flex flex-col justify-between h-[calc(100dvh-5rem)]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500">
          <div>
            {t.live.questionProgress} {roomData.currentQuestionIdx + 1} / {roomData.totalQuestions}
          </div>
          <div className="flex items-center gap-3">
            <span>Score: {currentScore.toLocaleString()}</span>
            {currentStreak > 1 && (
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                Streak: {currentStreak}
              </span>
            )}
          </div>
        </div>

        {/* Question Text */}
        <div className="py-4 text-center">
          <h3 className="text-base sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug">
            {q?.question_text || "..."}
          </h3>
        </div>

        {/* 4 Formal Options */}
        {hasSubmitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
            <div className="h-3 w-3 rounded-full bg-blue-600 animate-ping mb-2" />
            <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              {t.live.submittedWaiting}
            </h4>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-2">
            {q?.options.map((option, idx) => {
              const letter = ["A", "B", "C", "D"][idx] || "";
              const colorClasses = [
                "border-red-300 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-900 dark:text-red-200",
                "border-blue-300 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-900 dark:text-blue-200",
                "border-amber-300 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-900 dark:text-amber-200",
                "border-emerald-300 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200",
              ][idx % 4];

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSelectOption(option.id)}
                  className={cn(
                    "min-h-24 p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer font-bold text-sm sm:text-base active:scale-[0.98]",
                    colorClasses,
                    selectedOptionId === option.id && "ring-2 ring-blue-600 dark:ring-blue-400"
                  )}
                >
                  <span className="h-8 w-8 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 flex items-center justify-center font-black text-xs shrink-0">
                    {letter}
                  </span>
                  <span className="flex-1 break-words">{option.text}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 4. Review Phase (Correct/Incorrect outcome)
  if (roomData?.status === "review") {
    const isCorrect = Boolean(roomData.currentPlayer?.lastAnswerCorrect);
    const points = roomData.currentPlayer?.lastPointsEarned || 0;

    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-16 flex flex-col justify-center items-center text-center space-y-4">
        <div
          className={cn(
            "p-8 rounded-2xl border w-full space-y-3",
            isCorrect
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
          )}
        >
          <span className="text-xs font-bold uppercase tracking-wider block">
            {isCorrect ? t.live.correct : t.live.incorrect}
          </span>
          <p className="text-3xl font-black">
            {isCorrect ? `+${points}` : "+0"}
          </p>
        </div>
        <p className="text-xs font-semibold text-zinc-400">
          {t.live.submittedWaiting}
        </p>
      </div>
    );
  }

  // 5. Leaderboard / Standings Phase
  if (roomData?.status === "leaderboard") {
    const top = roomData.topPlayers || [];
    const myRankIdx = top.findIndex((p) => p.id === playerId);
    const myRank = myRankIdx >= 0 ? myRankIdx + 1 : "-";

    return (
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-10 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {roomData.quizTitle}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {t.live.showStandings}
          </h2>
        </div>

        {/* Current Player Standings Card */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              {nickname}
            </span>
            <span className="text-lg font-black text-blue-600">
              Rank #{myRank}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              {roomData.currentPlayer?.score || 0} pts
            </span>
          </div>
        </div>

        {/* Top 5 Table */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
          {top.map((p) => (
            <div
              key={p.id}
              className={cn(
                "p-3.5 flex items-center justify-between text-sm font-semibold",
                p.id === playerId && "bg-blue-50/60 dark:bg-blue-950/20 font-bold"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-zinc-400 w-6">#{p.rank}</span>
                <span className="text-zinc-900 dark:text-zinc-100">{p.nickname}</span>
              </div>
              <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. Final Finished Phase
  if (roomData?.status === "finished") {
    const top = roomData.topPlayers || [];
    const myRankIdx = top.findIndex((p) => p.id === playerId);
    const myRank = myRankIdx >= 0 ? myRankIdx + 1 : "-";
    const myScore = roomData.currentPlayer?.score || 0;

    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-14 flex flex-col justify-center items-center text-center space-y-6">
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 w-full space-y-3 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t.live.podiumTitle}
          </span>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
            Rank #{myRank}
          </h2>
          <p className="text-2xl font-black text-blue-600">
            {myScore.toLocaleString()} pts
          </p>
        </div>

        <Button
          onClick={() => router.push("/quiz")}
          className="w-full h-12 font-bold text-sm rounded-xl cursor-pointer"
        >
          {t.live.returnHome}
        </Button>
      </div>
    );
  }

  return null;
}
