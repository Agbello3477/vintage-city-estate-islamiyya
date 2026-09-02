import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ScheduleBanner } from "@/components/attendance/ScheduleBanner";
import { CalendarCheck, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

export default async function CommitteeAttendancePage() {
  await requireRole(["COMMITTEE"]);

  const [attendanceRecords, classes] = await Promise.all([
    db.attendance.findMany({
      orderBy: { sessionDate: "desc" },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        class: true,
        markedBy: true,
      },
    }),
    db.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalLogs = attendanceRecords.length;
  const presentLogs = attendanceRecords.filter((a) => a.status === "PRESENT").length;
  const lateLogs = attendanceRecords.filter((a) => a.status === "LATE").length;
  const absentLogs = attendanceRecords.filter((a) => a.status === "ABSENT").length;
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
    <div className="space-y-6">
      <ScheduleBanner />

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

      {/* Attendance Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
              {attendanceRecords.map((rec) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
