import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Quizemia — Turn lessons into play!",
  description: "User dashboard and quiz statistics",
};

export default function DashboardPage() {
  return <Dashboard />;
}
