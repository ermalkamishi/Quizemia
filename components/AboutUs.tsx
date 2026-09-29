"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Globe,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  Gamepad2,
  BarChart3,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    shape: "▲",
    color: "red",
    colorClass: "bg-red-600 text-white",
    title: "AI-Powered Question Synthesis",
    icon: BrainCircuit,
    description:
      "Paste any lecture transcript, textbook notes, or upload diagrams. Our multimodal AI engine automatically structures questions, assigns distractors, and balances difficulty in seconds.",
    highlight: "Powered by modern LLM & Vision pipelines",
  },
  {
    step: "02",
    shape: "◆",
    color: "blue",
    colorClass: "bg-blue-600 text-white",
    title: "High-Energy Arena Gameplay",
    icon: Gamepad2,
    description:
      "Players battle against countdown timers using 4 tactile, color-coded choices (Red Triangle, Blue Diamond, Yellow Circle, Green Square). Speed bonuses and streak multipliers turn learning into a thrilling race.",
    highlight: "Responsive on every phone, tablet, and laptop",
  },
  {
    step: "03",
    shape: "■",
    color: "green",
    colorClass: "bg-emerald-600 text-white",
    title: "Instant Analytics & Knowledge Retention",
    icon: BarChart3,
    description:
      "Review answers on the celebratory podium. Creators monitor player participation, track pass rates, and pinpoint topics needing reinforcement.",
    highlight: "Real-time Row-Level-Security with Supabase",
  },
];

export default function AboutUs() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-zinc-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300">
            <Sparkles className="h-4 w-4 fill-amber-300" />
            <span>Quizemia — Turn lessons into play!</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Gamifying Education Through{" "}
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Interactive Play
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 font-medium leading-relaxed">
            Traditional studying often feels passive and repetitive. We built Quizemia with a simple mission: <strong>Turn lessons into play!</strong> We transform study materials into high-octane, memorable quiz competitions that ignite curiosity and reward speed and accuracy.
          </p>
        </div>
      </section>

      {/* 3-Step Animated Guide: How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="vibrant">Interactive Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            From raw notes to an interactive live arena in under 30 seconds.
          </p>
        </div>

        {/* Step Selector Tabs for Mobile / Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {HOW_IT_WORKS_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = activeStep === idx;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer select-none ${
                  isCurrent
                    ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xl ring-2 ring-blue-500"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black text-lg shadow-sm ${s.colorClass}`}
                  >
                    {s.shape}
                  </span>
                  <span className="text-xs font-black tracking-widest text-zinc-400">
                    STEP {s.step}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    {s.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  {s.description}
                </p>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-zinc-400">
                  {s.highlight}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Core Values / Features Grid */}
      <section className="bg-zinc-100/70 dark:bg-zinc-900/50 py-16 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Built for Modern Learners &amp; Educators
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Combining tactile game design with robust cloud architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Zap className="h-8 w-8 text-amber-500 mb-3" />
              <h3 className="font-bold text-base mb-1.5">Kahoot-Inspired Mechanics</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Color-coded choices (Red, Blue, Yellow, Green) and shape anchors that help players answer with speed and spatial memory.
              </p>
            </Card>

            <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Globe className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-bold text-base mb-1.5">Universal Accessibility</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Designed mobile-first. No bulky app installation required—simply load the web page on any mobile browser and start playing.
              </p>
            </Card>

            <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Award className="h-8 w-8 text-emerald-500 mb-3" />
              <h3 className="font-bold text-base mb-1.5">Secure Cloud Architecture</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Backed by Supabase PostgreSQL, Row-Level Security, and instant auth for seamless public sharing and private homework sets.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 sm:py-20 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to test your knowledge?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            Explore hundreds of community quizzes or craft your own in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/quiz?mode=create">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
                <Sparkles className="h-5 w-5" />
                <span>Launch Quiz Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Public Arena
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
