"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/types";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpenCheck,
  Receipt,
  MessageSquareWarning,
  Users,
  GraduationCap,
  Award,
} from "lucide-react";

interface MobileBottomNavProps {
  user: SessionUser;
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname();

  const committeeTabs = [
    { href: "/committee", label: "Overview", icon: LayoutDashboard },
    { href: "/committee/users", label: "Users", icon: Users },
    { href: "/committee/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/committee/fees", label: "Fees", icon: Receipt },
    { href: "/committee/tickets", label: "Tickets", icon: MessageSquareWarning },
  ];

  const teacherTabs = [
    { href: "/teacher", label: "Schedule", icon: LayoutDashboard },
    { href: "/teacher/students", label: "Students", icon: GraduationCap },
    { href: "/teacher/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/teacher/gradebook", label: "Grades", icon: BookOpenCheck },
    { href: "/teacher/fees", label: "Fees", icon: Receipt },
  ];

  const parentTabs = [
    { href: "/parent", label: "Children", icon: LayoutDashboard },
    { href: "/parent/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/parent/academics", label: "Report Cards", icon: Award },
    { href: "/parent/fees", label: "Fee Status", icon: Receipt },
    { href: "/parent/tickets", label: "Inquiries", icon: MessageSquareWarning },
  ];

  let tabs = parentTabs;
  if (user.role === "COMMITTEE") tabs = committeeTabs;
  if (user.role === "TEACHER") tabs = teacherTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] text-center",
                isActive
                  ? "text-emerald-800 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all",
                  isActive ? "bg-emerald-100/80 text-emerald-800 shadow-xs" : ""
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
