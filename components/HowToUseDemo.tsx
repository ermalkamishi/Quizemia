"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Play,
  Pause,
  Upload,
  FileText,
  ImageIcon,
  BrainCircuit,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
  MousePointer,
  RotateCcw,
  Zap,
  Timer,
  Flame,
  Globe,
  Lock,
  Layers,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface DemoStep {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  badge: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 0,
    title: "1. Upload Notes / Image",
    shortTitle: "Upload Notes",
    icon: Upload,
    badge: "Input Source",
  },
  {
    id: 1,
    title: "2. AI Processing",
    shortTitle: "AI Synthesis",
    icon: BrainCircuit,
    badge: "Smart Generation",
  },
  {
    id: 2,
    title: "3. Play & Compete",
    shortTitle: "Play Arena",
    icon: Gamepad2,
    badge: "Interactive Quiz",
  },
];

export function HowToUseDemo() {
  const { language, t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stepTimerProgress, setStepTimerProgress] = useState(0);

  // Step 3 Interactive state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(15);

  const STEP_DURATION_MS = 5500;

  // Decoupled refs to prevent React StrictMode side-effect re-execution from skipping steps
  const activeStepRef = useRef(0);
  activeStepRef.current = activeStep;

  const progressRef = useRef(0);

  // Auto-play timer for sliding smoothly: Step 1 (0) -> Step 2 (1) -> Step 3 (2) -> Step 1 (0)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 40; // 40ms tick for ultra-smooth progress animation
    const stepIncrement = (intervalTime / STEP_DURATION_MS) * 100;

    const interval = setInterval(() => {
      progressRef.current += stepIncrement;

      if (progressRef.current >= 100) {
        progressRef.current = 0;
        setStepTimerProgress(0);
        // Strictly increment 0 -> 1 -> 2 -> 0 without skipping
        const next = (activeStepRef.current + 1) % DEMO_STEPS.length;
        activeStepRef.current = next;
        setActiveStep(next);
      } else {
        setStepTimerProgress(progressRef.current);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // When step changes manually, reset progress bar
  const handleSelectStep = (stepIdx: number) => {
    progressRef.current = 0;
    setStepTimerProgress(0);
    activeStepRef.current = stepIdx;
    setActiveStep(stepIdx);
  };

  const handlePrevStep = () => {
    const prev = (activeStep - 1 + DEMO_STEPS.length) % DEMO_STEPS.length;
    handleSelectStep(prev);
  };

  const handleNextStep = () => {
    const next = (activeStep + 1) % DEMO_STEPS.length;
    handleSelectStep(next);
  };

  // Step 3 Gameplay: Interactive Timer (pauses when demo is paused)
  useEffect(() => {
    if (activeStep !== 2 || !isPlaying) return;
    const interval = setInterval(() => {
      setGameTimeLeft((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeStep, isPlaying]);

  // Step 3 Answer Selection
  const handleAnswerClick = (optionId: string, isCorrect: boolean, e: React.MouseEvent) => {
    if (selectedAnswer) return; // already answered
    setSelectedAnswer(optionId);

    if (isCorrect) {
      setShowCelebration(true);
      setQuizScore((prev) => prev + 1000);
      setQuizStreak((prev) => prev + 1);

      // Trigger confetti from the click coordinates
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: originX, y: originY },
          colors: ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"],
        });
      } catch (err) {
        // Fallback
      }
    } else {
      setQuizStreak(0);
    }
  };

  const handleResetStep3Quiz = () => {
    setSelectedAnswer(null);
    setShowCelebration(false);
    setGameTimeLeft(15);
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-zinc-950 text-white border-t border-zinc-800/80">
      {/* =========================================================================
          DARK GRID BACKGROUND WITH AMBIENT GLOWING RADIAL LIGHTS
         ========================================================================= */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/15 to-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {language === "al" ? (
              <>
                Shiheni{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  në Veprim
                </span>
              </>
            ) : (
              <>
                See It{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  In Action
                </span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            {t.about.demoSubtitle}
          </p>
        </div>

        {/* =========================================================================
            INTERACTIVE DEMO WINDOW CONTAINER (BROWSER / APP FRAME)
           ========================================================================= */}
        <div className="relative rounded-3xl border border-white/15 bg-zinc-900/80 backdrop-blur-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Top Window Bar (macOS style dots + Fake Address Bar) */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-zinc-950/60">
            {/* Window Dots */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/90" />
              <span className="w-3 h-3 rounded-full bg-amber-500/90" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
            </div>

            {/* Address Bar Pill */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-zinc-800/80 border border-white/10 text-xs font-mono text-zinc-300 shadow-inner max-w-xs sm:max-w-md w-full justify-center truncate">
              <Lock className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="truncate">quizemia.com/studio/demo-live</span>
            </div>

            {/* Live / Paused Status Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              {isPlaying ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 hidden sm:inline">Demo </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-400 font-bold">
                    {language === "al" ? "Prezantimi u Ndalua" : "Showcase Paused"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Steps Filter Tabs */}
          <div className="grid grid-cols-3 border-b border-white/10 bg-zinc-900/60 p-1.5 sm:p-2 gap-1.5">
            {DEMO_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleSelectStep(step.id)}
                  className={cn(
                    "relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 sm:py-3 px-2 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer overflow-hidden",
                    isActive
                      ? "text-white bg-white/10 shadow-md border border-white/15"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      isActive ? "text-blue-400 scale-110" : "text-zinc-500"
                    )}
                  />
                  <span className="truncate">
                    {step.id === 0 ? t.about.demoStep1 : step.id === 1 ? t.about.demoStep2 : t.about.demoStep3}
                  </span>

                  {/* Animated Progress Line on Active Tab */}
                  {isActive && (
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 h-[3px] rounded-full transition-all duration-75",
                        isPlaying
                          ? "bg-gradient-to-r from-blue-500 to-indigo-400"
                          : "bg-amber-400"
                      )}
                      style={{
                        width: `${stepTimerProgress}%`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* =========================================================================
              SHOWCASE VIEWPORT (SMOOTH FRAMER MOTION TRANSITIONS)
             ========================================================================= */}
          <div className="relative min-h-[460px] sm:min-h-[500px] p-4 sm:p-8 flex items-center justify-center bg-gradient-to-b from-transparent via-zinc-950/40 to-zinc-950/80">
            <AnimatePresence mode="wait">
              {/* STEP 1: Upload Notes / Image */}
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-3xl space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-red-500/20 text-red-400 font-black text-xs border border-red-500/30">
                        01
                      </span>
                      <h3 className="font-extrabold text-base sm:text-lg text-white">
                        Paste Lesson Material or Drop Diagram Image
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-zinc-400 border-white/15 text-[11px]">
                      Instant Multimodal Input
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left: Simulated Text Notes Input */}
                    <div className="relative p-4 sm:p-5 rounded-2xl bg-zinc-800/60 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <FileText className="h-4 w-4 text-blue-400" /> Lesson Transcript / Notes
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          ✓ Paste Ready
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 font-mono text-xs sm:text-[13px] text-zinc-300 leading-relaxed min-h-[140px]">
                        <p className="text-zinc-200">
                          <span className="text-blue-400 font-bold"># Biology 101: Cellular Respiration</span>
                          <br />
                          Photosynthesis takes place in chloroplasts. Light reactions split water into
                          protons, electrons, and oxygen gas, creating high-energy <span className="text-amber-300 font-bold">ATP &amp; NADPH</span> molecules.
                        </p>
                      </div>

                      <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Key terms and concepts automatically identified
                      </p>
                    </div>

                    {/* Right: Simulated Image Upload Dropzone */}
                    <div className="relative p-4 sm:p-5 rounded-2xl bg-zinc-800/60 border border-white/10 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <ImageIcon className="h-4 w-4 text-purple-400" /> Textbook Diagram
                        </span>
                        <span className="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                          Vision AI
                        </span>
                      </div>

                      {/* Upload Thumbnail Preview */}
                      <div className="relative p-3 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-900 to-purple-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/30 blur-sm absolute" />
                          <BrainCircuit className="h-7 w-7 text-emerald-300 relative z-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-200 truncate">
                            chloroplast_thylakoid_cycle.png
                          </p>
                          <p className="text-[11px] text-zinc-400">1.4 MB • Diagram Analyzed</p>
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                            <Check className="h-3 w-3" /> Ready for question generation
                          </span>
                        </div>
                      </div>

                      {/* Simulated Action Button with Mouse Cursor Pointer */}
                      <div className="relative pt-1">
                        <div className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                          <Sparkles className="h-4 w-4" />
                          <span>Generate 5-Question Quiz</span>
                        </div>

                        {/* Animated Simulated Cursor */}
                        <motion.div
                          animate={{
                            x: [25, 0, 25],
                            y: [15, -4, 15],
                            scale: [1, 0.9, 1],
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute right-6 bottom-1 flex items-center gap-1 text-white pointer-events-none drop-shadow-md z-20"
                        >
                          <MousePointer className="h-5 w-5 fill-white text-zinc-950" />
                          <span className="text-[10px] font-black bg-blue-500 px-1.5 py-0.5 rounded shadow">
                            Click!
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: AI Processing & Question Synthesis */}
              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-2xl text-center space-y-6"
                >
                  {/* Central Neural Pulse Animation */}
                  <div className="relative inline-flex items-center justify-center">
                    <div className="absolute w-28 h-28 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
                    <div className="absolute w-20 h-20 rounded-full bg-purple-500/30 blur-md pointer-events-none" />
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 border border-white/20">
                      <BrainCircuit className="h-8 w-8 animate-pulse text-cyan-200" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      AI Synthesis in Progress...
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                      Parsing core educational concepts, balancing distractors, and configuring Kahoot-style tactile options.
                    </p>
                  </div>

                  {/* Animated Task Checklist */}
                  <div className="max-w-md mx-auto space-y-2.5 text-left">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/80 border border-white/10"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        Extracted 4 key principles from lesson notes
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/80 border border-white/10"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        Synthesized plausible distractors &amp; assigned Kahoot shapes
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/80 border border-white/10"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        Configured 15-second timers &amp; speed bonus algorithm
                      </span>
                    </motion.div>
                  </div>

                  {/* Progress Glow Bar */}
                  <div className="max-w-xs mx-auto space-y-1.5">
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400"
                        animate={{ width: ["15%", "65%", "100%"] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">100% Ready for Arena Play</span>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Play & Compete (Live Interactive Question Card) */}
              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-3xl space-y-4"
                >
                  {/* Gameplay Header Bar */}
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-zinc-800/80 border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 font-black text-xs border border-blue-500/30">
                        1
                      </span>
                      <span className="text-xs font-bold text-zinc-300">of 5 Questions</span>
                      <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-zinc-400 border-white/10">
                        🌱 Photosynthesis
                      </Badge>
                    </div>

                    {/* 15s Countdown Clock */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-950/70 border border-white/10 shadow-inner">
                      <Timer
                        className={cn(
                          "h-4 w-4",
                          gameTimeLeft <= 5 ? "text-red-500 animate-ping" : "text-emerald-400"
                        )}
                      />
                      <span
                        className={cn(
                          "font-black text-sm sm:text-base tabular-nums",
                          gameTimeLeft <= 5 ? "text-red-400 font-black animate-pulse" : "text-white"
                        )}
                      >
                        {gameTimeLeft}s
                      </span>
                    </div>

                    {/* Streak & Score Counter */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{quizScore} pts</span>
                      </div>
                      {quizStreak > 0 && (
                        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                          <Flame className="h-3.5 w-3.5 fill-red-400" />
                          <span>{quizStreak}x</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Question Card */}
                  <div className="relative p-4 sm:p-6 rounded-2xl bg-zinc-800/90 border border-white/15 text-center shadow-lg">
                    {/* Celebration Toast */}
                    <AnimatePresence>
                      {showCelebration && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs shadow-xl shadow-emerald-500/30 border border-white flex items-center gap-1.5 z-20"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>CORRECT! +1,000 SPEED POINTS</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <h4 className="text-base sm:text-xl font-black text-white leading-snug">
                      What is the primary energy molecule produced during the light-dependent reactions of photosynthesis?
                    </h4>
                  </div>

                  {/* 4 Tactile Interactive Kahoot Choices */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                    {/* Red Triangle */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleAnswerClick("a", true, e)}
                      className={cn(
                        "flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl text-left font-bold transition-all shadow-md cursor-pointer border-b-4",
                        selectedAnswer === "a"
                          ? "bg-red-600 text-white border-red-800 ring-4 ring-emerald-400"
                          : selectedAnswer
                            ? "bg-red-600 text-white border-red-800 ring-4 ring-emerald-400"
                            : "bg-red-600 hover:bg-red-700 text-white border-red-800"
                      )}
                    >
                      <span className="text-lg sm:text-xl font-black opacity-90">▲</span>
                      <span className="flex-1 text-xs sm:text-base font-extrabold truncate">ATP &amp; NADPH</span>
                      {selectedAnswer && <CheckCircle2 className="h-5 w-5 text-white shrink-0" />}
                    </motion.button>

                    {/* Blue Diamond */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleAnswerClick("b", false, e)}
                      className={cn(
                        "flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl text-left font-bold transition-all shadow-md cursor-pointer border-b-4",
                        selectedAnswer === "b"
                          ? "bg-blue-600 text-white border-blue-800 opacity-60 grayscale"
                          : selectedAnswer
                            ? "bg-blue-600/50 text-white border-blue-800 opacity-40 grayscale"
                            : "bg-blue-600 hover:bg-blue-700 text-white border-blue-800"
                      )}
                    >
                      <span className="text-lg sm:text-xl font-black opacity-90">◆</span>
                      <span className="flex-1 text-xs sm:text-base font-extrabold truncate">Lactic Acid</span>
                    </motion.button>

                    {/* Yellow Circle */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleAnswerClick("c", false, e)}
                      className={cn(
                        "flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl text-left font-bold transition-all shadow-md cursor-pointer border-b-4",
                        selectedAnswer === "c"
                          ? "bg-amber-500 text-zinc-950 border-amber-700 opacity-60 grayscale"
                          : selectedAnswer
                            ? "bg-amber-500/50 text-zinc-950 border-amber-700 opacity-40 grayscale"
                            : "bg-amber-500 hover:bg-amber-600 text-zinc-950 border-amber-700"
                      )}
                    >
                      <span className="text-lg sm:text-xl font-black opacity-90">●</span>
                      <span className="flex-1 text-xs sm:text-base font-extrabold truncate">Chlorophyll A</span>
                    </motion.button>

                    {/* Green Square */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleAnswerClick("d", false, e)}
                      className={cn(
                        "flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl text-left font-bold transition-all shadow-md cursor-pointer border-b-4",
                        selectedAnswer === "d"
                          ? "bg-emerald-600 text-white border-emerald-800 opacity-60 grayscale"
                          : selectedAnswer
                            ? "bg-emerald-600/50 text-white border-emerald-800 opacity-40 grayscale"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800"
                      )}
                    >
                      <span className="text-lg sm:text-xl font-black opacity-90">■</span>
                      <span className="flex-1 text-xs sm:text-base font-extrabold truncate">Carbon Monoxide</span>
                    </motion.button>
                  </div>

                  {/* Reset Try-Again bar for Step 3 */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-zinc-400">
                      💡 <em>Click the red button above to test real live answering!</em>
                    </p>
                    {selectedAnswer && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetStep3Quiz}
                        className="h-7 text-xs font-bold gap-1 text-zinc-300 border-white/15 bg-white/5 hover:bg-white/10"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Try Again</span>
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =========================================================================
              FLOATING INTERACTIVE CONTROLS BAR (BOTTOM RIGHT)
             ========================================================================= */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-white/10 bg-zinc-950/80">
            {/* Step Helper Text */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <span className="font-bold text-zinc-300">Step {activeStep + 1} of 3:</span>
              <span className="text-zinc-300 hidden sm:inline">{DEMO_STEPS[activeStep].title}</span>
              {!isPlaying && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full ml-1">
                  Paused
                </span>
              )}
            </div>

            {/* Video Player-Style Play / Pause & Prev / Next Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevStep}
                className="h-8 px-2.5 rounded-full text-xs font-bold gap-1 border-white/15 bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white cursor-pointer"
                title="Previous step"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-extrabold gap-1.5 border shadow-md active:scale-95 cursor-pointer transition-all",
                  isPlaying
                    ? "border-white/15 bg-white/10 hover:bg-white/20 text-white"
                    : "border-amber-400/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 ring-1 ring-amber-400/30"
                )}
                title={isPlaying ? "Pause auto-sliding showcase" : "Resume auto-sliding showcase"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Resume</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleNextStep}
                className="h-8 px-2.5 rounded-full text-xs font-bold gap-1 border-white/15 bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white cursor-pointer"
                title="Next step"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
