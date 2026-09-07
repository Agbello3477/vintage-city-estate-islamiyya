import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ScheduleBanner } from "@/components/attendance/ScheduleBanner";
import {
  CommitteeAttendanceClient,
  AttendanceRecordItem,
} from "./CommitteeAttendanceClient";

export default async function CommitteeAttendancePage() {
  await requireRole(["COMMITTEE"]);

  const [rawAttendance, rawClasses] = await Promise.all([
    db.attendance.findMany({
      orderBy: { sessionDate: "desc" },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        class: true,
        markedBy: true,
      },
    }),
    db.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  const attendanceRecords: AttendanceRecordItem[] = rawAttendance.map((rec) => ({
    id: rec.id,
    sessionDate: rec.sessionDate,
    status: rec.status as any,
    checkInTime: rec.checkInTime ? rec.checkInTime.toISOString() : null,
    checkOutTime: rec.checkOutTime ? rec.checkOutTime.toISOString() : null,
    remarks: rec.remarks,
    student: {
      id: rec.student.id,
      fullName: rec.student.fullName,
      admissionNumber: rec.student.admissionNumber,
      parent: rec.student.parent
        ? {
            fullName: rec.student.parent.fullName,
          }
        : null,
    },
    class: {
      id: rec.class.id,
      name: rec.class.name,
    },
    markedBy: rec.markedBy
      ? {
          fullName: rec.markedBy.fullName,
        }
      : null,
  }));

  const classes = rawClasses.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <ScheduleBanner />
      <CommitteeAttendanceClient initialRecords={attendanceRecords} classes={classes} />
    </div>
  );
}

