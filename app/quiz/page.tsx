import { Suspense } from "react";
import type { Metadata } from "next";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Quiz Studio & Player",
  description: "Play interactive Kahoot-style quizzes or generate custom questions instantly with AI.",
  alternates: {
    canonical: "/quiz",
  },
};

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <Quiz />
    </Suspense>
  );
}
