import React, { Suspense } from "react";
import type { Metadata } from "next";
import LivePlayer from "@/components/LivePlayer";

export const metadata: Metadata = {
  title: "Join Live Game — Quizemia",
  description: "Enter your 6-digit game PIN to join a synchronized live quiz challenge.",
};

export default function LiveJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin mx-auto dark:border-zinc-100" />
        </div>
      }
    >
      <LivePlayer />
    </Suspense>
  );
}
