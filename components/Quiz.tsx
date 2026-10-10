"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Flame,
  Globe,
  Lock,
  Layers,
  Zap,
  Search,
  HelpCircle,
  Clock,
  Info,
  Trash2,
  FileText,
  X,
  Eye,
  EyeOff,
  Edit3,
  Check,
  Shuffle,
  User as UserIcon,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Quiz as QuizType, Question, QuestionOption, QuizLanguage } from "@/types/quiz";
import {
  fetchQuizById,
  fetchPublicQuizzes,
  createQuizWithQuestions,
  incrementQuizPlayCount,
  DEFAULT_PUBLIC_QUIZZES,
} from "@/lib/supabase/queries";
import { checkProfanity, validateQuizContent } from "@/lib/moderation";
import { getCategoryTheme } from "@/lib/categoryThemes";
import {
  calculateAnswerPoints,
  calculateCompletionBonus,
  recordMatchResult,
  recordQuizCreatedBonus,
} from "@/lib/leaderboard";

const CATEGORIES = ["All", "General", "Geography", "Science", "Technology", "History", "Pop Culture"];

export default function Quiz() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const quizIdParam = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const tabParam = searchParams.get("tab");

  // Mode: "play" | "create" | "host"
  const [mode, setMode] = useState<"play" | "create" | "host">(
    modeParam === "create" ? "create" : modeParam === "host" ? "host" : "play"
  );
  // Creation Tab: "ai" or "manual"
  const [creationTab, setCreationTab] = useState<"ai" | "manual">(
    tabParam === "manual" ? "manual" : "ai"
  );
  // Whether to show editable questions below AI showcase
  const [showEditQuestions, setShowEditQuestions] = useState<boolean>(false);

  // Quiz Language for generation and tagging (en, al, mk) - strictly independent from UI header language switcher
  const [quizLanguage, setQuizLanguageState] = useState<QuizLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quizemia_creator_language");
      if (saved === "al" || saved === "mk" || saved === "en") return saved;
    }
    return language === "al" ? "al" : "en";
  });

  const setQuizLanguage = (newLang: QuizLanguage) => {
    setQuizLanguageState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("quizemia_creator_language", newLang);
    }
  };

  const [questionCountMode, setQuestionCountMode] = useState<string>("auto");
  const [lobbyLanguageFilter, setLobbyLanguageFilter] = useState<"all" | QuizLanguage>("all");

  useEffect(() => {
    if (modeParam === "create") {
      setMode("create");
      if (tabParam === "manual") {
        setCreationTab("manual");
      } else {
        setCreationTab("ai");
      }
      const promptParam = searchParams.get("prompt");
      if (promptParam) {
        setAiPrompt(promptParam);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (modeParam === "play") {
      setMode("play");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [modeParam, tabParam, searchParams]);
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Gameplay State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<{ correct: boolean; points?: number } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [earnedCompletionBonus, setEarnedCompletionBonus] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isGameOver, setIsGameOver] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleTimeExpiredRef = useRef<() => void>(() => { });
  const handleNextQuestionRef = useRef<() => void>(() => { });
  const isTimeExpiredHandledRef = useRef(false);

  // Creation State
  const [isPublic, setIsPublic] = useState(true);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizCategory, setQuizCategory] = useState("General");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const getInitialQuestions = (lang: string): Question[] => [
    {
      question_text:
        lang === "al"
          ? "Cila organelë qelizore njihet si qendra energjetike e qelizës?"
          : "What is the powerhouse of the cell?",
      time_limit: 20,
      points: 1000,
      order_index: 0,
      options: [
        { id: "a", text: lang === "al" ? "Mitokondria" : "Mitochondria", is_correct: true, color: "red", shape: "triangle" },
        { id: "b", text: lang === "al" ? "Ribozomi" : "Ribosome", is_correct: false, color: "blue", shape: "diamond" },
        { id: "c", text: lang === "al" ? "Bërthama (Nukleusi)" : "Nucleus", is_correct: false, color: "yellow", shape: "circle" },
        { id: "d", text: lang === "al" ? "Retikumi Endoplazmatik" : "Endoplasmic Reticulum", is_correct: false, color: "green", shape: "square" },
      ],
    },
  ];

  const [questionsList, setQuestionsList] = useState<Question[]>(() => getInitialQuestions(language));

  // Automatically update the sample default question if user switches languages before editing it
  useEffect(() => {
    setQuestionsList((prev) => {
      if (prev.length === 1) {
        const q = prev[0];
        const isEnglishDefault = q.question_text === "What is the powerhouse of the cell?";
        const isAlbanianDefault = q.question_text === "Cila organelë qelizore njihet si qendra energjetike e qelizës?";
        if ((language === "al" && isEnglishDefault) || (language === "en" && isAlbanianDefault)) {
          return getInitialQuestions(language);
        }
      }
      return prev;
    });
  }, [language]);

  const [availableQuizzes, setAvailableQuizzes] = useState<QuizType[]>([]);
  const [lobbySearch, setLobbySearch] = useState("");
  const [lobbyFilter, setLobbyFilter] = useState<"all" | "default" | "community">("all");
  const [lobbyCategory, setLobbyCategory] = useState("All");

  const startQuiz = (quiz: QuizType) => {
    // Safety check: verify quiz content doesn't contain prohibited/vulgar words
    const safetyCheck = validateQuizContent(quiz.title, quiz.description, quiz.questions);
    if (!safetyCheck.isSafe) {
      toast({
        title: language === "al" ? "Kuiz i Ndaluar" : "Prohibited Quiz Content",
        description:
          language === "al"
            ? `Ky kuiz përmban fjalë të papërshtatshme (${safetyCheck.flaggedWord}) dhe nuk lejohet të luhet.`
            : `This quiz contains prohibited or vulgar language ("${safetyCheck.flaggedWord}") and cannot be played.`,
        type: "error",
      });
      return;
    }

    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const SHAPE_CONFIG = [
      { id: "a", color: "red", shape: "triangle" },
      { id: "b", color: "blue", shape: "diamond" },
      { id: "c", color: "yellow", shape: "circle" },
      { id: "d", color: "green", shape: "square" },
    ] as const;

    // Dynamically shuffle options for every question so answers are randomized across the 4 buttons
    const randomizedQuestions = (quiz.questions || []).map((q) => {
      if (!q.options || q.options.length <= 1) return q;
      const shuffled = [...q.options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const remappedOptions = shuffled.map((opt, optIdx) => {
        const shapeMeta = SHAPE_CONFIG[optIdx] || SHAPE_CONFIG[0];
        return {
          ...opt,
          id: shapeMeta.id,
          color: shapeMeta.color,
          shape: shapeMeta.shape,
        };
      });
      return {
        ...q,
        options: remappedOptions,
      };
    });

    setActiveQuiz({
      ...quiz,
      questions: randomizedQuestions,
    });
    setCurrentQuestionIdx(0);
    setSelectedOptionId(null);
    setIsAnswerRevealed(false);
    setLastAnswerResult(null);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setMaxStreak(0);
    setEarnedCompletionBonus(0);
    setIsGameOver(false);
    isTimeExpiredHandledRef.current = false;
    const initialTime = randomizedQuestions[0]?.time_limit || 20;
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
    if (activeQuiz) {
      startQuiz(activeQuiz);
    }
  };

  // Timer Effect during Gameplay: only runs when playing an active quiz
  useEffect(() => {
    if (mode !== "play" || !activeQuiz || isGameOver || isAnswerRevealed) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      let expired = false;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          expired = true;
          return 0;
        }
        return prev - 1;
      });

      if (expired) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleTimeExpiredRef.current();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mode, activeQuiz, isGameOver, isAnswerRevealed, currentQuestionIdx]);

  // Clean up any pending timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, []);

  const handleTimeExpired = () => {
    if (isTimeExpiredHandledRef.current || isAnswerRevealed) return;
    isTimeExpiredHandledRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    setIsAnswerRevealed(true);
    setStreak(0);
    setLastAnswerResult({ correct: false });
    toast({
      title: language === "al" ? "Koha Mbaroi! ⏱" : "Time's Up! ⏱",
      description: language === "al" ? "Po kalohet te pyetja tjetër..." : "Moving to next question...",
      type: "error",
      duration: 1700,
    });

    // Automatically advance to the next question after 2.0 seconds
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      handleNextQuestionRef.current();
    }, 2000);
  };

  const handleSelectOption = (option: QuestionOption) => {
    if (isAnswerRevealed) return;
    isTimeExpiredHandledRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    setSelectedOptionId(option.id);
    setIsAnswerRevealed(true);

    if (option.is_correct) {
      const currentQ = activeQuiz?.questions?.[currentQuestionIdx];
      const maxTime = currentQ?.time_limit || 20;
      const { total: pointsEarned, speedBonus, streakBonus } = calculateAnswerPoints(timeLeft, maxTime, streak);

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));
      setCorrectCount((prev) => prev + 1);
      if (user) {
        setScore((prev) => prev + pointsEarned);
        setLastAnswerResult({ correct: true, points: pointsEarned });

        const bonusItems: string[] = [];
        if (speedBonus > 0) bonusItems.push(`+${speedBonus} ${language === "al" ? "shpejtësi" : "speed"}`);
        if (streakBonus > 0) bonusItems.push(`+${streakBonus} ${language === "al" ? "seri" : "streak"}`);
        const bonusSuffix = bonusItems.length > 0 ? ` (${bonusItems.join(", ")})` : "";

        toast({
          title: language === "al" ? "Saktë! 🎉" : "Correct! 🎉",
          description: `+${pointsEarned} pts${bonusSuffix}`,
          type: "success",
          duration: 1700,
        });
      } else {
        // Non-signed in players do not earn points; show only correct message without point signals
        setLastAnswerResult({ correct: true });

        toast({
          title: language === "al" ? "Saktë! 🎉" : "Correct! 🎉",
          description: language === "al" ? "Përgjigje e saktë!" : "Correct answer!",
          type: "success",
          duration: 1700,
        });
      }
    } else {
      setStreak(0);
      setLastAnswerResult({ correct: false });
      toast({
        title: language === "al" ? "E Pasaktë! ❌" : "Incorrect! ❌",
        description: language === "al" ? "Vazhdo me pyetjen tjetër!" : "Better luck on the next question!",
        type: "error",
        duration: 1700,
      });
    }

    // Automatically advance to the next question after 2.0 seconds
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      handleNextQuestionRef.current();
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!activeQuiz?.questions) return;
    const nextIdx = currentQuestionIdx + 1;

    if (nextIdx < activeQuiz.questions.length) {
      setCurrentQuestionIdx(nextIdx);
      setSelectedOptionId(null);
      setIsAnswerRevealed(false);
      setLastAnswerResult(null);
      isTimeExpiredHandledRef.current = false;
      setTimeLeft(activeQuiz.questions[nextIdx]?.time_limit || 20);
    } else {
      // Game Over
      setIsGameOver(true);
      if (activeQuiz.id) {
        incrementQuizPlayCount(activeQuiz.id);
      }

      // Calculate Quiz Completion Mastery Bonus
      const qTotal = activeQuiz.questions.length;
      const completionBonus = calculateCompletionBonus(correctCount, qTotal);
      setEarnedCompletionBonus(user ? completionBonus : 0);

      const finalMatchScore = user ? score + completionBonus : 0;
      if (user) {
        setScore(finalMatchScore);
        const nickname =
          user.user_metadata?.nickname ||
          user.user_metadata?.name ||
          (user.email ? user.email.split("@")[0] : "Player");

        recordMatchResult({
          userId: user.id,
          nickname,
          matchScore: finalMatchScore,
          correctAnswers: correctCount,
          totalQuestions: qTotal,
          bestStreak: maxStreak,
        });
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

  handleTimeExpiredRef.current = handleTimeExpired;
  handleNextQuestionRef.current = handleNextQuestion;

  // Real Multimodal AI Generation with Google Gemini
  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim() && !uploadedFile && !uploadedImageName) {
      toast({
        title: language === "al" ? "Kërkohet Tema ose Dokumenti" : "Topic or Document Required",
        description:
          language === "al"
            ? "Ju lutem shkruani një temë ose ngarkoni një dokument (Word, PowerPoint, PDF, ose Foto) për të gjeneruar pyetje."
            : "Please enter a topic or upload a study file (Word, PowerPoint, PDF, or Image) to generate questions.",
        type: "error",
      });
      return;
    }

    // Safety check on user prompt
    if (aiPrompt.trim()) {
      const promptCheck = checkProfanity(aiPrompt);
      if (!promptCheck.isSafe) {
        toast({
          title: language === "al" ? "Kërkesë e Ndaluar" : "Prohibited Topic",
          description: language === "al" ? promptCheck.messageAl : promptCheck.messageEn,
          type: "error",
        });
        return;
      }
    }

    // Safety check on uploaded file name
    if (uploadedFile && uploadedFile.name) {
      const fileCheck = checkProfanity(uploadedFile.name);
      if (!fileCheck.isSafe) {
        toast({
          title: language === "al" ? "Emër Skedari i Ndaluar" : "Prohibited File Name",
          description: language === "al" ? fileCheck.messageAl : fileCheck.messageEn,
          type: "error",
        });
        return;
      }
    }

    setIsAiGenerating(true);
    setAiGeneratedSuccess(false);
    setShowEditQuestions(false);

    try {
      const formData = new FormData();
      if (aiPrompt.trim()) {
        formData.append("prompt", aiPrompt.trim());
      }
      formData.append("language", quizLanguage);
      formData.append("count", questionCountMode);
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      }

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate quiz with AI.");
      }

      if (data.title) setQuizTitle(data.title);
      if (data.description) setQuizDescription(data.description);
      if (data.category) setQuizCategory(data.category);
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestionsList(data.questions);
      }

      // Show the generated quiz showcase section with question count, Play button, and View/Edit questions button
      setAiGeneratedSuccess(true);
      setShowEditQuestions(false);

      const langLabel = quizLanguage === "al" ? "Shqip" : quizLanguage === "mk" ? "Македонски" : "English";
      const qCount = data.questions?.length || 0;

      toast({
        title: language === "al" ? "Kuizi me AI u Gjenerua me Sukses!" : "AI Quiz Generated Successfully!",
        description:
          language === "al"
            ? `U gjeneruan ${qCount} pyetje në ${langLabel}${uploadedFile ? ` nga "${uploadedFile.name}"` : ""}. Mund ta luani menjëherë ose t'i modifikoni pyetjet!`
            : `Generated ${qCount} questions in ${langLabel}${uploadedFile ? ` from "${uploadedFile.name}"` : ""}. You can play now or edit the questions!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("AI Generation error:", err);
      toast({
        title: language === "al" ? "Gabim gjatë Gjenerimit" : "Generation Error",
        description:
          err.message ||
          (language === "al"
            ? "Nuk u arrit të gjenerohej kuizi. Ju lutem provoni sërish."
            : "Failed to generate quiz. Please try again."),
        type: "error",
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handlePlayCurrentQuiz = () => {
    if (!questionsList || questionsList.length === 0) {
      toast({
        title: language === "al" ? "Kërkohen Pyetje" : "Questions Required",
        description: language === "al" ? "Nuk ka pyetje për të luajtur." : "There are no questions to play.",
        type: "error",
      });
      return;
    }

    // Safety validation on manually created or edited questions
    const safetyCheck = validateQuizContent(quizTitle, quizDescription, questionsList);
    if (!safetyCheck.isSafe) {
      toast({
        title: language === "al" ? "Përmbajtje e Ndaluar" : "Prohibited Content Detected",
        description:
          language === "al"
            ? `Kuizi përmban fjalë të papërshtatshme (${safetyCheck.flaggedWord}). Ju lutem pastroni pyetjet para se të luani.`
            : `Quiz contains prohibited language ("${safetyCheck.flaggedWord}"). Please remove inappropriate words before playing.`,
        type: "error",
      });
      return;
    }

    const tempQuiz: QuizType = {
      id: "temp-" + Date.now(),
      title: quizTitle.trim() || (language === "al" ? "Kuiz me AI" : "AI Generated Quiz"),
      description: quizDescription.trim() || (language === "al" ? "Krijuar me Quizemia AI" : "Created with Quizemia AI"),
      category: quizCategory,
      language: quizLanguage,
      is_public: false,
      questions: questionsList,
      play_count: 0,
      created_at: new Date().toISOString(),
    };
    startQuiz(tempQuiz);
    setMode("play");
  };

  const handleInitiateSave = () => {
    if (!quizTitle.trim()) {
      toast({
        title: language === "al" ? "Kërkohet Titulli" : "Title Required",
        description: language === "al" ? "Ju lutem vendosni një emër për kuizin." : "Please provide a name for your quiz.",
        type: "error",
      });
      return;
    }

    if (!questionsList || questionsList.length === 0) {
      toast({
        title: language === "al" ? "Kërkohen Pyetje" : "Questions Required",
        description: language === "al" ? "Ju lutem shtoni të paktën një pyetje në kuiz." : "Please add at least one question to your quiz.",
        type: "error",
      });
      return;
    }

    // Safety validation: verify that title, description, and manual questions don't contain bad words
    const safetyCheck = validateQuizContent(quizTitle, quizDescription, questionsList);
    if (!safetyCheck.isSafe) {
      toast({
        title: language === "al" ? "Përmbajtje e Ndaluar" : "Prohibited Content Detected",
        description:
          language === "al"
            ? `Kuizi përmban fjalë të papërshtatshme (${safetyCheck.flaggedWord}). Ju lutem hiqni fjalorin fyes para se ta ruani.`
            : `Quiz contains prohibited or vulgar words ("${safetyCheck.flaggedWord}"). Please remove prohibited words before saving.`,
        type: "error",
      });
      return;
    }

    // Guest mode bypass: guest quizzes are transient and not saved to the library/cloud,
    // so bypass asking whether to publish or keep private and directly start playing.
    if (!user) {
      handleConfirmSave(false);
      return;
    }

    // Prompt user: "Do you want to publish this quiz so anyone else can play, or keep it private?"
    setIsPublishDialogOpen(true);
  };

  const handleConfirmSave = async (publishChoice: boolean, shouldHostLive: boolean = false) => {
    setIsSavingQuiz(true);

    const creatorNickname =
      user?.user_metadata?.nickname ||
      user?.user_metadata?.name ||
      user?.user_metadata?.display_name ||
      (user?.email ? user.email.split("@")[0] : "Quizemia Creator");

    const result = await createQuizWithQuestions(
      {
        title: quizTitle.trim(),
        description: quizDescription.trim() || (language === "al" ? "Kuiz i personalizuar nga përdoruesi." : "Custom user-created quiz."),
        category: quizCategory,
        language: quizLanguage,
        is_public: publishChoice,
        cover_image:
          "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
        questions: questionsList,
      },
      user?.id,
      creatorNickname
    );

    setIsSavingQuiz(false);
    setIsPublishDialogOpen(false);

    if (result.success && result.quiz) {
      if (user) {
        recordQuizCreatedBonus(user.id, creatorNickname);
        toast({
          title: publishChoice
            ? (language === "al" ? "Kuizi u Publikua! +200 Pikë 🏆" : "Quiz Published! +200 Points 🏆")
            : (language === "al" ? "Kuizi Privat u Ruajt! +200 Pikë 🏆" : "Private Quiz Saved! +200 Points 🏆"),
          description: publishChoice
            ? (language === "al"
              ? `"${result.quiz.title}" u publikua! Fitove +200 pikë krijuesi në renditje!`
              : `"${result.quiz.title}" is published! You earned +200 creator points on the leaderboard!`)
            : (language === "al"
              ? `"${result.quiz.title}" u ruajt! Fitove +200 pikë krijuesi në renditje!`
              : `"${result.quiz.title}" is saved! You earned +200 creator points on the leaderboard!`),
          type: "success",
        });
        setAvailableQuizzes((prev) => [result.quiz!, ...prev]);
      } else {
        toast({
          title: language === "al" ? "Sesioni i Mysafirit Filloi" : "Guest Session Started",
          description: language === "al"
            ? `Po luani "${result.quiz.title}". (Nuk ruhet në bibliotekë si mysafir)`
            : `Playing "${result.quiz.title}". (Not saved to library as guest)`,
          type: "info",
        });
      }

      if (shouldHostLive) {
        router.push(`/live/host?quizId=${result.quiz.id}`);
      } else {
        startQuiz(result.quiz);
        setMode("play");
      }
    } else {
      toast({
        title: language === "al" ? "Ruajtja Dështoi" : "Save Failed",
        description: result.error || (language === "al" ? "Nuk mund të ruhej kuizi. Ju lutem provoni përsëri." : "Could not save quiz. Please try again."),
        type: "error",
      });
    }
  };

  const currentQ = activeQuiz?.questions?.[currentQuestionIdx];
  const totalQuestions = activeQuiz?.questions?.length || 0;
  const isPlayingActiveQuiz = Boolean(mode === "play" && activeQuiz && !isGameOver && currentQ);
  const categoryTheme = getCategoryTheme(activeQuiz?.category);
  const CategoryIcon = categoryTheme.icon;

  return (
    <div
      className={cn(
        "flex-1 flex flex-col w-full mx-auto transition-all",
        isPlayingActiveQuiz
          ? "max-w-6xl px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 h-[calc(100dvh-4.5rem)] sm:h-[calc(100dvh-5rem)] max-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-5rem)] overflow-hidden justify-between"
          : "max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      )}
    >
      {/* Top Segmented Mode Bar - hidden while in live gameplay so screen isn't wasted */}
      {!isPlayingActiveQuiz && (
        <div className="flex items-center justify-between mb-8 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={() => setMode("play")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${mode === "play"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              <span>{t.quiz.playArenaBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("create")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${mode === "create"
                ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-500/30"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              <span>{t.quiz.createStudioBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("host")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${mode === "host"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              <span>{language === "al" ? "Krijo një Lojë Live" : "Host Live Game"}</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          GAMEPLAY MODE
         ========================================================================= */}
      {mode === "play" && (
        <div className={cn("flex-1 flex flex-col", isPlayingActiveQuiz ? "h-full min-h-0 justify-between" : "justify-center")}>
          {loadingQuiz ? (
            <div className="text-center py-24 space-y-4">
              <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
              <p className="font-semibold text-zinc-600 dark:text-zinc-400">
                {language === "al" ? "Po ngarkohet arena..." : "Loading arena..."}
              </p>
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
                  {language === "al" ? "Kuizi Përfundoi!" : "Quiz Completed!"}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  {activeQuiz?.title || (language === "al" ? "Sfida Përfundoi" : "Challenge Finished")}
                </p>
              </div>

              {/* Score Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {language === "al" ? "Pikët Totale" : "Final Score"}
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
                    {user ? score.toLocaleString() : "0 pts"}
                  </p>
                  {!user && (
                    <span className="text-[10px] font-medium text-zinc-400 block mt-0.5">
                      {language === "al" ? "Pa pikë për mysafirët" : "No points for guests"}
                    </span>
                  )}
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {language === "al" ? "Saktësia" : "Accuracy"}
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1">
                    {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}%
                  </p>
                  <span className="text-[10px] font-medium text-zinc-400 block mt-0.5">
                    {correctCount}/{totalQuestions} {language === "al" ? "të sakta" : "correct"}
                  </span>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {language === "al" ? "Seria Maksimale" : "Max Streak"}
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-red-500 mt-1">
                    🔥 {maxStreak}x
                  </p>
                  <span className="text-[10px] font-medium text-zinc-400 block mt-0.5">
                    {language === "al" ? "Rresht të sakta" : "In a row"}
                  </span>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {language === "al" ? "Bonus Kuizi" : "Quiz Bonus"}
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-blue-500 mt-1">
                    {user ? `+${earnedCompletionBonus}` : "0 pts"}
                  </p>
                  <span className="text-[10px] font-medium text-zinc-400 block mt-0.5">
                    {user
                      ? (language === "al" ? "Përfundim me sukses" : "Completion bonus")
                      : (language === "al" ? "Kërkohet hyrja" : "Sign in required")}
                  </span>
                </div>
              </div>

              {!user && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {language === "al"
                      ? "Pikët nuk ruhen për vizitorët. Hyni për të fituar pikë, krijuar seri dhe garuar në Renditje!"
                      : "Points are not awarded to guests for completing quizzes. Sign in to earn points, build streaks, and race on the Leaderboard!"}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => openAuthModal("signup")}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5"
                  >

                    <span>{language === "al" ? "Hyni për të Fituar Pikë" : "Sign In to Earn Points"}</span>
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button
                  size="lg"
                  onClick={resetGame}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{language === "al" ? "Luaj Përsëri" : "Play Again"}</span>
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/leaderboard")}
                    className="w-full sm:w-auto font-bold gap-2 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  >
                    <Trophy className="h-4 w-4 fill-amber-500/20" />
                    <span>{language === "al" ? "Shiko Renditjen 🏆" : "View Leaderboard 🏆"}</span>
                  </Button>
                )}
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
                  <span>{language === "al" ? "Zgjidh një Kuiz Tjetër" : "Choose Another Quiz"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-auto"
                >
                  {language === "al" ? "Kthehu te Paneli" : "Back to Dashboard"}
                </Button>
              </div>
            </motion.div>
          ) : currentQ ? (
            /* ================= Active Question Gameplay ================= */
            <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 sm:gap-3.5 h-full">
              {/* Question Header & Progress Bar Group */}
              <div className="shrink-0 flex flex-col gap-1.5 sm:gap-2">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-zinc-900 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  {/* Left: Question counter + Exit button */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-black text-xs sm:text-sm">
                      {currentQuestionIdx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-zinc-500 shrink-0">
                      <span className="hidden sm:inline">
                        {language === "al" ? `nga ${totalQuestions} Pyetje` : `of ${totalQuestions} Questions`}
                      </span>
                      <span className="sm:hidden">/{totalQuestions}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setActiveQuiz(null);
                        router.replace("/quiz");
                      }}
                      className="text-xs font-semibold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:underline ml-0.5 sm:ml-1 cursor-pointer shrink-0"
                      title={language === "al" ? "Dil nga Kuizi" : "Exit Quiz"}
                    >
                      <span className="hidden sm:inline">{language === "al" ? "← Ndrysho Kuizin" : "← Change Quiz"}</span>
                      <span className="sm:hidden">{language === "al" ? "✕ Dil" : "✕ Exit"}</span>
                    </button>
                  </div>

                  {/* Center: Animated Timer */}
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 shadow-inner shrink-0">
                    <Timer
                      className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${timeLeft <= 5
                        ? "text-red-600 animate-ping"
                        : timeLeft <= 10
                          ? "text-amber-500"
                          : "text-emerald-600"
                        }`}
                    />
                    <span
                      className={`text-base sm:text-xl md:text-2xl font-black tabular-nums ${timeLeft <= 5 ? "text-red-600 font-extrabold animate-pulse" : ""
                        }`}
                    >
                      {timeLeft}s
                    </span>
                  </div>

                  {/* Right: Next button or Points */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {isAnswerRevealed ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {lastAnswerResult && (
                          <span
                            className={cn(
                              "px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-black flex items-center gap-1 border animate-in zoom-in-90 duration-150 shrink-0",
                              lastAnswerResult.correct
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                                : "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40"
                            )}
                          >
                            {lastAnswerResult.correct ? (
                              <>
                                <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>{user && lastAnswerResult.points ? `+${lastAnswerResult.points}` : (language === "al" ? "Saktë" : "Correct")}</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>{language === "al" ? "Pasaktë" : "Wrong"}</span>
                              </>
                            )}
                          </span>
                        )}
                        <Button
                          size="sm"
                          onClick={handleNextQuestion}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm px-2.5 sm:px-4 py-1 sm:py-1.5 h-7 sm:h-8 rounded-lg sm:rounded-xl shadow-md shadow-blue-500/25 animate-pulse cursor-pointer shrink-0"
                        >
                          <span>
                            {currentQuestionIdx + 1 === totalQuestions
                              ? (language === "al" ? "Podiumi 🏆" : "Podium 🏆")
                              : (language === "al" ? "Tjetra →" : "Next →")}
                          </span>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-200 dark:border-amber-900 shrink-0">
                          <Zap className="h-3.5 w-3.5 fill-amber-500 shrink-0" />
                          <span>{user ? `${score} pts` : "0 pts"}</span>
                        </div>
                        {streak > 1 && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1.5 rounded-full border border-red-200 shrink-0">
                            <Flame className="h-3.5 w-3.5 fill-red-500 shrink-0" /> {streak}x
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 sm:h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Text & Thematic Category Canvas Card */}
              <motion.div
                key={currentQuestionIdx}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={cn(
                  "relative flex-1 min-h-[96px] max-h-[36vh] md:max-h-none flex flex-col items-center justify-center p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-lg text-center overflow-hidden border backdrop-blur-xl transition-all duration-300",
                  categoryTheme.gradientBg,
                  timeLeft <= 5 ? categoryTheme.borderUrgent : categoryTheme.borderNormal
                )}
              >
                {/* Ambient Category Glow Orbs */}
                <div
                  className={cn(
                    "absolute -top-12 -left-12 w-44 h-44 rounded-full blur-3xl opacity-40 dark:opacity-30 pointer-events-none bg-gradient-to-br",
                    categoryTheme.glowClass
                  )}
                />
                <div
                  className={cn(
                    "absolute -bottom-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-35 dark:opacity-25 pointer-events-none bg-gradient-to-tl",
                    categoryTheme.glowClass
                  )}
                />

                {/* Thematic SVG Watermark in background */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-transform duration-700 ease-out",
                    categoryTheme.watermarkColor
                  )}
                  style={{ transform: "rotate(-5deg) scale(1.05)" }}
                >
                  {categoryTheme.renderWatermark()}
                </div>

                {/* Sleek Category Tag + Points Pill Header */}
                <div className="relative z-10 mb-2 sm:mb-3 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black border shadow-sm backdrop-blur-md",
                      categoryTheme.badgeStyle
                    )}
                  >
                    <CategoryIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span>
                      {language === "al" ? categoryTheme.nameAl : categoryTheme.nameEn}
                    </span>
                  </div>

                  <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />

                  <div className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700/70 shadow-sm backdrop-blur-md">
                    <span>
                      {user
                        ? `⚡ ${currentQ.points || 1000} pts`
                        : (language === "al" ? "⚡ Luaj pa pikë" : "⚡ Practice (No points)")}
                    </span>
                  </div>
                </div>

                {/* Optional Media (GIF/Image placeholder) if present */}
                {currentQ.media_url && (
                  <div className="relative z-10 h-20 sm:h-32 md:h-44 max-h-[15vh] md:max-h-[22vh] w-auto max-w-lg mx-auto overflow-hidden rounded-xl sm:rounded-2xl mb-2 sm:mb-3 shadow-md shrink-1 border border-white/20 dark:border-white/10">
                    <img
                      src={currentQ.media_url}
                      alt="Question Visual Media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Question Text */}
                <h2 className="relative z-10 text-base sm:text-xl lg:text-[1.75rem] font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-3 sm:line-clamp-4 drop-shadow-sm max-w-3xl mx-auto">
                  {currentQ.question_text}
                </h2>
              </motion.div>

              {/* 4 Interactive Kahoot Options (Red ▲, Blue ◆, Yellow ●, Green ■) */}
              {/* Uses 2x2 grid on ALL screen sizes for instant thumb reachability without scrolling */}
              <div className="shrink-0 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-3.5">
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
                        whileHover={!isAnswerRevealed ? { scale: 1.015 } : {}}
                        whileTap={!isAnswerRevealed ? { scale: 0.985 } : {}}
                        onClick={() => handleSelectOption(option)}
                        className={`relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl text-left font-bold transition-all shadow-md select-none cursor-pointer disabled:cursor-default min-h-[48px] sm:min-h-[56px] lg:min-h-[62px] ${kahootStyles[option.color]
                          } ${isAnswerRevealed && !option.is_correct
                            ? "opacity-35 grayscale"
                            : ""
                          } ${showCorrect ? "ring-4 ring-emerald-400 scale-[1.015] shadow-2xl" : ""}`}
                      >
                        <span className="text-base sm:text-xl font-black opacity-80 shrink-0">
                          {shapeIcons[option.shape]}
                        </span>
                        <span className="flex-1 leading-snug line-clamp-2 text-xs sm:text-base font-bold">
                          {option.text}
                        </span>

                        {/* Revealed Status Icon */}
                        {showCorrect && (
                          <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white shrink-0" />
                        )}
                        {showWrong && (
                          <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Reveal Controls with Auto-Advance Feedback */}
                {isAnswerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-1.5 sm:p-2 px-3 sm:px-4 bg-zinc-100 dark:bg-zinc-800/90 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        {currentQuestionIdx + 1 === totalQuestions
                          ? "Quiz finished! Loading..."
                          : "Next in 2s..."}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleNextQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1 sm:gap-2 shadow-md active:scale-95 text-xs sm:text-sm px-3 sm:px-4 py-1 h-7 sm:h-8 cursor-pointer"
                    >
                      <span>{currentQuestionIdx + 1 === totalQuestions ? "Podium 🏆" : "Skip →"}</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            /* ================= Quiz Selection Lobby ================= */
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    {language === "al" ? "Zgjidhni një Kuiz për të Luajtur" : "Choose a Quiz to Play"}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {language === "al"
                      ? "Zgjidhni një sfidë zyrtare të Quizemia ose një kuiz të komunitetit në 3 gjuhë (EN, AL, MK)."
                      : "Select an official Quizemia challenge or a community creation in 3 languages (EN, AL, MK)."}
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder={t.dashboard.searchPlaceholder}
                    value={lobbySearch}
                    onChange={(e) => setLobbySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Lobby Source & Category Filter Tabs */}
              <div className="flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                {/* Top Row: Source Filters (All / Official / Community) and Language Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setLobbyFilter("all")}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${lobbyFilter === "all"
                        ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                    >
                      {t.dashboard.filterAll} ({availableQuizzes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLobbyFilter("default")}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${lobbyFilter === "default"
                        ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                    >
                      {t.dashboard.filterOfficial} ({availableQuizzes.filter((q) => q.creator_email === "Quizemia Official" || DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === q.id)).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLobbyFilter("community")}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${lobbyFilter === "community"
                        ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                    >
                      👥 {t.dashboard.filterCommunity} ({availableQuizzes.filter((q) => q.creator_email !== "Quizemia Official" && !DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === q.id)).length})
                    </button>
                  </div>

                  {/* Language Filter Pills */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-zinc-500 shrink-0 flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{language === "al" ? "Filtro sipas gjuhës:" : "Filter by Language:"}</span>
                    </span>
                    <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setLobbyLanguageFilter("all")}
                        className={cn(
                          "px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap",
                          lobbyLanguageFilter === "all"
                            ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                        {language === "al" ? "Të gjitha" : "All"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLobbyLanguageFilter("en")}
                        className={cn(
                          "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1",
                          lobbyLanguageFilter === "en"
                            ? "bg-blue-500 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                        <span>EN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLobbyLanguageFilter("al")}
                        className={cn(
                          "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1",
                          lobbyLanguageFilter === "al"
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                        <span>AL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLobbyLanguageFilter("mk")}
                        className={cn(
                          "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1",
                          lobbyLanguageFilter === "mk"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                      >
                        <span>MK</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Pills (Full-width flex-wrap so all categories are visible without scrolling) */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLobbyCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${lobbyCategory === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                    >
                      {t.categories[cat] || cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Available Quizzes */}
              {(() => {
                const filtered = availableQuizzes.filter((quiz) => {
                  const isDefault =
                    quiz.creator_email === "Quizemia Official" ||
                    DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === quiz.id);

                  if (lobbyFilter === "default" && !isDefault) return false;
                  if (lobbyFilter === "community" && isDefault) return false;

                  const quizLang = quiz.language || "en";
                  if (lobbyLanguageFilter !== "all" && quizLang !== lobbyLanguageFilter) return false;

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
                        {t.dashboard.noQuizzesFound}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 mb-5">
                        {t.dashboard.tryDifferentSearch}
                      </p>
                      <Button
                        onClick={() => setMode("create")}
                        className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold"
                      >
                        {t.dashboard.createNew}
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((quiz) => {
                      const isDefault =
                        quiz.creator_email === "Quizemia Official" ||
                        DEFAULT_PUBLIC_QUIZZES.some((d) => d.id === quiz.id);
                      const qCount = quiz.questions?.length || 3;
                      const quizLang = quiz.language || "en";

                      let authorNickname = quiz.creator_email?.trim() || "";
                      if (authorNickname.includes("@")) {
                        authorNickname = authorNickname.split("@")[0];
                      }
                      if (!authorNickname || authorNickname.toLowerCase() === "null") {
                        authorNickname = "Creator";
                      }

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
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-white/40">
                                  <Sparkles className="h-10 w-10" />
                                </div>
                              )}
                              <div className="absolute top-2.5 left-2.5">
                                <Badge variant="vibrant">{quiz.category || "General"}</Badge>
                              </div>
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
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
                                  {quizLang === "al" ? "Shqip" : quizLang === "mk" ? "MK" : "EN"}
                                </span>
                                {isDefault ? (
                                  <Badge className="bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm text-white border-0 text-[10px] font-bold gap-1 shadow-sm">

                                    <span>{language === "al" ? "Zyrtar" : "Official"}</span>
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-950/80 dark:bg-blue-900/80 backdrop-blur-sm text-blue-200 border border-blue-500/30 text-[10px] font-bold gap-1 shadow-sm max-w-[130px] truncate">
                                    <UserIcon className="h-3 w-3 text-blue-400 shrink-0" />
                                    <span className="truncate">@{authorNickname}</span>
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-base font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                {quiz.title}
                              </CardTitle>
                              <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                                {quiz.description || (language === "al" ? "Sfidë edukative interaktive." : "Interactive educational challenge.")}
                              </p>
                            </CardHeader>

                            <CardContent className="p-4 pt-1">
                              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                                    {qCount} {t.dashboard.questionsCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                                    ~{qCount * 20}s
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium truncate max-w-[120px]">
                                  {isDefault ? (
                                    <span className="text-amber-600 dark:text-amber-400 font-bold">Quizemia</span>
                                  ) : (
                                    <span className="text-blue-600 dark:text-blue-400 font-bold truncate">@{authorNickname}</span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </div>

                          <CardFooter className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-2 flex items-center gap-2">
                            <Button
                              onClick={() => startQuiz(quiz)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95"
                            >
                              <span>{t.dashboard.playNow}</span>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/live/host?quizId=${quiz.id}`)}
                              className="font-bold text-xs px-3 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title={language === "al" ? "Krijo lojë live me PIN" : "Host live game with PIN"}
                            >
                              {language === "al" ? "Krijo Lojë" : "Host"}                            </Button>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t.quiz.studioTitle}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {t.quiz.studioSubtitle}
              </p>
            </div>
            {!user && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>{t.quiz.guestNotice}</span>
              </div>
            )}
          </div>

          {/* Creation Tabs */}
          <Tabs value={creationTab} onValueChange={(v) => setCreationTab(v as "ai" | "manual")}>
            <TabsList className="grid grid-cols-2 max-w-md">
              <TabsTrigger value="ai" className="gap-2">
                <span>{t.quiz.aiTab}</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Layers className="h-4 w-4" />
                <span>{t.quiz.manualTab}</span>
              </TabsTrigger>
            </TabsList>

            {/* AI Generator Tab */}
            <TabsContent value="ai" className="space-y-6 pt-4">
              {aiGeneratedSuccess && questionsList.length > 0 ? (
                /* Generated Quiz Showcase Card */
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl border-2 border-amber-400/70 dark:border-amber-500/40 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 p-6 sm:p-8 shadow-xl shadow-amber-500/10 space-y-6 relative overflow-hidden"
                >
                  {/* Subtle ambient blur */}
                  <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-6">
                    {/* Header Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/60 dark:border-zinc-800 pb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 shrink-0">
                          <Sparkles className="h-7 w-7 fill-current animate-pulse" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>{language === "al" ? "Kuizi u Gjenerua me Sukses!" : "Quiz Generated Successfully!"}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1.5 tracking-tight">
                            {quizTitle || (language === "al" ? "Kuizi i Ri me AI" : "New AI Quiz")}
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-bold border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800 text-xs px-3 py-1">
                          {t.categories[quizCategory] || quizCategory}
                        </Badge>
                        <Badge className="font-bold bg-blue-600 text-white hover:bg-blue-600 text-xs px-3 py-1">
                          {quizLanguage === "al" ? "🇦🇱 Shqip" : quizLanguage === "mk" ? "🇲🇰 Македонски" : "🇬🇧 English"}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    {quizDescription && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic bg-white/60 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                        "{quizDescription}"
                      </p>
                    )}

                    {/* Source File indicator if applicable */}
                    {uploadedFile && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-amber-500/10 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-500/20">
                        <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate">
                          {language === "al" ? "Materiali burimor i ngarkuar:" : "Source study material:"} <strong>{uploadedFile.name}</strong> ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}

                    {/* Primary Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Play Now Button */}
                      <Button
                        type="button"
                        onClick={handlePlayCurrentQuiz}
                        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-extrabold text-base py-6 rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        <Play className="h-5 w-5 fill-current" />
                        <span>{language === "al" ? "Luaj Kuizin Tani" : "Play Quiz Now"}</span>
                      </Button>

                      {/* View / Edit Questions Button */}
                      <Button
                        type="button"
                        variant={showEditQuestions ? "default" : "outline"}
                        onClick={() => {
                          setShowEditQuestions((prev) => {
                            const next = !prev;
                            if (next) {
                              setTimeout(() => {
                                document.getElementById("quiz-questions-editor")?.scrollIntoView({ behavior: "smooth" });
                              }, 120);
                            }
                            return next;
                          });
                        }}
                        className={cn(
                          "border-2 font-bold text-sm py-6 rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all",
                          showEditQuestions
                            ? "border-amber-500 bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25"
                            : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        )}
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>
                          {showEditQuestions
                            ? (language === "al" ? "Fshih Redaktimin" : "Hide Questions")
                            : (language === "al" ? "Shiko / Modifiko Pyetjet" : "View / Edit Questions")}
                        </span>
                        <Badge
                          variant={showEditQuestions ? "outline" : "secondary"}
                          className={cn(
                            "ml-1 text-xs font-black",
                            showEditQuestions ? "bg-white/20 text-white border-white/40" : ""
                          )}
                        >
                          {questionsList.length}
                        </Badge>
                      </Button>

                      {/* Save to Library Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleInitiateSave}
                        disabled={isSavingQuiz}
                        className="border border-blue-300 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-sm py-6 rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                        <span>{language === "al" ? "Ruaj në Bibliotekë" : "Save to Library"}</span>
                      </Button>
                    </div>

                    {/* Collapsible Questions Preview */}
                    <details className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-4 transition-all">
                      <summary className="flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer select-none">
                        <span className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>{language === "al" ? "Shiko listën e plotë të pyetjeve" : "Quick glance at all question titles"} ({questionsList.length})</span>
                        </span>
                        <span className="text-zinc-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                      </summary>
                      <div className="mt-3.5 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                        {questionsList.map((q, idx) => {
                          const correctOpt = q.options?.find((o) => o.is_correct);
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 sm:mt-0">
                                  {idx + 1}
                                </span>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                  {q.question_text}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                {correctOpt && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                    <Check className="h-3 w-3" />
                                    <span>{correctOpt.text}</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-zinc-400 bg-zinc-200/60 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded">
                                  {q.time_limit || 20}s
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>

                    {/* Dedicated Edit Questions Toggle Prompt below Quick glance */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/30 dark:via-zinc-800/40 dark:to-transparent border border-amber-300/60 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/20 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Edit3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {language === "al"
                              ? "Dëshironi të ndryshoni ose shtoni pyetje?"
                              : "Want to edit, modify, or add questions?"}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {language === "al"
                              ? (showEditQuestions
                                ? "Redaktuesi i pyetjeve është i hapur më poshtë."
                                : "Kliko këtu për të hapur listën e plotë të pyetjeve dhe për t'i redaktuar.")
                              : (showEditQuestions
                                ? "Question editor is active and shown below."
                                : "Click here to reveal and edit each question, choices, and timer.")}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => {
                          setShowEditQuestions((prev) => {
                            const next = !prev;
                            if (next) {
                              setTimeout(() => {
                                document.getElementById("quiz-questions-editor")?.scrollIntoView({ behavior: "smooth" });
                              }, 120);
                            }
                            return next;
                          });
                        }}
                        className={cn(
                          "w-full sm:w-auto font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0",
                          showEditQuestions
                            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25"
                        )}
                      >
                        {showEditQuestions ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>{language === "al" ? "Fshih Redaktimin e Pyetjeve" : "Hide Question Editor"}</span>
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>{language === "al" ? "Modifiko Pyetjet me Detaje" : "Edit the Questions"}</span>
                            <span className="text-[10px] bg-black/20 dark:bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
                              {questionsList.length}
                            </span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Reset / Generate Another */}
                    <div className="pt-2 flex items-center justify-between border-t border-amber-200/50 dark:border-zinc-800 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAiGeneratedSuccess(false);
                          setShowEditQuestions(false);
                        }}
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>{language === "al" ? "Gjenero një kuiz tjetër me AI" : "Generate another quiz with AI"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCreationTab("manual");
                          setShowEditQuestions(true);
                        }}
                        className="font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{language === "al" ? "Shko te redaktimi manual" : "Go to manual editor"}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <Card className="border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-950/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">

                      <span>{t.quiz.aiTitle}</span>
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-zinc-500">
                      {t.quiz.aiSubtitle}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Language Selector for AI Generation */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <span>{language === "al" ? "Gjuha e Kuizit të Gjeneruar" : "Quiz Generation Language"}</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuizLanguage("en")}
                          className={cn(
                            "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            quizLanguage === "en"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm ring-2 ring-blue-500/20"
                              : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <span>{language === "al" ? "Anglisht" : "English"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizLanguage("al")}
                          className={cn(
                            "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            quizLanguage === "al"
                              ? "border-red-500 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 shadow-sm ring-2 ring-red-500/20"
                              : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <span>Shqip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizLanguage("mk")}
                          className={cn(
                            "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            quizLanguage === "mk"
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/20"
                              : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <span>Македонски</span>
                        </button>
                      </div>
                    </div>

                    {/* Question Quantity / Count Selection */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Layers className="h-4 w-4 text-amber-500" />
                          <span>{language === "al" ? "Sasia e Pyetjeve" : "Question Quantity"}</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuestionCountMode("auto")}
                          className={cn(
                            "flex flex-col items-center justify-center py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            questionCountMode === "auto"
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/20"
                              : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {language === "al" ? "Automatik" : "Auto (Smart)"}
                          </span>
                          <span className="text-[10px] font-normal text-zinc-400">{language === "al" ? "Sipas gjatësisë" : "Adapts to info"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionCountMode("5")}
                          className={cn(
                            "flex flex-col items-center justify-center py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            questionCountMode === "5"
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/20"
                              : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <span>5 {language === "al" ? "Pyetje" : "Questions"}</span>
                          <span className="text-[10px] font-normal text-zinc-400">{language === "al" ? "I shpejtë" : "Quick test"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionCountMode("10")}
                          className={cn(
                            "flex flex-col items-center justify-center py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            questionCountMode === "10"
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/20"
                              : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <span>10 {language === "al" ? "Pyetje" : "Questions"}</span>
                          <span className="text-[10px] font-normal text-zinc-400">{language === "al" ? "Standard" : "Standard"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionCountMode("max")}
                          className={cn(
                            "flex flex-col items-center justify-center py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            questionCountMode === "max"
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/20"
                              : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <span>{language === "al" ? "Maksimumi" : "Max Questions"}</span>
                          <span className="text-[10px] font-normal text-zinc-400">{language === "al" ? "Gjithë materiali" : "All key points"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        {language === "al" ? "Tema ose Udhëzimi i Kuizit" : "Quiz Subject or Prompt"}
                      </label>
                      {(() => {
                        const promptSafety = checkProfanity(aiPrompt);
                        return (
                          <div>
                            <Input
                              type="text"
                              placeholder={t.quiz.topicPlaceholder}
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                              className={cn(!promptSafety.isSafe && "border-red-500 focus-visible:ring-red-500 text-red-700 dark:text-red-400")}
                            />
                            {!promptSafety.isSafe && (
                              <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                <span>{language === "al" ? promptSafety.messageAl : promptSafety.messageEn}</span>
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Upload Dropzone UI (Supports Word, PowerPoint, PDF, Images) */}
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        {t.quiz.uploadNotes}
                      </label>
                      <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:border-amber-500 cursor-pointer transition-all text-center relative group">
                        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 mb-3 group-hover:scale-110 transition-transform">
                          {uploadedFile ? (
                            <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          {uploadedFile
                            ? uploadedFile.name
                            : (language === "al" ? "Kliko ose lësho dokumentin këtu" : "Click or drop your study file here")}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                          {language === "al"
                            ? "Mbështet Word (.docx), PowerPoint (.pptx), PDF, dhe Foto (PNG, JPG)"
                            : "Supports Word (.docx), PowerPoint (.pptx), PDF, and Images (PNG, JPG)"}
                        </span>
                        {uploadedFile && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-sm">
                            <span>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setUploadedFile(null);
                                setUploadedImageName(null);
                              }}
                              className="hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                              title={language === "al" ? "Hiq skedarin" : "Remove file"}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*,.pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const fileCheck = checkProfanity(file.name);
                              if (!fileCheck.isSafe) {
                                toast({
                                  title: language === "al" ? "Skedar i Ndaluar" : "Prohibited File",
                                  description:
                                    language === "al"
                                      ? `Emri i skedarit përmban fjalë të papërshtatshme ("${fileCheck.flaggedWord}"). Ju lutem ngarkoni vetëm materiale edukative.`
                                      : `File name contains inappropriate language ("${fileCheck.flaggedWord}"). Please upload only clean educational files.`,
                                  type: "error",
                                });
                                e.target.value = "";
                                return;
                              }
                              setUploadedFile(file);
                              setUploadedImageName(file.name);
                              toast({
                                title: language === "al" ? "Dokumenti u Bashkëngjit" : "File Attached",
                                description: `${file.name} ${language === "al" ? "gati për analizë me AI" : "ready for AI analysis"}`,
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
                          {t.quiz.generating}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {t.quiz.generateButton}
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Manual Editor Tab */}
            <TabsContent value="manual" className="space-y-6 pt-4">
              {questionsList.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-300 dark:border-amber-700/60 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        {language === "al" ? "Kuizi i Gatshëm për Lojë" : "Quiz Ready to Play"}
                      </div>
                      <div className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                        {quizTitle || (language === "al" ? "Kuizi i Ri" : "New Quiz")} ({questionsList.length} {language === "al" ? "pyetje" : "questions"})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handlePlayCurrentQuiz}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{language === "al" ? "Luaj Tani" : "Play Now"}</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleInitiateSave}
                      disabled={isSavingQuiz}
                      className="border-zinc-300 dark:border-zinc-700 font-bold gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{language === "al" ? "Ruaj" : "Save"}</span>
                    </Button>
                  </div>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    {language === "al" ? "Detajet e Kuizit" : "Quiz Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        {t.quiz.quizTitleLabel} *
                      </label>
                      {(() => {
                        const titleSafety = checkProfanity(quizTitle);
                        return (
                          <div>
                            <Input
                              type="text"
                              placeholder={t.quiz.quizTitlePlaceholder}
                              value={quizTitle}
                              onChange={(e) => setQuizTitle(e.target.value)}
                              className={cn(!titleSafety.isSafe && "border-red-500 focus-visible:ring-red-500 text-red-700 dark:text-red-400")}
                            />
                            {!titleSafety.isSafe && (
                              <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>{language === "al" ? titleSafety.messageAl : titleSafety.messageEn}</span>
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        {t.quiz.quizCategoryLabel}
                      </label>
                      <select
                        value={quizCategory}
                        onChange={(e) => setQuizCategory(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium"
                      >
                        <option value="General">{t.categories["General"] || "General"}</option>
                        <option value="Science">{t.categories["Science"] || "Science"}</option>
                        <option value="Geography">{t.categories["Geography"] || "Geography"}</option>
                        <option value="Technology">{t.categories["Technology"] || "Technology"}</option>
                        <option value="History">{t.categories["History"] || "History"}</option>
                        <option value="Pop Culture">{t.categories["Pop Culture"] || "Pop Culture"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                        {t.common.language}
                      </label>
                      <select
                        value={quizLanguage}
                        onChange={(e) => setQuizLanguage(e.target.value as QuizLanguage)}
                        className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-semibold"
                      >
                        <option value="en">🇬🇧 English</option>
                        <option value="al">🇦🇱 Shqip (Albanian)</option>
                        <option value="mk">🇲🇰 Македонски (Macedonian)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      {t.quiz.quizDescLabel}
                    </label>
                    {(() => {
                      const descSafety = checkProfanity(quizDescription);
                      return (
                        <div>
                          <Input
                            type="text"
                            placeholder={t.quiz.quizDescPlaceholder}
                            value={quizDescription}
                            onChange={(e) => setQuizDescription(e.target.value)}
                            className={cn(!descSafety.isSafe && "border-red-500 focus-visible:ring-red-500 text-red-700 dark:text-red-400")}
                          />
                          {!descSafety.isSafe && (
                            <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              <span>{language === "al" ? descSafety.messageAl : descSafety.messageEn}</span>
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Public / Private Toggle (Only relevant for registered users with saved quizzes) */}
                  {user ? (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {isPublic ? (
                            <Globe className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-zinc-400" />
                          )}
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {isPublic
                              ? (language === "al" ? "Kuiz Publik (I dukshëm në Arenë)" : "Public Quiz (Visible in Arena)")
                              : (language === "al" ? "Kuiz Privat (Vetëm me Lidhje Direkte)" : "Private Quiz (Direct Link Only)")}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          {isPublic
                            ? (language === "al"
                              ? "Çdokush në panel mund ta zbulojë dhe luajë këtë kuiz."
                              : "Anyone on the dashboard can discover and play this quiz.")
                            : (language === "al"
                              ? "Vetëm ju dhe lojtarët me lidhjen tuaj unike mund të hapin këtë kuiz."
                              : "Only you and players with your unique link can access this quiz.")}
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
                  ) : (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs">

                      <span>
                        {language === "al"
                          ? "Modaliteti Vizitor: Kuizet e krijuara luhen menjëherë në këtë sesion dhe nuk ruhen përgjithmonë në bibliotekë."
                          : "Guest Mode: Created quizzes are played immediately in this session and will not be saved permanently to your library."}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Question Review & Save Section (Optional in AI mode, toggleable via Edit buttons) */}
          {(creationTab === "manual" || showEditQuestions) && (
            <motion.div
              id="quiz-questions-editor"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-24"
            >
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>{language === "al" ? "Pyetjet e Kuizit" : "Quiz Questions"}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {questionsList.length}
                    </Badge>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {language === "al"
                      ? "Mund të modifikoni pyetjet, alternativat, kohën, ose të shtoni pyetje të reja."
                      : "Customize questions, choices, timer, or add new questions."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {creationTab === "ai" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditQuestions(false)}
                      className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1.5 cursor-pointer"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>{language === "al" ? "Fshih Redaktimin" : "Hide Editor"}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const randCorrectIdx = Math.floor(Math.random() * 4);
                      setQuestionsList([
                        ...questionsList,
                        {
                          question_text: language === "al" ? `Pyetje e re ${questionsList.length + 1}` : `New Question ${questionsList.length + 1}`,
                          time_limit: 20,
                          points: 1000,
                          order_index: questionsList.length,
                          options: [
                            { id: "a", text: language === "al" ? "Përgjigjja 1" : "Answer 1", is_correct: randCorrectIdx === 0, color: "red", shape: "triangle" },
                            { id: "b", text: language === "al" ? "Përgjigjja 2" : "Answer 2", is_correct: randCorrectIdx === 1, color: "blue", shape: "diamond" },
                            { id: "c", text: language === "al" ? "Përgjigjja 3" : "Answer 3", is_correct: randCorrectIdx === 2, color: "yellow", shape: "circle" },
                            { id: "d", text: language === "al" ? "Përgjigjja 4" : "Answer 4", is_correct: randCorrectIdx === 3, color: "green", shape: "square" },
                          ],
                        },
                      ]);
                    }}
                    className="gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{language === "al" ? "Shto Pyetje" : "Add Question"}</span>
                  </Button>
                </div>
              </div>

              {questionsList.map((q, qIndex) => {
                const qSafety = checkProfanity(q.question_text);
                const hasOptionViolation = q.options.some((opt) => !checkProfanity(opt.text).isSafe);
                const isCardFlagged = !qSafety.isSafe || hasOptionViolation;

                return (
                  <Card
                    key={qIndex}
                    className={cn(
                      "p-5 transition-colors border",
                      isCardFlagged
                        ? "border-red-500/60 bg-red-500/[0.03] dark:bg-red-950/[0.15]"
                        : "border-zinc-200 dark:border-zinc-800"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          {language === "al" ? "Pyetja" : "Question"} #{qIndex + 1}
                        </span>
                        {isCardFlagged && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>{language === "al" ? "Fjalë e ndaluar" : "Prohibited word"}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs font-semibold text-zinc-500">
                          {language === "al" ? "Koha" : "Time"}: {q.time_limit}s
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...questionsList];
                            const rawOpts = [...updated[qIndex].options];
                            for (let i = rawOpts.length - 1; i > 0; i--) {
                              const j = Math.floor(Math.random() * (i + 1));
                              [rawOpts[i], rawOpts[j]] = [rawOpts[j], rawOpts[i]];
                            }
                            const SHAPE_CONFIG = [
                              { id: "a", color: "red", shape: "triangle" },
                              { id: "b", color: "blue", shape: "diamond" },
                              { id: "c", color: "yellow", shape: "circle" },
                              { id: "d", color: "green", shape: "square" },
                            ] as const;
                            updated[qIndex].options = rawOpts.map((opt, oIdx) => ({
                              ...opt,
                              id: SHAPE_CONFIG[oIdx].id,
                              color: SHAPE_CONFIG[oIdx].color,
                              shape: SHAPE_CONFIG[oIdx].shape,
                            }));
                            setQuestionsList(updated);
                            toast({
                              title: language === "al" ? "Opsionet u Përzien! 🔀" : "Answers Shuffled! 🔀",
                              description: language === "al" ? "Pozicionet e përgjigjeve u ndërruan rastësisht." : "Option positions randomized.",
                              type: "info",
                              duration: 1500,
                            });
                          }}
                          className="text-zinc-400 hover:text-amber-500 transition-colors p-1 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                          title={language === "al" ? "Përziej renditjen e opsioneve" : "Shuffle option positions"}
                        >
                          <Shuffle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{language === "al" ? "Përziej" : "Shuffle"}</span>
                        </button>
                        {questionsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuestionsList(questionsList.filter((_, idx) => idx !== qIndex));
                            }}
                            className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            title={language === "al" ? "Fshij këtë pyetje" : "Delete this question"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Input
                        type="text"
                        placeholder={language === "al" ? "Shkruani tekstin e pyetjes..." : "Enter question text..."}
                        value={q.question_text}
                        onChange={(e) => {
                          const updated = [...questionsList];
                          updated[qIndex].question_text = e.target.value;
                          setQuestionsList(updated);
                        }}
                        className={cn(
                          "font-bold text-base mb-2",
                          !qSafety.isSafe && "border-red-500 focus-visible:ring-red-500 text-red-700 dark:text-red-400"
                        )}
                      />
                      {!qSafety.isSafe && (
                        <p className="text-xs text-red-500 font-bold mb-3 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>{language === "al" ? qSafety.messageAl : qSafety.messageEn}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIndex) => {
                        const optSafety = checkProfanity(opt.text);
                        return (
                          <div
                            key={opt.id}
                            className={`flex items-center gap-2 p-3 rounded-xl border ${!optSafety.isSafe
                              ? "border-red-500 bg-red-50/60 dark:bg-red-950/30"
                              : opt.is_correct
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
                              title={language === "al" ? "Shënoje si përgjigje të saktë" : "Mark as correct answer"}
                            />
                            <div className="flex-1 flex flex-col gap-0.5">
                              <Input
                                type="text"
                                placeholder={language === "al" ? `Opsioni ${opt.id.toUpperCase()}` : `Option ${opt.id.toUpperCase()}`}
                                value={opt.text}
                                onChange={(e) => {
                                  const updated = [...questionsList];
                                  updated[qIndex].options[optIndex].text = e.target.value;
                                  setQuestionsList(updated);
                                }}
                                className={cn(
                                  "h-9 text-xs sm:text-sm",
                                  !optSafety.isSafe && "border-red-500 focus-visible:ring-red-500 text-red-700 dark:text-red-400"
                                )}
                              />
                              {!optSafety.isSafe && (
                                <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-0.5">
                                  <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                                  <span>{language === "al" ? optSafety.messageAl : optSafety.messageEn}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-zinc-400 uppercase w-6 text-center">
                              {opt.id}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}

              {/* Content safety warning banner if any part violates moderation */}
              {(() => {
                const totalSafety = validateQuizContent(quizTitle, quizDescription, questionsList);
                if (!totalSafety.isSafe) {
                  return (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                      <span>
                        {language === "al"
                          ? `Vërejtje Sigurie: ${totalSafety.messageAl || "Përmbajtja përmban fjalë të papërshtatshme."} Ju lutem pastroni fjalët e theksuara para se ta ruani ose ta luani.`
                          : `Safety Warning: ${totalSafety.messageEn || "Quiz contains prohibited words."} Please fix flagged terms before saving or playing.`}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Save & Play CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                {!user ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>
                      {language === "al" ? (
                        <>
                          Modaliteti Vizitor: Ky kuiz do të luhet në këtë sesion, por nuk do të ruhet pasi të dilni.{" "}
                          <button
                            type="button"
                            onClick={() => openAuthModal("login")}
                            className="underline font-bold hover:text-amber-700"
                          >
                            Hyni për ta ruajtur
                          </button>
                          .
                        </>
                      ) : (
                        <>
                          Guest Mode: This quiz will play in this session, but won&apos;t be saved after you leave.{" "}
                          <button
                            type="button"
                            onClick={() => openAuthModal("login")}
                            className="underline font-bold hover:text-amber-700"
                          >
                            Sign in to save it
                          </button>
                          .
                        </>
                      )}
                    </span>
                  </p>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {creationTab === "ai" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setShowEditQuestions(false)}
                      className="cursor-pointer"
                    >
                      <span>{language === "al" ? "Mbyll Redaktimin" : "Close Editor"}</span>
                    </Button>
                  )}
                  <Button
                    size="lg"
                    onClick={handleInitiateSave}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-8 shadow-lg active:scale-95 w-full sm:w-auto shrink-0 cursor-pointer"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      {user
                        ? (language === "al" ? "Ruaj & Luaj Kuizin" : "Save & Play Quiz")
                        : (language === "al" ? "Luaj Kuizin (Vizitor)" : "Play Quiz (Guest)")}
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* =========================================================================
          HOST LIVE GAME SELECTION CONTAINER
         ========================================================================= */}
      {mode === "host" && (
        <div className="flex-1 space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {language === "al" ? "Krijo një Lojë Live" : "Host a Live Game"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
                {language === "al"
                  ? "Zgjidhni një kuiz për të gjeneruar PIN-in dhe për të ftuar pjesëmarrësit në kohë reale."
                  : "Select a quiz to generate your game PIN and host participants in real time."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMode("create");
                  setCreationTab("ai");
                }}
                className="font-bold text-xs cursor-pointer"
              >
                {language === "al" ? "Krijo me AI" : "Create with AI"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMode("create");
                  setCreationTab("manual");
                }}
                className="font-bold text-xs cursor-pointer"
              >
                {language === "al" ? "Krijo Manualisht" : "Create Manually"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold mb-1">
                    <span>{quiz.category}</span>
                    <span>{quiz.questions?.length || 0} Qs</span>
                  </div>
                  <CardTitle className="text-base font-bold line-clamp-1">
                    {quiz.title}
                  </CardTitle>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                    {quiz.description || "Live challenge."}
                  </p>
                </CardHeader>
                <CardFooter className="p-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    onClick={() => router.push(`/live/host?quizId=${quiz.id}`)}
                    className="w-full font-bold text-xs bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer"
                  >
                    {language === "al" ? "Fillo Lojë me PIN" : "Launch with PIN"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================= Publish Preference Question Modal (Signed-in Users Only) ================= */}
      {user && (
        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogContent className="max-w-lg p-6 sm:p-7">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2.5">

                <DialogTitle className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {language === "al" ? "Publikoni Kuizin Tuaj" : "Publish Your Quiz"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200 leading-normal pt-1">
                {language === "al"
                  ? "Dëshironi ta publikoni këtë kuiz në arenë që të gjithë të luajnë, apo ta mbani privat vetëm me lidhje?"
                  : "Do you want to publish this quiz so anyone else can play, or do you want to keep it private?"}
              </DialogDescription>
            </DialogHeader>

            {/* Quiz Summary Pill */}
            <div className="my-2 p-3 sm:p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {language === "al" ? "Kuizi është gati" : "Quiz Ready"}
                </p>
                <p className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                  {quizTitle || (language === "al" ? "Kuiz pa Titull" : "Untitled Quiz")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="secondary" className="text-xs font-bold">
                  {quizCategory}
                </Badge>
                <Badge variant="outline" className="text-xs font-bold">
                  {quizLanguage === "al" ? "🇦🇱 AL" : quizLanguage === "mk" ? "🇲🇰 MK" : "🇬🇧 EN"}
                </Badge>
                <Badge variant="outline" className="text-xs font-bold">
                  {questionsList.length} Qs
                </Badge>
              </div>
            </div>

            {/* 2 Interactive Choice Cards */}
            <div className="space-y-3 py-1">
              {/* Public Option */}
              <div
                onClick={() => setIsPublic(true)}
                className={cn(
                  "group relative flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                  isPublic
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-md"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isPublic
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700"
                  )}
                >
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{language === "al" ? "Publiko Publikisht" : "Publish Publicly"}</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        Arena
                      </span>
                    </span>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isPublic ? "border-emerald-600 bg-emerald-600 text-white" : "border-zinc-300 dark:border-zinc-600"
                      )}
                    >
                      {isPublic && <CheckCircle className="h-4 w-4" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {language === "al"
                      ? `Çdokush në Quizemia mund ta zbulojë dhe luajë këtë kuiz në Arenën publike. Do të shfaqet me autorin tuaj: @${user?.user_metadata?.nickname ||
                      user?.user_metadata?.name ||
                      user?.user_metadata?.display_name ||
                      (user?.email ? user.email.split("@")[0] : "Quizemia Creator")
                      }.`
                      : `Anyone on Quizemia can discover and play this quiz in the public Arena. It will be published under your nickname: @${user?.user_metadata?.nickname ||
                      user?.user_metadata?.name ||
                      user?.user_metadata?.display_name ||
                      (user?.email ? user.email.split("@")[0] : "Quizemia Creator")
                      }.`}
                  </p>
                </div>
              </div>

              {/* Private Option */}
              <div
                onClick={() => setIsPublic(false)}
                className={cn(
                  "group relative flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                  !isPublic
                    ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-600/20 shadow-md"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    !isPublic
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700"
                  )}
                >
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{language === "al" ? "Mbaje Privat" : "Keep it Private"}</span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                        {language === "al" ? "Vetëm me Lidhje" : "Link Only"}
                      </span>
                    </span>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                        !isPublic ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 dark:border-zinc-600"
                      )}
                    >
                      {!isPublic && <CheckCircle className="h-4 w-4" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {language === "al"
                      ? "Vetëm ju dhe njerëzit me lidhjen tuaj direkte mund ta luajnë. Nuk shfaqet në kërkimet publike."
                      : "Only you and people with your direct quiz link will be able to play. Hidden from public searches."}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPublishDialogOpen(false)}
                className="w-full sm:w-auto text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {language === "al" ? "Kthehu te Ndryshimi" : "Back to Editing"}
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSavingQuiz}
                  onClick={() => handleConfirmSave(isPublic, true)}
                  className="w-full sm:w-auto font-bold text-xs sm:text-sm border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  {language === "al" ? "Ruaj & Fillo Lojë Live (PIN)" : "Save & Host Live (PIN)"}
                </Button>
                <Button
                  type="button"
                  disabled={isSavingQuiz}
                  onClick={() => handleConfirmSave(isPublic, false)}
                  className={cn(
                    "w-full sm:w-auto font-black text-white px-6 py-2 rounded-xl shadow-lg active:scale-95 transition-all gap-2 cursor-pointer",
                    isPublic
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25"
                  )}
                >
                  {isSavingQuiz ? (
                    <span>{language === "al" ? "Po ruhet kuizi..." : "Saving Quiz..."}</span>
                  ) : (
                    <>
                      <span>
                        {language === "al"
                          ? isPublic
                            ? "Publiko & Luaj"
                            : "Ruaj Privat & Luaj"
                          : isPublic
                            ? "Publish & Play"
                            : "Save Private & Play"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
