"use client";

import React, { useState } from "react";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ShieldAlert, Search, Filter } from "lucide-react";

export interface AuditLogItem {
  id: string;
  userName: string | null;
  userRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditLogViewerProps {
  logs: AuditLogItem[];
}

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filtered = logs.filter((log) => {
    if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = log.userName?.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      if (!matchName && !matchDetails && !matchAction) return false;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes("MUTATION") || action.includes("OVERRIDE")) {
      return <Badge variant="warning">{action}</Badge>;
    }
    if (action.includes("CREATION") || action.includes("ENROLLMENT")) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (action.includes("DEACTIVATION")) {
      return <Badge variant="danger">{action}</Badge>;
    }
    return <Badge variant="info">{action}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit details, actor, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="GRADE_MUTATION">GRADE_MUTATION</option>
            <option value="FEE_STATUS_OVERRIDE">FEE_STATUS_OVERRIDE</option>
            <option value="STUDENT_ENROLLMENT">STUDENT_ENROLLMENT</option>
            <option value="USER_CREATION">USER_CREATION</option>
            <option value="USER_STATUS_CHANGE">USER_STATUS_CHANGE</option>
            <option value="BATCH_ATTENDANCE_EXECUTED">BATCH_ATTENDANCE_EXECUTED</option>
            <option value="TICKET_RESOLUTION">TICKET_RESOLUTION</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Actor & Role</th>
                <th className="px-4 py-3.5">Action Type</th>
                <th className="px-4 py-3.5">Immutable Audit Details</th>
                <th className="px-4 py-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-mono">
                      <div>{formatDate(log.createdAt)}</div>
                      <div className="text-[10px] text-slate-400">{formatTime(log.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{log.userName || "System"}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3.5 text-slate-700 max-w-md">
                      <p className="leading-relaxed">{log.details}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.ipAddress || "127.0.0.1"}
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
