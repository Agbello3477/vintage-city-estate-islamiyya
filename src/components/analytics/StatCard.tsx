import React from "react";
import { Card } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "emerald" | "amber" | "sky" | "rose" | "slate";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "emerald",
}: StatCardProps) {
  const variantStyles = {
    emerald: "from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900 icon-emerald",
    amber: "from-amber-50 to-orange-50 border-amber-200 text-amber-900 icon-amber",
    sky: "from-sky-50 to-blue-50 border-sky-200 text-sky-900 icon-sky",
    rose: "from-rose-50 to-red-50 border-rose-200 text-rose-900 icon-rose",
    slate: "from-slate-50 to-slate-100 border-slate-200 text-slate-900 icon-slate",
  };

  const iconStyles = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    sky: "bg-sky-100 text-sky-700",
    rose: "bg-rose-100 text-rose-700",
    slate: "bg-slate-200 text-slate-700",
  };

  return (
    <Card className={cn("bg-gradient-to-br border", variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </Card>
  );
}
