"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  Search,
  HelpCircle,
  Clock,
  Flame,
  ArrowRight,
  Upload,
  FileText,
  X,
  Globe,
  User as UserIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/types/quiz";
import { fetchPublicQuizzes, DEFAULT_PUBLIC_QUIZZES } from "@/lib/supabase/queries";
import { HeroBackgroundAnimation } from "@/components/HeroBackgroundAnimation";
import { HeroQuizCard } from "@/components/HeroQuizCard";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "General", "Geography", "Science", "Technology", "History", "Pop Culture"];

const QUICK_TOPICS = [
  "🧬 Photosynthesis",
  "🪐 Solar System",
  "🏛️ Roman History",
  "⚡ Python Code",
];

export default function Dashboard() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState<"all" | "en" | "al" | "mk">("all");

  // Hero interactive state
  const [wordIndex, setWordIndex] = useState(0);
  const [heroPrompt, setHeroPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate hero headline text every 1.8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % (t.hero.rotatingWords.length || 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [t.hero.rotatingWords.length]);

  const handleQuickTopicClick = (topic: string) => {
    const cleanTopic = topic.replace(/^[^\w\s]+/, "").trim();
    setHeroPrompt(cleanTopic);
  };

  const handleGenerateQuiz = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = heroPrompt.trim() || (uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, "") : "");
    if (query) {
      router.push(`/quiz?mode=create&prompt=${encodeURIComponent(query)}`);
    } else {
      router.push("/quiz?mode=create");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (!heroPrompt) {
        setHeroPrompt(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      const data = await fetchPublicQuizzes();
      setQuizzes(data);
      setLoading(false);
    }
    loadQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesCategory =
      selectedCategory === "All" ||
      quiz.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage =
      selectedLanguage === "all" ||
      (quiz.language || "en") === selectedLanguage;
    return matchesCategory && matchesSearch && matchesLanguage;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - 2-Column High-Energy Layout */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 via-indigo-700 to-purple-800 text-white py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Animated 3D Quiz & Education Background Stream */}
        <HeroBackgroundAnimation />

        {/* Ambient Glowing Blobs Behind Hero Preview Card and Copy */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute -top-10 -left-10 w-96 h-96 bg-red-500/80 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-10 w-96 h-96 bg-amber-400/80 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-emerald-500/80 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/80 rounded-full blur-3xl" />
        </div>

        {/* 2-Column Hero Grid */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* =========================================================================
              LEFT COLUMN: HERO COPY & INTERACTIVE ACTIONS
             ========================================================================= */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Main Headline with Dynamic Rotating Words */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.15]">
              {t.hero.headlinePrefix}{" "}
              <span className="inline-block relative min-h-[1.2em] whitespace-nowrap">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${language}-${wordIndex}`}
                    initial={{ y: 22, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -22, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`inline-block bg-gradient-to-r ${(t.hero.rotatingWords[wordIndex % t.hero.rotatingWords.length] || t.hero.rotatingWords[0]).gradient} bg-clip-text text-transparent drop-shadow-sm`}
                  >
                    {(t.hero.rotatingWords[wordIndex % t.hero.rotatingWords.length] || t.hero.rotatingWords[0]).text}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-base sm:text-lg text-blue-100 font-medium leading-relaxed">
              {t.hero.mainSubtitle}
            </p>

            {/* Interactive Mini-Input / Upload CTA */}
            <div className="space-y-3 pt-2">
              <form
                onSubmit={handleGenerateQuiz}
                className="relative p-2 rounded-2xl bg-white/15 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/25 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl"
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.txt,.docx"
                  className="hidden"
                />

                {/* File upload trigger button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title={t.hero.uploadTooltip}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white border border-white/20 transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  <Upload className="h-4 w-4" />
                </button>

                {/* Input box with optional attached file badge */}
                <div className="flex-1 flex items-center gap-2 px-2 overflow-hidden">
                  {uploadedFile ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/30 border border-blue-400/40 text-xs font-bold text-white shrink-0">
                      <FileText className="h-3.5 w-3.5 text-blue-300" />
                      <span className="max-w-[120px] truncate">{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="hover:text-red-300 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null}

                  <input
                    type="text"
                    value={heroPrompt}
                    onChange={(e) => setHeroPrompt(e.target.value)}
                    placeholder={uploadedFile ? (language === "al" ? "Shto udhëzime shtesë..." : "Add custom instructions...") : t.hero.inputPlaceholder}
                    className="w-full bg-transparent border-none text-sm text-white placeholder-blue-200/70 focus:outline-none focus:ring-0 font-medium"
                  />
                </div>

                {/* Primary Generate Quiz Button */}
                <Button
                  type="submit"
                  size="default"
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-black text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 border-b-2 border-amber-600 active:scale-95 transition-all gap-1.5 shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t.hero.generateButton}</span>
                </Button>
              </form>

              {/* Quick Topic Categories below the input */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs font-semibold text-blue-200/80">{t.hero.tryLabel}</span>
                {t.hero.tryChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleQuickTopicClick(chip)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Repositioned How It Works Action */}
              <div className="pt-2">
                <Link href="/about-us#how-it-works">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md rounded-xl font-bold text-xs sm:text-sm px-4 py-2 transition-all hover:scale-105 active:scale-95 gap-2 cursor-pointer shadow-sm"
                  >
                    <HelpCircle className="h-4 w-4 text-amber-300" />
                    <span>{t.hero.howItWorks}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: INTERACTIVE 3D GLASSMORPHISM CARD PREVIEW
             ========================================================================= */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            <HeroQuizCard />
          </div>
        </div>
      </section>

      {/* Main Public Arena Section */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-red-500 fill-red-500" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t.dashboard.title}
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t.dashboard.subtitle}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder={t.dashboard.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category & Language Filter Bars */}
        <div className="space-y-3 mb-8">
          {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
              >
                {t.categories[cat] || cat}
              </button>
            ))}
          </div>

          {/* Language Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-zinc-500 shrink-0 flex items-center gap-1 mr-1">
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              <span>{language === "al" ? "Gjuha:" : "Language:"}</span>
            </span>
            <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedLanguage("all")}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                  selectedLanguage === "all"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                {language === "al" ? "Të gjitha" : "All Languages"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage("en")}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1",
                  selectedLanguage === "en"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage("al")}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1",
                  selectedLanguage === "al"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <span>🇦🇱</span>
                <span>Shqip</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage("mk")}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1",
                  selectedLanguage === "mk"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <span>🇲🇰</span>
                <span>Македонски</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse border border-zinc-200 dark:border-zinc-800"
              />
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 max-w-lg mx-auto">
            <HelpCircle className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
              {t.dashboard.noQuizzesFound}
            </h3>
            <p className="text-sm text-zinc-500 mt-1 mb-6">
              {t.dashboard.tryDifferentSearch}
            </p>
            <Link href="/quiz?mode=create">
              <Button className="bg-blue-600 font-bold">{t.dashboard.createNew}</Button>
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {filteredQuizzes.map((quiz) => {
              const questionCount = quiz.questions?.length || 3;
              const quizLang = quiz.language || "en";

              const isOfficial =
                quiz.creator_email === "Quizemia Official" ||
                DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === quiz.id);

              let authorNickname = quiz.creator_email?.trim() || "";
              if (authorNickname.includes("@")) {
                authorNickname = authorNickname.split("@")[0];
              }
              if (!authorNickname || authorNickname.toLowerCase() === "null") {
                authorNickname = "Creator";
              }

              return (
                <motion.div
                  key={quiz.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full flex flex-col justify-between hover:shadow-xl hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all group">
                    <div>
                      {/* Cover Image / Gradient */}
                      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-tr from-indigo-900 to-purple-900">
                        {quiz.cover_image ? (
                          <img
                            src={quiz.cover_image}
                            alt={quiz.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-white/40">
                            <Sparkles className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge variant="vibrant">{quiz.category || "General"}</Badge>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md",
                              quizLang === "al"
                                ? "bg-red-600 text-white"
                                : quizLang === "mk"
                                ? "bg-amber-600 text-white"
                                : "bg-blue-600 text-white"
                            )}
                          >
                            {quizLang === "al" ? "🇦🇱 Shqip" : quizLang === "mk" ? "🇲🇰 MK" : "🇬🇧 EN"}
                          </span>
                          {isOfficial ? (
                            <div className="bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
                              <span>Official</span>
                            </div>
                          ) : (
                            <div className="bg-blue-950/80 backdrop-blur-md text-blue-200 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm max-w-[130px] truncate">
                              <UserIcon className="h-3 w-3 text-blue-400 shrink-0" />
                              <span className="truncate">@{authorNickname}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {quiz.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1.5 text-xs sm:text-sm">
                          {quiz.description || "A fun, fast-paced interactive quiz."}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-2">
                        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                            {questionCount} {t.dashboard.questionsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            ~{questionCount * 20}s
                          </span>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 max-w-[170px] truncate">
                        {isOfficial ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                            <span>{language === "al" ? "Zyrtare nga Quizemia" : "Platform Official"}</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{language === "al" ? `Nga: @${authorNickname}` : `By: @${authorNickname}`}</span>
                          </>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/quiz?id=${quiz.id}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{t.dashboard.playNow}</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}
