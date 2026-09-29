"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Play,
  Share2,
  Trash2,
  Lock,
  Globe,
  HelpCircle,
  Calendar,
  Layers,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { Quiz } from "@/types/quiz";
import { fetchUserQuizzes, deleteQuiz } from "@/lib/supabase/queries";

export default function MyQuizzes() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchUserQuizzes(user?.id);
      setQuizzes(data);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleShare = (quiz: Quiz) => {
    const url = `${window.location.origin}/quiz?id=${quiz.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: `Quiz URL copied to clipboard: ${quiz.title}`,
        type: "success",
      });
    } else {
      toast({
        title: "Share URL",
        description: url,
        type: "info",
      });
    }
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setDeleting(true);
    await deleteQuiz(quizToDelete.id);
    setQuizzes((prev) => prev.filter((q) => q.id !== quizToDelete.id));
    setDeleting(false);
    setQuizToDelete(null);
    toast({
      title: "Quiz Deleted",
      description: "The quiz was removed from your library.",
      type: "info",
    });
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-7 w-7 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              My Quizzes
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your personal creations, check engagement, and launch games.
          </p>
        </div>

        <Link href="/quiz?mode=create">
          <Button className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-bold gap-2 shadow-md w-full sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            <span>Create New Quiz</span>
          </Button>
        </Link>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Quizzes</span>
          <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-50">{quizzes.length}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Public Quizzes</span>
          <p className="text-2xl font-black mt-1 text-emerald-600">
            {quizzes.filter((q) => q.is_public).length}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Private Quizzes</span>
          <p className="text-2xl font-black mt-1 text-blue-600">
            {quizzes.filter((q) => !q.is_public).length}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Plays</span>
          <p className="text-2xl font-black mt-1 text-purple-600">
            {quizzes.reduce((acc, q) => acc + (q.play_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-zinc-800"
            />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 max-w-xl mx-auto">
          <Layers className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            No Quizzes Created Yet
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6 max-w-sm mx-auto">
            Build your first AI-generated or custom quiz in seconds and start challenging players!
          </p>
          <Link href="/quiz?mode=create">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
              <PlusCircle className="h-5 w-5" />
              <span>Create Your First Quiz</span>
            </Button>
          </Link>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {quizzes.map((quiz) => {
            const questionCount = quiz.questions?.length || 1;
            const formattedDate = quiz.created_at
              ? new Date(quiz.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            return (
              <motion.div
                key={quiz.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800">
                  <div>
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {quiz.is_public ? (
                          <Badge variant="success" className="gap-1 text-[11px]">
                            <Globe className="h-3 w-3" />
                            <span>Public</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-[11px]">
                            <Lock className="h-3 w-3" />
                            <span>Private</span>
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[11px]">
                          {quiz.category || "General"}
                        </Badge>
                      </div>

                      <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">
                        {quiz.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1 text-xs">
                        {quiz.description || "Interactive educational challenge."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 pt-0">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 py-3 border-y border-zinc-100 dark:border-zinc-800">
                        <span className="flex items-center gap-1 font-medium">
                          <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                          {questionCount} Questions
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                          {quiz.play_count || 0} plays
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="p-5 pt-0 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(quiz)}
                        className="h-9 px-3 gap-1.5 text-xs font-semibold hover:border-blue-400 hover:text-blue-600"
                        title="Copy Share Link"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setQuizToDelete(quiz)}
                        className="h-9 px-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete Quiz"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => router.push(`/quiz?id=${quiz.id}`)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Play</span>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!quizToDelete} onOpenChange={() => setQuizToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Delete Quiz?</span>
            </DialogTitle>
            <DialogDescription className="mt-2">
              Are you sure you want to delete <strong>{quizToDelete?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setQuizToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
