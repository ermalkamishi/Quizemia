import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  description: "Turn lessons into play! Play and create interactive quizzes.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <Dashboard />;
}
