import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { StudentsClient } from "../../committee/students/StudentsClient";

export default async function TeacherStudentsPage() {
  const user = await requireRole(["TEACHER", "COMMITTEE"]);

  const assignedClasses = await db.class.findMany({
    where: user.role === "COMMITTEE" ? {} : { teacherId: user.id },
    orderBy: { name: "asc" },
  });

  const classIds = assignedClasses.map((c) => c.id);

  const [students, parents] = await Promise.all([
    db.student.findMany({
      where: { classId: { in: classIds } },
      orderBy: { fullName: "asc" },
      include: {
        class: true,
        parent: true,
        _count: {
          select: {
            attendance: true,
            academicRecords: true,
          },
        },
      },
    }),
    db.user.findMany({
      where: { role: "PARENT", isActive: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <StudentsClient
        initialStudents={students as any}
        classes={assignedClasses}
        parents={parents}
      />
    </div>
  );
}
