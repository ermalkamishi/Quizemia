import type { Metadata } from "next";
import Leaderboard from "@/components/Leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard — Quizemia",
  description: "Global competitive leaderboard. Race against players worldwide, earn skill points, and climb to the top!",
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
