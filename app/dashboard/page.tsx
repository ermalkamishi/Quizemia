import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized Quizemia dashboard. Track stats, resume quizzes, and launch new challenges.",
  alternates: {
    canonical: "/dashboard",
  },
};

export default function DashboardPage() {
  return <Dashboard />;
}
