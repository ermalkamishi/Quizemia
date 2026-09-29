"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Mail, Lock, User as UserIcon } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, openAuthModal, signInWithEmail, signUpWithEmail, loginAsGuest } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const res =
      authMode === "login"
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);

    setSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-500 via-amber-500 to-blue-600 text-white font-black text-lg shadow-md">
              K!
            </span>
            <DialogTitle>
              {authMode === "login" ? "Welcome Back!" : "Create Free Account"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {authMode === "login"
              ? "Sign in to save quizzes, track performance, and share with players."
              : "Join our interactive quiz arena and start generating quizzes with AI."}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full font-bold">
            {submitting ? "Please wait..." : authMode === "login" ? "Sign In" : "Sign Up"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-semibold">
                Or quick test
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={loginAsGuest}
            className="w-full flex items-center justify-center gap-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Continue as Instant Guest</span>
          </Button>
        </form>

        <div className="mt-5 text-center text-xs text-zinc-500">
          {authMode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
