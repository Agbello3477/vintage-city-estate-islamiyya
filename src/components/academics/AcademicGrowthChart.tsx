"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface SubjectScoreData {
  subject: string;
  scorePercentage: number;
  totalAssessments: number;
}

interface AcademicGrowthChartProps {
  subjectData: SubjectScoreData[];
}

export function AcademicGrowthChart({ subjectData }: AcademicGrowthChartProps) {
  if (!subjectData || subjectData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No performance records available to plot growth charts.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Subject Performance Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-1">
          Subject Mastery Breakdown (%)
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Average percentage score achieved per Islamiyya subject
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: "#64748b" }}
                angle={-15}
                textAnchor="end"
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  fontSize: "12px",
                }}
                formatter={(val: any) => [`${val}%`, "Mastery Rate"]}
              />
              <Bar dataKey="scorePercentage" fill="#047857" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Islamic Competency Radar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-1">
          Islamic Competency Radar
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Holistic assessment across Tahfiz, Fiqh, Hadith & Arabic
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={subjectData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#475569" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Radar
                name="Score %"
                dataKey="scorePercentage"
                stroke="#065f46"
                fill="#10b981"
                fillOpacity={0.4}
              />
              <Tooltip formatter={(val: any) => [`${val}%`, "Mastery"]} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
