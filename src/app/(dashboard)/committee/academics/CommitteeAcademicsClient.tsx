"use client";

import React, { useState } from "react";
import { GradeEntryModal } from "@/components/academics/GradeEntryModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { BookOpenCheck, Award, Plus, Search, Filter } from "lucide-react";

interface RecordItem {
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

export function CommitteeAcademicsClient({
  initialRecords,
  students,
}: {
  initialRecords: RecordItem[];
  students: Array<{
    id: string;
    fullName: string;
    admissionNumber: string;
    classId: string;
    className: string;
  }>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Academic & Tahfiz Gradebook</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View student assessment scores, memorization records, and teacher remarks
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
          <Plus className="w-4 h-4" />
          <span>Record New Grade</span>
        </Button>
      </div>

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
            <option value="General Islamiyya">General Islamiyya</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Student & Class</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Assessment Title / Surah</th>
                <th className="px-4 py-3.5 text-center">Score</th>
                <th className="px-4 py-3.5 text-center">Grade %</th>
                <th className="px-4 py-3.5">Teacher Feedback</th>
                <th className="px-4 py-3.5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const pct = Math.round((r.score / r.totalObtainable) * 100);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 text-sm">{r.student.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.student.admissionNumber} &bull; {r.class.name}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="islamic">{r.subject}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      <div>{r.title}</div>
                      <span className="text-[10px] text-slate-400">{r.type.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                      {r.score}/{r.totalObtainable}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`font-bold ${
                          pct >= 80 ? "text-emerald-700" : pct >= 60 ? "text-amber-700" : "text-rose-700"
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs text-[11px]">
                      {r.teacherFeedback || <span className="text-slate-300 italic">None</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400 text-[11px]">
                      {formatDate(r.assessmentDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <GradeEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        students={students}
      />
    </div>
  );
}
