import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ScheduleBanner } from "@/components/attendance/ScheduleBanner";
import { StatCard } from "@/components/analytics/StatCard";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  GraduationCap,
  CalendarCheck,
  BookOpenCheck,
  Receipt,
  ArrowRight,
  Sparkles,
  Users,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default async function TeacherDashboardPage() {
  const user = await requireRole(["TEACHER"]);

  // Get assigned classes
  const assignedClasses = await db.class.findMany({
    where: { teacherId: user.id },
    include: {
      students: true,
      _count: {
        select: {
          students: true,
          attendance: true,
          academicRecords: true,
        },
      },
    },
  });

  const totalAssignedStudents = assignedClasses.reduce((acc, c) => acc + c.students.length, 0);
  const totalGradedRecords = assignedClasses.reduce((acc, c) => acc + c._count.academicRecords, 0);

  return (
    <div className="space-y-6">
      <ScheduleBanner />

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ustadh Portal & Schedule
            </h1>
            <Badge variant="islamic">Islamiyya Faculty</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Assalamu Alaikum, {user.fullName}. You manage students, attendance, and grades for {assignedClasses.length} assigned sections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/teacher/students"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll / Manage Students</span>
          </Link>
          <Link
            href="/teacher/attendance"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-glass transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Classes"
          value={assignedClasses.length}
          subtitle="Curriculum sections"
          icon={GraduationCap}
          variant="emerald"
        />
        <StatCard
          title="Class Students"
          value={totalAssignedStudents}
          subtitle="Enrolled under your care"
          icon={Users}
          variant="amber"
        />
        <StatCard
          title="Graded Assessments"
          value={totalGradedRecords}
          subtitle="Tahfiz, Fiqh & Arabic tests"
          icon={BookOpenCheck}
          variant="sky"
        />
      </div>

      {/* Quick Access Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/teacher/students"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-3">Add & Manage Students</h3>
          <p className="text-xs text-slate-500 mt-1">
            Enroll new children into your assigned classes, update profiles, and link parent guardians.
          </p>
        </Link>

        <Link
          href="/teacher/attendance"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-3">Dynamic Attendance</h3>
          <p className="text-xs text-slate-500 mt-1">
            1-Click batch check-in/out with Thu/Fri (4-6 PM) & Sat/Sun (8:30 AM-1 PM) schedule enforcement.
          </p>
        </Link>

        <Link
          href="/teacher/gradebook"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-3">Tahfiz & Gradebook</h3>
          <p className="text-xs text-slate-500 mt-1">
            Record Quran memorization (Surah/Ayah), Tajweed scores, Hadith, and Fiqh assessments.
          </p>
        </Link>
      </div>

      {/* Assigned Classes Cards */}
      <div>
        <h3 className="font-bold text-slate-800 text-base mb-3">Your Assigned Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{cls.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">Academic Year: {cls.academicYear}</p>
                </div>
                <Badge variant="islamic">{cls.students.length} Students</Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                <Link
                  href={`/teacher/students`}
                  className="p-2 bg-slate-50 text-slate-800 rounded-xl hover:bg-slate-100 font-semibold"
                >
                  Manage Roster
                </Link>
                <Link
                  href={`/teacher/attendance?classId=${cls.id}`}
                  className="p-2 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100 font-semibold"
                >
                  Attendance
                </Link>
                <Link
                  href={`/teacher/gradebook?classId=${cls.id}`}
                  className="p-2 bg-amber-50 text-amber-800 rounded-xl hover:bg-amber-100 font-semibold"
                >
                  Gradebook
                </Link>
                <Link
                  href={`/teacher/fees?classId=${cls.id}`}
                  className="p-2 bg-sky-50 text-sky-800 rounded-xl hover:bg-sky-100 font-semibold"
                >
                  Fees
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
