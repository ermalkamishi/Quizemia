"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string; data?: any }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    nickname?: string
  ) => Promise<{ error?: string; data?: any; needsEmailConfirmation?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    // Clean up any deprecated mock guest items in browser storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("kahoot_guest_user");
    }

    // Check active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      // If user is unconfirmed, automatically trigger server-side confirmation and retry sign in
      if (error && error.message.toLowerCase().includes("email not confirmed")) {
        try {
          const autoConfirmRes = await fetch("/api/auth/auto-confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail }),
          });
          if (autoConfirmRes.ok) {
            // Retry login now that account has been confirmed
            const retry = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: pass,
            });
            if (!retry.error) {
              closeAuthModal();
              return { data: retry.data };
            }
          }
        } catch {
          // ignore auto-confirm error and fallback to standard error
        }
      }

      if (error) return { error: error.message };
      closeAuthModal();
      return { data };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : "Failed to sign in" };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, nickname?: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanNickname = nickname?.trim() || cleanEmail.split("@")[0];

      // Call server registration API which creates user with email_confirm: true
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: pass,
          nickname: cleanNickname,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        return { error: json.error || "Failed to create account" };
      }

      // Automatically sign in the user immediately so session is created
      const signInRes = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (signInRes.error) {
        return { data: json.user };
      }

      closeAuthModal();
      return { data: signInRes.data };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : "Failed to sign up" };
    }
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("kahoot_guest_user");
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        signOut,
        signInWithEmail,
        signUpWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
