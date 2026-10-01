"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    openAuthModal,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const { language, t } = useLanguage();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setNickname("");
    setEmail("");
    setPassword("");
    setErrorMsg("");
    setNeedsConfirmation(false);
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const handleModeSwitch = (mode: "login" | "signup") => {
    setErrorMsg("");
    setNeedsConfirmation(false);
    openAuthModal(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim();
    const cleanNickname = nickname.trim();

    // Validation for Signup
    if (authMode === "signup") {
      if (!cleanNickname) {
        setErrorMsg("Please enter a nickname for your Quizemia profile.");
        return;
      }
      if (cleanNickname.length < 2) {
        setErrorMsg("Nickname must be at least 2 characters.");
        return;
      }
      if (cleanNickname.length > 25) {
        setErrorMsg("Nickname must be 25 characters or fewer.");
        return;
      }
    }

    // Common validations
    if (!cleanEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    if (authMode === "login") {
      const res = await signInWithEmail(cleanEmail, password);
      setSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        resetForm();
      }
    } else {
      const res = await signUpWithEmail(cleanEmail, password, cleanNickname);
      setSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.needsEmailConfirmation) {
        setNeedsConfirmation(true);
      } else {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl">
        {/* Header with Official Quizemia Mascot Logo & Branding */}
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-blue-500/20 shrink-0">
              <div className="h-full w-full rounded-[14px] bg-white dark:bg-zinc-900 flex items-center justify-center p-1.5 overflow-hidden">
                <Image
                  src="/quiz.png"
                  alt="Quizemia Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">

              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {authMode === "login" ? t.auth.welcomeBack : t.auth.createAccount}
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed pt-1">
            {authMode === "login"
              ? (language === "al"
                  ? "Hyni për të ruajtur kuizet, për të ndjekur performancën dhe për të garuar drejtpërdrejt në arenë."
                  : "Sign in to save quizzes, track performance, and battle live in the arena.")
              : (language === "al"
                  ? "Bashkohuni me Quizemia për të gjeneruar kuize me AI, për të sfiduar shokët dhe për të fituar trofe."
                  : "Join Quizemia to generate battle quizzes with AI, challenge peers, and earn trophies.")}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Segment Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl my-4 border border-zinc-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => handleModeSwitch("login")}
            className={cn(
              "py-2 text-xs sm:text-sm font-bold rounded-lg transition-all text-center cursor-pointer",
              authMode === "login"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            {t.auth.loginButton}
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("signup")}
            className={cn(
              "py-2 text-xs sm:text-sm font-bold rounded-lg transition-all text-center cursor-pointer",
              authMode === "signup"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            {t.auth.signupButton}
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span className="flex-1 leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Email Confirmation Notice (if Supabase requires email verification) */}
        {needsConfirmation ? (
          <div className="space-y-4 py-2 text-center animate-in fade-in duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {language === "al" ? "Kontrolloni Email-in Tuaj!" : "Check Your Email!"}
              </h4>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {language === "al"
                  ? "Dërguam një lidhje verifikimi te "
                  : "We sent a verification link to "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {email}
                </span>
                {language === "al"
                  ? ". Ju lutem klikoni lidhjen në email për të konfirmuar llogarinë tuaj, pastaj hyni."
                  : ". Please click the link in your email to confirm your Quizemia account, then sign in."}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => handleModeSwitch("login")}
              className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              {language === "al" ? "Kthehu te Hyrja" : "Back to Sign In"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Required Nickname Field (Sign Up Only) */}
            {authMode === "signup" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>
                    {t.auth.nicknameLabel} <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {language === "al" ? "Emri në arenë" : "Display name in arena"}
                  </span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder={t.auth.nicknamePlaceholder}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500 text-sm font-medium"
                    required
                    minLength={2}
                    maxLength={25}
                    autoComplete="nickname"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                {t.auth.emailLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500 text-sm font-medium"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  {t.auth.passwordLabel} <span className="text-red-500">*</span>
                </label>
                {authMode === "signup" && (
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {language === "al" ? "Min 6 karaktere" : "Min 6 characters"}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500 text-sm font-medium"
                  required
                  minLength={6}
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {authMode === "login"
                        ? (language === "al" ? "Po identifikoheni..." : "Signing In...")
                        : (language === "al" ? "Po krijohet llogaria..." : "Creating Account...")}
                    </span>
                  </span>
                ) : authMode === "login" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>{language === "al" ? "Hyr në Quizemia" : "Sign In to Quizemia"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>{language === "al" ? "Krijo Llogari në Quizemia" : "Create Quizemia Account"}</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Footer Link Switcher */}
        {!needsConfirmation && (
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {authMode === "login" ? (
              <p>
                {t.auth.noAccount}{" "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch("signup")}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  {t.auth.signupButton}
                </button>
              </p>
            ) : (
              <p>
                {t.auth.hasAccount}{" "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch("login")}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  {t.auth.loginButton}
                </button>
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
