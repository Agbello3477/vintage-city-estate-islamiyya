"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/types";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  School,
  GraduationCap,
  CalendarCheck,
  Receipt,
  BookOpenCheck,
  MessageSquareWarning,
  History,
  Sparkles,
  Award,
} from "lucide-react";

interface SidebarProps {
  user: SessionUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

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
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Navigation Menu</span>
          </div>
          <nav className="space-y-1 mt-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Islamiyya Notice Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-xs text-slate-700">
          <p className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
            <span>📅</span> Islamiyya Schedule
          </p>
          <p className="text-[11px] text-slate-600 mb-1 font-medium">
            <strong>Thu & Fri:</strong> 4:00 PM – 6:00 PM
          </p>
          <p className="text-[11px] text-slate-600 font-medium">
            <strong>Sat & Sun:</strong> 8:30 AM – 1:00 PM
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center space-y-1">
        <div>Vintage City Estate Islamiyya © {new Date().getFullYear()}</div>
        <div className="font-semibold text-emerald-800">Powered by MaSha Tech Innovations</div>
      </div>
    </aside>
  );
}
