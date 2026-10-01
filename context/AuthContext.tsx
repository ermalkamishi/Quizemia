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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });
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

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            nickname: cleanNickname,
            name: cleanNickname,
            display_name: cleanNickname,
          },
        },
      });

      if (error) return { error: error.message };

      // Supabase returns empty identities array if user with this email already exists and email enumeration protection is on
      if (data.user?.identities && data.user.identities.length === 0) {
        return { error: "An account with this email already exists. Please sign in instead." };
      }

      // If Supabase requires email verification and didn't start a session immediately
      if (data.user && !data.session) {
        return {
          needsEmailConfirmation: true,
          data,
        };
      }

      closeAuthModal();
      return { data };
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
