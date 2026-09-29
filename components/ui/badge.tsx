import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "vibrant";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-transparent",
    secondary: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-transparent",
    destructive: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-transparent",
    outline: "text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-transparent",
    vibrant: "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold border-transparent shadow-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
