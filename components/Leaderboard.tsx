"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Flame,
  Search,
  Zap,
  Target,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  Crown,
  Layers,
  ArrowUpRight,
  LogIn,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LeaderboardEntry, getLocalUserStats } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Leaderboard() {
  const { user, openAuthModal } = useAuth();
  const { language, t } = useLanguage();

  const [timeframe, setTimeframe] = useState<"all" | "weekly" | "today">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHowPointsWork, setShowHowPointsWork] = useState(false);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);

  // Fetch leaderboard data from API
  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const url = `/api/leaderboard?timeframe=${timeframe}&userId=${encodeURIComponent(user?.id || "")}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && Array.isArray(data.players)) {
          let list: LeaderboardEntry[] = data.players;

          // Merge local current user stats if available
          if (user?.id) {
            const localStats = getLocalUserStats(user.id);
            if (localStats) {
              const userIdx = list.findIndex((p) => p.id === user.id);
              if (userIdx >= 0) {
                // Pick highest point count between server and local
                if (localStats.total_points > list[userIdx].total_points) {
                  list[userIdx] = { ...list[userIdx], ...localStats, is_current_user: true };
                } else {
                  list[userIdx].is_current_user = true;
                }
              } else {
                // User hasn't been synced to server yet, inject them
                list.push({ ...localStats, is_current_user: true });
              }

              // Re-sort and re-rank
              list.sort((a, b) => b.total_points - a.total_points);
              list = list.map((p, idx) => ({ ...p, rank: idx + 1 }));
            }
          }

          setPlayers(list);
          const foundCurrent = list.find((p) => p.id === user?.id || p.is_current_user);
          setCurrentUserEntry(foundCurrent || null);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [timeframe, user]);

  // Filter players by search query
  const filteredPlayers = players.filter((player) =>
    player.nickname.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const topThree = players.slice(0, 3);
  const rank1 = topThree[0];
  const rank2 = topThree[1];
  const rank3 = topThree[2];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.leaderboard.title}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
          {t.leaderboard.subtitle}
        </p>

        {/* Quick Action Button: "How Points Work" & "Play to Earn" */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHowPointsWork((prev) => !prev)}
            className="rounded-full text-xs font-bold gap-1.5 border-zinc-300 dark:border-zinc-700"
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>{t.leaderboard.howPointsWork}</span>
            {showHowPointsWork ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>

          <Link href="/quiz">
            <Button
              size="sm"
              className="rounded-full text-xs font-bold gap-1.5 bg-gradient-to-r from-red-600 to-amber-500 hover:opacity-95 text-white shadow-sm"
            >
              <span>{language === "al" ? "Luaj & Fito Pikë" : "Play & Earn Points"}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* "How Points Work" Collapsible Breakdown Card */}
      <AnimatePresence>
        {showHowPointsWork && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-amber-300/60 dark:border-amber-700/60 bg-gradient-to-br from-amber-500/[0.04] via-orange-500/[0.02] to-yellow-500/[0.04] shadow-md p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                      {t.leaderboard.howPointsWork}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t.leaderboard.howPointsDesc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      {language === "al" ? "Përgjigje e Saktë" : "Correct Answer"}
                    </div>
                    <div className="text-xl font-black text-emerald-600">+100 pts</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {t.leaderboard.correctAnswerRule}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      {language === "al" ? "Shpejtësia" : "Speed Bonus"}
                    </div>
                    <div className="text-xl font-black text-blue-600">Deri +50 pts</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {t.leaderboard.speedBonusRule}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      {language === "al" ? "Seria e Saktë" : "Streak Multiplier"}
                    </div>
                    <div className="text-xl font-black text-orange-600">+10 - 50 pts</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {t.leaderboard.streakBonusRule}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      {language === "al" ? "Përfundimi" : "Quiz Mastery"}
                    </div>
                    <div className="text-xl font-black text-purple-600">+50 - 150 pts</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {t.leaderboard.completionBonusRule}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      {language === "al" ? "Krijues Kuizi" : "Quiz Author"}
                    </div>
                    <div className="text-xl font-black text-amber-500">+200 pts</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {t.leaderboard.creatorBonusRule}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 3 Podium Showcase */}
      {players.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end pt-4 pb-2 max-w-4xl mx-auto">
          {/* Rank #2 (Silver) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center text-center order-1"
          >
            <div className="relative mb-2 sm:mb-3">
              <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 dark:from-slate-600 dark:to-slate-400 p-1 shadow-lg">
                <div className="h-full w-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-lg sm:text-2xl">
                  {rank2.nickname.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-black text-xs sm:text-sm border-2 border-white dark:border-zinc-900 shadow">
                2
              </span>
            </div>

            <span className="font-extrabold text-xs sm:text-base text-zinc-900 dark:text-white truncate max-w-[100px] sm:max-w-[150px]">
              {rank2.nickname}
            </span>

            {/* Pillar #2 */}
            <div className="w-full mt-3 h-24 sm:h-36 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-slate-200 to-slate-300/80 dark:from-slate-800 dark:to-slate-900 border-t-4 border-slate-400 flex flex-col items-center justify-center p-2 shadow-inner">
              <span className="text-base sm:text-2xl font-black text-slate-700 dark:text-slate-200">
                {rank2.total_points.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">
                {t.leaderboard.pointsLabel}
              </span>
            </div>
          </motion.div>

          {/* Rank #1 (Gold - Elevated in Center) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center text-center order-2 -mt-4 sm:-mt-6"
          >
            <div className="relative mb-2 sm:mb-3">
              <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <Crown className="h-7 w-7 sm:h-9 sm:w-9 fill-current filter drop-shadow-md" />
              </div>
              <div className="h-18 w-18 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1.5 shadow-xl ring-4 ring-amber-400/30">
                <div className="h-full w-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center font-black text-amber-600 dark:text-amber-400 text-2xl sm:text-3xl">
                  {rank1.nickname.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-1 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-amber-500 text-white font-black text-sm sm:text-base border-2 border-white dark:border-zinc-900 shadow-md">
                1
              </span>
            </div>

            <span className="font-black text-sm sm:text-lg text-zinc-900 dark:text-white truncate max-w-[110px] sm:max-w-[180px]">
              {rank1.nickname}
            </span>

            {/* Pillar #1 */}
            <div className="w-full mt-3 h-32 sm:h-48 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-200 via-amber-300/80 to-amber-400/90 dark:from-amber-950/80 dark:via-amber-900/60 dark:to-zinc-900 border-t-4 border-amber-500 flex flex-col items-center justify-center p-2 shadow-lg">
              <span className="text-xl sm:text-3xl font-black text-amber-900 dark:text-amber-300">
                {rank1.total_points.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {t.leaderboard.pointsLabel}
              </span>
              <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200">
                <Flame className="h-3 w-3 fill-current" />
                <span>{rank1.best_streak}x streak</span>
              </div>
            </div>
          </motion.div>

          {/* Rank #3 (Bronze) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col items-center text-center order-3"
          >
            <div className="relative mb-2 sm:mb-3">
              <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 p-1 shadow-lg">
                <div className="h-full w-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center font-black text-amber-800 dark:text-amber-300 text-lg sm:text-2xl">
                  {rank3.nickname.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="absolute -bottom-2 -right-1 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-amber-700 text-white font-black text-xs sm:text-sm border-2 border-white dark:border-zinc-900 shadow">
                3
              </span>
            </div>

            <span className="font-extrabold text-xs sm:text-base text-zinc-900 dark:text-white truncate max-w-[100px] sm:max-w-[150px]">
              {rank3.nickname}
            </span>

            {/* Pillar #3 */}
            <div className="w-full mt-3 h-20 sm:h-28 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-100 to-amber-200/80 dark:from-zinc-800 dark:to-zinc-900 border-t-4 border-amber-700 flex flex-col items-center justify-center p-2 shadow-inner">
              <span className="text-base sm:text-2xl font-black text-amber-900 dark:text-amber-200">
                {rank3.total_points.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                {t.leaderboard.pointsLabel}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* User Status Bar: Highlights user rank or prompts guest to register */}
      <div className="sticky top-20 z-30">
        {user ? (
          currentUserEntry ? (
            <div className="p-3 sm:p-4 rounded-2xl bg-blue-600 text-white shadow-xl flex items-center justify-between gap-4 border border-blue-400/40 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-base sm:text-lg border border-white/30">
                  #{currentUserEntry.rank || "—"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base">
                      {currentUserEntry.nickname}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                      {language === "al" ? "JU" : "YOU"}
                    </span>
                  </div>
                  <div className="text-xs text-blue-100 flex items-center gap-2 mt-0.5">
                    <span>{currentUserEntry.quizzes_played} {language === "al" ? "kuize" : "quizzes"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-lg sm:text-2xl font-black tabular-nums">
                    {currentUserEntry.total_points.toLocaleString()} pts
                  </div>
                  <div className="text-[11px] text-blue-200">
                    {currentUserEntry.accuracy_percentage}% {t.leaderboard.accuracyCol}
                  </div>
                </div>

                <Link href="/quiz">
                  <Button
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-black shadow-md hidden sm:inline-flex"
                  >
                    <span>{language === "al" ? "Kalo Lart →" : "Climb Higher →"}</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 rounded-2xl bg-zinc-900 text-white shadow-lg flex items-center justify-between gap-4 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm sm:text-base block">
                    {language === "al" ? "Nuk keni ende pikë" : "No match points yet"}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {language === "al"
                      ? "Përfundoni kuizin tuaj të parë për t'u shfaqur në tabelën e renditjes!"
                      : "Complete your first quiz to enter the leaderboard!"}
                  </span>
                </div>
              </div>
              <Link href="/quiz">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  {language === "al" ? "Luaj Tani" : "Play Now"}
                </Button>
              </Link>
            </div>
          )
        ) : (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-blue-500/15 border border-amber-500/30 dark:border-amber-700/50 backdrop-blur-md shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <span className="font-black text-sm text-zinc-900 dark:text-white block">
                  {t.leaderboard.signInPrompt}
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {t.leaderboard.guestNotice}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => openAuthModal("signup")}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shrink-0 shadow-md"
            >
              <LogIn className="h-4 w-4" />
              <span>{language === "al" ? "Hyni / Regjistrohuni" : "Sign In / Register"}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Timeframe Segmented Control */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe("all")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              timeframe === "all"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            {t.leaderboard.allTime}
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("weekly")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              timeframe === "weekly"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            {t.leaderboard.weekly}
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("today")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              timeframe === "today"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            {t.leaderboard.today}
          </button>
        </div>

        {/* Search Player by Nickname */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder={t.leaderboard.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-10 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          />
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-semibold text-zinc-500">
              {language === "al" ? "Po llogariten pikët..." : "Calculating rankings..."}
            </p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Trophy className="h-10 w-10 text-zinc-400 mx-auto" />
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              {t.leaderboard.noPlayersFound}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6 w-16 text-center">{t.leaderboard.rankCol}</th>
                  <th className="py-3.5 px-4">{t.leaderboard.playerCol}</th>
                  <th className="py-3.5 px-4 text-right">{t.leaderboard.pointsCol}</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">{t.leaderboard.playedCol}</th>
                  <th className="py-3.5 px-4 text-center hidden lg:table-cell">{t.leaderboard.createdCol}</th>
                  <th className="py-3.5 px-4 text-center hidden sm:table-cell">{t.leaderboard.accuracyCol}</th>
                  <th className="py-3.5 px-4 text-center hidden sm:table-cell">{t.leaderboard.streakCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredPlayers.map((player) => {
                  const isTop1 = player.rank === 1;
                  const isTop2 = player.rank === 2;
                  const isTop3 = player.rank === 3;
                  const isUser = player.is_current_user;

                  return (
                    <tr
                      key={player.id}
                      className={cn(
                        "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                        isUser && "bg-blue-50/70 dark:bg-blue-950/20 font-semibold",
                        isTop1 && "bg-amber-500/[0.03]"
                      )}
                    >
                      {/* Rank Number / Medal */}
                      <td className="py-3.5 px-4 sm:px-6 text-center font-black">
                        {isTop1 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black shadow-sm">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-white text-xs font-black shadow-sm">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white text-xs font-black shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-bold text-xs sm:text-sm">
                            #{player.rank}
                          </span>
                        )}
                      </td>

                      {/* Player Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center text-xs font-black uppercase text-white shadow-sm shrink-0",
                              isTop1
                                ? "bg-gradient-to-tr from-amber-500 to-yellow-400"
                                : isTop2
                                  ? "bg-gradient-to-tr from-slate-500 to-slate-300"
                                  : isTop3
                                    ? "bg-gradient-to-tr from-amber-700 to-amber-500"
                                    : "bg-gradient-to-tr from-blue-500 to-indigo-600"
                            )}
                          >
                            {player.nickname.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                                {player.nickname}
                              </span>
                              {isUser && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
                                  {language === "al" ? "JU" : "YOU"}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 sm:hidden mt-0.5">
                              {player.accuracy_percentage}% acc
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Points */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tabular-nums">
                          {player.total_points.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium ml-1">
                          {t.leaderboard.pointsLabel}
                        </span>
                      </td>

                      {/* Quizzes Played */}
                      <td className="py-3.5 px-4 text-center font-bold text-zinc-600 dark:text-zinc-300 hidden md:table-cell">
                        {player.quizzes_played}
                      </td>

                      {/* Quizzes Created */}
                      <td className="py-3.5 px-4 text-center font-bold text-zinc-600 dark:text-zinc-300 hidden lg:table-cell">
                        {player.quizzes_created}
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-bold text-xs tabular-nums text-zinc-700 dark:text-zinc-300">
                            {player.accuracy_percentage}%
                          </span>
                          <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${player.accuracy_percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Best Streak */}
                      <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
                          <Flame className="h-3.5 w-3.5 fill-current" />
                          <span>{player.best_streak}x</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
