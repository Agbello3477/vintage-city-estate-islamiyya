import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { StudentsClient } from "./StudentsClient";

export default async function StudentsPage() {
  await requireRole(["COMMITTEE"]);

  const [students, classes, parents] = await Promise.all([
    db.student.findMany({
      orderBy: { fullName: "asc" },
      include: {
        class: true,
        parent: true,
        _count: {
          select: {
            attendance: true,
            academicRecords: true,
            feePayments: true,
          },
        },
      },
    }),
    db.class.findMany({
      orderBy: { name: "asc" },
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
        classes={classes as any}
        parents={parents as any}
      />
    </div>
  );
}
