"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import {
  hashPassword,
  verifyPassword,
  createToken,
  setAuthCookie,
  clearAuthCookie,
  getSession,
} from "./auth";
import { recordAuditLog } from "./audit";
import { checkRateLimit, resetRateLimit } from "./rate-limit";
import {
  loginSchema,
  userCreateSchema,
  classCreateSchema,
  studentEnrollSchema,
  attendanceMarkSchema,
  batchAttendanceSchema,
  academicRecordSchema,
  feePaymentToggleSchema,
  feedbackTicketSchema,
  ticketResponseSchema,
} from "./validations";

// --- AUTH ACTIONS ---

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";

  // 1. Rate limiting check (5 attempts per 15 min)
  const rateLimit = checkRateLimit(`login:${email || "anon"}`);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      error: `Too many failed login attempts. Please try again in ${minutesLeft} minutes.`,
    };
  }

  // 2. Validate input
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || "Invalid credentials" };
  }

  // 3. Check user
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return { error: "Invalid email or account is inactive." };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: "Invalid email or password." };
  }

  // Reset rate limit on success
  resetRateLimit(`login:${email}`);

  // Create token & cookie
  const token = await createToken({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as any,
    isActive: user.isActive,
  });

  await setAuthCookie(token);

  await recordAuditLog({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    action: "USER_LOGIN",
    entityType: "USER",
    entityId: user.id,
    details: `${user.fullName} logged in successfully as ${user.role}.`,
  });

  // Redirect based on role
  if (user.role === "COMMITTEE") redirect("/committee");
  if (user.role === "TEACHER") redirect("/teacher");
  if (user.role === "PARENT") redirect("/parent");
  redirect("/login");
}

export async function quickDemoLogin(role: "COMMITTEE" | "TEACHER" | "PARENT") {
  let targetEmail = "admin@vintagecity.edu";
  if (role === "TEACHER") targetEmail = "ustadh.ahmad@vintagecity.edu";
  if (role === "PARENT") targetEmail = "parent.ibrahim@gmail.com";

  const user = await db.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    throw new Error("Demo user not found. Please seed the database first.");
  }

  const token = await createToken({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as any,
    isActive: user.isActive,
  });

  await setAuthCookie(token);

  if (role === "COMMITTEE") redirect("/committee");
  if (role === "TEACHER") redirect("/teacher");
  if (role === "PARENT") redirect("/parent");
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/");
}

// --- USER & TEACHER ACTIONS (COMMITTEE) ---

export async function createUserAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "COMMITTEE") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    phoneNumber: formData.get("phoneNumber")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    role: formData.get("role")?.toString() || "PARENT",
  };

  const validation = userCreateSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message };
  }

  const existing = await db.user.findUnique({
    where: { email: rawData.email },
  });
  if (existing) {
    return { error: "A user with this email address already exists." };
  }

  const passwordHash = await hashPassword(rawData.password);
  const newUser = await db.user.create({
    data: {
      fullName: rawData.fullName,
      email: rawData.email,
      phoneNumber: rawData.phoneNumber || null,
      passwordHash,
      role: rawData.role,
      isActive: true,
    },
  });

  await recordAuditLog({
    action: "USER_CREATION",
    entityType: "USER",
    entityId: newUser.id,
    details: `Created new ${newUser.role} user: ${newUser.fullName} (${newUser.email})`,
  });

  revalidatePath("/committee/users");
  return { success: true, user: newUser };
}

export async function toggleUserStatusAction(userId: string, currentStatus: boolean) {
  const session = await getSession();
  if (!session || session.role !== "COMMITTEE") {
    return { error: "Unauthorized." };
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { isActive: !currentStatus },
  });

  await recordAuditLog({
    action: "USER_STATUS_CHANGE",
    entityType: "USER",
    entityId: updated.id,
    details: `Toggled user status for ${updated.fullName} to ${updated.isActive ? "ACTIVE" : "DEACTIVATED"}`,
  });

  revalidatePath("/committee/users");
  return { success: true };
}

// --- CLASS ACTIONS ---

export async function createClassAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "COMMITTEE") {
    return { error: "Unauthorized." };
  }

  const rawData = {
    name: formData.get("name")?.toString() || "",
    academicYear: formData.get("academicYear")?.toString() || "2025/2026",
    teacherId: formData.get("teacherId")?.toString() || null,
  };

  const validation = classCreateSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message };
  }

  const newClass = await db.class.create({
    data: {
      name: rawData.name,
      academicYear: rawData.academicYear,
      teacherId: rawData.teacherId || null,
    },
  });

  await recordAuditLog({
    action: "CLASS_CREATION",
    entityType: "CLASS",
    entityId: newClass.id,
    details: `Created class: ${newClass.name} (${newClass.academicYear})`,
  });

  revalidatePath("/committee/classes");
  return { success: true };
}

export async function updateClassAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "COMMITTEE") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  const classId = formData.get("classId")?.toString() || "";
  const name = formData.get("name")?.toString() || "";
  const academicYear = formData.get("academicYear")?.toString() || "2025/2026";
  const teacherId = formData.get("teacherId")?.toString() || null;

  if (!classId || !name) {
    return { error: "Class ID and name are required." };
  }

  const updatedClass = await db.class.update({
    where: { id: classId },
    data: {
      name,
      academicYear,
      teacherId: teacherId || null,
    },
    include: {
      teacher: true,
    },
  });

  await recordAuditLog({
    action: "CLASS_TEACHER_ASSIGNMENT",
    entityType: "CLASS",
    entityId: updatedClass.id,
    details: `Committee ${session.fullName} assigned ${updatedClass.teacher?.fullName || "Unassigned"} to class ${updatedClass.name} (${updatedClass.academicYear})`,
  });

  revalidatePath("/committee/classes");
  revalidatePath("/teacher");
  revalidatePath("/teacher/students");
  revalidatePath("/teacher/attendance");
  revalidatePath("/teacher/gradebook");
  return { success: true, updatedClass };
}

// --- STUDENT ENROLLMENT ACTIONS ---

export async function enrollStudentAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "COMMITTEE" && session.role !== "TEACHER")) {
    return { error: "Unauthorized: Only Committee or Teachers can enroll students." };
  }

  const rawData = {
    admissionNumber: formData.get("admissionNumber")?.toString() || "",
    fullName: formData.get("fullName")?.toString() || "",
    gender: formData.get("gender")?.toString() || "MALE",
    dateOfBirth: formData.get("dateOfBirth")?.toString() || null,
    classId: formData.get("classId")?.toString() || "",
    parentId: formData.get("parentId")?.toString() || "",
  };

  const validation = studentEnrollSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message };
  }

  const existing = await db.student.findUnique({
    where: { admissionNumber: rawData.admissionNumber },
  });
  if (existing) {
    return { error: "A student with this admission number already exists." };
  }

  const student = await db.student.create({
    data: {
      admissionNumber: rawData.admissionNumber,
      fullName: rawData.fullName,
      gender: rawData.gender,
      dateOfBirth: rawData.dateOfBirth ? new Date(rawData.dateOfBirth) : null,
      classId: rawData.classId,
      parentId: rawData.parentId,
    },
    include: {
      class: true,
    },
  });

  // Initialize 12-Month Fee Ledger for student
  const academicYear = student.class.academicYear || "2025/2026";
  for (let month = 1; month <= 12; month++) {
    await db.studentFeePayment.create({
      data: {
        studentId: student.id,
        academicYear,
        monthIndex: month,
        isPaid: false,
        amountPaid: 0,
      },
    });
  }

  await recordAuditLog({
    action: "STUDENT_ENROLLMENT",
    entityType: "STUDENT",
    entityId: student.id,
    details: `Enrolled student ${student.fullName} (${student.admissionNumber}) into class ${student.class.name}`,
  });

  revalidatePath("/committee/students");
  revalidatePath("/committee/users");
  revalidatePath("/teacher/students");
  return { success: true, student };
}

export async function assignChildrenToParentAction(parentId: string, studentIds: string[]) {
  const session = await getSession();
  if (!session || (session.role !== "COMMITTEE" && session.role !== "TEACHER")) {
    return { error: "Unauthorized: Only Committee or Teachers can assign children." };
  }

  const parent = await db.user.findUnique({
    where: { id: parentId },
    include: { children: true },
  });

  if (!parent || parent.role !== "PARENT") {
    return { error: "Target parent user not found or invalid role." };
  }

  // Link selected students to this parent
  if (studentIds.length > 0) {
    await db.student.updateMany({
      where: { id: { in: studentIds } },
      data: { parentId },
    });
  }

  await recordAuditLog({
    action: "PARENT_CHILDREN_ASSIGNMENT",
    entityType: "USER",
    entityId: parent.id,
    details: `${session.fullName} assigned ${studentIds.length} children to parent ${parent.fullName} (${parent.email})`,
  });

  revalidatePath("/committee/users");
  revalidatePath("/committee/students");
  revalidatePath("/teacher/students");
  revalidatePath("/parent");
  return { success: true };
}

export async function updateStudentAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "COMMITTEE" && session.role !== "TEACHER")) {
    return { error: "Unauthorized." };
  }

  const studentId = formData.get("studentId")?.toString() || "";
  const fullName = formData.get("fullName")?.toString() || "";
  const gender = formData.get("gender")?.toString() || "MALE";
  const dateOfBirth = formData.get("dateOfBirth")?.toString() || null;
  const classId = formData.get("classId")?.toString() || "";
  const parentId = formData.get("parentId")?.toString() || "";

  if (!studentId || !fullName || !classId || !parentId) {
    return { error: "Required fields missing." };
  }

  const updated = await db.student.update({
    where: { id: studentId },
    data: {
      fullName,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      classId,
      parentId,
    },
    include: {
      class: true,
      parent: true,
    },
  });

  await recordAuditLog({
    action: "STUDENT_UPDATED",
    entityType: "STUDENT",
    entityId: updated.id,
    details: `Updated profile for student ${updated.fullName} (Class: ${updated.class.name}, Parent: ${updated.parent.fullName})`,
  });

  revalidatePath("/committee/students");
  revalidatePath("/committee/users");
  revalidatePath("/teacher/students");
  return { success: true, student: updated };
}

// --- ATTENDANCE ACTIONS (SCHEDULE ENFORCEMENT & BATCH ACTIONS) ---

export async function markSingleAttendanceAction(data: {
  studentId: string;
  classId: string;
  sessionDate: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  action: "CHECK_IN" | "CHECK_OUT" | "STATUS_ONLY";
  remarks?: string;
}) {
  const session = await getSession();
  if (!session || (session.role !== "COMMITTEE" && session.role !== "TEACHER")) {
    return { error: "Unauthorized." };
  }

  const now = new Date();
  const existing = await db.attendance.findUnique({
    where: {
      student_session_unique: {
        studentId: data.studentId,
        sessionDate: data.sessionDate,
      },
    },
  });

  let checkInTime = existing?.checkInTime;
  let checkOutTime = existing?.checkOutTime;

  if (data.action === "CHECK_IN") {
    checkInTime = now;
  } else if (data.action === "CHECK_OUT") {
    checkOutTime = now;
  }

  const record = await db.attendance.upsert({
    where: {
      student_session_unique: {
        studentId: data.studentId,
        sessionDate: data.sessionDate,
      },
    },
    create: {
      studentId: data.studentId,
      classId: data.classId,
      sessionDate: data.sessionDate,
      status: data.status,
      checkInTime: data.action === "CHECK_IN" ? now : null,
      checkOutTime: data.action === "CHECK_OUT" ? now : null,
      markedById: session.id,
      remarks: data.remarks || null,
    },
    update: {
      status: data.status,
      checkInTime,
      checkOutTime,
      markedById: session.id,
      remarks: data.remarks !== undefined ? data.remarks : existing?.remarks,
    },
  });

  await recordAuditLog({
    action: "ATTENDANCE_MARKED",
    entityType: "ATTENDANCE",
    entityId: record.id,
    details: `${session.fullName} marked ${data.status} for student (Date: ${data.sessionDate}, Action: ${data.action})`,
  });

  revalidatePath("/teacher/attendance");
  revalidatePath("/committee/attendance");
  revalidatePath("/parent/attendance");
  return { success: true, record };
}

export async function batchAttendanceAction(params: {
  classId: string;
  sessionDate: string;
  actionType: "BATCH_CHECK_IN" | "BATCH_CHECK_OUT" | "SAVE_ALL";
  studentsData: Array<{
    studentId: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    remarks?: string;
  }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "COMMITTEE" && session.role !== "TEACHER")) {
    return { error: "Unauthorized." };
  }

  const now = new Date();

  for (const item of params.studentsData) {
    const existing = await db.attendance.findUnique({
      where: {
        student_session_unique: {
          studentId: item.studentId,
          sessionDate: params.sessionDate,
        },
      },
    });

    let checkIn = existing?.checkInTime;
    let checkOut = existing?.checkOutTime;

    if (params.actionType === "BATCH_CHECK_IN") {
      checkIn = now;
    } else if (params.actionType === "BATCH_CHECK_OUT") {
      checkOut = now;
    }

    await db.attendance.upsert({
      where: {
        student_session_unique: {
          studentId: item.studentId,
          sessionDate: params.sessionDate,
        },
      },
      create: {
        studentId: item.studentId,
        classId: params.classId,
        sessionDate: params.sessionDate,
        status: item.status,
        checkInTime: params.actionType === "BATCH_CHECK_IN" ? now : null,
        checkOutTime: params.actionType === "BATCH_CHECK_OUT" ? now : null,
        markedById: session.id,
        remarks: item.remarks || null,
      },
      update: {
        status: item.status,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        markedById: session.id,
        remarks: item.remarks || existing?.remarks || null,
      },
    });
  }

  await recordAuditLog({
    action: "BATCH_ATTENDANCE_EXECUTED",
    entityType: "ATTENDANCE",
    details: `${session.fullName} executed ${params.actionType} for ${params.studentsData.length} students on ${params.sessionDate}`,
  });

  revalidatePath("/teacher/attendance");
  revalidatePath("/committee/attendance");
  revalidatePath("/parent/attendance");
  return { success: true };
}

// --- ACADEMIC & TAHFIZ GRADES ACTIONS ---

export async function createAcademicRecordAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "COMMITTEE" && session.role !== "TEACHER")) {
    return { error: "Unauthorized: Only Teachers and Committee can record grades." };
  }

  const rawData = {
    studentId: formData.get("studentId")?.toString() || "",
    classId: formData.get("classId")?.toString() || "",
    subject: formData.get("subject")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    type: formData.get("type")?.toString() as any,
    score: Number(formData.get("score")),
    totalObtainable: Number(formData.get("totalObtainable") || 100),
    assessmentDate: formData.get("assessmentDate")?.toString() || new Date().toISOString().split("T")[0],
    teacherFeedback: formData.get("teacherFeedback")?.toString() || "",
  };

  const validation = academicRecordSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message };
  }

  const record = await db.academicRecord.create({
    data: {
      studentId: rawData.studentId,
      classId: rawData.classId,
      subject: rawData.subject,
      title: rawData.title,
      type: rawData.type,
      score: rawData.score,
      totalObtainable: rawData.totalObtainable,
      assessmentDate: new Date(rawData.assessmentDate),
      teacherFeedback: rawData.teacherFeedback || null,
      gradedById: session.id,
    },
    include: {
      student: true,
    },
  });

  await recordAuditLog({
    action: "GRADE_MUTATION",
    entityType: "ACADEMIC_RECORD",
    entityId: record.id,
    details: `${session.fullName} entered score ${record.score}/${record.totalObtainable} for ${record.student.fullName} in [${record.subject}: ${record.title}]`,
  });

  revalidatePath("/teacher/gradebook");
  revalidatePath("/committee/academics");
  revalidatePath("/parent/academics");
  return { success: true, record };
}

// --- 12-MONTH FEE LEDGER ACTIONS ---

export async function toggleFeePaymentAction(data: {
  studentId: string;
  academicYear: string;
  monthIndex: number;
  isPaid: boolean;
  amountPaid?: number;
}) {
  const session = await getSession();
  if (!session || (session.role !== "COMMITTEE" && session.role !== "TEACHER")) {
    return { error: "Unauthorized: Only Committee and Teachers can modify fee records." };
  }

  const validation = feePaymentToggleSchema.safeParse({
    studentId: data.studentId,
    academicYear: data.academicYear,
    monthIndex: data.monthIndex,
    isPaid: data.isPaid,
    amountPaid: data.amountPaid ?? 5000,
  });

  if (!validation.success) {
    return { error: validation.error.errors[0]?.message };
  }

  const student = await db.student.findUnique({
    where: { id: data.studentId },
  });

  const updated = await db.studentFeePayment.upsert({
    where: {
      unique_student_month_fee: {
        studentId: data.studentId,
        academicYear: data.academicYear,
        monthIndex: data.monthIndex,
      },
    },
    create: {
      studentId: data.studentId,
      academicYear: data.academicYear,
      monthIndex: data.monthIndex,
      isPaid: data.isPaid,
      amountPaid: data.isPaid ? (data.amountPaid ?? 5000) : 0,
      paidAt: data.isPaid ? new Date() : null,
      recordedById: session.id,
    },
    update: {
      isPaid: data.isPaid,
      amountPaid: data.isPaid ? (data.amountPaid ?? 5000) : 0,
      paidAt: data.isPaid ? new Date() : null,
      recordedById: session.id,
    },
  });

  await recordAuditLog({
    action: "FEE_STATUS_OVERRIDE",
    entityType: "FEE_PAYMENT",
    entityId: updated.id,
    details: `${session.fullName} marked Month ${data.monthIndex} fee for ${student?.fullName || "Student"} as ${data.isPaid ? "PAID (₦" + updated.amountPaid + ")" : "UNPAID / DUE"}`,
  });

  revalidatePath("/teacher/fees");
  revalidatePath("/committee/fees");
  revalidatePath("/parent/fees");
  return { success: true, updated };
}

// --- FEEDBACK & COMPLAINTS ACTIONS ---

export async function submitFeedbackTicketAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "PARENT") {
    return { error: "Unauthorized: Only parents can submit feedback tickets." };
  }

  const rawData = {
    studentId: formData.get("studentId")?.toString() || null,
    category: formData.get("category")?.toString() as any,
    title: formData.get("title")?.toString() || "",
    message: formData.get("message")?.toString() || "",
  };

  const validation = feedbackTicketSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message };
  }

  const ticket = await db.feedbackTicket.create({
    data: {
      parentId: session.id,
      studentId: rawData.studentId || null,
      category: rawData.category,
      title: rawData.title,
      message: rawData.message,
      status: "OPEN",
    },
  });

  await recordAuditLog({
    action: "TICKET_SUBMISSION",
    entityType: "FEEDBACK_TICKET",
    entityId: ticket.id,
    details: `Parent ${session.fullName} submitted ticket [${ticket.category}]: ${ticket.title}`,
  });

  revalidatePath("/parent/tickets");
  revalidatePath("/committee/tickets");
  return { success: true, ticket };
}

export async function respondTicketAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "COMMITTEE") {
    return { error: "Unauthorized: Only Committee members can respond to tickets." };
  }

  const rawData = {
    ticketId: formData.get("ticketId")?.toString() || "",
    status: formData.get("status")?.toString() as any,
    committeeResponse: formData.get("committeeResponse")?.toString() || "",
  };

  const validation = ticketResponseSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message };
  }

  const ticket = await db.feedbackTicket.update({
    where: { id: rawData.ticketId },
    data: {
      status: rawData.status,
      committeeResponse: rawData.committeeResponse,
      respondedById: session.id,
      respondedAt: new Date(),
    },
  });

  await recordAuditLog({
    action: "TICKET_RESOLUTION",
    entityType: "FEEDBACK_TICKET",
    entityId: ticket.id,
    details: `Committee ${session.fullName} updated ticket status to ${ticket.status} with official response`,
  });

  revalidatePath("/committee/tickets");
  revalidatePath("/parent/tickets");
  return { success: true, ticket };
}
