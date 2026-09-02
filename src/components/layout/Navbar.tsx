"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SessionUser, ROLE_LABELS } from "@/types";
import { DemoSwitcher } from "./DemoSwitcher";
import { logoutAction } from "@/lib/actions";
import {
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
} from "lucide-react";

interface NavbarProps {
  user: SessionUser;
}

export function Navbar({ user }: NavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const getRoleIcon = () => {
    if (user.role === "COMMITTEE") return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    if (user.role === "TEACHER") return <GraduationCap className="w-4 h-4 text-emerald-400" />;
    return <HeartHandshake className="w-4 h-4 text-sky-400" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white border-b border-emerald-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-600/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <span className="text-xl font-bold text-amber-400">🕌</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-200 transition-colors">
                    Vintage City Estate
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-800 text-emerald-200 rounded border border-emerald-700">
                    VCE-IMP
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/90 font-medium">Islamiyya Portal</p>
              </div>
            </Link>
          </div>

          {/* Quick Demo Switcher */}
          <div className="hidden lg:block">
            <DemoSwitcher currentRole={user.role} />
          </div>

          {/* User Profile & Actions */}
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

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <DemoSwitcher currentRole={user.role} />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden bg-emerald-950 border-t border-emerald-800 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
            <div>
              <p className="text-sm font-semibold text-white">{user.fullName}</p>
              <p className="text-xs text-emerald-300">{ROLE_LABELS[user.role]}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-900/40 text-rose-300 border border-rose-800/60 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
