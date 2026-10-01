"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  RotateCcw,
  Zap,
  Award,
} from "lucide-react";
import { useLanguage, AnswerOptionTranslation } from "@/context/LanguageContext";

export function HeroQuizCard() {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(2450);
  const [streak, setStreak] = useState(2);
  const [showCelebration, setShowCelebration] = useState(false);

  // 3D Tilt Hover tracking
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // 15-second countdown timer with auto-reset loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle option selection
  const handleSelectOption = (option: AnswerOptionTranslation, event: React.MouseEvent) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.isCorrect) {
      setScore((prev) => prev + 1000);
      setStreak((prev) => prev + 1);
      setShowCelebration(true);

      // Launch cheerful confetti burst from the card location
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { x: originX, y: originY },
          colors: ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#a855f7"],
        });
      } catch (e) {
        // Confetti fallback
      }
    } else {
      setStreak(0);
    }

    // Auto-reset after 2.8s so user can play again
    setTimeout(() => {
      setSelectedOptionId(null);
      setIsAnswered(false);
      setShowCelebration(false);
    }, 2800);
  };

  // Circular timer calculations (r = 16, C = 2 * PI * 16 ≈ 100.5)
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / 15);

  const timerColor =
    timeLeft > 8 ? "#34d399" : timeLeft > 4 ? "#fbbf24" : "#f87171";

  const options = t.hero.card.options;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg mx-auto [perspective:1000px] select-none"
    >
      {/* =========================================================================
          AMBIENT GLOWING BLOBS BEHIND THE HERO CARD FOR ULTRA-RICH DEPTH
         ========================================================================= */}
      <div className="absolute -inset-4 pointer-events-none overflow-visible">
        <div className="absolute -top-12 -right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-8 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 right-12 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl" />
      </div>

      {/* Floating 3D Badge: Points Earned */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0, y: 15 }}
            animate={{ scale: 1.1, opacity: 1, y: -20 }}
            exit={{ scale: 0.8, opacity: 0, y: -35 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="absolute -top-8 right-6 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-black text-sm shadow-xl shadow-amber-400/40 border-2 border-white"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.hero.card.pointsCelebration}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MAIN GLASSMORPHISM 3D TILT CARD
         ========================================================================= */}
      <motion.div
        animate={{
          rotateY: mouseOffset.x * 14,
          rotateX: -mouseOffset.y * 14,
          y: [0, -6, 0],
        }}
        transition={{
          rotateY: { type: "spring", stiffness: 240, damping: 20 },
          rotateX: { type: "spring", stiffness: 240, damping: 20 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative z-10 p-5 sm:p-6 rounded-3xl bg-white/15 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/25 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Sleek Glossy Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

        {/* Card Header: Question Info & Animated Circular Timer */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-red-500/80 text-white font-extrabold text-xs shadow-sm shadow-red-500/30">
              {t.hero.card.questionBadge}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/15 dark:bg-white/10 text-white font-semibold text-xs border border-white/10">
              {t.hero.card.subject}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Score & Streak Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-amber-300">
              <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400 animate-pulse" />
              <span>{streak}x {t.hero.card.streak}</span>
            </div>

            {/* Circular Countdown Timer */}
            <div className="relative flex items-center justify-center w-10 h-10">
              <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 40 40">
                {/* Background Ring */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3.5"
                  fill="transparent"
                  className="text-white/15"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke={timerColor}
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear drop-shadow-[0_0_6px_currentColor]"
                />
              </svg>
              <span className={`absolute text-xs font-black ${timeLeft <= 4 ? "text-red-400 animate-ping" : "text-white"}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Card Body: Question Title */}
        <div className="relative z-10 py-5 text-left">
          <p className="text-xs uppercase font-extrabold tracking-wider text-blue-200">
            {t.hero.card.multipleChoice}
          </p>
          <h3 className="mt-1.5 text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
            {t.hero.card.question}
          </h3>
          <p className="mt-1 text-xs text-blue-100/70 font-medium">
            {t.hero.card.tapHint}
          </p>
        </div>

        {/* Options Grid: 4 Colorful Kahoot-style Answer Buttons */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrectOption = option.isCorrect;

            let buttonStyle = `bg-gradient-to-r ${option.bgGradient} ${option.borderColor} ${option.glowShadow}`;
            let iconElement = <span className="text-sm font-black opacity-90">{option.shapeSymbol}</span>;

            if (isAnswered) {
              if (isCorrectOption) {
                buttonStyle = "bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-300 shadow-emerald-500/50 scale-[1.02] ring-2 ring-emerald-300";
                iconElement = <CheckCircle2 className="h-4 w-4 text-white animate-bounce" />;
              } else if (isSelected) {
                buttonStyle = "bg-gradient-to-r from-zinc-700 to-zinc-800 border-red-500/60 opacity-60";
                iconElement = <XCircle className="h-4 w-4 text-red-400 animate-pulse" />;
              } else {
                buttonStyle = "bg-zinc-800/60 border-transparent opacity-40";
              }
            }

            return (
              <motion.button
                key={option.id}
                type="button"
                whileHover={!isAnswered ? { scale: 1.025, y: -2 } : {}}
                whileTap={!isAnswered ? { scale: 0.96 } : {}}
                onClick={(e) => handleSelectOption(option, e)}
                className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-white font-bold text-sm text-left shadow-md transition-all cursor-pointer ${buttonStyle}`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-black/20 shrink-0">
                  {iconElement}
                </div>
                <span className="flex-1 leading-tight">{option.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Card Footer: Live Score */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-100">
          <span className="text-[11px] text-blue-200/80 font-medium">{t.hero.card.practiceRound}</span>

          <div className="flex items-center gap-1 font-bold text-amber-300 text-xs">
            <Trophy className="h-3.5 w-3.5 text-yellow-300" />
            <span>{t.hero.card.score} {score.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default HeroQuizCard;

