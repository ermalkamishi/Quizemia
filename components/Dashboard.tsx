"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  Search,
  Users,
  HelpCircle,
  Clock,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/types/quiz";
import { fetchPublicQuizzes } from "@/lib/supabase/queries";
import { HeroBackgroundAnimation } from "@/components/HeroBackgroundAnimation";

const CATEGORIES = ["All", "General", "Geography", "Science", "Technology", "History", "Pop Culture"];

export default function Dashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 via-indigo-700 to-purple-800 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Animated 3D Quiz & Education Background Stream */}
        <HeroBackgroundAnimation />

        {/* Floating Kahoot Shape Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-red-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-10 w-80 h-80 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-emerald-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <p className="text-amber-300 font-black tracking-widest uppercase text-xs sm:text-sm">
            Turn lessons into play!
          </p>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Learn, Challenge, &amp; Win in{" "}
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-emerald-300 bg-clip-text text-transparent">
              High Energy
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-blue-100 font-medium leading-relaxed">
            Generate 4-option quizzes in seconds using AI from notes, images, or any topic.
            Join thousands of students and curious minds in fast-paced arena battles!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/quiz?mode=create" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border-b-4 border-amber-600 gap-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Create Your Own Quiz</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/about-us" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md font-semibold text-base"
              >
                How It Works
              </Button>
            </Link>
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
                Explore Public Quizzes
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Explore official default quizzes made by Quizemia and test your knowledge.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by title, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
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
              No quizzes found
            </h3>
            <p className="text-sm text-zinc-500 mt-1 mb-6">
              Try adjusting your search query or be the first to create a quiz in this category!
            </p>
            <Link href="/quiz?mode=create">
              <Button className="bg-blue-600 font-bold">Create a Quiz Now</Button>
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
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-white/40">
                            <Sparkles className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge variant="vibrant">{quiz.category || "General"}</Badge>
                        </div>
                        <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
                          <span>Quizemia Official</span>
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
                            {questionCount} Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            ~{questionCount * 20}s
                          </span>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Platform Default</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/quiz?id=${quiz.id}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Play Now</span>
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
