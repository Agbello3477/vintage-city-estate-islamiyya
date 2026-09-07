import * as XLSX from "xlsx";
import JSZip from "jszip";
import jsPDF from "jspdf";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

// --- 12-MONTH FEE LEDGER EXPORT (EXCEL & CSV) ---

export interface ExportFeeStudent {
  studentName: string;
  admissionNumber: string;
  className: string;
  academicYear: string;
  parentName: string;
  parentPhone: string | null;
  months: Array<{
    monthIndex: number;
    isPaid: boolean;
    amountPaid: number;
    paidAt: string | null;
  }>;
}

export function exportFeeLedgerToExcel(
  students: ExportFeeStudent[],
  fileName = "MIWT_Islamiyya_12Month_Fee_Ledger"
) {
  const monthNames = [
    "Month 1 (Sep)",
    "Month 2 (Oct)",
    "Month 3 (Nov)",
    "Month 4 (Dec)",
    "Month 5 (Jan)",
    "Month 6 (Feb)",
    "Month 7 (Mar)",
    "Month 8 (Apr)",
    "Month 9 (May)",
    "Month 10 (Jun)",
    "Month 11 (Jul)",
    "Month 12 (Aug)",
  ];

  const rows = students.map((s, idx) => {
    const totalPaid = s.months.reduce((acc, m) => acc + (m.isPaid ? m.amountPaid : 0), 0);
    const paidMonthsCount = s.months.filter((m) => m.isPaid).length;

    const rowObj: Record<string, any> = {
      "S/N": idx + 1,
      "Student Name": s.studentName,
      "Admission No": s.admissionNumber,
      "Class": s.className,
      "Parent / Guardian": s.parentName,
      "Phone Number": s.parentPhone || "N/A",
    };

    // Add Month 1 to 12
    monthNames.forEach((name, mIdx) => {
      const monthData = s.months.find((m) => m.monthIndex === mIdx + 1);
      rowObj[name] = monthData?.isPaid
        ? `PAID (₦${monthData.amountPaid.toLocaleString()})`
        : "DUE";
    });

    rowObj["Total Paid (Months)"] = `${paidMonthsCount} / 12`;
    rowObj["Total Amount (₦)"] = totalPaid;

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 5 },  // S/N
    { wch: 22 }, // Student Name
    { wch: 16 }, // Adm No
    { wch: 16 }, // Class
    { wch: 22 }, // Parent
    { wch: 15 }, // Phone
    ...Array(12).fill({ wch: 16 }),
    { wch: 18 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "12-Month Fee Ledger");

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export function exportFeeLedgerToCSV(
  students: ExportFeeStudent[],
  fileName = "MIWT_Islamiyya_Fee_Ledger"
) {
  const monthNames = [
    "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6",
    "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12",
  ];

  const headers = [
    "S/N",
    "Student Name",
    "Admission Number",
    "Class",
    "Parent Name",
    "Parent Phone",
    ...monthNames,
    "Paid Months",
    "Total Amount (NGN)",
  ];

  const csvRows = [headers.join(",")];

  students.forEach((s, idx) => {
    const totalPaid = s.months.reduce((acc, m) => acc + (m.isPaid ? m.amountPaid : 0), 0);
    const paidMonthsCount = s.months.filter((m) => m.isPaid).length;

    const row = [
      idx + 1,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.admissionNumber}"`,
      `"${s.className}"`,
      `"${s.parentName.replace(/"/g, '""')}"`,
      `"${s.parentPhone || ""}"`,
      ...monthNames.map((_, mIdx) => {
        const m = s.months.find((item) => item.monthIndex === mIdx + 1);
        return m?.isPaid ? `"PAID (₦${m.amountPaid})"` : '"DUE"';
      }),
      `"${paidMonthsCount}/12"`,
      totalPaid,
    ];
    csvRows.push(row.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- ATTENDANCE REGISTER EXPORT (EXCEL) ---

export interface ExportAttendanceItem {
  studentName: string;
  admissionNumber: string;
  className: string;
  sessionDate: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  remarks: string | null;
}

export function exportAttendanceToExcel(
  records: ExportAttendanceItem[],
  fileName = "MIWT_Islamiyya_Attendance_Register"
) {
  const rows = records.map((r, idx) => ({
    "S/N": idx + 1,
    "Date": formatDate(r.sessionDate),
    "Student Name": r.studentName,
    "Admission No": r.admissionNumber,
    "Class": r.className,
    "Status": r.status,
    "Check-In Time": r.checkInTime ? formatTime(r.checkInTime) : "—",
    "Check-Out Time": r.checkOutTime ? formatTime(r.checkOutTime) : "—",
    "Remarks": r.remarks || "—",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Log");

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// --- BULK REPORT CARD ZIP GENERATOR ---

export interface BulkReportStudentData {
  id: string;
  fullName: string;
  admissionNumber: string;
  gender: string;
  className: string;
  academicYear: string;
  parentName: string;
  attendancePercentage: number;
  totalSessions: number;
  presentSessions: number;
  subjects: Array<{
    subject: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
    grade: string;
  }>;
  overallAverage: number;
}

export async function exportBulkReportCardsZip(
  students: BulkReportStudentData[],
  onProgress?: (current: number, total: number) => void
) {
  const zip = new JSZip();

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (onProgress) onProgress(i + 1, students.length);

    const doc = new jsPDF("p", "mm", "a4");

    // Header Background
    doc.setFillColor(6, 78, 59); // Emerald 900
    doc.rect(10, 10, 190, 30, "F");

    // Bismillah & Title
    doc.setTextColor(245, 158, 11); // Amber 400
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("BISMILLAHIR RAHMANIR RAHIM", 105, 16, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("MADARASATUL ISLAMIYYA WA TARBIYYA", 105, 24, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(209, 250, 229);
    doc.text("OFFICIAL TERM PROGRESS & TAHFIZ REPORT CARD", 105, 32, { align: "center" });

    // Student Info Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(10, 44, 190, 24, 2, 2, "FD");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(`Student Name: ${s.fullName}`, 14, 52);
    doc.text(`Admission No: ${s.admissionNumber}`, 14, 58);
    doc.text(`Class Level: ${s.className}`, 14, 64);

    doc.text(`Academic Year: ${s.academicYear}`, 120, 52);
    doc.text(`Parent / Guardian: ${s.parentName}`, 120, 58);
    doc.text(`Attendance Rate: ${s.attendancePercentage}% (${s.presentSessions}/${s.totalSessions} Sessions)`, 120, 64);

    // Subject Table Header
    let y = 74;
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y, 190, 8, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(10, y, 190, 8, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text("Subject / Module", 14, y + 5.5);
    doc.text("Score", 110, y + 5.5);
    doc.text("Max", 135, y + 5.5);
    doc.text("Percentage", 155, y + 5.5);
    doc.text("Grade", 185, y + 5.5);

    y += 8;

    // Subject Rows
    doc.setFont("helvetica", "normal");
    s.subjects.forEach((sub) => {
      doc.rect(10, y, 190, 7, "S");
      doc.text(sub.subject, 14, y + 5);
      doc.text(String(sub.totalScore), 110, y + 5);
      doc.text(String(sub.maxScore), 135, y + 5);
      doc.text(`${sub.percentage}%`, 155, y + 5);

      doc.setFont("helvetica", "bold");
      doc.text(sub.grade, 185, y + 5);
      doc.setFont("helvetica", "normal");

      y += 7;
    });

    // Summary Box
    y += 4;
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(10, y, 190, 18, 2, 2, "FD");

    doc.setTextColor(6, 78, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Overall Academic Average: ${s.overallAverage}%`, 14, y + 7);
    doc.setFontSize(9);
    doc.text(`Islamic Evaluation: ${s.overallAverage >= 80 ? "Mumtaz (Excellent)" : "Jayyid Jiddan (Very Good)"}`, 14, y + 13);

    // Signatures
    y += 28;
    doc.setDrawColor(148, 163, 184);
    doc.line(20, y, 70, y);
    doc.line(130, y, 180, y);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Class Ustadh Signature", 30, y + 4);
    doc.text("Official Committee Seal", 140, y + 4);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Madarasatul Islamiyya wa Tarbiyya • Powered by MaSha Tech Innovations", 105, 285, { align: "center" });

    const pdfBlob = doc.output("blob");
    const safeName = s.fullName.replace(/[^a-zA-Z0-9]/g, "_");
    zip.file(`MIWT_ReportCard_${safeName}_${s.admissionNumber.replace(/\//g, "_")}.pdf`, pdfBlob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `MIWT_Term_ReportCards_${new Date().toISOString().split("T")[0]}.zip`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
