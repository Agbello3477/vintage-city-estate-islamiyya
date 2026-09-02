import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { TicketManagement, TicketItem } from "@/components/tickets/TicketManagement";

export default async function ParentTicketsPage() {
  const user = await requireRole(["PARENT"]);

  const [rawTickets, children] = await Promise.all([
    db.feedbackTicket.findMany({
      where: { parentId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        parent: true,
        student: true,
      },
    }),
    db.student.findMany({
      where: { parentId: user.id },
      select: { id: true, fullName: true, admissionNumber: true },
    }),
  ]);

  const formattedTickets: TicketItem[] = rawTickets.map((t) => ({
    id: t.id,
    category: t.category as any,
    title: t.title,
    message: t.message,
    status: t.status as any,
    committeeResponse: t.committeeResponse,
    respondedAt: t.respondedAt ? t.respondedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    parent: {
      id: t.parent.id,
      fullName: t.parent.fullName,
      email: t.parent.email,
      phoneNumber: t.parent.phoneNumber,
    },
    student: t.student
      ? {
          id: t.student.id,
          fullName: t.student.fullName,
          admissionNumber: t.student.admissionNumber,
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Feedback & Complaints Channel</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit suggestions, academic inquiries, or welfare requests directly to the Islamiyya Committee
        </p>
      </div>

      <TicketManagement
        tickets={formattedTickets}
        userRole="PARENT"
        childrenOptions={children}
      />
    </div>
  );
}
