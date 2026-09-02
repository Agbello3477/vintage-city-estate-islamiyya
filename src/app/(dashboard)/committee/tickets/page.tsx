import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { TicketManagement, TicketItem } from "@/components/tickets/TicketManagement";
import { MessageSquareWarning } from "lucide-react";

export default async function CommitteeTicketsPage() {
  await requireRole(["COMMITTEE"]);

  const rawTickets = await db.feedbackTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      parent: true,
      student: true,
    },
  });

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
        <h2 className="text-xl font-bold text-slate-800">Parent Feedback & Complaint Triage</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Triage inquiries, respond to suggestions, and resolve welfare issues
        </p>
      </div>

      <TicketManagement tickets={formattedTickets} userRole="COMMITTEE" />
    </div>
  );
}
