import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { FeeLedgerMatrix, StudentFeeRow } from "@/components/fees/FeeLedgerMatrix";

export default async function TeacherFeesPage() {
  const user = await requireRole(["TEACHER", "COMMITTEE"]);

  const assignedClasses = await db.class.findMany({
    where: user.role === "COMMITTEE" ? {} : { teacherId: user.id },
    include: {
      students: {
        include: {
          parent: true,
          feePayments: {
            orderBy: { monthIndex: "asc" },
          },
        },
      },
    },
  });

  const students = assignedClasses.flatMap((c) =>
    c.students.map((s) => ({
      ...s,
      className: c.name,
      academicYear: c.academicYear,
    }))
  );

  const formattedRows: StudentFeeRow[] = students.map((s) => ({
    studentId: s.id,
    studentName: s.fullName,
    admissionNumber: s.admissionNumber,
    className: s.className,
    academicYear: s.academicYear || "2025/2026",
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
        <h2 className="text-xl font-bold text-slate-800">Class Fee Ledger & Verification</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Mark student monthly fees as Paid or Due with mandatory audit log recording
        </p>
      </div>

      <FeeLedgerMatrix
        studentsData={formattedRows}
        canEdit={true}
        currentAcademicYear="2025/2026"
      />
    </div>
  );
}
