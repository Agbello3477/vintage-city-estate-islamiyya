"use client";

import React, { useState, useTransition } from "react";
import { createClassAction, updateClassAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { School, UserPlus, Users, BookOpen, Edit3, UserCheck, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface TeacherItem {
  id: string;
  fullName: string;
  email: string;
}

interface ClassItem {
  id: string;
  name: string;
  academicYear: string;
  createdAt: string;
  teacher?: TeacherItem | null;
  _count: {
    students: number;
    attendance: number;
    academicRecords: number;
  };
}

export function ClassesClient({
  initialClasses,
  teachers,
}: {
  initialClasses: ClassItem[];
  teachers: TeacherItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit Class / Assign Ustadh Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    classItem?: ClassItem;
  }>({ isOpen: false });

  // Create Form State
  const [createName, setCreateName] = useState("");
  const [createAcademicYear, setCreateAcademicYear] = useState("2025/2026");
  const [createTeacherId, setCreateTeacherId] = useState(teachers[0]?.id || "");

  // Edit Form State
  const [editName, setEditName] = useState("");
  const [editAcademicYear, setEditAcademicYear] = useState("2025/2026");
  const [editTeacherId, setEditTeacherId] = useState("");

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", createName);
    formData.append("academicYear", createAcademicYear);
    if (createTeacherId) formData.append("teacherId", createTeacherId);

    startTransition(async () => {
      try {
        const res = await createClassAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Class "${createName}" created and Ustadh assigned successfully!`);
          setCreateName("");
          setIsCreateModalOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to create class");
      }
    });
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditName(cls.name);
    setEditAcademicYear(cls.academicYear);
    setEditTeacherId(cls.teacher?.id || "");
    setEditModal({ isOpen: true, classItem: cls });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.classItem) return;

    const formData = new FormData();
    formData.append("classId", editModal.classItem.id);
    formData.append("name", editName);
    formData.append("academicYear", editAcademicYear);
    if (editTeacherId) formData.append("teacherId", editTeacherId);

    startTransition(async () => {
      try {
        const res = await updateClassAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Updated class & assigned Ustadh for "${editName}"!`);
          setEditModal({ isOpen: false });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update class assignment");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Classes & Sections</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            The <strong>Committee (Super Admin)</strong> configures Islamiyya classes and assigns lead Ustadhs
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} variant="primary" size="sm">
          <School className="w-4 h-4" />
          <span>Create New Class</span>
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {initialClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <School className="w-5 h-5" />
                </div>
                <Badge variant="islamic">{cls.academicYear}</Badge>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{cls.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-800">
                    Lead Ustadh: {cls.teacher ? cls.teacher.fullName : "Unassigned"}
                  </span>
                </div>
                {cls.teacher?.email && (
                  <p className="text-[10px] text-slate-400 font-mono pl-5">{cls.teacher.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Students</span>
                  <span className="text-sm font-bold text-slate-800">{cls._count.students} Enrolled</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assessments</span>
                  <span className="text-sm font-bold text-emerald-800">{cls._count.academicRecords} Graded</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Button
                onClick={() => handleOpenEdit(cls)}
                variant="outline"
                size="sm"
                className="w-full text-xs py-1.5 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Assign / Change Ustadh</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Islamiyya Class"
        subtitle="Specify class name, academic year, and assign the lead Ustadh"
        maxWidth="md"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class Name / Level
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Ibtidaiyah 3 or Tahfiz Intermediate"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              required
              value={createAcademicYear}
              onChange={(e) => setCreateAcademicYear(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Ustadh (Lead Teacher)
            </label>
            <select
              value={createTeacherId}
              onChange={(e) => setCreateTeacherId(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-emerald-900"
            >
              <option value="">-- Leave Unassigned --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              <span>Create Class</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Class & Assign Ustadh Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false })}
        title="Edit Class & Assign Ustadh"
        subtitle={`Class: ${editModal.classItem?.name} (${editModal.classItem?.academicYear})`}
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class Name / Level
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              required
              value={editAcademicYear}
              onChange={(e) => setEditAcademicYear(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign / Reassign Lead Ustadh
            </label>
            <select
              value={editTeacherId}
              onChange={(e) => setEditTeacherId(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-emerald-900"
            >
              <option value="">-- Leave Unassigned --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditModal({ isOpen: false })}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              <CheckCircle className="w-4 h-4" />
              <span>Save Class & Ustadh Assignment</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
