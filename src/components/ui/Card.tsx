import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered";
}

export function Card({ children, className, variant = "glass", ...props }: CardProps) {
  const variantStyles = {
    glass: "glass-card rounded-2xl p-5",
    default: "bg-white rounded-2xl p-5 shadow-sm border border-slate-100",
    bordered: "bg-white rounded-2xl p-5 border border-slate-200",
  };

  return (
    <div className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}
