"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser, ROLE_LABELS } from "@/types";
import { DemoSwitcher } from "./DemoSwitcher";
import { logoutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Users,
  School,
  CalendarCheck,
  Receipt,
  BookOpenCheck,
  MessageSquareWarning,
  History,
  Award,
  Calendar,
} from "lucide-react";

interface NavbarProps {
  user: SessionUser;
}

export function Navbar({ user }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const getRoleIcon = () => {
    if (user.role === "COMMITTEE") return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    if (user.role === "TEACHER") return <GraduationCap className="w-4 h-4 text-emerald-400" />;
    return <HeartHandshake className="w-4 h-4 text-sky-400" />;
  };

  const committeeLinks = [
    { href: "/committee", label: "Executive Dashboard", icon: LayoutDashboard },
    { href: "/committee/users", label: "Manage Parents & Teachers", icon: Users },
    { href: "/committee/classes", label: "Classes & Curriculum", icon: School },
    { href: "/committee/students", label: "Student Admissions", icon: GraduationCap },
    { href: "/committee/attendance", label: "Attendance Master", icon: CalendarCheck },
    { href: "/committee/academics", label: "Academic Performance", icon: BookOpenCheck },
    { href: "/committee/fees", label: "12-Month Fee Ledger", icon: Receipt },
    { href: "/committee/tickets", label: "Feedback & Complaints", icon: MessageSquareWarning },
    { href: "/committee/audit-logs", label: "Immutable Audit Trail", icon: History },
  ];

  const teacherLinks = [
    { href: "/teacher", label: "Today's Schedule", icon: LayoutDashboard },
    { href: "/teacher/students", label: "Add & Manage Students", icon: GraduationCap },
    { href: "/teacher/attendance", label: "Batch Attendance", icon: CalendarCheck },
    { href: "/teacher/gradebook", label: "Tahfiz & Grades", icon: BookOpenCheck },
    { href: "/teacher/fees", label: "Class Fee Status", icon: Receipt },
  ];

  const parentLinks = [
    { href: "/parent", label: "Children Overview", icon: LayoutDashboard },
    { href: "/parent/attendance", label: "Daily Session Logs", icon: CalendarCheck },
    { href: "/parent/academics", label: "Performance & Report Cards", icon: Award },
    { href: "/parent/fees", label: "12-Month Fee Status", icon: Receipt },
    { href: "/parent/tickets", label: "Feedback & Inquiries", icon: MessageSquareWarning },
  ];

  let links = parentLinks;
  if (user.role === "COMMITTEE") links = committeeLinks;
  if (user.role === "TEACHER") links = teacherLinks;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white border-b border-emerald-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-800 border border-emerald-600/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <span className="text-lg sm:text-xl font-bold text-amber-400">🕌</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-emerald-200 transition-colors">
                    Vintage City Estate
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-800 text-emerald-200 rounded border border-emerald-700">
                    VCE-IMP
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-emerald-300/90 font-medium">Islamiyya Portal</p>
              </div>
            </Link>
          </div>

          {/* Quick Demo Switcher (Desktop) */}
          <div className="hidden lg:block">
            <DemoSwitcher currentRole={user.role} />
          </div>

          {/* User Profile & Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 bg-emerald-800/60 border border-emerald-700/60 rounded-xl px-3 py-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs border border-emerald-500/40">
                {user.fullName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white leading-tight">{user.fullName}</p>
                  {getRoleIcon()}
                </div>
                <p className="text-[10px] text-emerald-300 leading-tight">
                  {ROLE_LABELS[user.role] || user.role}
                </p>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors border border-transparent hover:border-emerald-700"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mobile Right Controls: Switcher & Hamburger */}
          <div className="flex items-center gap-1.5 md:hidden">
            <div className="scale-90 origin-right">
              <DemoSwitcher currentRole={user.role} />
            </div>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-xl border border-emerald-700/60 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {showMobileMenu && (
        <div className="md:hidden bg-emerald-950 border-t border-emerald-800/80 px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top duration-200 shadow-2xl">
          {/* User Profile Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-900/60 border border-emerald-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm border border-emerald-500/40">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{user.fullName}</p>
                <p className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                  {getRoleIcon()}
                  <span>{ROLE_LABELS[user.role]}</span>
                </p>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-rose-900/50 text-rose-200 border border-rose-800 rounded-lg hover:bg-rose-900 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-2 mb-1">
              Menu Navigation
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm border border-emerald-500/50"
                      : "text-emerald-100 hover:bg-emerald-900/80 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-amber-300" : "text-emerald-300")} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Schedule Preset Widget */}
          <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-[11px] text-emerald-200 space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Timetable Rules</span>
            </p>
            <p><strong>Thu & Fri:</strong> 4:00 PM – 6:00 PM</p>
            <p><strong>Sat & Sun:</strong> 8:30 AM – 1:00 PM</p>
          </div>
        </div>
      )}
    </header>
  );
}
