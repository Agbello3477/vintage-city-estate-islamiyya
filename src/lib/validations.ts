import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userCreateSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Valid email required"),
  phoneNumber: z.string().min(7, "Phone number required").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["COMMITTEE", "TEACHER", "PARENT"]),
});

export const classCreateSchema = z.object({
  name: z.string().min(2, "Class name is required"),
  academicYear: z.string().min(4, "Academic year is required (e.g., 2025/2026)"),
  teacherId: z.string().optional().nullable(),
});

export const studentEnrollSchema = z.object({
  admissionNumber: z.string().min(2, "Admission number is required"),
  fullName: z.string().min(3, "Student full name is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().optional().nullable(),
  classId: z.string().min(1, "Class selection is required"),
  parentId: z.string().min(1, "Parent selection is required"),
});

export const attendanceMarkSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
  sessionDate: z.string().min(10), // YYYY-MM-DD
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  action: z.enum(["CHECK_IN", "CHECK_OUT", "STATUS_ONLY"]).default("CHECK_IN"),
  remarks: z.string().optional().nullable(),
});

export const batchAttendanceSchema = z.object({
  classId: z.string().min(1),
  sessionDate: z.string().min(10),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      checkIn: z.boolean().default(false),
      checkOut: z.boolean().default(false),
      remarks: z.string().optional().nullable(),
    })
  ),
});

export const academicRecordSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  title: z.string().min(2, "Assessment title is required"),
  type: z.enum(["QUIZ", "TEST", "MIDTERM", "FINAL_EXAM", "MEMORIZATION_QURAN"]),
  score: z.number().min(0, "Score must be >= 0"),
  totalObtainable: z.number().min(1, "Total obtainable must be > 0"),
  assessmentDate: z.string().min(10),
  teacherFeedback: z.string().optional().nullable(),
});

export const feePaymentToggleSchema = z.object({
  studentId: z.string().min(1),
  academicYear: z.string().min(4),
  monthIndex: z.number().int().min(1).max(12),
  isPaid: z.boolean(),
  amountPaid: z.number().min(0).default(5000),
});

export const feedbackTicketSchema = z.object({
  studentId: z.string().optional().nullable(),
  category: z.enum(["ACADEMIC", "FACILITIES", "WELFARE", "FEES"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const ticketResponseSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED"]),
  committeeResponse: z.string().min(3, "Response text is required"),
});
