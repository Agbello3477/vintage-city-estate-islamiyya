import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { FeeLedgerMatrix, StudentFeeRow } from "@/components/fees/FeeLedgerMatrix";

export default async function TeacherFeesPage() {
  const user = await requireRole(["TEACHER", "COMMITTEE"]);

  // Fetch assigned classes, or fallback to all students if none assigned
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

  let rawStudents = assignedClasses.flatMap((c) =>
    c.students.map((s) => ({
      ...s,
      className: c.name,
      academicYear: c.academicYear,
    }))
  );

  if (rawStudents.length === 0) {
    const allStudents = await db.student.findMany({
      orderBy: { fullName: "asc" },
      include: {
        class: true,
        parent: true,
        feePayments: {
          orderBy: { monthIndex: "asc" },
        },
      },
    });
    rawStudents = allStudents.map((s) => ({
      ...s,
      className: s.class?.name || "Unassigned",
      academicYear: s.class?.academicYear || "2025/2026",
    }));
  }

  const formattedRows: StudentFeeRow[] = rawStudents.map((s) => {
    const paymentMap = new Map(s.feePayments.map((p) => [p.monthIndex, p]));
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = i + 1;
      const payment = paymentMap.get(monthIndex);
      return {
        id: payment?.id,
        monthIndex,
        isPaid: payment?.isPaid ?? false,
        amountPaid: payment?.amountPaid ?? (payment?.isPaid ? 5000 : 0),
        paidAt: payment?.paidAt ? payment.paidAt.toISOString() : null,
      };
    });

    return {
      studentId: s.id,
      studentName: s.fullName,
      admissionNumber: s.admissionNumber,
      className: s.className,
      academicYear: s.academicYear || "2025/2026",
      parentName: s.parent?.fullName || "N/A",
      parentPhone: s.parent?.phoneNumber || null,
      months,
    };
  });

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
