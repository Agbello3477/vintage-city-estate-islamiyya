"use client";

import React, { useState, useTransition } from "react";
import { MONTH_SHORT_NAMES, formatCurrency, formatDate } from "@/lib/utils";
import { toggleFeePaymentAction } from "@/lib/actions";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle, AlertCircle, Receipt, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export interface FeeMonthItem {
  id?: string;
  monthIndex: number; // 1 to 12
  isPaid: boolean;
  amountPaid: number;
  paidAt: string | null;
}

export interface StudentFeeRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  academicYear: string;
  parentName: string;
  parentPhone: string | null;
  months: FeeMonthItem[]; // 12 items
}

interface FeeLedgerMatrixProps {
  studentsData: StudentFeeRow[];
  canEdit?: boolean; // True for Committee & Teachers, False for Parents
  currentAcademicYear?: string;
}

export function FeeLedgerMatrix({
  studentsData,
  canEdit = false,
  currentAcademicYear = "2025/2026",
}: FeeLedgerMatrixProps) {
  const [isPending, startTransition] = useTransition();

  // Selected fee item for editing modal
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    student?: StudentFeeRow;
    monthIndex?: number;
    currentPaid?: boolean;
    amount?: number;
  }>({ isOpen: false });

  const [customAmount, setCustomAmount] = useState<number>(5000);

  const handleOpenModal = (student: StudentFeeRow, monthItem: FeeMonthItem) => {
    if (!canEdit) return;
    setCustomAmount(monthItem.amountPaid > 0 ? monthItem.amountPaid : 5000);
    setActiveModal({
      isOpen: true,
      student,
      monthIndex: monthItem.monthIndex,
      currentPaid: monthItem.isPaid,
      amount: monthItem.amountPaid,
    });
  };

  const handleTogglePayment = (isPaid: boolean) => {
    if (!activeModal.student || !activeModal.monthIndex) return;

    startTransition(async () => {
      try {
        const res = await toggleFeePaymentAction({
          studentId: activeModal.student!.studentId,
          academicYear: activeModal.student!.academicYear || currentAcademicYear,
          monthIndex: activeModal.monthIndex!,
          isPaid,
          amountPaid: isPaid ? customAmount : 0,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(
            `Month ${activeModal.monthIndex} marked as ${
              isPaid ? "PAID" : "UNPAID / DUE"
            } with audit log recorded`
          );
          setActiveModal({ isOpen: false });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update fee record");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Paid (Cleared)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span>Unpaid / Due (Pending)</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Standard Monthly Fee: {formatCurrency(5000)} &bull; Academic Year: {currentAcademicYear}</span>
        </div>
      </div>

      {/* 12-Month Pill Grid Table */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3.5 min-w-[200px]">Student Details</th>
              {MONTH_SHORT_NAMES.map((m, idx) => (
                <th key={m} className="px-2 py-3.5 text-center min-w-[64px]">
                  M{idx + 1} ({m})
                </th>
              ))}
              <th className="px-4 py-3.5 text-right">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {studentsData.map((student) => {
              const paidMonthsCount = student.months.filter((m) => m.isPaid).length;
              const totalPaidAmount = student.months.reduce((acc, m) => acc + (m.isPaid ? m.amountPaid : 0), 0);

              return (
                <tr key={student.studentId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800 text-sm">
                      {student.studentName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {student.admissionNumber} &bull; {student.className}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Parent: {student.parentName}
                    </div>
                  </td>

                  {/* 12 Months Pills */}
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const monthIndex = idx + 1;
                    const monthItem =
                      student.months.find((m) => m.monthIndex === monthIndex) || {
                        monthIndex,
                        isPaid: false,
                        amountPaid: 0,
                        paidAt: null,
                      };

                    return (
                      <td key={monthIndex} className="px-1.5 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(student, monthItem)}
                          disabled={!canEdit}
                          className={`w-full py-1.5 px-2 rounded-lg font-bold text-[11px] border transition-all ${
                            monthItem.isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300"
                          } ${canEdit ? "cursor-pointer" : "cursor-default"}`}
                          title={
                            monthItem.isPaid
                              ? `Paid: ${formatCurrency(monthItem.amountPaid)} on ${formatDate(
                                  monthItem.paidAt
                                )}`
                              : `Unpaid: Due for ${MONTH_SHORT_NAMES[idx]}`
                          }
                        >
                          {monthItem.isPaid ? "PAID" : "DUE"}
                        </button>
                      </td>
                    );
                  })}

                  <td className="px-4 py-3.5 text-right">
                    <div className="font-bold text-slate-800 text-xs">
                      {paidMonthsCount}/12 Months
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold">
                      {formatCurrency(totalPaidAmount)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Payment Modal */}
      <Modal
        isOpen={activeModal.isOpen}
        onClose={() => setActiveModal({ isOpen: false })}
        title="Update Student Fee Status"
        subtitle={`Student: ${activeModal.student?.studentName} (${activeModal.student?.admissionNumber})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <p>
              <strong>Month:</strong> {activeModal.monthIndex ? MONTH_SHORT_NAMES[activeModal.monthIndex - 1] : ""} (Month {activeModal.monthIndex})
            </p>
            <p>
              <strong>Academic Year:</strong> {activeModal.student?.academicYear}
            </p>
            <p>
              <strong>Current Status:</strong>{" "}
              <span
                className={`font-bold ${
                  activeModal.currentPaid ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {activeModal.currentPaid ? "PAID" : "UNPAID / DUE"}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount (₦ NGN)
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {activeModal.currentPaid ? (
              <Button
                variant="danger"
                size="sm"
                loading={isPending}
                onClick={() => handleTogglePayment(false)}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Mark as Unpaid / Due</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                loading={isPending}
                onClick={() => handleTogglePayment(true)}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Mark as Paid</span>
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
