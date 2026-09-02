import { requireRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { AcademicGrowthChart } from "@/components/academics/AcademicGrowthChart";
import { ReportCardView } from "@/components/academics/ReportCardView";

export default async function ParentAcademicsPage({
  searchParams,
}: {
  searchParams: { studentId?: string };
}) {
  const user = await requireRole(["PARENT"]);

  const children = await db.student.findMany({
    where: { parentId: user.id },
    include: {
      class: true,
      parent: true,
      attendance: true,
      academicRecords: {
        orderBy: { assessmentDate: "desc" },
      },
    },
  });

  if (children.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
        No enrolled children found linked to this parent account.
      </div>
    );
  }

  const selectedChild =
    children.find((c) => c.id === searchParams.studentId) || children[0];

  // Calculate subject mastery averages for chart
  const subjectMap = new Map<string, { total: number; count: number }>();
  selectedChild.academicRecords.forEach((r) => {
    const existing = subjectMap.get(r.subject) || { total: 0, count: 0 };
    const pct = (r.score / r.totalObtainable) * 100;
    existing.total += pct;
    existing.count += 1;
    subjectMap.set(r.subject, existing);
  });

  const chartData = Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    scorePercentage: Math.round(data.total / data.count),
    totalAssessments: data.count,
  }));

  const totalSessions = selectedChild.attendance.length;
  const presentCount = selectedChild.attendance.filter((a) => a.status === "PRESENT").length;
  const attendancePercentage =
    totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Child Selector Tabs */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {children.map((c) => (
            <a
              key={c.id}
              href={`/parent/academics?studentId=${c.id}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                c.id === selectedChild.id
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {c.fullName} ({c.class.name})
            </a>
          ))}
        </div>
      )}

      {/* Visual Analytics Charts */}
      <AcademicGrowthChart subjectData={chartData} />

      {/* Official Printable & Downloadable Report Card */}
      <ReportCardView
        student={{
          id: selectedChild.id,
          admissionNumber: selectedChild.admissionNumber,
          fullName: selectedChild.fullName,
          gender: selectedChild.gender,
          className: selectedChild.class.name,
          academicYear: selectedChild.class.academicYear || "2025/2026",
          parentName: selectedChild.parent.fullName,
          parentPhone: selectedChild.parent.phoneNumber,
        }}
        attendanceSummary={{
          totalSessions,
          presentCount,
          attendancePercentage,
        }}
        academicRecords={selectedChild.academicRecords.map((r) => ({
          id: r.id,
          subject: r.subject,
          title: r.title,
          type: r.type,
          score: r.score,
          totalObtainable: r.totalObtainable,
          assessmentDate: r.assessmentDate.toISOString(),
          teacherFeedback: r.teacherFeedback,
        }))}
      />
    </div>
  );
}
