import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { CommitteeAcademicsClient } from "../../committee/academics/CommitteeAcademicsClient";

export default async function TeacherGradebookPage({
  searchParams,
}: {
  searchParams: { classId?: string };
}) {
  const user = await requireRole(["TEACHER", "COMMITTEE"]);

  const assignedClasses = await db.class.findMany({
    where: user.role === "COMMITTEE" ? {} : { teacherId: user.id },
    orderBy: { name: "asc" },
  });

  const classIds = assignedClasses.map((c) => c.id);

  const [records, tahfizRecords, students] = await Promise.all([
    db.academicRecord.findMany({
      where: { classId: { in: classIds } },
      orderBy: { assessmentDate: "desc" },
      include: {
        student: true,
        class: true,
        gradedBy: true,
      },
    }),
    db.tahfizProgress.findMany({
      where: { student: { classId: { in: classIds } } },
      orderBy: { surahNumber: "asc" },
    }),
    db.student.findMany({
      where: { classId: { in: classIds } },
      orderBy: { fullName: "asc" },
      include: {
        class: true,
        parent: true,
        attendance: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <CommitteeAcademicsClient
        initialRecords={records as any}
        tahfizRecords={tahfizRecords as any}
        students={students.map((s) => {
          const totalAtt = s.attendance.length;
          const presentAtt = s.attendance.filter((a) => a.status === "PRESENT").length;
          const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

          return {
            id: s.id,
            fullName: s.fullName,
            admissionNumber: s.admissionNumber,
            gender: s.gender,
            classId: s.classId,
            className: s.class.name,
            academicYear: s.class.academicYear || "2025/2026",
            parentName: s.parent.fullName,
            attendancePercentage: attPct,
            totalSessions: totalAtt,
            presentSessions: presentAtt,
          };
        })}
      />
    </div>
  );
}
