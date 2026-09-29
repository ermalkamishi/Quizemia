"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Play,
  PlusCircle,
  Timer,
  CheckCircle,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Flame,
  Globe,
  Lock,
  Layers,
  Zap,
  Search,
  HelpCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { Quiz as QuizType, Question, QuestionOption } from "@/types/quiz";
import {
  fetchQuizById,
  fetchPublicQuizzes,
  createQuizWithQuestions,
  incrementQuizPlayCount,
  DEFAULT_PUBLIC_QUIZZES,
} from "@/lib/supabase/queries";

const CATEGORIES = ["All", "General", "Geography", "Science", "Technology", "History", "Pop Culture"];

export default function Quiz() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const quizIdParam = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const tabParam = searchParams.get("tab");

  // Mode: "play" or "create"
  const [mode, setMode] = useState<"play" | "create">(
    modeParam === "create" ? "create" : "play"
  );
  // Creation Tab: "ai" or "manual"
  const [creationTab, setCreationTab] = useState<"ai" | "manual">(
    tabParam === "manual" ? "manual" : "ai"
  );

  useEffect(() => {
    if (modeParam === "create") {
      setMode("create");
      if (tabParam === "manual") {
        setCreationTab("manual");
      } else {
        setCreationTab("ai");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modeParam === "play") {
      setMode("play");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [modeParam, tabParam]);
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Gameplay State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isGameOver, setIsGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Creation State
  const [isPublic, setIsPublic] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizCategory, setQuizCategory] = useState("General");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [questionsList, setQuestionsList] = useState<Question[]>([
    {
      question_text: "What is the powerhouse of the cell?",
      time_limit: 20,
      points: 1000,
      order_index: 0,
      options: [
        { id: "a", text: "Mitochondria", is_correct: true, color: "red", shape: "triangle" },
        { id: "b", text: "Ribosome", is_correct: false, color: "blue", shape: "diamond" },
        { id: "c", text: "Nucleus", is_correct: false, color: "yellow", shape: "circle" },
        { id: "d", text: "Endoplasmic Reticulum", is_correct: false, color: "green", shape: "square" },
      ],
    },
  ]);

  const [availableQuizzes, setAvailableQuizzes] = useState<QuizType[]>([]);
  const [lobbySearch, setLobbySearch] = useState("");
  const [lobbyFilter, setLobbyFilter] = useState<"all" | "default" | "community">("all");
  const [lobbyCategory, setLobbyCategory] = useState("All");

  const startQuiz = (quiz: QuizType) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedOptionId(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    const initialTime = quiz.questions?.[0]?.time_limit || 20;
    setTimeLeft(initialTime);
  };

  // Load available quizzes, and only start game if a specific quiz ?id= is passed
  useEffect(() => {
    async function load() {
      setLoadingQuiz(true);
      const allQuizzes = await fetchPublicQuizzes();
      setAvailableQuizzes(allQuizzes);

      if (quizIdParam) {
        const found = await fetchQuizById(quizIdParam);
        if (found) {
          startQuiz(found);
          setMode("play");
        }
      } else {
        // Do not auto-launch! Leave activeQuiz null so the user can choose from the lobby
        setActiveQuiz(null);
      }
      setLoadingQuiz(false);
    }
    load();
  }, [quizIdParam]);

  // Reset Game
  const resetGame = () => {
    setCurrentQuestionIdx(0);
    setSelectedOptionId(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    const initialTime = activeQuiz?.questions?.[0]?.time_limit || 20;
    setTimeLeft(initialTime);
  };

  // Timer Effect during Gameplay
  useEffect(() => {
    if (mode !== "play" || isGameOver || isAnswerRevealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimeout(() => handleTimeExpired(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isGameOver, isAnswerRevealed, currentQuestionIdx]);

  const handleTimeExpired = () => {
    setIsAnswerRevealed(true);
    setStreak(0);
    toast({
      title: "Time's Up!",
      description: "You ran out of time on this question.",
      type: "error",
    });
  };

  const handleSelectOption = (option: QuestionOption) => {
    if (isAnswerRevealed) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOptionId(option.id);
    setIsAnswerRevealed(true);

    if (option.is_correct) {
      // Calculate speed-based score Kahoot-style: base points + speed bonus
      const currentQ = activeQuiz?.questions?.[currentQuestionIdx];
      const maxTime = currentQ?.time_limit || 20;
      const speedFraction = Math.max(timeLeft / maxTime, 0.2);
      const pointsEarned = Math.round(1000 * speedFraction + streak * 100);

      setScore((prev) => prev + pointsEarned);
      setStreak((prev) => prev + 1);

      toast({
        title: "Correct Answer! 🎉",
        description: `+${pointsEarned} points awarded (Speed Bonus included)`,
        type: "success",
      });
    } else {
      setStreak(0);
      toast({
        title: "Incorrect",
        description: "Better luck on the next question!",
        type: "error",
      });
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz?.questions) return;
    const nextIdx = currentQuestionIdx + 1;

    if (nextIdx < activeQuiz.questions.length) {
      setCurrentQuestionIdx(nextIdx);
      setSelectedOptionId(null);
      setIsAnswerRevealed(false);
      setTimeLeft(activeQuiz.questions[nextIdx]?.time_limit || 20);
    } else {
      // Game Over
      setIsGameOver(true);
      if (activeQuiz.id) {
        incrementQuizPlayCount(activeQuiz.id);
      }
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  // AI Generation Simulation Handler (with hooks for OpenAI/Gemini)
  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim() && !uploadedImageName) {
      toast({
        title: "Prompt or Image Required",
        description: "Please enter a topic or upload notes to generate questions.",
        type: "error",
      });
      return;
    }

    setIsAiGenerating(true);

    // Simulated API call delay to emulate OpenAI Vision / Gemini prompt completion
    setTimeout(() => {
      const topic = aiPrompt.trim() || "Uploaded Material";
      const generatedQuestions: Question[] = [
        {
          question_text: `What is the fundamental concept behind ${topic}?`,
          time_limit: 20,
          points: 1000,
          order_index: 0,
          options: [
            { id: "a", text: `Core Principle of ${topic}`, is_correct: true, color: "red", shape: "triangle" },
            { id: "b", text: "Secondary Assumption", is_correct: false, color: "blue", shape: "diamond" },
            { id: "c", text: "Outdated Hypothesis", is_correct: false, color: "yellow", shape: "circle" },
            { id: "d", text: "Irrelevant Factor", is_correct: false, color: "green", shape: "square" },
          ],
        },
        {
          question_text: `Which of the following is most commonly associated with ${topic}?`,
          time_limit: 15,
          points: 1000,
          order_index: 1,
          options: [
            { id: "a", text: "Random Noise", is_correct: false, color: "red", shape: "triangle" },
            { id: "b", text: `High Impact Application of ${topic}`, is_correct: true, color: "blue", shape: "diamond" },
            { id: "c", text: "Static Resistance", is_correct: false, color: "yellow", shape: "circle" },
            { id: "d", text: "Uncontrolled Dispersion", is_correct: false, color: "green", shape: "square" },
          ],
        },
        {
          question_text: `In practical scenarios, how do professionals optimize ${topic}?`,
          time_limit: 20,
          points: 1000,
          order_index: 2,
          options: [
            { id: "a", text: "Manual Guesswork", is_correct: false, color: "red", shape: "triangle" },
            { id: "b", text: "Complete Automation Without Review", is_correct: false, color: "blue", shape: "diamond" },
            { id: "c", text: "Iterative Testing & Systematic Analysis", is_correct: true, color: "yellow", shape: "circle" },
            { id: "d", text: "Ignoring Feedback Loops", is_correct: false, color: "green", shape: "square" },
          ],
        },
      ];

      setQuizTitle(`${topic.slice(0, 35)} Master Quiz`);
      setQuizDescription(`AI-generated interactive quiz testing key knowledge in ${topic}.`);
      setQuestionsList(generatedQuestions);
      setIsAiGenerating(false);

      toast({
        title: "AI Quiz Generated!",
        description: `Created 3 questions on ${topic}. Review and save!`,
        type: "success",
      });
    }, 1800);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a name for your quiz.",
        type: "error",
      });
      return;
    }

    const result = await createQuizWithQuestions(
      {
        title: quizTitle,
        description: quizDescription || "Custom user-created quiz.",
        category: quizCategory,
        is_public: isPublic,
        cover_image:
          "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
        questions: questionsList,
      },
      user?.id,
      user?.email
    );

    if (result.success && result.quiz) {
      toast({
        title: "Quiz Saved!",
        description: `"${result.quiz.title}" is ready to play!`,
        type: "success",
      });
      setAvailableQuizzes((prev) => [result.quiz!, ...prev]);
      startQuiz(result.quiz);
      setMode("play");
    }
  };

  const currentQ = activeQuiz?.questions?.[currentQuestionIdx];
  const totalQuestions = activeQuiz?.questions?.length || 0;

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Segmented Mode Bar */}
      <div className="flex items-center justify-between mb-8 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setMode("play");
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${mode === "play"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Play Arena</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${mode === "create"
                ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-500/30"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Quiz Studio (Create)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          GAMEPLAY MODE
         ========================================================================= */}
      {mode === "play" && (
        <div className="flex-1 flex flex-col justify-center">
          {loadingQuiz ? (
            <div className="text-center py-24 space-y-4">
              <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
              <p className="font-semibold text-zinc-600 dark:text-zinc-400">Loading arena...</p>
            </div>
          ) : isGameOver ? (
            /* ================= Scoreboard / Podium Screen ================= */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10 px-4 sm:px-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl mx-auto w-full space-y-6"
            >
              <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shadow-inner">
                <Trophy className="h-16 w-16 fill-current animate-bounce" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  Quiz Completed!
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  {activeQuiz?.title || "Challenge Finished"}
                </p>
              </div>

              {/* Score Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-400 uppercase">Final Score</span>
                  <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
                    {score.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-400 uppercase">Questions</span>
                  <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
                    {totalQuestions}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-400 uppercase">Max Streak</span>
                  <p className="text-2xl sm:text-3xl font-black text-red-500 mt-1">
                    🔥 {streak}x
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button
                  size="lg"
                  onClick={resetGame}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Play Again</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setActiveQuiz(null);
                    router.replace("/quiz");
                  }}
                  className="w-full sm:w-auto font-bold gap-2"
                >
                  <Layers className="h-4 w-4" />
                  <span>Choose Another Quiz</span>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-auto"
                >
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          ) : currentQ ? (
            /* ================= Active Question Gameplay ================= */
            <div className="space-y-6">
              {/* Question Header & Timer */}
              <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-black text-sm">
                    {currentQuestionIdx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-500">
                    of {totalQuestions} Questions
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (timerRef.current) clearInterval(timerRef.current);
                      setActiveQuiz(null);
                      router.replace("/quiz");
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-2"
                  >
                    ← Change Quiz
                  </button>
                </div>

                {/* Animated Circular/Linear Timer */}
                <div className="flex items-center gap-2">
                  <Timer
                    className={`h-5 w-5 ${timeLeft <= 5
                        ? "text-red-600 animate-ping"
                        : timeLeft <= 10
                          ? "text-amber-500"
                          : "text-emerald-600"
                      }`}
                  />
                  <span
                    className={`text-xl font-black tabular-nums ${timeLeft <= 5 ? "text-red-600 font-extrabold" : ""
                      }`}
                  >
                    {timeLeft}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900">
                    <Zap className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{score} pts</span>
                  </div>
                  {streak > 1 && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1.5 rounded-full border border-red-200">
                      <Flame className="h-3.5 w-3.5 fill-red-500" /> {streak}x
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Question Text & Media Card */}
              <motion.div
                key={currentQuestionIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg text-center space-y-4"
              >
                {/* Optional Media (GIF/Image placeholder) */}
                {currentQ.media_url && (
                  <div className="max-h-52 w-full max-w-md mx-auto overflow-hidden rounded-2xl mb-4 shadow-md">
                    <img
                      src={currentQ.media_url}
                      alt="Question Visual Media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
                  {currentQ.question_text}
                </h2>
              </motion.div>

              {/* 4 Interactive Kahoot Options (Red ▲, Blue ◆, Yellow ●, Green ■) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {currentQ.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const showCorrect = isAnswerRevealed && option.is_correct;
                  const showWrong = isAnswerRevealed && isSelected && !option.is_correct;

                  // Kahoot Shape & Color Mapping
                  const kahootStyles = {
                    red: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-b-4 border-red-800",
                    blue: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-b-4 border-blue-800",
                    yellow: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-zinc-950 font-bold border-b-4 border-amber-700",
                    green: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-b-4 border-emerald-800",
                  };

                  const shapeIcons = {
                    triangle: "▲",
                    diamond: "◆",
                    circle: "●",
                    square: "■",
                  };

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      disabled={isAnswerRevealed}
                      whileHover={!isAnswerRevealed ? { scale: 1.02 } : {}}
                      whileTap={!isAnswerRevealed ? { scale: 0.98 } : {}}
                      onClick={() => handleSelectOption(option)}
                      className={`relative flex items-center gap-3 p-5 sm:p-6 rounded-2xl text-left font-bold text-base sm:text-lg transition-all shadow-md select-none cursor-pointer disabled:cursor-default ${kahootStyles[option.color]
                        } ${isAnswerRevealed && !option.is_correct
                          ? "opacity-35 grayscale"
                          : ""
                        } ${showCorrect ? "ring-4 ring-emerald-400 scale-[1.02] shadow-2xl" : ""}`}
                    >
                      <span className="text-xl sm:text-2xl font-black opacity-80 shrink-0">
                        {shapeIcons[option.shape]}
                      </span>
                      <span className="flex-1 leading-snug">{option.text}</span>

                      {/* Revealed Status Icon */}
                      {showCorrect && (
                        <CheckCircle className="h-6 w-6 text-white shrink-0" />
                      )}
                      {showWrong && (
                        <XCircle className="h-6 w-6 text-white shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Reveal Controls */}
              {isAnswerRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700"
                >
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {currentQuestionIdx + 1 === totalQuestions
                      ? "That was the last question!"
                      : "Ready for the next round?"}
                  </span>
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md active:scale-95"
                  >
                    <span>{currentQuestionIdx + 1 === totalQuestions ? "View Podium" : "Next Question"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            /* ================= Quiz Selection Lobby ================= */
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    Choose a Quiz to Play
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Select an official Quizemia challenge or a community creation to enter the arena.
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search quizzes..."
                    value={lobbySearch}
                    onChange={(e) => setLobbySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Lobby Source Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLobbyFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      lobbyFilter === "all"
                        ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    All Quizzes ({availableQuizzes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLobbyFilter("default")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      lobbyFilter === "default"
                        ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    🌟 Official ({availableQuizzes.filter((q) => q.creator_email === "Quizemia Official" || !q.user_id || DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === q.id)).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLobbyFilter("community")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      lobbyFilter === "community"
                        ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    👥 Community ({availableQuizzes.filter((q) => q.creator_email !== "Quizemia Official" && q.user_id && !DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === q.id)).length})
                  </button>
                </div>

                {/* Category Pills (horizontal scroll) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLobbyCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        lobbyCategory === cat
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Available Quizzes */}
              {(() => {
                const filtered = availableQuizzes.filter((quiz) => {
                  const isDefault =
                    quiz.creator_email === "Quizemia Official" ||
                    !quiz.user_id ||
                    DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === quiz.id);

                  if (lobbyFilter === "default" && !isDefault) return false;
                  if (lobbyFilter === "community" && isDefault) return false;

                  const matchesCategory =
                    lobbyCategory === "All" ||
                    quiz.category?.toLowerCase() === lobbyCategory.toLowerCase();

                  const matchesSearch =
                    quiz.title.toLowerCase().includes(lobbySearch.toLowerCase()) ||
                    quiz.description?.toLowerCase().includes(lobbySearch.toLowerCase());

                  return matchesCategory && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 max-w-md mx-auto">
                      <Layers className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                        No quizzes found
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 mb-5">
                        {lobbyFilter === "community"
                          ? "No community quizzes found matching your criteria. Create one in the studio!"
                          : "Try clearing your search or category filter."}
                      </p>
                      <Button
                        onClick={() => setMode("create")}
                        className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold"
                      >
                        Create a Quiz in Studio
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((quiz) => {
                      const isDefault =
                        quiz.creator_email === "Quizemia Official" ||
                        !quiz.user_id ||
                        DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === quiz.id);
                      const qCount = quiz.questions?.length || 3;

                      return (
                        <Card
                          key={quiz.id}
                          className="flex flex-col justify-between hover:shadow-xl hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all group overflow-hidden"
                        >
                          <div>
                            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-tr from-indigo-900 to-purple-900">
                              {quiz.cover_image ? (
                                <img
                                  src={quiz.cover_image}
                                  alt={quiz.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-white/40">
                                  <Sparkles className="h-10 w-10" />
                                </div>
                              )}
                              <div className="absolute top-2.5 left-2.5">
                                <Badge variant="vibrant">{quiz.category || "General"}</Badge>
                              </div>
                              <div className="absolute top-2.5 right-2.5">
                                {isDefault ? (
                                  <Badge className="bg-blue-600 text-white border-0 text-[10px] font-bold gap-1 shadow-sm">
                                    <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
                                    <span>Official</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px] font-bold">
                                    Community
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-base font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                {quiz.title}
                              </CardTitle>
                              <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                                {quiz.description || "Interactive educational challenge."}
                              </p>
                            </CardHeader>

                            <CardContent className="p-4 pt-1">
                              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-400">
                                <span className="flex items-center gap-1">
                                  <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                                  {qCount} Questions
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                                  ~{qCount * 20}s
                                </span>
                              </div>
                            </CardContent>
                          </div>

                          <CardFooter className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                            <Button
                              onClick={() => startQuiz(quiz)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm active:scale-95"
                            >
                              <Play className="h-4 w-4 fill-current" />
                              <span>Start Game</span>
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          CREATION MODE (Quiz Studio)
         ========================================================================= */}
      {mode === "create" && (
        <div className="flex-1 space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quiz Creation Studio
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Create 4-choice interactive quizzes manually or let AI distill your notes into questions.
            </p>
          </div>

          {/* Creation Tabs */}
          <Tabs value={creationTab} onValueChange={(v) => setCreationTab(v as "ai" | "manual")}>
            <TabsList className="grid grid-cols-2 max-w-md">
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>AI Auto-Generator</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Layers className="h-4 w-4" />
                <span>Manual Editor</span>
              </TabsTrigger>
            </TabsList>

            {/* AI Generator Tab */}
            <TabsContent value="ai" className="space-y-6 pt-4">
              <Card className="border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-950/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Sparkles className="h-5 w-5 text-amber-500 fill-amber-400" />
                    <span>Generate Instant 4-Option Quiz</span>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-zinc-500">
                    Type a topic, paste study notes, or upload a diagram/slide. OpenAI Vision / Gemini placeholder integration creates calibrated questions with 4 Kahoot-style choices.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      Quiz Subject or Prompt
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Molecular Biology, French Renaissance, Quantum Computing, World Capitals..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  </div>

                  {/* Upload Dropzone UI (for OpenAI Vision / Gemini Multimodal) */}
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      Upload Study Guide, Diagram, or Slides (Optional)
                    </label>
                    <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:border-amber-500 cursor-pointer transition-colors text-center">
                      <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                      <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {uploadedImageName ? uploadedImageName : "Click to upload image or PDF"}
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-0.5">
                        Supports PNG, JPG, or PDF slides for AI visual analysis
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedImageName(file.name);
                            toast({
                              title: "File Attached",
                              description: `${file.name} ready for AI parsing`,
                              type: "info",
                            });
                          }
                        }}
                      />
                    </label>
                  </div>

                  <Button
                    onClick={handleGenerateWithAi}
                    disabled={isAiGenerating}
                    className="w-full bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 hover:opacity-95 text-white font-extrabold text-base py-6 shadow-md"
                  >
                    {isAiGenerating ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 animate-spin" />
                        AI Distilling Questions...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Generate Quiz with AI
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manual Editor Tab */}
            <TabsContent value="manual" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        Quiz Title *
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Cell Structure Quiz"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        Category
                      </label>
                      <select
                        value={quizCategory}
                        onChange={(e) => setQuizCategory(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="General">General</option>
                        <option value="Science">Science</option>
                        <option value="Geography">Geography</option>
                        <option value="Technology">Technology</option>
                        <option value="History">History</option>
                        <option value="Pop Culture">Pop Culture</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      Short Description
                    </label>
                    <Input
                      type="text"
                      placeholder="Brief overview of what players will learn..."
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                    />
                  </div>

                  {/* Public / Private Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {isPublic ? (
                          <Globe className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-zinc-400" />
                        )}
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {isPublic ? "Public Quiz (Visible in Arena)" : "Private Quiz (Direct Link Only)"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {isPublic
                          ? "Anyone on the dashboard can discover and play this quiz."
                          : "Only you and players with your unique link can access this quiz."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPublic ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublic ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Question Review & Save Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Quiz Questions ({questionsList.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setQuestionsList([
                    ...questionsList,
                    {
                      question_text: `New Question ${questionsList.length + 1}`,
                      time_limit: 20,
                      points: 1000,
                      order_index: questionsList.length,
                      options: [
                        { id: "a", text: "Answer 1", is_correct: true, color: "red", shape: "triangle" },
                        { id: "b", text: "Answer 2", is_correct: false, color: "blue", shape: "diamond" },
                        { id: "c", text: "Answer 3", is_correct: false, color: "yellow", shape: "circle" },
                        { id: "d", text: "Answer 4", is_correct: false, color: "green", shape: "square" },
                      ],
                    },
                  ])
                }
                className="gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Question</span>
              </Button>
            </div>

            {questionsList.map((q, qIndex) => (
              <Card key={qIndex} className="p-5 border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Question #{qIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    Time: {q.time_limit}s
                  </span>
                </div>

                <Input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => {
                    const updated = [...questionsList];
                    updated[qIndex].question_text = e.target.value;
                    setQuestionsList(updated);
                  }}
                  className="font-bold text-base mb-4"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2 p-3 rounded-xl border ${opt.is_correct
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "border-zinc-200 dark:border-zinc-800"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={opt.is_correct}
                        onChange={() => {
                          const updated = [...questionsList];
                          updated[qIndex].options = updated[qIndex].options.map((o) => ({
                            ...o,
                            is_correct: o.id === opt.id,
                          }));
                          setQuestionsList(updated);
                        }}
                        className="h-4 w-4 accent-emerald-600 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <Input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...questionsList];
                          updated[qIndex].options[optIndex].text = e.target.value;
                          setQuestionsList(updated);
                        }}
                        className="h-9 text-xs sm:text-sm"
                      />
                      <span className="text-xs font-bold text-zinc-400 uppercase w-6 text-center">
                        {opt.id}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {/* Save & Play CTA */}
            <div className="pt-4 flex justify-end gap-3">
              <Button
                size="lg"
                onClick={handleSaveQuiz}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-8 shadow-lg active:scale-95"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Save &amp; Play Quiz Now</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
