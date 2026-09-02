"use client";

import React, { useState, useEffect } from "react";
import { getScheduleForDate } from "@/lib/schedule";
import { Clock, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

export function ScheduleBanner() {
  const [time, setTime] = useState<string>("");
  const [sessionInfo, setSessionInfo] = useState(getScheduleForDate());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setSessionInfo(getScheduleForDate(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 shadow-glass border border-emerald-700/50 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">
                {sessionInfo.dayName} Islamiyya Schedule
              </h2>
              {sessionInfo.isCurrentlyInSession ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Live Session
                </span>
              ) : sessionInfo.isClassDay ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  Scheduled Today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Off Day
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200 mt-0.5 font-medium">
              {sessionInfo.scheduleText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-4 py-2 self-stretch md:self-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Current Time</p>
            <p className="text-sm font-mono font-bold text-amber-300">{time || "--:--:--"}</p>
          </div>
          <div className="h-7 w-px bg-emerald-700/60"></div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Preset Rule</p>
            <p className="text-xs font-medium text-emerald-100">
              {sessionInfo.isClassDay ? `${sessionInfo.startTime} – ${sessionInfo.endTime}` : "No Classes"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
