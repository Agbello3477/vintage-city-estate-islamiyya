import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { FeeLedgerMatrix, StudentFeeRow } from "@/components/fees/FeeLedgerMatrix";
import { formatCurrency } from "@/lib/utils";
import { Receipt, ShieldCheck, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";

export default async function CommitteeFeesPage() {
  await requireRole(["COMMITTEE"]);

  const students = await db.student.findMany({
    orderBy: { fullName: "asc" },
    include: {
      class: true,
      parent: true,
      feePayments: {
        orderBy: { monthIndex: "asc" },
      },
    },
  });

  const formattedRows: StudentFeeRow[] = students.map((s) => {
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
      className: s.class?.name || "Unassigned",
      academicYear: s.class?.academicYear || "2025/2026",
      parentName: s.parent?.fullName || "N/A",
      parentPhone: s.parent?.phoneNumber || null,
      months,
    };
  });

  const totalPaidCount = formattedRows.reduce(
    (acc, row) => acc + row.months.filter((m) => m.isPaid).length,
    0
  );
  const totalDueCount = formattedRows.reduce(
    (acc, row) => acc + row.months.filter((m) => !m.isPaid).length,
    0
  );
  const totalRevenue = formattedRows.reduce(
    (acc, row) => acc + row.months.reduce((sum, m) => sum + (m.isPaid ? m.amountPaid : 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">12-Month Master Fee Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full override authority and financial auditing for Madarasatul Islamiyya wa Tarbiyya
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalRevenue)}
          subtitle="All confirmed student payments"
          icon={Receipt}
          variant="emerald"
        />
        <StatCard
          title="Paid Month Badges"
          value={totalPaidCount}
          subtitle="Cleared green badges"
          icon={CheckCircle2}
          variant="sky"
        />
        <StatCard
          title="Outstanding Due"
          value={totalDueCount}
          subtitle="Red alert indicators"
          icon={AlertCircle}
          variant="rose"
        />
      </div>

      {/* Interactive Fee Ledger Matrix */}
      <FeeLedgerMatrix
        studentsData={formattedRows}
        canEdit={true}
        currentAcademicYear="2025/2026"
      />
    </div>
  );
}
