"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LiveGameStatus, LivePlayer } from "@/lib/liveGame";
import { fetchQuizById } from "@/lib/supabase/queries";
import { Quiz, Question } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface HostRoomData {
  pin: string;
  status: LiveGameStatus;
  currentQuestionIdx: number;
  totalQuestions: number;
  quizTitle: string;
  category: string;
  questionStartTime?: number;
  questionTimeLimit: number;
  currentQuestion?: Question;
  players: LivePlayer[];
  answerCounts: Record<string, number>;
  createdAt: number;
  updatedAt: number;
}

export default function LiveHost() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const quizIdParam = searchParams.get("quizId");
  const existingPin = searchParams.get("pin");

  const [pin, setPin] = useState(existingPin || "");
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<HostRoomData | null>(null);
  const [error, setError] = useState("");
  const [advancing, setAdvancing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or fetch Host Room
  useEffect(() => {
    async function initRoom() {
      setLoading(true);
      setError("");

      try {
        if (existingPin) {
          // Reconnect to existing host room
          const res = await fetch(`/api/live/room?pin=${encodeURIComponent(existingPin)}&role=host`);
          const data = await res.json();
          if (data.success && data.room) {
            setPin(existingPin);
            setRoomData(data.room);
          } else {
            setError(data.error || "Room not found.");
          }
        } else if (quizIdParam) {
          // Fetch quiz and create new room
          const quiz = await fetchQuizById(quizIdParam);
          if (!quiz) {
            setError("Failed to load quiz details.");
            setLoading(false);
            return;
          }

          const hostNickname =
            user?.user_metadata?.nickname ||
            user?.user_metadata?.name ||
            (user?.email ? user.email.split("@")[0] : "Host");

          const createRes = await fetch("/api/live/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create",
              quiz,
              hostId: user?.id || "host",
              hostNickname,
            }),
          });

          const createData = await createRes.json();
          if (createData.success && createData.pin) {
            setPin(createData.pin);
            setRoomData(createData.room);
            router.replace(`/live/host?pin=${createData.pin}`);
          } else {
            setError(createData.error || "Failed to initialize game room.");
          }
        } else {
          setError("No quiz specified to host.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    initRoom();
  }, [quizIdParam, existingPin]);

  // Poll room updates for Host
  const fetchHostRoom = async () => {
    if (!pin) return;
    try {
      const res = await fetch(`/api/live/room?pin=${encodeURIComponent(pin)}&role=host`);
      const data = await res.json();
      if (data.success && data.room) {
        setRoomData(data.room);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!pin) return;

    pollIntervalRef.current = setInterval(() => {
      fetchHostRoom();
    }, 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [pin]);

  // Handle synchronized timer in Question Phase
  useEffect(() => {
    if (roomData?.status === "question" && roomData.questionStartTime) {
      const limit = roomData.questionTimeLimit || 20;

      const updateTimer = () => {
        const elapsed = (Date.now() - (roomData.questionStartTime || Date.now())) / 1000;
        const remain = Math.max(0, Math.round(limit - elapsed));
        setTimeLeft(remain);

        // When time expires or all players answered, advance to review
        const answeredCount = Object.values(roomData.answerCounts || {}).reduce((a, b) => a + b, 0);
        const totalPlayers = roomData.players?.length || 0;

        if (remain <= 0 || (totalPlayers > 0 && answeredCount >= totalPlayers)) {
          handleAdvance("show_review");
        }
      };

      updateTimer();
      timerIntervalRef.current = setInterval(updateTimer, 500);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [roomData?.status, roomData?.questionStartTime, roomData?.answerCounts, roomData?.players?.length]);

  // Advance Room Phase
  const handleAdvance = async (step: "start" | "show_review" | "show_leaderboard" | "next_question" | "finish") => {
    if (!pin || advancing) return;
    setAdvancing(true);

    try {
      const res = await fetch("/api/live/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "advance",
          pin,
          step,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoomData(data.room);
      }
    } catch {
      // ignore
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin dark:border-zinc-100" />
        <p className="text-sm font-semibold text-zinc-500">
          {language === "al" ? "Po përgatitet dhoma e lojës..." : "Initializing game session..."}
        </p>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-16 text-center space-y-4">
        <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 font-semibold text-sm">
          {error || "Session unavailable."}
        </div>
        <Button onClick={() => router.push("/quiz")} variant="outline" className="font-bold text-xs uppercase">
          {t.common.back}
        </Button>
      </div>
    );
  }

  // 1. Lobby Phase
  if (roomData.status === "lobby") {
    const playersCount = roomData.players?.length || 0;

    return (
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 space-y-8">
        {/* Top Header Card */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {roomData.category} • {roomData.quizTitle}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            {t.live.hostGameTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            {language === "al"
              ? "Udhëzoni pjesëmarrësit të hapin faqen dhe të shkruajnë kodin më poshtë:"
              : "Direct participants to navigate to the game URL and enter the PIN:"}
          </p>
        </div>

        {/* Formal PIN Billboard */}
        <div className="p-6 sm:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center shadow-lg space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 block">
            {t.live.gamePin}
          </span>
          <div className="text-5xl sm:text-7xl font-black tracking-widest text-zinc-900 dark:text-zinc-50 select-all font-mono">
            {roomData.pin}
          </div>
          <div className="pt-2 text-xs font-semibold text-zinc-500">
            Join at: <span className="font-bold text-blue-600 dark:text-blue-400">quizemia.com/live/join</span>
          </div>
        </div>

        {/* Players Joined Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              {t.live.playersJoined} ({playersCount})
            </span>
            <Button
              size="lg"
              disabled={advancing}
              onClick={() => handleAdvance("start")}
              className="font-bold text-sm px-8 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
            >
              {advancing ? t.common.loading : t.live.startGameButton}
            </Button>
          </div>

          {/* Joined Players List */}
          {playersCount === 0 ? (
            <div className="py-12 text-center text-sm font-medium text-zinc-400">
              {language === "al"
                ? "Asnjë lojtar nuk është bashkuar ende. Shpërndani PIN-in për të filluar!"
                : "No participants have joined yet. Share the PIN to begin!"}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {roomData.players.map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold text-zinc-800 dark:text-zinc-200 shadow-sm"
                >
                  {p.nickname}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Active Question Phase
  if (roomData.status === "question") {
    const q = roomData.currentQuestion;
    const answeredCount = Object.values(roomData.answerCounts || {}).reduce((a, b) => a + b, 0);
    const totalPlayers = roomData.players?.length || 0;

    return (
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col justify-between h-[calc(100dvh-5rem)]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500">
          <span>
            {t.live.questionProgress} {roomData.currentQuestionIdx + 1} / {roomData.totalQuestions}
          </span>
          <span className="font-mono text-xl font-black text-zinc-900 dark:text-zinc-50">
            {timeLeft}s
          </span>
          <div className="flex items-center gap-4">
            <span>
              {t.live.answersCount}: {answeredCount} / {totalPlayers}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAdvance("show_review")}
              disabled={advancing}
              className="text-xs font-bold"
            >
              {language === "al" ? "Mbyll Kohën" : "Close Question"}
            </Button>
          </div>
        </div>

        {/* Question Title & Media */}
        <div className="my-auto py-8 text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
            {q?.question_text}
          </h2>
          {q?.media_url && (
            <div className="max-h-56 max-w-md mx-auto rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <img src={q.media_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* 4 Formal Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-2">
          {q?.options.map((option, idx) => {
            const letter = ["A", "B", "C", "D"][idx] || "";
            const colorBorder = [
              "border-red-300 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/10",
              "border-blue-300 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/10",
              "border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/10",
              "border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/10",
            ][idx % 4];

            return (
              <div
                key={option.id}
                className={cn(
                  "p-4 rounded-xl border-2 flex items-center gap-3 font-bold text-sm sm:text-base",
                  colorBorder
                )}
              >
                <span className="h-8 w-8 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 flex items-center justify-center font-black text-xs shrink-0">
                  {letter}
                </span>
                <span className="text-zinc-900 dark:text-zinc-100">{option.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Review Phase
  if (roomData.status === "review") {
    const q = roomData.currentQuestion;
    const totalVotes = Object.values(roomData.answerCounts || {}).reduce((a, b) => a + b, 0);

    return (
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {t.live.questionProgress} {roomData.currentQuestionIdx + 1} / {roomData.totalQuestions}
          </span>
          <Button
            size="sm"
            onClick={() => handleAdvance("show_leaderboard")}
            disabled={advancing}
            className="font-bold text-xs"
          >
            {t.live.showStandings}
          </Button>
        </div>

        <div className="text-center py-4">
          <h3 className="text-xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {q?.question_text}
          </h3>
        </div>

        {/* Options Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {q?.options.map((option, idx) => {
            const letter = ["A", "B", "C", "D"][idx] || "";
            const isCorrect = Boolean(option.is_correct);
            const votes = roomData.answerCounts?.[option.id] || 0;
            const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

            return (
              <div
                key={option.id}
                className={cn(
                  "p-4 rounded-xl border-2 flex flex-col justify-between space-y-3 transition-all",
                  isCorrect
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-75"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black">
                      {letter}
                    </span>
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      {option.text}
                    </span>
                  </div>
                  {isCorrect && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                      {language === "al" ? "E Saktë" : "Correct"}
                    </span>
                  )}
                </div>

                {/* Voter Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-500">
                    <span>{votes} {language === "al" ? "përgjigje" : "answers"}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", isCorrect ? "bg-emerald-500" : "bg-zinc-400")}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. Round Standings Phase
  if (roomData.status === "leaderboard") {
    const isLastQ = roomData.currentQuestionIdx + 1 >= roomData.totalQuestions;
    const sortedPlayers = roomData.players.slice().sort((a, b) => b.score - a.score);

    return (
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {roomData.quizTitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {t.live.showStandings}
            </h2>
          </div>
          <Button
            size="sm"
            onClick={() => handleAdvance(isLastQ ? "finish" : "next_question")}
            disabled={advancing}
            className="font-bold text-xs"
          >
            {isLastQ ? (language === "al" ? "Renditja Finale" : "Final Podium") : t.live.nextQuestion}
          </Button>
        </div>

        {/* Players Ranking */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className="p-4 flex items-center justify-between text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            >
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-600 dark:text-zinc-300">
                  #{idx + 1}
                </span>
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                  {player.nickname}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {player.streak > 1 && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Streak: {player.streak}
                  </span>
                )}
                <span className="text-base font-black text-zinc-900 dark:text-zinc-50">
                  {player.score.toLocaleString()} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. Final Podium Phase
  if (roomData.status === "finished") {
    const sorted = roomData.players.slice().sort((a, b) => b.score - a.score);
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];

    return (
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-10 text-center">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {roomData.quizTitle}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            {t.live.podiumTitle}
          </h1>
        </div>

        {/* Formal 3-Pillar Podium */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-6">
          {/* 2nd Place */}
          <div className="p-4 sm:p-6 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-2 h-48 flex flex-col justify-end">
            <span className="text-xs font-black text-zinc-400 uppercase">2nd</span>
            <p className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
              {second?.nickname || "—"}
            </p>
            <p className="text-xs sm:text-sm font-black text-zinc-500">
              {second ? `${second.score} pts` : ""}
            </p>
          </div>

          {/* 1st Place */}
          <div className="p-5 sm:p-8 rounded-2xl border-2 border-amber-500 bg-white dark:bg-zinc-900 space-y-2.5 h-64 flex flex-col justify-end shadow-xl">
            <span className="text-xs font-black text-amber-500 uppercase tracking-wider">1st Champion</span>
            <p className="font-black text-base sm:text-xl text-zinc-900 dark:text-zinc-50 truncate">
              {first?.nickname || "—"}
            </p>
            <p className="text-sm sm:text-lg font-black text-amber-600 dark:text-amber-400">
              {first ? `${first.score.toLocaleString()} pts` : ""}
            </p>
          </div>

          {/* 3rd Place */}
          <div className="p-4 sm:p-6 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-2 h-40 flex flex-col justify-end">
            <span className="text-xs font-black text-zinc-400 uppercase">3rd</span>
            <p className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
              {third?.nickname || "—"}
            </p>
            <p className="text-xs sm:text-sm font-black text-zinc-500">
              {third ? `${third.score} pts` : ""}
            </p>
          </div>
        </div>

        <div className="pt-6">
          <Button
            size="lg"
            onClick={() => router.push("/quiz")}
            className="font-bold text-sm px-8 rounded-xl cursor-pointer"
          >
            {t.live.returnHome}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
