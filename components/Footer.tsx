import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Image
                src="/quiz.png"
                alt="Quizemia Logo"
                width={36}
                height={36}
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Quizemia
                </span>
                <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 tracking-wide">
                  Turn lessons into play!
                </span>
              </div>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              An interactive educational quiz platform. Turn any study guide, PDF, or topic into high-energy, memorable learning games.
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-xs text-zinc-400">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                  Public Quizzes
                </Link>
              </li>
              <li>
                <Link href="/quiz?mode=create" className="hover:text-blue-600 transition-colors">
                  AI Quiz Generator
                </Link>
              </li>
              <li>
                <Link href="/my-quizzes" className="hover:text-blue-600 transition-colors">
                  My Library & Stats
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">
              About
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                <Link href="/about-us" className="hover:text-blue-600 transition-colors">
                  Our Mission & Story
                </Link>
              </li>
              <li>
                <Link href="/about-us#how-it-works" className="hover:text-blue-600 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} Quizemia. Empowering teachers, students, and curious minds.</p>

        </div>
      </div>
    </footer>
  );
}
