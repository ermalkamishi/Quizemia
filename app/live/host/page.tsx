import React, { Suspense } from "react";
import type { Metadata } from "next";
import LiveHost from "@/components/LiveHost";

export const metadata: Metadata = {
  title: "Live Game Host — Quizemia",
  description: "Host a synchronized multiplayer quiz room with real-time participant scoring.",
};

export default function LiveHostPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin mx-auto dark:border-zinc-100" />
        </div>
      }
    >
      <LiveHost />
    </Suspense>
  );
}
