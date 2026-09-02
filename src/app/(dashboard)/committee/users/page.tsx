import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { UserManagementClient } from "./UserManagementClient";

export default async function UsersPage() {
  await requireRole(["COMMITTEE"]);

  const [users, students] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        classesTaught: true,
        children: {
          include: {
            class: true,
          },
        },
      },
    }),
    db.student.findMany({
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        admissionNumber: true,
        parentId: true,
        class: {
          select: { name: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <UserManagementClient initialUsers={users as any} allStudents={students as any} />
    </div>
  );
}
