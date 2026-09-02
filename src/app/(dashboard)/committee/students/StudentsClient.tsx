"use client";

import React, { useState, useTransition } from "react";
import { enrollStudentAction, updateStudentAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { UserPlus, GraduationCap, Search, Filter, Edit3, UserCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface StudentItem {
  id: string;
  admissionNumber: string;
  fullName: string;
  gender: string;
  dateOfBirth: string | null;
  createdAt: string;
  class: {
    id: string;
    name: string;
    academicYear: string;
  };
  parent: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
  _count: {
    attendance: number;
    academicRecords: number;
  };
}

export function StudentsClient({
  initialStudents,
  classes,
  parents,
}: {
  initialStudents: StudentItem[];
  classes: Array<{ id: string; name: string }>;
  parents: Array<{ id: string; fullName: string; email: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Edit Student Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    student?: StudentItem;
  }>({ isOpen: false });

  const [editFullName, setEditFullName] = useState("");
  const [editGender, setEditGender] = useState<"MALE" | "FEMALE">("MALE");
  const [editDateOfBirth, setEditDateOfBirth] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [editParentId, setEditParentId] = useState("");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");

  // Enroll Form State
  const [admissionNumber, setAdmissionNumber] = useState(
    `VCE/2025/${String(initialStudents.length + 1).padStart(3, "0")}`
  );
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [parentId, setParentId] = useState(parents[0]?.id || "");

  const filteredStudents = initialStudents.filter((s) => {
    if (classFilter !== "ALL" && s.class.id !== classFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchAdm = s.admissionNumber.toLowerCase().includes(q);
      const matchParent = s.parent.fullName.toLowerCase().includes(q);
      if (!matchName && !matchAdm && !matchParent) return false;
    }
    return true;
  });

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("admissionNumber", admissionNumber);
    formData.append("fullName", fullName);
    formData.append("gender", gender);
    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
    formData.append("classId", classId);
    formData.append("parentId", parentId);

    startTransition(async () => {
      try {
        const res = await enrollStudentAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Enrolled student ${fullName} with 12-Month Fee Ledger initialized!`);
          setFullName("");
          setDateOfBirth("");
          setIsEnrollModalOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to enroll student");
      }
    });
  };

  const handleOpenEdit = (student: StudentItem) => {
    setEditFullName(student.fullName);
    setEditGender(student.gender as any);
    setEditDateOfBirth(
      student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : ""
    );
    setEditClassId(student.class.id);
    setEditParentId(student.parent.id);
    setEditModal({ isOpen: true, student });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.student) return;

    const formData = new FormData();
    formData.append("studentId", editModal.student.id);
    formData.append("fullName", editFullName);
    formData.append("gender", editGender);
    if (editDateOfBirth) formData.append("dateOfBirth", editDateOfBirth);
    formData.append("classId", editClassId);
    formData.append("parentId", editParentId);

    startTransition(async () => {
      try {
        const res = await updateStudentAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Updated student profile & parent assignment for ${editFullName}!`);
          setEditModal({ isOpen: false });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update student");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Student Directory & Admissions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student enrollments, assign or change parent guardians, and manage profiles
          </p>
        </div>

        <Button onClick={() => setIsEnrollModalOpen(true)} variant="primary" size="sm">
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, admission no, parent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Student Details</th>
                <th className="px-4 py-3.5">Gender</th>
                <th className="px-4 py-3.5">Class / Level</th>
                <th className="px-4 py-3.5">Assigned Parent / Guardian</th>
                <th className="px-4 py-3.5">Attendance</th>
                <th className="px-4 py-3.5">Grades</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800 text-sm">{s.fullName}</div>
                    <div className="font-mono text-emerald-800 text-[11px] font-bold">
                      {s.admissionNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        s.gender === "MALE"
                          ? "bg-sky-50 text-sky-800 border border-sky-200"
                          : "bg-purple-50 text-purple-800 border border-purple-200"
                      }`}
                    >
                      {s.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{s.class.name}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{s.parent.fullName}</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[10px]">
                      {s.parent.phoneNumber || s.parent.email}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-700">
                    {s._count.attendance} Sessions
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-800">
                    {s._count.academicRecords} Records
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      onClick={() => handleOpenEdit(s)}
                      variant="outline"
                      size="sm"
                      className="py-1 px-2.5 text-[11px] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit / Reassign</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false })}
        title="Edit Student & Reassign Parent"
        subtitle={`Student: ${editModal.student?.fullName} (${editModal.student?.admissionNumber})`}
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={editGender}
                onChange={(e) => setEditGender(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Level
              </label>
              <select
                value={editClassId}
                onChange={(e) => setEditClassId(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign / Link to Parent Guardian
              </label>
              <select
                value={editParentId}
                onChange={(e) => setEditParentId(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-emerald-900"
              >
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Birth (Optional)
            </label>
            <input
              type="date"
              value={editDateOfBirth}
              onChange={(e) => setEditDateOfBirth(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditModal({ isOpen: false })}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              <CheckCircle className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New Student"
        subtitle="Registers student, links parent guardian, and creates 12-Month Fee Ledger"
        maxWidth="lg"
      >
        <form onSubmit={handleEnroll} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Number
              </label>
              <input
                type="text"
                required
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="w-full text-sm font-mono px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Bilal Ibrahim"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Level
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent / Guardian Account
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-emerald-900"
              >
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              <span>Enroll Student</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
