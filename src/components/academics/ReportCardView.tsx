"use client";

import React, { useRef } from "react";
import { formatDate, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Printer, Download, Award, CheckCircle2, Shield } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface AcademicRecordItem {
  id: string;
  subject: string;
  title: string;
  type: string;
  score: number;
  totalObtainable: number;
  assessmentDate: string;
  teacherFeedback: string | null;
}

interface ReportCardProps {
  student: {
    id: string;
    admissionNumber: string;
    fullName: string;
    gender: string;
    className: string;
    academicYear: string;
    parentName: string;
    parentPhone: string | null;
  };
  attendanceSummary: {
    totalSessions: number;
    presentCount: number;
    attendancePercentage: number;
  };
  academicRecords: AcademicRecordItem[];
}

export function ReportCardView({
  student,
  attendanceSummary,
  academicRecords,
}: ReportCardProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      toast.info("Generating PDF report card...");
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`VCE_Islamiyya_ReportCard_${student.admissionNumber.replace(/\//g, "_")}.pdf`);
      toast.success("Report card downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate PDF");
    }
  };

  // Group assessments by subject
  const subjectMap = new Map<string, { totalScore: number; maxScore: number; records: AcademicRecordItem[] }>();
  academicRecords.forEach((r) => {
    const existing = subjectMap.get(r.subject) || { totalScore: 0, maxScore: 0, records: [] };
    existing.totalScore += r.score;
    existing.maxScore += r.totalObtainable;
    existing.records.push(r);
    subjectMap.set(r.subject, existing);
  });

  const subjectSummary = Array.from(subjectMap.entries()).map(([subject, data]) => {
    const percentage = data.maxScore > 0 ? Math.round((data.totalScore / data.maxScore) * 100) : 0;
    let grade = "A";
    if (percentage < 50) grade = "F";
    else if (percentage < 60) grade = "D";
    else if (percentage < 70) grade = "C";
    else if (percentage < 85) grade = "B";

    return {
      subject,
      totalScore: data.totalScore,
      maxScore: data.maxScore,
      percentage,
      grade,
      records: data.records,
    };
  });

  const overallAverage =
    subjectSummary.length > 0
      ? Math.round(subjectSummary.reduce((acc, s) => acc + s.percentage, 0) / subjectSummary.length)
      : 0;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="no-print flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Official Term Progress Report Card</h3>
          <p className="text-xs text-slate-500">Ready for high-resolution printing or PDF export</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </Button>
          <Button onClick={handleDownloadPDF} variant="primary" size="sm">
            <Download className="w-4 h-4" />
            <span>Export Official PDF</span>
          </Button>
        </div>
      </div>

      {/* Printable Report Card Container */}
      <div
        ref={reportRef}
        className="bg-white p-8 rounded-2xl border-2 border-emerald-800/40 shadow-glass text-slate-800 max-w-4xl mx-auto space-y-6"
      >
        {/* Header with Islamic Motif */}
        <div className="text-center border-b-2 border-emerald-800 pb-5">
          <p className="text-xs font-serif text-emerald-800 tracking-widest mb-1 font-semibold">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">🕌</span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-950 uppercase">
                Vintage City Estate Islamiyya
              </h1>
              <p className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
                Knowledge &bull; Faith &bull; Excellence &bull; Character
              </p>
            </div>
          </div>
          <div className="mt-2 inline-block px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
            OFFICIAL TERM PROGRESS & TAHFIZ REPORT CARD &bull; {student.academicYear}
          </div>
        </div>

        {/* Student Metadata Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-medium block uppercase text-[10px]">Student Name</span>
            <span className="font-bold text-slate-900 text-sm">{student.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block uppercase text-[10px]">Admission No.</span>
            <span className="font-mono font-bold text-slate-900">{student.admissionNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block uppercase text-[10px]">Class & Session</span>
            <span className="font-bold text-emerald-800">{student.className}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block uppercase text-[10px]">Parent / Guardian</span>
            <span className="font-semibold text-slate-800">{student.parentName}</span>
          </div>
        </div>

        {/* Academic Performance Table */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Islamic Studies & Tahfiz Assessment Ledger</span>
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-4 py-2.5">Latest Assessment / Memorization</th>
                  <th className="px-3 py-2.5 text-center">Score</th>
                  <th className="px-3 py-2.5 text-center">Percentage</th>
                  <th className="px-3 py-2.5 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectSummary.map((sub) => {
                  const latest = sub.records[sub.records.length - 1];
                  return (
                    <tr key={sub.subject} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-900">{sub.subject}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-medium">{latest?.title || "Continuous Assessment"}</div>
                        {latest?.teacherFeedback && (
                          <p className="text-[10px] text-emerald-700 italic mt-0.5">
                            "{latest.teacherFeedback}"
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-semibold text-slate-800">
                        {sub.totalScore}/{sub.maxScore}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-emerald-800">
                        {sub.percentage}%
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block w-6 h-6 leading-6 rounded-md font-bold text-white bg-emerald-800 text-center text-xs">
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200">
            <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
              Attendance & Punctuality
            </h5>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Sessions Attended:</span>
              <span className="font-bold text-slate-800">
                {attendanceSummary.presentCount} / {attendanceSummary.totalSessions}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-600">Attendance Percentage:</span>
              <span className="font-bold text-emerald-800 text-sm">
                {attendanceSummary.attendancePercentage}%
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200">
            <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
              Overall Academic Standing
            </h5>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Terminal Average:</span>
              <span className="font-bold text-amber-900 text-base">{overallAverage}%</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-600">Islamic Evaluation:</span>
              <span className="font-bold text-emerald-800">
                {overallAverage >= 80 ? "Mumtaz (Excellent)" : "Jayyid Jiddan (Very Good)"}
              </span>
            </div>
          </div>
        </div>

        {/* Official Signatures & Seal */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10 flex items-end justify-center font-serif text-slate-600 italic">
              Ustadh Ahmad S.
            </div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              Class Ustadh
            </div>
          </div>

          <div>
            <div className="h-10 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-700/60 flex items-center justify-center text-[9px] font-black text-emerald-800 uppercase tracking-tighter transform rotate-[-8deg]">
                VCE SEAL
              </div>
            </div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              Official Estate Seal
            </div>
          </div>

          <div>
            <div className="h-10 flex items-end justify-center font-serif text-slate-600 italic">
              Alhaji Faruq Al-Mansoor
            </div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
              Committee Chairman
            </div>
          </div>
        </div>

        <div className="text-center pt-2 text-[10px] text-slate-400 font-medium border-t border-slate-100">
          Official Electronic Student Progress Document &bull; Powered by MaSha Tech Innovations
        </div>
      </div>
    </div>
  );
}
