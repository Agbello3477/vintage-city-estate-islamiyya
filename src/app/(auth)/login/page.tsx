"use client";

import React, { useState, useTransition } from "react";
import { loginAction, quickDemoLogin } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      try {
        const res = await loginAction(null, formData);
        if (res?.error) {
          setErrorMessage(res.error);
          toast.error(res.error);
        }
      } catch (err: any) {
        // redirect happens via next/navigation
      }
    });
  };

  const handleQuickDemo = (role: "COMMITTEE" | "TEACHER" | "PARENT") => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await quickDemoLogin(role);
        toast.success(`Logged in as ${role}`);
      } catch (err: any) {
        setErrorMessage(err.message || "Demo login failed");
        toast.error(err.message || "Demo login failed");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] islamic-pattern-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 border-2 border-emerald-600/50 flex items-center justify-center text-3xl shadow-glass">
            🕌
          </div>
        </Link>
        <p className="text-xs font-serif text-emerald-800 tracking-widest font-bold">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Vintage City Estate Islamiyya
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Sign in to your role dashboard (Super Admin, Teacher, or Parent)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Quick Demo Switcher Cards */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-5 shadow-glass border border-emerald-700/60 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>1-Click Demo Evaluation Sign-In</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemo("COMMITTEE")}
              disabled={isPending}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/50 text-center transition-all hover:scale-102"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-xs font-bold text-white">Super Admin</span>
              <span className="text-[10px] text-emerald-300">Alhaji Faruq</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("TEACHER")}
              disabled={isPending}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/50 text-center transition-all hover:scale-102"
            >
              <GraduationCap className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-white">Ustadh / Teacher</span>
              <span className="text-[10px] text-emerald-300">Ustadh Ahmad</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("PARENT")}
              disabled={isPending}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/50 text-center transition-all hover:scale-102"
            >
              <HeartHandshake className="w-5 h-5 text-sky-400 mb-1" />
              <span className="text-xs font-bold text-white">Parent Portal</span>
              <span className="text-[10px] text-emerald-300">Engr. Ibrahim</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-8 shadow-glass rounded-2xl border border-slate-200/90 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g., admin@vintagecity.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isPending}
            >
              <span>Sign In with Credentials</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
            <p>Protected by Argon2id/Bcrypt hashing, JWT HTTP-Only cookies, and Sliding-window rate limiter.</p>
            <p className="font-semibold text-emerald-800 pt-0.5">Powered by MaSha Tech Innovations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
