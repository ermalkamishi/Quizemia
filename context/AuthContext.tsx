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
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
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

    // Check localStorage guest user if no session
    if (typeof window !== "undefined") {
      const storedGuest = localStorage.getItem("kahoot_guest_user");
      if (storedGuest && !session?.user) {
        try {
          setUser(JSON.parse(storedGuest));
        } catch {
          // ignore
        }
      }
    }

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) return { error: error.message };
      closeAuthModal();
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : "Failed to sign in" };
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
      });
      if (error) return { error: error.message };
      closeAuthModal();
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : "Failed to sign up" };
    }
  };

  const loginAsGuest = () => {
    const guestUser: Partial<User> = {
      id: "guest-" + Math.random().toString(36).substring(2, 9),
      email: "guest_player@kahootquiz.app",
      user_metadata: { name: "Guest Player", avatar: "🎮" },
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("kahoot_guest_user", JSON.stringify(guestUser));
    }
    setUser(guestUser as User);
    closeAuthModal();
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
        loginAsGuest,
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
