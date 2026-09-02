import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { AuditLogViewer, AuditLogItem } from "@/components/analytics/AuditLogViewer";
import { ShieldCheck } from "lucide-react";

export default async function CommitteeAuditLogsPage() {
  await requireRole(["COMMITTEE"]);

  const rawLogs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedLogs: AuditLogItem[] = rawLogs.map((l) => ({
    id: l.id,
    userName: l.userName,
    userRole: l.userRole,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    details: l.details,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h2 className="text-xl font-bold text-slate-800">Immutable System Audit Trail</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Tamper-evident logs of fee updates, grade entries, user authentication, and system events
        </p>
      </div>

      <AuditLogViewer logs={formattedLogs} />
    </div>
  );
}
