import type { Metadata } from "next";
import MyQuizzes from "@/components/MyQuizzes";

export const metadata: Metadata = {
  title: "My Quizzes",
  description: "Manage, edit, export, and host your custom AI-generated and hand-crafted quizzes.",
  alternates: {
    canonical: "/my-quizzes",
  },
};

export default function MyQuizzesPage() {
  return <MyQuizzes />;
}
