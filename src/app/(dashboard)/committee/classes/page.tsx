import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ClassesClient } from "./ClassesClient";

export default async function ClassesPage() {
  await requireRole(["COMMITTEE"]);

  const [classes, teachers] = await Promise.all([
    db.class.findMany({
      orderBy: { name: "asc" },
      include: {
        teacher: true,
        students: true,
        _count: {
          select: {
            students: true,
            attendance: true,
            academicRecords: true,
          },
        },
      },
    }),
    db.user.findMany({
      where: { role: "TEACHER", isActive: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <ClassesClient initialClasses={classes as any} teachers={teachers as any} />
    </div>
  );
}
