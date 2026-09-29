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
}

interface ToastContextType {
  toasts: ToastItem[];
  toast: (options: { title: string; description?: string; type?: ToastType }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback(
    ({ title, description, type = "info" }: { title: string; description?: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setTimeout(() => {
        setToasts((prev) => [...prev, { id, title, description, type }]);
      }, 0);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl transition-all animate-in slide-in-from-bottom-5 duration-200",
              item.type === "success" && "bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-50",
              item.type === "error" && "bg-red-50 border-red-200 text-red-950 dark:bg-red-950 dark:border-red-800 dark:text-red-50",
              item.type === "info" && "bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
            )}
          >
            {item.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {item.type === "error" && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
            {item.type === "info" && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              {item.description && <p className="text-xs opacity-90 mt-0.5">{item.description}</p>}
            </div>
            <button
              onClick={() => dismiss(item.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
            >
              <X className="h-4 w-4" />
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
      toast: (opts: { title: string; description?: string }) => console.log(opts.title),
      dismiss: () => {},
      toasts: [],
    };
  }
  return context;
}
