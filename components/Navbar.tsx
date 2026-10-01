"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  Layers,
  Info,
  LogOut,
  User as UserIcon,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { name: t.nav.myQuizzes, href: "/my-quizzes", icon: Layers },
    { name: t.nav.playCreate, href: "/quiz", icon: PlusCircle },
    { name: t.nav.aboutUs, href: "/about-us", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center group py-1">
          <Image
            src="/quiz.png"
            alt="Quizemia Logo"
            width={220}
            height={70}
            className="h-12 sm:h-15 w-auto object-contain group-hover:scale-105 transition-transform"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/80 p-1.5 rounded-full border border-zinc-200/60 dark:border-zinc-800/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                  isActive
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-800/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-zinc-600")} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions: Language Switcher + User Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher for EN / AL */}
          <div className="flex items-center p-1 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1",
                language === "en"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
              title="English"
            >
              <span>EN</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage("al")}
              className={cn(
                "px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1",
                language === "al"
                  ? "bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
              title="Shqip (Albanian)"
            >
              <span>AL</span>
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/my-quizzes"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                  {(user.user_metadata?.nickname || user.user_metadata?.name || user.email || "U").charAt(0)}
                </div>
                <span className="text-xs font-semibold max-w-[120px] truncate text-zinc-700 dark:text-zinc-300">
                  {user.user_metadata?.nickname || user.user_metadata?.name || user.email?.split("@")[0]}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                title={t.nav.signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => openAuthModal("login")}>
                {t.nav.signIn}
              </Button>
              <Button
                size="sm"
                onClick={() => openAuthModal("signup")}
                className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-bold shadow-sm"
              >
                {t.nav.getStarted}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
              {(user.user_metadata?.nickname || user.user_metadata?.name || user.email || "U").charAt(0)}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-zinc-500")} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {language === "al" ? "Gjuha:" : "Language:"}
            </span>
            <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                  language === "en"
                    ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage("al")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                  language === "al"
                    ? "bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <span>🇦🇱</span>
                <span>AL</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <UserIcon className="h-4 w-4" />
                  <span className="truncate font-semibold">
                    {user.user_metadata?.nickname || user.user_metadata?.name || user.email}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t.nav.signOut}</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    openAuthModal("login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  {t.nav.signIn}
                </Button>
                <Button
                  onClick={() => {
                    openAuthModal("signup");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold"
                >
                  {t.nav.getStarted}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
