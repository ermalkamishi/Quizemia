import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "kahoot-red"
    | "kahoot-blue"
    | "kahoot-yellow"
    | "kahoot-green";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-[0.98]",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]",
      outline: "border border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
      secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700",
      ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
      link: "text-blue-600 underline-offset-4 hover:underline p-0 h-auto",
      "kahoot-red": "bg-red-600 hover:bg-red-700 text-white shadow-md active:translate-y-0.5 border-b-4 border-red-800",
      "kahoot-blue": "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:translate-y-0.5 border-b-4 border-blue-800",
      "kahoot-yellow": "bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md active:translate-y-0.5 border-b-4 border-amber-700",
      "kahoot-green": "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:translate-y-0.5 border-b-4 border-emerald-800",
    };

    const sizeStyles = {
      default: "h-11 px-5 py-2.5 text-sm",
      sm: "h-9 px-3 text-xs",
      lg: "h-13 px-8 text-base font-semibold",
      icon: "h-10 w-10 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
