import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  BookOpen,
  Clock,
  Receipt,
  Sparkles,
  CalendarCheck,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.role === "COMMITTEE") redirect("/committee");
    if (session.role === "TEACHER") redirect("/teacher");
    if (session.role === "PARENT") redirect("/parent");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] islamic-pattern-bg flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white border-b border-emerald-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-600/50 flex items-center justify-center text-amber-300 text-xl shadow-inner">
              🕌
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">
                Vintage City Estate Islamiyya
              </span>
              <p className="text-[10px] text-emerald-300 font-medium">Management Portal (VCE-IMP)</p>
            </div>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-900 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Official Islamiyya School Management & Parent Portal</span>
          </div>

          <p className="text-sm font-serif text-emerald-800 tracking-widest font-semibold">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Nurturing Knowledge, Faith & Character in our Children
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Welcome to the centralized management system for <strong>Vintage City Estate Islamiyya</strong>. Real-time attendance tracking, 12-month fee ledger, Tahfiz progress report cards, and parent-committee communications.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-glass hover:shadow-glass-hover transition-all"
            >
              <span>Access Portal & Demo Accounts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3 User Portals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Super Admin (Committee)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full control over teacher assignments, admissions, fee auditing, system analytics, ticket triage, and immutable audit logs.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Islamiyya Ustadh (Teacher)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              1-click batch attendance check-in/out with schedule enforcement, Tahfiz (Hifz) & Quran grading, and student fee recording.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Parent & Guardian Portal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View daily attendance timestamps, check 12-month fee ledger (Red/Green pills), download PDF Report Cards, and lodge inquiries.
            </p>
          </div>
        </div>

        {/* Schedule Preset Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-glass border border-emerald-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-amber-300">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Islamiyya Schedule Presets</h4>
              <p className="text-xs text-emerald-200 mt-0.5">Enforced timetable for all classes and sessions</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/60">
              <span className="text-amber-300">Thursday & Friday:</span> 4:00 PM – 6:00 PM
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/60">
              <span className="text-emerald-300">Saturday & Sunday:</span> 8:30 AM – 1:00 PM
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>Vintage City Estate Islamiyya Management Portal &bull; All Rights Reserved © {new Date().getFullYear()}</p>
        <p className="font-semibold text-emerald-800">Powered by MaSha Tech Innovations</p>
      </footer>
    </div>
  );
}
