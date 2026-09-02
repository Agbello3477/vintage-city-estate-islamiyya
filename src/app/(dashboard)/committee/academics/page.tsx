import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { CommitteeAcademicsClient } from "./CommitteeAcademicsClient";

export default async function CommitteeAcademicsPage() {
  await requireRole(["COMMITTEE"]);

  const [records, students, classes] = await Promise.all([
    db.academicRecord.findMany({
      orderBy: { assessmentDate: "desc" },
      include: {
        student: true,
        class: true,
        gradedBy: true,
      },
    }),
    db.student.findMany({
      orderBy: { fullName: "asc" },
      include: { class: true },
    }),
    db.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <CommitteeAcademicsClient
        initialRecords={records as any}
        students={students.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          admissionNumber: s.admissionNumber,
          classId: s.classId,
          className: s.class.name,
        }))}
      />
    </div>
  );
}
