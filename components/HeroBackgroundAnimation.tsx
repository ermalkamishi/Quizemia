"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  Atom,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Trophy,
  Clock,
  Gamepad2,
  Target,
  Flame,
  Zap,
} from "lucide-react";

interface FloatingIconItem {
  icon: React.ElementType;
  colorClass: string;
  glowColor: string;
  size: number;
  rotatesContinuously?: boolean;
}

// Track 1 Items (Top row)
const TRACK_1_ICONS: FloatingIconItem[] = [
  { icon: GraduationCap, colorClass: "text-amber-300", glowColor: "rgba(252, 211, 77, 0.4)", size: 30 },
  { icon: HelpCircle, colorClass: "text-rose-400", glowColor: "rgba(251, 113, 133, 0.4)", size: 26 },
  { icon: Atom, colorClass: "text-cyan-300", glowColor: "rgba(103, 232, 249, 0.5)", size: 34, rotatesContinuously: true },
  { icon: Trophy, colorClass: "text-yellow-300", glowColor: "rgba(253, 224, 71, 0.45)", size: 28 },
  { icon: BookOpen, colorClass: "text-blue-300", glowColor: "rgba(147, 197, 253, 0.4)", size: 28 },
  { icon: Sparkles, colorClass: "text-purple-300", glowColor: "rgba(216, 180, 254, 0.5)", size: 24, rotatesContinuously: true },
  { icon: Gamepad2, colorClass: "text-emerald-300", glowColor: "rgba(110, 231, 183, 0.45)", size: 32 },
  { icon: Zap, colorClass: "text-amber-400", glowColor: "rgba(251, 191, 36, 0.5)", size: 26 },
];

// Track 2 Items (Middle row - spaced widely so it stays clear behind hero text)
const TRACK_2_ICONS: FloatingIconItem[] = [
  { icon: Lightbulb, colorClass: "text-amber-300", glowColor: "rgba(252, 211, 77, 0.45)", size: 32 },
  { icon: CheckCircle2, colorClass: "text-emerald-400", glowColor: "rgba(52, 211, 153, 0.4)", size: 28 },
  { icon: Target, colorClass: "text-red-400", glowColor: "rgba(248, 113, 113, 0.4)", size: 30 },
  { icon: Clock, colorClass: "text-sky-300", glowColor: "rgba(125, 211, 252, 0.4)", size: 26 },
  { icon: Flame, colorClass: "text-orange-400", glowColor: "rgba(251, 146, 60, 0.5)", size: 30 },
  { icon: Sparkles, colorClass: "text-pink-300", glowColor: "rgba(244, 114, 182, 0.5)", size: 26, rotatesContinuously: true },
  { icon: Atom, colorClass: "text-indigo-300", glowColor: "rgba(165, 180, 252, 0.45)", size: 32, rotatesContinuously: true },
];

// Track 3 Items (Bottom row)
const TRACK_3_ICONS: FloatingIconItem[] = [
  { icon: Trophy, colorClass: "text-amber-300", glowColor: "rgba(252, 211, 77, 0.45)", size: 32 },
  { icon: Gamepad2, colorClass: "text-rose-400", glowColor: "rgba(251, 113, 133, 0.4)", size: 30 },
  { icon: GraduationCap, colorClass: "text-blue-300", glowColor: "rgba(147, 197, 253, 0.4)", size: 28 },
  { icon: Zap, colorClass: "text-yellow-300", glowColor: "rgba(253, 224, 71, 0.5)", size: 26 },
  { icon: Atom, colorClass: "text-teal-300", glowColor: "rgba(94, 234, 212, 0.45)", size: 34, rotatesContinuously: true },
  { icon: BookOpen, colorClass: "text-emerald-300", glowColor: "rgba(110, 231, 183, 0.4)", size: 28 },
  { icon: HelpCircle, colorClass: "text-purple-300", glowColor: "rgba(216, 180, 254, 0.45)", size: 26 },
];

// Kahoot Floating Neon Shapes
const KAHOOT_SHAPES = [
  { shape: "▲", color: "text-red-400/50" },
  { shape: "◆", color: "text-blue-400/50" },
  { shape: "●", color: "text-amber-400/50" },
  { shape: "■", color: "text-emerald-400/50" },
];

interface MarqueeRowProps {
  items: FloatingIconItem[];
  duration: number;
  topPercent: string;
  delayOffset?: number;
  opacityLevel?: string;
}

function MarqueeRow({ items, duration, topPercent, delayOffset = 0, opacityLevel = "opacity-45" }: MarqueeRowProps) {
  // Multiply items for continuous looping
  const loopedItems = [...items, ...items, ...items];

  return (
    <div
      className={`absolute left-0 w-full flex items-center overflow-visible pointer-events-none select-none ${opacityLevel}`}
      style={{ top: topPercent }}
    >
      <motion.div
        className="flex items-center gap-16 sm:gap-28 shrink-0"
        initial={{ x: "-50%" }}
        animate={{ x: "0%" }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: delayOffset,
        }}
      >
        {loopedItems.map((item, idx) => {
          const Icon = item.icon;
          const kahootShape = KAHOOT_SHAPES[idx % KAHOOT_SHAPES.length];

          return (
            <motion.div
              key={idx}
              animate={
                item.rotatesContinuously
                  ? {
                      y: [0, -12, 0, 12, 0],
                      rotate: 360,
                    }
                  : {
                      y: [0, -12, 0, 12, 0],
                      rotate: [-10, 10, -10],
                    }
              }
              transition={{
                y: {
                  duration: 5 + (idx % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: item.rotatesContinuously
                  ? {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }
                  : {
                      duration: 6 + (idx % 4),
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
              }}
              className="relative flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-[2px] transition-transform"
              style={{
                filter: `drop-shadow(0 0 10px ${item.glowColor})`,
              }}
            >
              <Icon
                style={{ width: item.size, height: item.size }}
                className={`${item.colorClass} drop-shadow-md`}
              />

              {/* Subtle Kahoot Shape companion orb */}
              <span className={`absolute -bottom-1 -right-2 text-[10px] font-black ${kahootShape.color}`}>
                {kahootShape.shape}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function HeroBackgroundAnimation() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{
        // Smooth gradient fade-in on the left and fade-out on the right
        maskImage: "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
      }}
    >
      {/* Track 1 - High level drifting left to right */}
      <MarqueeRow
        items={TRACK_1_ICONS}
        duration={36}
        topPercent="12%"
        delayOffset={0}
        opacityLevel="opacity-55"
      />

      {/* Track 2 - Mid level with softer opacity so headline remains 100% crisp */}
      <MarqueeRow
        items={TRACK_2_ICONS}
        duration={46}
        topPercent="48%"
        delayOffset={-8}
        opacityLevel="opacity-30"
      />

      {/* Track 3 - Lower level */}
      <MarqueeRow
        items={TRACK_3_ICONS}
        duration={40}
        topPercent="82%"
        delayOffset={-14}
        opacityLevel="opacity-50"
      />
    </div>
  );
}

export default HeroBackgroundAnimation;
