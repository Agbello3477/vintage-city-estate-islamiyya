import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ScheduleBanner } from "@/components/attendance/ScheduleBanner";
import { StatCard } from "@/components/analytics/StatCard";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  Receipt,
  MessageSquareWarning,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default async function ParentDashboardPage() {
  const user = await requireRole(["PARENT"]);

  // Fetch children
  const children = await db.student.findMany({
    where: { parentId: user.id },
    include: {
      class: true,
      attendance: {
        orderBy: { sessionDate: "desc" },
        take: 5,
      },
      academicRecords: {
        orderBy: { assessmentDate: "desc" },
        take: 5,
      },
      feePayments: {
        orderBy: { monthIndex: "asc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <ScheduleBanner />

      {/* Parent Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Parent & Guardian Portal
            </h1>
            <Badge variant="info">Enrolled Parent</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Assalamu Alaikum, {user.fullName}. Monitoring progress for {children.length} enrolled {children.length === 1 ? "child" : "children"}.
          </p>
        </div>

        <Link
          href="/parent/academics"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-glass transition-all"
        >
          <Award className="w-4 h-4" />
          <span>View Official Report Cards</span>
        </Link>
      </div>

      {/* Children Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child) => {
          const totalSessions = child.attendance.length;
          const presentCount = child.attendance.filter((a) => a.status === "PRESENT").length;
          const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

          const paidMonths = child.feePayments.filter((p) => p.isPaid).length;
          const latestAttendance = child.attendance[0];

          return (
            <div
              key={child.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-inner">
                    {child.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{child.fullName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Adm: {child.admissionNumber} &bull; <strong className="text-emerald-800">{child.class.name}</strong>
                    </p>
                  </div>
                </div>

                <Badge variant={attendancePct >= 85 ? "success" : "warning"}>
                  {attendancePct}% Attendance
                </Badge>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Latest Session</span>
                  <span className="font-bold text-slate-800">
                    {latestAttendance ? latestAttendance.status : "No record"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Latest Check-In</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {latestAttendance?.checkInTime ? formatTime(latestAttendance.checkInTime) : "--:--"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fee Status</span>
                  <span className="font-bold text-emerald-800">{paidMonths}/12 Paid</span>
                </div>
              </div>

              {/* 12-Month Pill Micro-Matrix */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">12-Month Fee Quick Overview</p>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-[10px] text-center font-bold">
                  {child.feePayments.map((p) => (
                    <div
                      key={p.id}
                      className={`py-1 rounded border ${
                        p.isPaid
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                      title={p.isPaid ? `Month ${p.monthIndex}: Paid` : `Month ${p.monthIndex}: Due`}
                    >
                      M{p.monthIndex}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <Link
                  href="/parent/attendance"
                  className="flex-1 text-center py-2 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100 font-semibold transition-colors"
                >
                  Session Timestamps
                </Link>
                <Link
                  href="/parent/academics"
                  className="flex-1 text-center py-2 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 font-semibold transition-colors"
                >
                  Report Card PDF
                </Link>
                <Link
                  href="/parent/fees"
                  className="flex-1 text-center py-2 bg-sky-50 text-sky-800 rounded-xl hover:bg-sky-100 font-semibold transition-colors"
                >
                  Fee Ledger
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
