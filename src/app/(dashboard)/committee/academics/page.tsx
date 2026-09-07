import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { CommitteeAcademicsClient } from "./CommitteeAcademicsClient";

export default async function CommitteeAcademicsPage() {
  await requireRole(["COMMITTEE"]);

  const [records, tahfizRecords, students, classes] = await Promise.all([
    db.academicRecord.findMany({
      orderBy: { assessmentDate: "desc" },
      include: {
        student: true,
        class: true,
        gradedBy: true,
      },
    }),
    db.tahfizProgress.findMany({
      orderBy: { surahNumber: "asc" },
    }),
    db.student.findMany({
      orderBy: { fullName: "asc" },
      include: {
        class: true,
        parent: true,
        attendance: true,
      },
    }),
    db.class.findMany({ orderBy: { name: "asc" } }),
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
