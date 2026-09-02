import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { FeeLedgerMatrix, StudentFeeRow } from "@/components/fees/FeeLedgerMatrix";
import { formatCurrency } from "@/lib/utils";
import { Receipt, ShieldCheck, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";

export default async function CommitteeFeesPage() {
  await requireRole(["COMMITTEE"]);

  const [students, allPayments] = await Promise.all([
    db.student.findMany({
      orderBy: { fullName: "asc" },
      include: {
        class: true,
        parent: true,
        feePayments: {
          orderBy: { monthIndex: "asc" },
        },
      },
    }),
    db.studentFeePayment.findMany(),
  ]);

  const totalPaidCount = allPayments.filter((p) => p.isPaid).length;
  const totalDueCount = allPayments.filter((p) => !p.isPaid).length;
  const totalRevenue = allPayments.reduce((acc, p) => acc + (p.isPaid ? p.amountPaid : 0), 0);

  const formattedRows: StudentFeeRow[] = students.map((s) => ({
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">12-Month Master Fee Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full override authority and financial auditing for Vintage City Estate Islamiyya
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
