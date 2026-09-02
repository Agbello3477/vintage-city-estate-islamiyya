import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "warning" | "info" | "outline" | "islamic";
}

export function Badge({ children, className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    islamic: "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
    danger: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
    warning: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
    info: "bg-sky-50 text-sky-700 border-sky-200 font-medium",
    outline: "bg-transparent text-slate-600 border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border tracking-wide",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
