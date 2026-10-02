"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Globe,
  Award,
  ArrowRight,
  BrainCircuit,
  Gamepad2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HowToUseDemo } from "@/components/HowToUseDemo";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutUs() {
  const [activeStep, setActiveStep] = useState(0);
  const { language, t } = useLanguage();

  const steps = [
    {
      step: "01",
      shape: "▲",
      colorClass: "bg-red-600 text-white",
      title: t.about.step1Title,
      icon: BrainCircuit,
      description: t.about.step1Desc,
      highlight:
        language === "al"
          ? "Mundësuar nga tubacione moderne LLM & Inteligjencë Pamore"
          : "Powered by modern LLM & Vision pipelines",
    },
    {
      step: "02",
      shape: "◆",
      colorClass: "bg-blue-600 text-white",
      title: t.about.step2Title,
      icon: Gamepad2,
      description: t.about.step2Desc,
      highlight:
        language === "al"
          ? "I përshtatshëm në çdo telefon, tablet dhe laptop"
          : "Responsive on every phone, tablet, and laptop",
    },
    {
      step: "03",
      shape: "■",
      colorClass: "bg-emerald-600 text-white",
      title: t.about.step3Title,
      icon: BarChart3,
      description: t.about.step3Desc,
      highlight:
        language === "al"
          ? "Siguri në nivel rreshti në kohë reale me Supabase"
          : "Real-time Row-Level-Security with Supabase",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-zinc-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            {t.about.titlePrefix}
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              {t.about.titleHighlight}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-300 font-medium leading-relaxed">
            {t.about.mission}
          </p>
        </div>
      </section>

      {/* 3-Step Animated Guide: How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="vibrant">{t.about.howItWorksBadge}</Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.about.howItWorksTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            {t.about.howItWorksSubtitle}
          </p>
        </div>

        {/* Step Selector Tabs for Mobile / Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = activeStep === idx;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer select-none ${isCurrent
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

      {/* Interactive App Showcase: See It In Action */}
      <HowToUseDemo />

      {/* Core Values / Features Grid */}
      <section className="bg-zinc-100/70 dark:bg-zinc-900/50 py-16 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {t.about.featuresTitle}
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              {t.about.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Zap className="h-8 w-8 text-amber-500 mb-3" />
              <h3 className="font-bold text-base mb-1.5">{t.about.feature1Title}</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                {t.about.feature1Desc}
              </p>
            </Card>

            <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Globe className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-bold text-base mb-1.5">{t.about.feature2Title}</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                {t.about.feature2Desc}
              </p>
            </Card>

            <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Award className="h-8 w-8 text-emerald-500 mb-3" />
              <h3 className="font-bold text-base mb-1.5">{t.about.feature3Title}</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                {t.about.feature3Desc}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 sm:py-20 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {t.about.readyTitle}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            {t.about.readySubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/quiz?mode=create">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
                <span>{t.hero.launchStudio}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t.hero.exploreArena}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
