import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { FeeLedgerMatrix, StudentFeeRow } from "@/components/fees/FeeLedgerMatrix";

export default async function ParentFeesPage() {
  const user = await requireRole(["PARENT"]);

  const children = await db.student.findMany({
    where: { parentId: user.id },
    include: {
      class: true,
      parent: true,
      feePayments: {
        orderBy: { monthIndex: "asc" },
      },
    },
  });

  const formattedRows: StudentFeeRow[] = children.map((s) => ({
    studentId: s.id,
    studentName: s.fullName,
    admissionNumber: s.admissionNumber,
    className: s.class.name,
    academicYear: s.class.academicYear || "2025/2026",
    parentName: s.parent.fullName,
    parentPhone: s.parent.phoneNumber,
    months: s.feePayments.map((p) => ({
      id: p.id,
      monthIndex: p.monthIndex,
      isPaid: p.isPaid,
      amountPaid: p.amountPaid,
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">12-Month Fee Payment Matrix</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View tuition status for all registered children with clear Green (Paid) and Red (Due) badges
        </p>
      </div>

      <FeeLedgerMatrix
        studentsData={formattedRows}
        canEdit={false}
        currentAcademicYear="2025/2026"
      />
    </div>
  );
}
