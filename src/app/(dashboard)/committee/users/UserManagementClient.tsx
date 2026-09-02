"use client";

import React, { useState, useTransition } from "react";
import {
  createUserAction,
  toggleUserStatusAction,
  assignChildrenToParentAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { ROLE_LABELS } from "@/types";
import {
  UserPlus,
  Shield,
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  UserCheck,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface StudentMinimal {
  id: string;
  fullName: string;
  admissionNumber: string;
  parentId: string;
  class: {
    name: string;
  };
}

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: "COMMITTEE" | "TEACHER" | "PARENT";
  isActive: boolean;
  createdAt: string;
  classesTaught?: Array<{ id: string; name: string }>;
  children?: Array<{ id: string; fullName: string; admissionNumber?: string; class?: { name: string } }>;
}

export function UserManagementClient({
  initialUsers,
  allStudents = [],
}: {
  initialUsers: UserItem[];
  allStudents?: StudentMinimal[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Assign Children Modal State
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    parent?: UserItem;
    selectedIds: string[];
  }>({
    isOpen: false,
    selectedIds: [],
  });

  // Create User Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"COMMITTEE" | "TEACHER" | "PARENT">("PARENT");
  const [initialChildIds, setInitialChildIds] = useState<string[]>([]);

  const filteredUsers = initialUsers.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phoneNumber?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("password", password);
    formData.append("role", role);

    startTransition(async () => {
      try {
        const res = await createUserAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          // If parent and initial children selected, link them
          if (role === "PARENT" && res.user && initialChildIds.length > 0) {
            await assignChildrenToParentAction(res.user.id, initialChildIds);
          }

          toast.success(`User ${fullName} provisioned successfully!`);
          setFullName("");
          setEmail("");
          setPhoneNumber("");
          setPassword("");
          setInitialChildIds([]);
          setIsModalOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to create user");
      }
    });
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        const res = await toggleUserStatusAction(userId, currentStatus);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("User account status updated!");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update status");
      }
    });
  };

  const handleOpenAssignModal = (parent: UserItem) => {
    // Pre-populate with current children IDs
    const currentChildIds = allStudents
      .filter((s) => s.parentId === parent.id)
      .map((s) => s.id);

    setAssignModal({
      isOpen: true,
      parent,
      selectedIds: currentChildIds,
    });
  };

  const handleToggleStudentSelection = (studentId: string) => {
    setAssignModal((prev) => {
      const exists = prev.selectedIds.includes(studentId);
      return {
        ...prev,
        selectedIds: exists
          ? prev.selectedIds.filter((id) => id !== studentId)
          : [...prev.selectedIds, studentId],
      };
    });
  };

  const handleSaveAssignedChildren = () => {
    if (!assignModal.parent) return;

    startTransition(async () => {
      try {
        const res = await assignChildrenToParentAction(
          assignModal.parent!.id,
          assignModal.selectedIds
        );
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(
            `Successfully assigned ${assignModal.selectedIds.length} children to ${assignModal.parent!.fullName}!`
          );
          setAssignModal({ isOpen: false, selectedIds: [] });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to assign children");
      }
    });
  };

  const getRoleBadge = (r: string) => {
    if (r === "COMMITTEE") return <Badge variant="warning">Super Admin</Badge>;
    if (r === "TEACHER") return <Badge variant="islamic">Islamiyya Ustadh</Badge>;
    return <Badge variant="info">Parent / Guardian</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User & Role Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage system permissions, provision teacher accounts, and assign children to parents
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {["ALL", "COMMITTEE", "TEACHER", "PARENT"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  roleFilter === r
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r === "ALL" ? "All Roles" : r}
              </button>
            ))}
          </div>

          <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Assigned Classes / Linked Children</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Created At</th>
                <th className="px-4 py-3.5 text-right">Actions & Linking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const linkedChildren = allStudents.filter((s) => s.parentId === u.id);

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 text-sm">{u.fullName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                      {u.phoneNumber && (
                        <div className="text-slate-400 text-[10px]">{u.phoneNumber}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">{getRoleBadge(u.role)}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {u.role === "TEACHER" ? (
                        u.classesTaught && u.classesTaught.length > 0 ? (
                          <div className="space-y-0.5">
                            {u.classesTaught.map((c) => (
                              <span
                                key={c.id}
                                className="inline-block bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-medium mr-1"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No classes assigned yet</span>
                        )
                      ) : u.role === "PARENT" ? (
                        linkedChildren.length > 0 ? (
                          <div className="space-y-1">
                            {linkedChildren.map((child) => (
                              <span
                                key={child.id}
                                className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-lg text-[11px] font-semibold mr-1.5"
                              >
                                <span>{child.fullName}</span>
                                <span className="text-[9px] text-sky-600 font-mono">({child.class.name})</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-rose-600 font-medium text-[11px] italic">
                            ⚠️ No children assigned yet
                          </span>
                        )
                      ) : (
                        <span className="text-amber-700 font-semibold text-[11px]">System Super Admin</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Deactivated</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {u.role === "PARENT" && (
                        <Button
                          onClick={() => handleOpenAssignModal(u)}
                          variant="secondary"
                          size="sm"
                          className="py-1 px-2.5 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                          title="Assign or link children to this parent"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign Children ({linkedChildren.length})</span>
                        </Button>
                      )}

                      <Button
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        variant={u.isActive ? "outline" : "secondary"}
                        size="sm"
                        disabled={isPending}
                        className="py-1 px-2.5 text-[11px]"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Children to Parent Modal */}
      <Modal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, selectedIds: [] })}
        title="Assign Children to Parent"
        subtitle={`Select students to link under ${assignModal.parent?.fullName} (${assignModal.parent?.email})`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Check the children that belong to this parent. The parent will immediately have full access to view their attendance, 12-Month fee ledger, and academic report cards.
          </p>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {allStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No students enrolled in the system yet.
              </div>
            ) : (
              allStudents.map((student) => {
                const isChecked = assignModal.selectedIds.includes(student.id);
                const currentlyLinkedToOther =
                  student.parentId && student.parentId !== assignModal.parent?.id;

                return (
                  <label
                    key={student.id}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                      isChecked ? "bg-emerald-50/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStudentSelection(student.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{student.fullName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Adm: {student.admissionNumber} &bull; Class: {student.class.name}
                        </p>
                      </div>
                    </div>

                    {isChecked ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Assigned
                      </span>
                    ) : currentlyLinkedToOther ? (
                      <span className="text-[10px] text-slate-400 italic">
                        Linked to another parent
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Unassigned
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              {assignModal.selectedIds.length} child(ren) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignModal({ isOpen: false, selectedIds: [] })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={isPending}
                onClick={handleSaveAssignedChildren}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save Linked Children</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision New User Account"
        subtitle="Create credentials with role-based permissions and optional child linking"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Engr. Mansur Bello"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g., parent.mansur@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+23480..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Assignment
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="PARENT">Parent / Guardian</option>
              <option value="TEACHER">Islamiyya Ustadh / Teacher</option>
              <option value="COMMITTEE">Super Admin (Committee)</option>
            </select>
          </div>

          {/* Optional: Link children if role is PARENT */}
          {role === "PARENT" && allStudents.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link Existing Children (Optional)
              </label>
              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50/50">
                {allStudents.map((stu) => {
                  const isChecked = initialChildIds.includes(stu.id);
                  return (
                    <label
                      key={stu.id}
                      className="flex items-center gap-2 text-xs p-1 hover:bg-white rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setInitialChildIds((prev) =>
                            isChecked ? prev.filter((id) => id !== stu.id) : [...prev, stu.id]
                          );
                        }}
                        className="w-3.5 h-3.5 text-emerald-600 rounded"
                      />
                      <span className="font-medium text-slate-800">{stu.fullName}</span>
                      <span className="text-[10px] text-slate-400">({stu.class.name})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              <span>Create Account</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
