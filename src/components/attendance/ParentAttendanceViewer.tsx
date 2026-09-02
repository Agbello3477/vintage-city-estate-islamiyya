"use client";

import React, { useState } from "react";
import { formatTime, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Calendar } from "lucide-react";

interface AttendanceRecord {
  id: string;
  sessionDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks: string | null;
}

interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  absentCount: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

interface ParentAttendanceViewerProps {
  childrenData: StudentAttendanceSummary[];
}

export function ParentAttendanceViewer({ childrenData }: ParentAttendanceViewerProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    childrenData[0]?.studentId || ""
  );

  const activeStudent =
    childrenData.find((c) => c.studentId === selectedStudentId) || childrenData[0];

  if (!activeStudent) {
    return (
      <Card className="text-center py-12 text-slate-500">
        No enrolled children found linked to your parent profile.
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge variant="success">Present</Badge>;
      case "LATE":
        return <Badge variant="warning">Late Arrival</Badge>;
      case "EXCUSED":
        return <Badge variant="info">Excused / Permission</Badge>;
      case "ABSENT":
        return <Badge variant="danger">Absent</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Child Switcher Tabs (if multiple children) */}
      {childrenData.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {childrenData.map((child) => (
            <button
              key={child.studentId}
              onClick={() => setSelectedStudentId(child.studentId)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                child.studentId === activeStudent.studentId
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200"
              }`}
            >
              {child.studentName} ({child.className})
            </button>
          ))}
        </div>
      )}

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
              Overall Rate
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-2">
            {activeStudent.attendancePercentage}%
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            {activeStudent.presentCount} of {activeStudent.totalSessions} sessions
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-amber-800 tracking-wider">
              Late Arrivals
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-2">
            {activeStudent.lateCount}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">Arrived after start time</p>
        </Card>

        <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-sky-800 tracking-wider">
              Excused Leaves
            </span>
            <Calendar className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-sky-900 mt-2">
            {activeStudent.excusedCount}
          </p>
          <p className="text-[11px] text-sky-700 mt-0.5">With registered notice</p>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-rose-800 tracking-wider">
              Unexcused Absent
            </span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-900 mt-2">
            {activeStudent.absentCount}
          </p>
          <p className="text-[11px] text-rose-700 mt-0.5">Missed sessions</p>
        </Card>
      </div>

      {/* Session History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Daily Session History &bull; {activeStudent.studentName}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {activeStudent.admissionNumber}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Session Date</th>
                <th className="px-4 py-3">Check-In Time</th>
                <th className="px-4 py-3">Check-Out Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Teacher Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeStudent.records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No recorded attendance logs yet.
                  </td>
                </tr>
              ) : (
                activeStudent.records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {formatDate(r.sessionDate)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">
                      {formatTime(r.checkInTime)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">
                      {formatTime(r.checkOutTime)}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(r.status)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {r.remarks || <span className="text-slate-300 italic">None</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
