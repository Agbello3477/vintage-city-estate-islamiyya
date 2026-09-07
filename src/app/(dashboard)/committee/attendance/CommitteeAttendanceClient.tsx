"use client";

import React, { useState, useMemo, useEffect } from "react";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Search, Filter } from "lucide-react";

export interface AttendanceRecordItem {
  id: string;
  sessionDate: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  remarks: string | null;
  student: {
    id: string;
    fullName: string;
    admissionNumber: string;
    parent?: {
      fullName: string;
    } | null;
  };
  class: {
    id: string;
    name: string;
  };
  markedBy?: {
    fullName: string;
  } | null;
}

interface CommitteeAttendanceClientProps {
  initialRecords: AttendanceRecordItem[];
  classes: Array<{ id: string; name: string }>;
}

export function CommitteeAttendanceClient({
  initialRecords,
  classes,
}: CommitteeAttendanceClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = initialRecords.filter((rec) => {
    if (statusFilter !== "ALL" && rec.status !== statusFilter) return false;
    if (classFilter !== "ALL" && rec.class.id !== classFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = rec.student.fullName.toLowerCase().includes(q);
      const matchAdm = rec.student.admissionNumber.toLowerCase().includes(q);
      const matchClass = rec.class.name.toLowerCase().includes(q);
      const matchTeacher = rec.markedBy?.fullName.toLowerCase().includes(q);
      const matchRemarks = rec.remarks?.toLowerCase().includes(q);
      if (!matchName && !matchAdm && !matchClass && !matchTeacher && !matchRemarks) return false;
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, classFilter, search]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalLogs = initialRecords.length;
  const presentLogs = initialRecords.filter((a) => a.status === "PRESENT").length;
  const absentLogs = initialRecords.filter((a) => a.status === "ABSENT").length;
  const overallPct = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge variant="success">Present</Badge>;
      case "LATE":
        return <Badge variant="warning">Late</Badge>;
      case "EXCUSED":
        return <Badge variant="info">Excused</Badge>;
      case "ABSENT":
        return <Badge variant="danger">Absent</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Stat Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Attendance Master</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit school-wide daily check-in timestamps and attendance compliance
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
            Overall Rate: {overallPct}%
          </span>
          <span className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl">
            Unexcused Absent: {absentLogs}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, class, teacher, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late Arrival</option>
            <option value="EXCUSED">Excused Leave</option>
            <option value="ABSENT">Unexcused Absent</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No attendance records match the selected filters.
          </div>
        ) : (
          paginatedRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rec.student.fullName}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {rec.student.admissionNumber} &bull; {rec.class.name}
                  </p>
                </div>
                {getStatusBadge(rec.status)}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl font-mono">
                <span>Date: {formatDate(rec.sessionDate)}</span>
                <span>In: {formatTime(rec.checkInTime)}</span>
                <span>Out: {formatTime(rec.checkOutTime)}</span>
              </div>

              {rec.remarks && (
                <p className="text-xs text-slate-600 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                  "{rec.remarks}"
                </p>
              )}

              <div className="text-[10px] text-slate-400 text-right">
                Marked by: {rec.markedBy?.fullName || "Ustadh"}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Session Date</th>
                <th className="px-4 py-3.5">Student & Class</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Check-In / Check-Out</th>
                <th className="px-4 py-3.5">Marked By</th>
                <th className="px-4 py-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No attendance records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono font-medium text-slate-700">
                      {formatDate(rec.sessionDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{rec.student.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {rec.student.admissionNumber} &bull; {rec.class.name}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(rec.status)}</td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 font-mono text-[11px]">
                        <div className="text-emerald-700 font-semibold">
                          In: {formatTime(rec.checkInTime)}
                        </div>
                        <div className="text-teal-700 font-semibold">
                          Out: {formatTime(rec.checkOutTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {rec.markedBy?.fullName || "Ustadh"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs">
                      {rec.remarks || <span className="text-slate-300 italic">None</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}
    </div>
  );
}
