"use client";

import React, { useState, useTransition } from "react";
import { enrollStudentAction, updateStudentAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import {
  UserPlus,
  GraduationCap,
  Search,
  Filter,
  Edit3,
  UserCheck,
  CheckCircle,
  School,
  MapPin,
  Phone,
  Calendar,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";

export interface StudentItem {
  id: string;
  admissionNumber: string;
  fullName: string;
  gender: string;
  dateOfBirth: string | null;
  address: string | null;
  phoneNumber: string | null;
  hasMedicalCondition: boolean;
  medicalConditionDetails: string | null;
  commencementDate: string | null;
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
  const [editAddress, setEditAddress] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editHasMedicalCondition, setEditHasMedicalCondition] = useState(false);
  const [editMedicalConditionDetails, setEditMedicalConditionDetails] = useState("");
  const [editCommencementDate, setEditCommencementDate] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [editParentId, setEditParentId] = useState("");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Enroll Form State
  const [admissionNumber, setAdmissionNumber] = useState(
    `MIWT/2026/${String(initialStudents.length + 1).padStart(3, "0")}`
  );
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasMedicalCondition, setHasMedicalCondition] = useState(false);
  const [medicalConditionDetails, setMedicalConditionDetails] = useState("");
  const [commencementDate, setCommencementDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [parentId, setParentId] = useState(parents[0]?.id || "");

  const filteredStudents = initialStudents.filter((s) => {
    if (classFilter !== "ALL" && s.class.id !== classFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchAdm = s.admissionNumber.toLowerCase().includes(q);
      const matchParent = s.parent.fullName.toLowerCase().includes(q);
      const matchAddress = s.address?.toLowerCase().includes(q) || false;
      const matchPhone = s.phoneNumber?.toLowerCase().includes(q) || false;
      if (!matchName && !matchAdm && !matchParent && !matchAddress && !matchPhone) return false;
    }
    return true;
  });

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("admissionNumber", admissionNumber);
    formData.append("fullName", fullName);
    formData.append("gender", gender);
    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
    if (address) formData.append("address", address);
    if (phoneNumber) formData.append("phoneNumber", phoneNumber);
    formData.append("hasMedicalCondition", String(hasMedicalCondition));
    if (hasMedicalCondition && medicalConditionDetails) {
      formData.append("medicalConditionDetails", medicalConditionDetails);
    }
    if (commencementDate) formData.append("commencementDate", commencementDate);
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
          setAddress("");
          setPhoneNumber("");
          setHasMedicalCondition(false);
          setMedicalConditionDetails("");
          setCommencementDate(new Date().toISOString().split("T")[0]);
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
    setEditAddress(student.address || "");
    setEditPhoneNumber(student.phoneNumber || "");
    setEditHasMedicalCondition(Boolean(student.hasMedicalCondition));
    setEditMedicalConditionDetails(student.medicalConditionDetails || "");
    setEditCommencementDate(
      student.commencementDate
        ? new Date(student.commencementDate).toISOString().split("T")[0]
        : ""
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
    if (editAddress) formData.append("address", editAddress);
    if (editPhoneNumber) formData.append("phoneNumber", editPhoneNumber);
    formData.append("hasMedicalCondition", String(editHasMedicalCondition));
    if (editHasMedicalCondition && editMedicalConditionDetails) {
      formData.append("medicalConditionDetails", editMedicalConditionDetails);
    }
    if (editCommencementDate) formData.append("commencementDate", editCommencementDate);
    formData.append("classId", editClassId);
    formData.append("parentId", editParentId);

    startTransition(async () => {
      try {
        const res = await updateStudentAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Updated profile for ${editFullName}!`);
          setEditModal({ isOpen: false });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update student");
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Student Directory & Admissions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student enrollments, medical notes, emergency contacts, and parent links
          </p>
        </div>

        <Button onClick={() => setIsEnrollModalOpen(true)} variant="primary" size="sm" className="text-xs">
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, admission no, parent, address, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
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

      {/* MOBILE CARD VIEW */}
      <div className="block lg:hidden space-y-3">
        {paginatedStudents.map((s) => (
          <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{s.fullName}</h4>
                <p className="text-[11px] font-mono font-bold text-emerald-800">{s.admissionNumber}</p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Class: {s.class.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    s.gender === "MALE"
                      ? "bg-sky-50 text-sky-800 border border-sky-200"
                      : "bg-purple-50 text-purple-800 border border-purple-200"
                  }`}
                >
                  {s.gender}
                </span>
                {s.hasMedicalCondition && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    <HeartPulse className="w-3 h-3 text-amber-600" />
                    <span>Medical Alert</span>
                  </span>
                )}
              </div>
            </div>

            {/* Medical Alert Callout (If Present) */}
            {s.hasMedicalCondition && s.medicalConditionDetails && (
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-0.5">
                <div className="font-bold flex items-center gap-1 text-[11px] text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Medical / Health Instructions:</span>
                </div>
                <p className="text-[11px] text-amber-950 pl-4">{s.medicalConditionDetails}</p>
              </div>
            )}

            {/* Address & Contact Details */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">{s.parent.fullName}</span>
                <span className="text-[10px] text-slate-400 font-mono">({s.parent.phoneNumber || s.parent.email})</span>
              </div>

              {(s.address || s.phoneNumber) && (
                <div className="pt-1.5 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-600">
                  {s.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.address}</span>
                    </div>
                  )}
                  {s.phoneNumber && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{s.phoneNumber}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Commenced</span>
                  <span className="font-bold text-slate-700">
                    {s.commencementDate ? formatDate(s.commencementDate) : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Attendance</span>
                  <span className="font-bold text-slate-700">{s._count.attendance} Sessions</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Academics</span>
                  <span className="font-bold text-emerald-800">{s._count.academicRecords} Records</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end pt-1 border-t border-slate-100">
              <Button
                onClick={() => handleOpenEdit(s)}
                variant="outline"
                size="sm"
                className="w-full text-xs py-1.5 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile / Medical Notes</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Student Details</th>
                <th className="px-4 py-3.5">Gender</th>
                <th className="px-4 py-3.5">Class / Level</th>
                <th className="px-4 py-3.5">Parent & Emergency Contact</th>
                <th className="px-4 py-3.5">Address & Commenced</th>
                <th className="px-4 py-3.5">Medical Notes</th>
                <th className="px-4 py-3.5">Stats</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.map((s) => (
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
                      {s.phoneNumber || s.parent.phoneNumber || s.parent.email}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{s.address || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Joined: {s.commencementDate ? formatDate(s.commencementDate) : "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {s.hasMedicalCondition ? (
                      <div className="space-y-1 max-w-xs">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          <HeartPulse className="w-3 h-3 text-amber-600" />
                          <span>Medical Alert</span>
                        </span>
                        {s.medicalConditionDetails && (
                          <p className="text-[11px] text-slate-600 truncate" title={s.medicalConditionDetails}>
                            {s.medicalConditionDetails}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">None (Fit)</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[11px]">
                    <div className="font-bold text-slate-700">{s._count.attendance} Att.</div>
                    <div className="font-bold text-emerald-800">{s._count.academicRecords} Rec.</div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      onClick={() => handleOpenEdit(s)}
                      variant="outline"
                      size="sm"
                      className="py-1 px-2.5 text-[11px] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}

      {/* Edit Student Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false })}
        title="Edit Student Profile & Information"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number / Emergency Contact
              </label>
              <input
                type="tel"
                placeholder="e.g., 08012345678"
                value={editPhoneNumber}
                onChange={(e) => setEditPhoneNumber(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Commencement
              </label>
              <input
                type="date"
                value={editCommencementDate}
                onChange={(e) => setEditCommencementDate(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Home Address
              </label>
              <input
                type="text"
                placeholder="e.g., Plot 14, Vintage City Estate, Phase 1"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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
          </div>

          {/* Medical Condition Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Does your Child/Ward have any medical condition?</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditHasMedicalCondition(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    !editHasMedicalCondition
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setEditHasMedicalCondition(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    editHasMedicalCondition
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {editHasMedicalCondition && (
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-amber-900">
                  If Yes, kindly explain (Conditions, Allergies, Special Care):
                </label>
                <textarea
                  rows={2}
                  required={editHasMedicalCondition}
                  placeholder="e.g., Mild asthma, carries inhaler. Allergic to groundnuts."
                  value={editMedicalConditionDetails}
                  onChange={(e) => setEditMedicalConditionDetails(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-amber-300 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>
            )}
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
        subtitle="Registers student, records medical & emergency details, and creates 12-Month Fee Ledger"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number / Emergency Contact
              </label>
              <input
                type="tel"
                placeholder="e.g., 08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Commencement
              </label>
              <input
                type="date"
                required
                value={commencementDate}
                onChange={(e) => setCommencementDate(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Home Address
            </label>
            <input
              type="text"
              placeholder="e.g., Plot 14, Vintage City Estate, Phase 1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Medical Condition Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Does your Child/Ward have any medical condition?</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasMedicalCondition(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    !hasMedicalCondition
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setHasMedicalCondition(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    hasMedicalCondition
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {hasMedicalCondition && (
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-amber-900">
                  If Yes, kindly explain (Conditions, Allergies, Special Care):
                </label>
                <textarea
                  rows={2}
                  required={hasMedicalCondition}
                  placeholder="e.g., Mild asthma, carries inhaler. Allergic to groundnuts."
                  value={medicalConditionDetails}
                  onChange={(e) => setMedicalConditionDetails(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-amber-300 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>
            )}
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
