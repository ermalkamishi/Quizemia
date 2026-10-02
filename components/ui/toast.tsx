"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  toast: (options: {
    title: string;
    description?: string;
    type?: ToastType;
    duration?: number;
  }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({
      title,
      description,
      type = "info",
      duration = 3200,
    }: {
      title: string;
      description?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        // Keep at most 2 toasts active so mobile screens remain clean
        setToasts((prev) => [...prev.slice(-1), { id, title, description, type, duration }]);
      }, 0);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast viewport: Top-anchored on mobile (top-3) so it never covers answer buttons; Bottom-right on desktop */}
      <div className="fixed top-3 inset-x-3 max-w-xs sm:max-w-sm mx-auto sm:mx-0 sm:left-auto sm:top-auto sm:bottom-5 sm:right-5 z-[100] flex flex-col gap-1.5 sm:gap-2 pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 rounded-xl sm:rounded-2xl border px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-top-2 sm:slide-in-from-bottom-2 duration-150",
              item.type === "success" &&
                "bg-emerald-900/95 border-emerald-500/80 text-white shadow-emerald-950/40",
              item.type === "error" &&
                "bg-red-900/95 border-red-500/80 text-white shadow-red-950/40",
              item.type === "info" &&
                "bg-zinc-900/95 border-zinc-700/80 text-white shadow-black/40"
            )}
          >
            {item.type === "success" && (
              <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-emerald-300 shrink-0" />
            )}
            {item.type === "error" && (
              <AlertCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-red-300 shrink-0" />
            )}
            {item.type === "info" && (
              <Info className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-300 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold truncate leading-tight">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-[10px] sm:text-xs text-zinc-200/90 truncate leading-tight mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="text-zinc-300 hover:text-white p-1 shrink-0 cursor-pointer"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    return {
      toast: (opts: { title: string; description?: string; type?: ToastType; duration?: number }) =>
        console.log(opts.title),
      dismiss: () => {},
      toasts: [],
    };
  }
  return context;
}
