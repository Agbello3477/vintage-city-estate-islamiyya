"use client";

import React, { useState } from "react";
import { GradeEntryModal } from "@/components/academics/GradeEntryModal";
import { TahfizProgressMap, TahfizRecordItem } from "@/components/tahfiz/TahfizProgressMap";
import { exportBulkReportCardsZip, BulkReportStudentData } from "@/lib/export-utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  BookOpenCheck,
  Award,
  Plus,
  Search,
  Filter,
  FileArchive,
  BookOpen,
  Sparkles,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export interface RecordItem {
  id: string;
  subject: string;
  title: string;
  type: string;
  score: number;
  totalObtainable: number;
  assessmentDate: string;
  teacherFeedback: string | null;
  student: {
    id: string;
    fullName: string;
    admissionNumber: string;
  };
  class: {
    id: string;
    name: string;
  };
  gradedBy?: {
    fullName: string;
  } | null;
}

export interface StudentLookupItem {
  id: string;
  fullName: string;
  admissionNumber: string;
  gender?: string;
  classId: string;
  className: string;
  academicYear?: string;
  parentName?: string;
  attendancePercentage?: number;
  totalSessions?: number;
  presentSessions?: number;
  subjects?: Array<{
    subject: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
    grade: string;
  }>;
  overallAverage?: number;
}

export function CommitteeAcademicsClient({
  initialRecords,
  tahfizRecords = [],
  students,
  canEdit = true,
}: {
  initialRecords: RecordItem[];
  tahfizRecords?: TahfizRecordItem[];
  students: StudentLookupItem[];
  canEdit?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"ACADEMICS" | "TAHFIZ">("ACADEMICS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>("");

  const filtered = initialRecords.filter((r) => {
    if (subjectFilter !== "ALL" && r.subject !== subjectFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchStudent = r.student.fullName.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      if (!matchStudent && !matchTitle) return false;
    }
    return true;
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentTahfizRecords = tahfizRecords.filter((t) => t.studentId === selectedStudentId);

  // Handle Bulk Report Card ZIP Download
  const handleDownloadAllReportCards = async () => {
    if (students.length === 0) {
      toast.error("No students available to generate report cards.");
      return;
    }

    setIsExportingZip(true);
    setExportProgress(`Generating 0 / ${students.length}...`);

    try {
      // Build full student data array
      const bulkData: BulkReportStudentData[] = students.map((s) => {
        const studentAssessments = initialRecords.filter((r) => r.student.id === s.id);
        const subjectMap = new Map<string, { totalScore: number; maxScore: number }>();

        studentAssessments.forEach((r) => {
          const ex = subjectMap.get(r.subject) || { totalScore: 0, maxScore: 0 };
          ex.totalScore += r.score;
          ex.maxScore += r.totalObtainable;
          subjectMap.set(r.subject, ex);
        });

        const subjects = Array.from(subjectMap.entries()).map(([sub, data]) => {
          const pct = data.maxScore > 0 ? Math.round((data.totalScore / data.maxScore) * 100) : 0;
          let grade = "A";
          if (pct < 50) grade = "F";
          else if (pct < 60) grade = "D";
          else if (pct < 70) grade = "C";
          else if (pct < 85) grade = "B";

          return {
            subject: sub,
            totalScore: data.totalScore,
            maxScore: data.maxScore,
            percentage: pct,
            grade,
          };
        });

        const overall =
          subjects.length > 0
            ? Math.round(subjects.reduce((acc, x) => acc + x.percentage, 0) / subjects.length)
            : 0;

        return {
          id: s.id,
          fullName: s.fullName,
          admissionNumber: s.admissionNumber,
          gender: s.gender || "MALE",
          className: s.className,
          academicYear: s.academicYear || "2025/2026",
          parentName: s.parentName || "Parent Guardian",
          attendancePercentage: s.attendancePercentage || 95,
          totalSessions: s.totalSessions || 40,
          presentSessions: s.presentSessions || 38,
          subjects,
          overallAverage: overall,
        };
      });

      await exportBulkReportCardsZip(bulkData, (cur, total) => {
        setExportProgress(`Generating ${cur} / ${total} PDF report cards...`);
      });

      toast.success(`Successfully downloaded ${students.length} student report cards in ZIP archive!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate bulk ZIP archive");
    } finally {
      setIsExportingZip(false);
      setExportProgress("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Academic & Tahfiz Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage subject gradebooks, Quran Juz 1–30 progress map, audio voice notes, and bulk PDF report cards
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadAllReportCards}
            disabled={isExportingZip}
            className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
          >
            {isExportingZip ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>{exportProgress || "Generating ZIP..."}</span>
              </>
            ) : (
              <>
                <FileArchive className="w-3.5 h-3.5 text-emerald-700" />
                <span>Bulk Report Cards (ZIP)</span>
              </>
            )}
          </Button>

          {canEdit && (
            <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm" className="text-xs">
              <Plus className="w-4 h-4" />
              <span>Record Grade</span>
            </Button>
          )}
        </div>
      </div>

      {/* TABS: ACADEMICS VS TAHFIZ PROGRESS MAP */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("ACADEMICS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ACADEMICS"
              ? "bg-white text-emerald-950 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpenCheck className="w-4 h-4 text-emerald-700" />
          <span>Subject Assessments Gradebook</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TAHFIZ")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "TAHFIZ"
              ? "bg-white text-emerald-950 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Quran & Tahfiz Progress Map (Juz 1–30)</span>
        </button>
      </div>

      {/* TAB 1: ACADEMIC GRADEBOOK */}
      {activeTab === "ACADEMICS" && (
        <div className="space-y-4">
          {/* Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or test title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Subjects</option>
                <option value="Tahfiz / Quran">Tahfiz / Quran</option>
                <option value="Hadith">Hadith</option>
                <option value="Fiqh">Fiqh</option>
                <option value="Arabic Language">Arabic Language</option>
                <option value="Sirah & Islamic Studies">Sirah & Islamic Studies</option>
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Subject & Title</th>
                    <th className="px-4 py-3.5">Assessment Type</th>
                    <th className="px-4 py-3.5">Score</th>
                    <th className="px-4 py-3.5">Grade</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Ustadh Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No academic assessment records found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const pct = Math.round((r.score / r.totalObtainable) * 100);
                      let grade = "A";
                      let badgeVar: any = "success";
                      if (pct < 50) {
                        grade = "F";
                        badgeVar = "danger";
                      } else if (pct < 60) {
                        grade = "D";
                        badgeVar = "warning";
                      } else if (pct < 70) {
                        grade = "C";
                        badgeVar = "warning";
                      } else if (pct < 85) {
                        grade = "B";
                        badgeVar = "info";
                      }

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800 text-sm">{r.student.fullName}</div>
                            <div className="font-mono text-emerald-800 text-[11px]">
                              {r.student.admissionNumber} &bull; {r.class.name}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-800">{r.subject}</span>
                            <span className="block text-[11px] text-slate-500 font-medium">{r.title}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {r.type.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 text-sm">
                              {r.score} <span className="text-slate-400 text-xs font-normal">/ {r.totalObtainable}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">{pct}%</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant={badgeVar}>{grade}</Badge>
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 font-medium">
                            {formatDate(r.assessmentDate)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 italic max-w-xs truncate">
                            {r.teacherFeedback || "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QURAN & TAHFIZ PROGRESS MAP (JUZ 1–30) */}
      {activeTab === "TAHFIZ" && (
        <div className="space-y-4">
          {/* Student Selector Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-800">Select Student to View / Assess Tahfiz:</label>
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.admissionNumber}) — {s.className}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <TahfizProgressMap
              studentId={selectedStudent.id}
              studentName={selectedStudent.fullName}
              records={studentTahfizRecords}
              canEdit={canEdit}
            />
          )}
        </div>
      )}

      {/* Grade Entry Modal */}
      {canEdit && (
        <GradeEntryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          students={students}
        />
      )}
    </div>
  );
}
