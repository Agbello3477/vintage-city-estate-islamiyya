import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ScheduleBanner } from "@/components/attendance/ScheduleBanner";
import { TeacherAttendanceManager } from "@/components/attendance/TeacherAttendanceManager";
import { formatSessionDate } from "@/lib/schedule";
import { redirect } from "next/navigation";

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: { classId?: string; date?: string };
}) {
  const user = await requireRole(["TEACHER", "COMMITTEE"]);

  // Get assigned classes
  const assignedClasses = await db.class.findMany({
    where: user.role === "COMMITTEE" ? {} : { teacherId: user.id },
    orderBy: { name: "asc" },
  });

  if (assignedClasses.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
        You do not have any assigned classes to take attendance for.
      </div>
    );
  }

  const selectedClassId = searchParams.classId || assignedClasses[0].id;
  const sessionDate = searchParams.date || formatSessionDate();

  const selectedClass = assignedClasses.find((c) => c.id === selectedClassId) || assignedClasses[0];

  // Fetch students enrolled in this class
  const students = await db.student.findMany({
    where: { classId: selectedClass.id },
    orderBy: { fullName: "asc" },
    include: {
      parent: true,
      attendance: {
        where: { sessionDate },
      },
    },
  });

  const studentsFormatted = students.map((s) => {
    const record = s.attendance[0];
    return {
      id: s.id,
      admissionNumber: s.admissionNumber,
      fullName: s.fullName,
      gender: s.gender,
      parentName: s.parent.fullName,
      parentPhone: s.parent.phoneNumber,
      attendanceRecord: record
        ? {
            id: record.id,
            status: record.status as any,
            checkInTime: record.checkInTime ? record.checkInTime.toISOString() : null,
            checkOutTime: record.checkOutTime ? record.checkOutTime.toISOString() : null,
            remarks: record.remarks,
          }
        : null,
    };
  });

  return (
    <div className="space-y-6">
      <ScheduleBanner />

      {/* Class Selector Bar */}
      {assignedClasses.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {assignedClasses.map((c) => (
            <a
              key={c.id}
              href={`/teacher/attendance?classId=${c.id}&date=${sessionDate}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                c.id === selectedClass.id
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {c.name}
            </a>
          ))}
        </div>
      )}

      <TeacherAttendanceManager
        classId={selectedClass.id}
        className={selectedClass.name}
        sessionDate={sessionDate}
        students={studentsFormatted}
      />
    </div>
  );
}
