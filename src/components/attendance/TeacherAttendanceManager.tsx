"use client";

import React, { useState, useTransition } from "react";
import { formatTime, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { batchAttendanceAction, markSingleAttendanceAction } from "@/lib/actions";
import { toast } from "sonner";
import {
  Check,
  CheckCheck,
  Clock,
  UserX,
  ShieldAlert,
  Save,
  MessageSquare,
} from "lucide-react";

interface StudentAttendanceItem {
  id: string;
  admissionNumber: string;
  fullName: string;
  gender: string;
  parentName: string;
  parentPhone: string | null;
  attendanceRecord?: {
    id: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    checkInTime?: string | null;
    checkOutTime?: string | null;
    remarks?: string | null;
  } | null;
}

interface TeacherAttendanceManagerProps {
  classId: string;
  className: string;
  sessionDate: string;
  students: StudentAttendanceItem[];
}

export function TeacherAttendanceManager({
  classId,
  className,
  sessionDate,
  students,
}: TeacherAttendanceManagerProps) {
  const [isPending, startTransition] = useTransition();

  // Local state initialized from props
  const [attendanceState, setAttendanceState] = useState<
    Record<
      string,
      {
        status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
        checkInTime?: string | null;
        checkOutTime?: string | null;
        remarks: string;
      }
    >
  >(() => {
    const map: Record<string, any> = {};
    students.forEach((s) => {
      map[s.id] = {
        status: s.attendanceRecord?.status || "PRESENT",
        checkInTime: s.attendanceRecord?.checkInTime || null,
        checkOutTime: s.attendanceRecord?.checkOutTime || null,
        remarks: s.attendanceRecord?.remarks || "",
      };
    });
    return map;
  });

  const handleStatusChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSingleCheckIn = (studentId: string) => {
    startTransition(async () => {
      try {
        const item = attendanceState[studentId];
        const res = await markSingleAttendanceAction({
          studentId,
          classId,
          sessionDate,
          status: item.status,
          action: "CHECK_IN",
          remarks: item.remarks,
        });
        if (res.error) {
          toast.error(res.error);
        } else {
          setAttendanceState((prev) => ({
            ...prev,
            [studentId]: {
              ...prev[studentId],
              checkInTime: new Date().toISOString(),
            },
          }));
          toast.success("Check-in timestamp recorded");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to record check-in");
      }
    });
  };

  const handleSingleCheckOut = (studentId: string) => {
    startTransition(async () => {
      try {
        const item = attendanceState[studentId];
        const res = await markSingleAttendanceAction({
          studentId,
          classId,
          sessionDate,
          status: item.status,
          action: "CHECK_OUT",
          remarks: item.remarks,
        });
        if (res.error) {
          toast.error(res.error);
        } else {
          setAttendanceState((prev) => ({
            ...prev,
            [studentId]: {
              ...prev[studentId],
              checkOutTime: new Date().toISOString(),
            },
          }));
          toast.success("Check-out timestamp recorded");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to record check-out");
      }
    });
  };

  const handleBatchCheckInAll = () => {
    startTransition(async () => {
      try {
        const payload = Object.entries(attendanceState).map(([sId, state]) => ({
          studentId: sId,
          status: state.status,
          remarks: state.remarks,
        }));

        const res = await batchAttendanceAction({
          classId,
          sessionDate,
          actionType: "BATCH_CHECK_IN",
          studentsData: payload,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          const nowStr = new Date().toISOString();
          setAttendanceState((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((sId) => {
              if (next[sId].status !== "ABSENT" && next[sId].status !== "EXCUSED") {
                next[sId] = { ...next[sId], checkInTime: nowStr };
              }
            });
            return next;
          });
          toast.success("Batch Check-In completed for all present students!");
        }
      } catch (err: any) {
        toast.error(err.message || "Batch action failed");
      }
    });
  };

  const handleBatchCheckOutAll = () => {
    startTransition(async () => {
      try {
        const payload = Object.entries(attendanceState).map(([sId, state]) => ({
          studentId: sId,
          status: state.status,
          remarks: state.remarks,
        }));

        const res = await batchAttendanceAction({
          classId,
          sessionDate,
          actionType: "BATCH_CHECK_OUT",
          studentsData: payload,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          const nowStr = new Date().toISOString();
          setAttendanceState((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((sId) => {
              if (next[sId].status !== "ABSENT" && next[sId].status !== "EXCUSED") {
                next[sId] = { ...next[sId], checkOutTime: nowStr };
              }
            });
            return next;
          });
          toast.success("Batch Check-Out recorded successfully!");
        }
      } catch (err: any) {
        toast.error(err.message || "Batch action failed");
      }
    });
  };

  const handleSaveAll = () => {
    startTransition(async () => {
      try {
        const payload = Object.entries(attendanceState).map(([sId, state]) => ({
          studentId: sId,
          status: state.status,
          remarks: state.remarks,
        }));

        const res = await batchAttendanceAction({
          classId,
          sessionDate,
          actionType: "SAVE_ALL",
          studentsData: payload,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Attendance updates saved successfully!");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to save attendance");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            {className} &bull; Attendance Register
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Session Date: {formatDate(sessionDate)} &bull; {students.length} Enrolled Students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleBatchCheckInAll}
            disabled={isPending}
            variant="secondary"
            size="sm"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span>1-Click Batch Check-In</span>
          </Button>

          <Button
            onClick={handleBatchCheckOutAll}
            disabled={isPending}
            variant="outline"
            size="sm"
          >
            <CheckCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>1-Click Batch Check-Out</span>
          </Button>

          <Button
            onClick={handleSaveAll}
            disabled={isPending}
            variant="primary"
            size="sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Logs</span>
          </Button>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3.5">Student & Admission</th>
              <th className="px-4 py-3.5">Attendance Status</th>
              <th className="px-4 py-3.5">Check-In / Out Times</th>
              <th className="px-4 py-3.5">Remarks / Reason</th>
              <th className="px-4 py-3.5 text-right">Instant Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const state = attendanceState[student.id] || {
                status: "PRESENT",
                remarks: "",
              };

              const isAbsentWithoutExcuse = state.status === "ABSENT" && !state.remarks.trim();

              return (
                <tr
                  key={student.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isAbsentWithoutExcuse ? "bg-rose-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {student.fullName}
                          {isAbsentWithoutExcuse && (
                            <span title="Absent without registered excuse!">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-500 inline" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          {student.admissionNumber} &bull; Parent: {student.parentName}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, "PRESENT")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          state.status === "PRESENT"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, "LATE")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          state.status === "LATE"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, "EXCUSED")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          state.status === "EXCUSED"
                            ? "bg-sky-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                        }`}
                      >
                        Excused
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, "ABSENT")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          state.status === "ABSENT"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="font-semibold text-emerald-700">In:</span>
                        <span className="font-mono">{formatTime(state.checkInTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="font-semibold text-teal-700">Out:</span>
                        <span className="font-mono">{formatTime(state.checkOutTime)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <input
                      type="text"
                      placeholder={
                        state.status === "EXCUSED"
                          ? "Reason for permission/excuse..."
                          : "Optional teacher remark..."
                      }
                      value={state.remarks}
                      onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </td>

                  <td className="px-4 py-3.5 text-right space-x-1.5">
                    <Button
                      onClick={() => handleSingleCheckIn(student.id)}
                      disabled={isPending}
                      variant="secondary"
                      size="sm"
                      className="py-1 px-2 text-[11px]"
                      title="Record current time as Check-In"
                    >
                      Check-In
                    </Button>
                    <Button
                      onClick={() => handleSingleCheckOut(student.id)}
                      disabled={isPending}
                      variant="outline"
                      size="sm"
                      className="py-1 px-2 text-[11px]"
                      title="Record current time as Check-Out"
                    >
                      Check-Out
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
