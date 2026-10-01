"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function IntroSplashScreen() {
  // Render true initially so the intro is in the initial server HTML,
  // preventing any split-second flash of the landing page underneath!
  const [isVisible, setIsVisible] = useState(true);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    // Check if intro has already run in this browser session (or force via ?intro=1)
    const hasSeenIntro = sessionStorage.getItem("quizemia_intro_seen");
    const forceIntro =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("intro") === "1";

    if (hasSeenIntro && !forceIntro) {
      setIsVisible(false);
      document.documentElement.classList.remove("intro-active");
      return;
    }

    // Unhide page content underneath the intro curtain so it is ready to be revealed
    const unhideTimer = setTimeout(() => {
      document.documentElement.classList.remove("intro-active");
    }, 150);

    // 1. Showcase brand for 1.3s before rolling dice
    const rollTimeout = setTimeout(() => {
      setIsRolling(true);
    }, 1300);

    // 2. Unmount intro once dice finishes wiping across the screen (~2.85s total)
    const closeTimeout = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("quizemia_intro_seen", "true");
      document.documentElement.classList.remove("intro-active");
    }, 2850);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(false);
        sessionStorage.setItem("quizemia_intro_seen", "true");
        document.documentElement.classList.remove("intro-active");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(unhideTimer);
      clearTimeout(rollTimeout);
      clearTimeout(closeTimeout);
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.classList.remove("intro-active");
    };
  }, []);

  const handleSkip = () => {
    setIsVisible(false);
    sessionStorage.setItem("quizemia_intro_seen", "true");
    document.documentElement.classList.remove("intro-active");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          id="quizemia-intro-root"
          key="quizemia-intro-splash"
          className="fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden"
        >
          {/* =========================================================================
              CURTAIN CONTAINER: Pinned right:0, left animates from 0% -> 100%.
              As the dice rolls from left to right, this curtain is pulled open,
              revealing the real website underneath in perfect lockstep!
             ========================================================================= */}
          <motion.div
            initial={{ left: "0%" }}
            animate={isRolling ? { left: "100%" } : { left: "0%" }}
            transition={{
              duration: 1.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute top-0 right-0 bottom-0 overflow-hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl shadow-[-25px_0_50px_rgba(0,0,0,0.35)] border-l border-zinc-200/60 dark:border-zinc-800/60"
          >
            {/* Viewport content stays fixed at screen dimensions and centered */}
            <div className="absolute top-0 right-0 w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
              {/* Subtle Ambient Glowing Background Orbs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.35, 0.5, 0.35],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-24 -left-24 w-96 h-96 bg-red-400/25 dark:bg-red-600/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.45, 0.3],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="absolute top-1/2 -right-20 w-96 h-96 bg-blue-400/25 dark:bg-blue-600/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.25, 0.4, 0.25],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="absolute -bottom-20 left-1/3 w-96 h-96 bg-amber-400/25 dark:bg-amber-500/20 rounded-full blur-3xl"
                />
              </div>

              {/* Skip Button */}
              <button
                type="button"
                onClick={handleSkip}
                className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>Skip</span>
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Central Logo & Brand Reveal */}
              <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg">
                {/* Pop-in Logo */}
                <motion.div
                  initial={{ scale: 0.35, opacity: 0, y: 25 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 20,
                    duration: 0.5,
                  }}
                  className="relative mb-3 sm:mb-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 rounded-3xl blur-2xl opacity-40 animate-pulse" />
                  <div className="relative p-2.5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800 shadow-2xl">
                    <Image
                      src="/quiz.png"
                      alt="Quizemia Logo"
                      width={140}
                      height={140}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-md"
                      priority
                    />
                  </div>
                </motion.div>

                {/* Brand Title */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="space-y-1"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Quizemia
                  </h1>
                </motion.div>

                {/* Tagline */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.28, duration: 0.4 }}
                  className="mt-2.5 sm:mt-3"
                >
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-extrabold text-sm sm:text-base tracking-wide shadow-sm">
                    <span>Turn lessons into play!</span>
                  </span>
                </motion.div>

                {/* 4 Colored Gamified Accents */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.42, duration: 0.3 }}
                  className="flex items-center justify-center gap-2.5 pt-5"
                >
                  <div className="h-3 w-3 rounded-full bg-red-500 shadow-md shadow-red-500/40 animate-pulse" />
                  <div className="h-3 w-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/40 animate-pulse delay-75" />
                  <div className="h-3 w-3 rounded-full bg-amber-500 shadow-md shadow-amber-500/40 animate-pulse delay-150" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/40 animate-pulse delay-200" />
                </motion.div>
              </div>

              {/* Floor Guide Line for the Dice Roll */}
              <div className="absolute bottom-16 sm:bottom-24 md:bottom-28 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent pointer-events-none opacity-40" />
            </div>
          </motion.div>

          {/* =========================================================================
              MASSIVE 3D DICE: ROLLS & PHYSICALLY WIPES/CLOSES THE INTRO SECTION
              Positioned right at the left seam of the curtain. As the curtain opens,
              the dice rolls across in identical lockstep, acting as the physical wiper!
             ========================================================================= */}
          {isRolling && (
            <motion.div
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{
                duration: 1.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="fixed bottom-16 sm:bottom-24 md:bottom-28 z-30 pointer-events-none -translate-x-1/2 flex flex-col items-center"
            >
              {/* Full-height vertical glowing light beam attached to the dice */}
              <div className="absolute -top-[120vh] bottom-[-20vh] w-0.5 bg-gradient-to-b from-transparent via-amber-400/70 dark:via-amber-300/70 to-transparent blur-[1px] pointer-events-none opacity-80" />
              <div className="absolute -top-[120vh] bottom-[-20vh] w-6 bg-gradient-to-r from-amber-400/15 via-red-400/10 to-transparent pointer-events-none blur-sm opacity-60" />

              {/* Massive Bouncing & Tumbling 3D Dice */}
              <motion.div
                animate={{
                  y: [0, -52, 0, -32, 0, -16, 0, -6, 0],
                  rotate: [0, 1080],
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 drop-shadow-[0_20px_30px_rgba(0,0,0,0.38)]"
              >
                {/* 3D Isometric SVG Dice Graphic */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full filter drop-shadow-lg"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Top Face Gradient */}
                    <linearGradient id="diceTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    {/* Left Face Gradient */}
                    <linearGradient id="diceLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f1f5f9" />
                      <stop offset="60%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                    {/* Right Face Gradient */}
                    <linearGradient id="diceRight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#cbd5e1" />
                      <stop offset="60%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>

                    {/* Radial Gradients for 3D Inset Pips */}
                    <radialGradient id="redPip" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="40%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </radialGradient>
                    <radialGradient id="bluePip" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="40%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#1e40af" />
                    </radialGradient>
                    <radialGradient id="amberPip" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="40%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#92400e" />
                    </radialGradient>
                  </defs>

                  {/* Top Face (Diamond) */}
                  <polygon
                    points="50,6 88,26 50,46 12,26"
                    fill="url(#diceTop)"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Top Face Center Pip (Vibrant Red) */}
                  <circle cx="50" cy="26" r="5.5" fill="url(#redPip)" stroke="#fca5a5" strokeWidth="0.5" />

                  {/* Left Face (Skewed Quad) */}
                  <polygon
                    points="12,26 50,46 50,88 12,68"
                    fill="url(#diceLeft)"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Left Face 3 Pips (Blue) */}
                  <circle cx="23" cy="40" r="3.8" fill="url(#bluePip)" stroke="#93c5fd" strokeWidth="0.5" />
                  <circle cx="31" cy="57" r="3.8" fill="url(#bluePip)" stroke="#93c5fd" strokeWidth="0.5" />
                  <circle cx="39" cy="74" r="3.8" fill="url(#bluePip)" stroke="#93c5fd" strokeWidth="0.5" />

                  {/* Right Face (Skewed Quad) */}
                  <polygon
                    points="50,46 88,26 88,68 50,88"
                    fill="url(#diceRight)"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Right Face 5 Pips (Amber/Gold) */}
                  <circle cx="61" cy="42" r="3.8" fill="url(#amberPip)" stroke="#fde68a" strokeWidth="0.5" />
                  <circle cx="77" cy="34" r="3.8" fill="url(#amberPip)" stroke="#fde68a" strokeWidth="0.5" />
                  <circle cx="69" cy="57" r="3.8" fill="url(#amberPip)" stroke="#fde68a" strokeWidth="0.5" />
                  <circle cx="61" cy="72" r="3.8" fill="url(#amberPip)" stroke="#fde68a" strokeWidth="0.5" />
                  <circle cx="77" cy="64" r="3.8" fill="url(#amberPip)" stroke="#fde68a" strokeWidth="0.5" />
                </svg>
              </motion.div>

              {/* Dynamic Floor Shadow beneath the rolling dice */}
              <motion.div
                animate={{
                  scaleX: [1, 0.45, 1, 0.6, 1, 0.75, 1, 0.9, 1],
                  opacity: [0.55, 0.2, 0.55, 0.28, 0.55, 0.38, 0.55, 0.45, 0.55],
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="w-24 sm:w-32 md:w-36 h-3.5 bg-zinc-950/40 dark:bg-black/70 rounded-full blur-[4px] mt-1"
              />

              {/* Sparkle & Dust particles trailing the dice */}
              <div className="absolute -left-10 top-8 flex flex-col gap-1 pointer-events-none opacity-90">
                <span className="text-base sm:text-lg animate-ping">✨</span>
                <span className="text-sm sm:text-base animate-pulse text-amber-500 delay-100">⭐</span>
                <span className="text-xs sm:text-sm animate-ping text-blue-500 delay-200">✨</span>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
