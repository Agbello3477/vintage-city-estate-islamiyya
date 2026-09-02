import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ScheduleBanner } from "@/components/attendance/ScheduleBanner";
import { StatCard } from "@/components/analytics/StatCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  School,
  Receipt,
  CalendarCheck,
  MessageSquareWarning,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default async function CommitteeDashboardPage() {
  const user = await requireRole(["COMMITTEE"]);

  // Gather stats
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalTickets,
    openTickets,
    totalFeePayments,
    recentLogs,
  ] = await Promise.all([
    db.student.count(),
    db.user.count({ where: { role: "TEACHER" } }),
    db.class.count(),
    db.feedbackTicket.count(),
    db.feedbackTicket.count({ where: { status: "OPEN" } }),
    db.studentFeePayment.findMany({ where: { isPaid: true } }),
    db.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);

  const totalFeeCollected = totalFeePayments.reduce((acc, f) => acc + f.amountPaid, 0);

  return (
    <div className="space-y-6">
      {/* Schedule Banner with Live Clock */}
      <ScheduleBanner />

      {/* Executive Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Executive Committee Dashboard
            </h1>
            <Badge variant="islamic">Super Admin</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Welcome back, {user.fullName}. Overview of Vintage City Estate Islamiyya operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/committee/fees"
            className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition-all"
          >
            Audit Fee Ledger
          </Link>
          <Link
            href="/committee/tickets"
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
          >
            Tickets ({openTickets} Open)
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled"
          value={totalStudents}
          subtitle="Registered children"
          icon={GraduationCap}
          variant="emerald"
        />
        <StatCard
          title="Islamiyya Ustadhs"
          value={totalTeachers}
          subtitle="Active faculty teachers"
          icon={Users}
          variant="amber"
        />
        <StatCard
          title="Active Classes"
          value={totalClasses}
          subtitle="Curriculum sections"
          icon={School}
          variant="sky"
        />
        <StatCard
          title="Fees Collected"
          value={formatCurrency(totalFeeCollected)}
          subtitle="2025/2026 Academic Year"
          icon={Receipt}
          variant="rose"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/committee/users"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-3">Manage Parents & Teachers</h3>
          <p className="text-xs text-slate-500 mt-1">
            Add, edit, deactivate, and manage Parent and Ustadh profiles, link children, and assign classes.
          </p>
        </Link>

        <Link
          href="/committee/fees"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-3">12-Month Fee Ledger</h3>
          <p className="text-xs text-slate-500 mt-1">
            View dynamic 12-month Red/Green status grid and perform manual overrides with audit logging.
          </p>
        </Link>

        <Link
          href="/committee/audit-logs"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-3">Immutable Audit Logs</h3>
          <p className="text-xs text-slate-500 mt-1">
            Inspect all system mutations, grade modifications, and authentication attempts.
          </p>
        </Link>
      </div>

      {/* Recent Audit Activities */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm">Recent System Security Logs</h3>
          <Link
            href="/committee/audit-logs"
            className="text-xs text-emerald-700 font-semibold hover:underline"
          >
            View all logs →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800">{log.userName || "System"}</span>{" "}
                <span className="text-slate-600">({log.action})</span> &bull;{" "}
                <span className="text-slate-500">{log.details}</span>
              </div>
              <span className="text-slate-400 font-mono shrink-0 ml-4">
                {formatDate(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
