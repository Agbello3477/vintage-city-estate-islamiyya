import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ScheduleBanner } from "@/components/attendance/ScheduleBanner";
import { ParentAttendanceViewer } from "@/components/attendance/ParentAttendanceViewer";

export default async function ParentAttendancePage() {
  const user = await requireRole(["PARENT"]);

  const children = await db.student.findMany({
    where: { parentId: user.id },
    include: {
      class: true,
      attendance: {
        orderBy: { sessionDate: "desc" },
      },
    },
  });

  const childrenData = children.map((c) => {
    const totalSessions = c.attendance.length;
    const presentCount = c.attendance.filter((a) => a.status === "PRESENT").length;
    const lateCount = c.attendance.filter((a) => a.status === "LATE").length;
    const excusedCount = c.attendance.filter((a) => a.status === "EXCUSED").length;
    const absentCount = c.attendance.filter((a) => a.status === "ABSENT").length;
    const attendancePercentage =
      totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

    return {
      studentId: c.id,
      studentName: c.fullName,
      admissionNumber: c.admissionNumber,
      className: c.class.name,
      totalSessions,
      presentCount,
      lateCount,
      excusedCount,
      absentCount,
      attendancePercentage,
      records: c.attendance.map((r) => ({
        id: r.id,
        sessionDate: r.sessionDate,
        checkInTime: r.checkInTime ? r.checkInTime.toISOString() : null,
        checkOutTime: r.checkOutTime ? r.checkOutTime.toISOString() : null,
        status: r.status as any,
        remarks: r.remarks,
      })),
    };
  });

  return (
    <div className="space-y-6">
      <ScheduleBanner />

      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Child Attendance & Session Tracking</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Live daily check-in and check-out logs, punctuality metrics, and absence notices
        </p>
      </div>

      <ParentAttendanceViewer childrenData={childrenData} />
    </div>
  );
}
