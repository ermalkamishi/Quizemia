import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Quizemia — Turn lessons into play!",
  description: "Turn lessons into play! Play and create interactive quizzes.",
};

export default function HomePage() {
  return <Dashboard />;
}
