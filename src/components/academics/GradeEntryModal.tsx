"use client";

import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createAcademicRecordAction } from "@/lib/actions";
import { ISLAMIC_SUBJECTS } from "@/lib/utils";
import { toast } from "sonner";
import { BookOpen, Sparkles } from "lucide-react";

interface StudentOption {
  id: string;
  fullName: string;
  admissionNumber: string;
  classId: string;
  className: string;
}

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentOption[];
  preselectedStudentId?: string;
  preselectedClassId?: string;
}

export function GradeEntryModal({
  isOpen,
  onClose,
  students,
  preselectedStudentId,
  preselectedClassId,
}: GradeEntryModalProps) {
  const [isPending, startTransition] = useTransition();

  const [studentId, setStudentId] = useState(preselectedStudentId || students[0]?.id || "");
  const [subject, setSubject] = useState(ISLAMIC_SUBJECTS[0]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"QUIZ" | "TEST" | "MIDTERM" | "FINAL_EXAM" | "MEMORIZATION_QURAN">("MEMORIZATION_QURAN");
  const [score, setScore] = useState<number>(90);
  const [totalObtainable, setTotalObtainable] = useState<number>(100);
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [teacherFeedback, setTeacherFeedback] = useState("");

  const selectedStudent = students.find((s) => s.id === studentId) || students[0];
  const classId = preselectedClassId || selectedStudent?.classId || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !classId) {
      toast.error("Please select a student and class");
      return;
    }

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("classId", classId);
    formData.append("subject", subject);
    formData.append("title", title);
    formData.append("type", type);
    formData.append("score", score.toString());
    formData.append("totalObtainable", totalObtainable.toString());
    formData.append("assessmentDate", assessmentDate);
    formData.append("teacherFeedback", teacherFeedback);

    startTransition(async () => {
      try {
        const res = await createAcademicRecordAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Assessment score saved and audit logged!");
          setTitle("");
          setTeacherFeedback("");
          onClose();
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to record grade");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Academic & Tahfiz Assessment"
      subtitle="Score entry with immutable audit logging"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Student
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.admissionNumber}) &bull; {s.className}
              </option>
            ))}
          </select>
        </div>

        {/* Subject & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Islamiyya Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {ISLAMIC_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assessment Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="MEMORIZATION_QURAN">Quran Memorization (Tahfiz)</option>
              <option value="QUIZ">Quiz / Weekly Review</option>
              <option value="TEST">Continuous Assessment Test</option>
              <option value="MIDTERM">Midterm Exam</option>
              <option value="FINAL_EXAM">Terminal Final Exam</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assessment Title / Memorization Range
          </label>
          <input
            type="text"
            placeholder="e.g., Surah Al-Mulk (Ayah 1-30) or Fiqh Taharah Exam"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Score & Total */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Score Obtained
            </label>
            <input
              type="number"
              step="0.5"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              required
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Obtainable
            </label>
            <input
              type="number"
              value={totalObtainable}
              onChange={(e) => setTotalObtainable(Number(e.target.value))}
              required
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Teacher Feedback */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ustadh Feedback & Tajweed Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g., Masha Allah, strong recitation fluency and clear pronunciation of Makharij..."
            value={teacherFeedback}
            onChange={(e) => setTeacherFeedback(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isPending}>
            <Sparkles className="w-4 h-4" />
            <span>Save Assessment Score</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
