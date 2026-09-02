"use client";

import React, { useTransition } from "react";
import { quickDemoLogin } from "@/lib/actions";
import { Shield, GraduationCap, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface DemoSwitcherProps {
  currentRole?: string;
}

export function DemoSwitcher({ currentRole }: DemoSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (role: "COMMITTEE" | "TEACHER" | "PARENT") => {
    startTransition(async () => {
      try {
        await quickDemoLogin(role);
        toast.success(`Switched role to ${role}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to switch persona");
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-emerald-950/80 border border-emerald-500/30 rounded-xl backdrop-blur-md text-xs shadow-inner">
      <div className="hidden sm:flex items-center gap-1 px-2 text-emerald-300 font-medium border-r border-emerald-700/50">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Demo Roles:</span>
      </div>
      <button
        onClick={() => handleSwitch("COMMITTEE")}
        disabled={isPending}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
          currentRole === "COMMITTEE"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-emerald-200 hover:bg-emerald-900 hover:text-white"
        }`}
        title="Super Admin / Committee Dashboard"
      >
        <Shield className="w-3.5 h-3.5 text-amber-300" />
        <span>Admin</span>
      </button>
      <button
        onClick={() => handleSwitch("TEACHER")}
        disabled={isPending}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
          currentRole === "TEACHER"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-emerald-200 hover:bg-emerald-900 hover:text-white"
        }`}
        title="Ustadh Ahmad / Teacher Dashboard"
      >
        <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
        <span>Teacher</span>
      </button>
      <button
        onClick={() => handleSwitch("PARENT")}
        disabled={isPending}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
          currentRole === "PARENT"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-emerald-200 hover:bg-emerald-900 hover:text-white"
        }`}
        title="Engr. Ibrahim / Parent Portal"
      >
        <Users className="w-3.5 h-3.5 text-sky-300" />
        <span>Parent</span>
      </button>
    </div>
  );
}
