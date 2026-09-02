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

  const [records, students] = await Promise.all([
    db.academicRecord.findMany({
      where: { classId: { in: classIds } },
      orderBy: { assessmentDate: "desc" },
      include: {
        student: true,
        class: true,
        gradedBy: true,
      },
    }),
    db.student.findMany({
      where: { classId: { in: classIds } },
      orderBy: { fullName: "asc" },
      include: { class: true },
    }),
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
