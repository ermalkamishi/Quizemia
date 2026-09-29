import type { Metadata } from "next";
import MyQuizzes from "@/components/MyQuizzes";

export const metadata: Metadata = {
  title: "Quizemia — Turn lessons into play!",
  description: "View and manage your created quizzes",
};

export default function MyQuizzesPage() {
  return <MyQuizzes />;
}
