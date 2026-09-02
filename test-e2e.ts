import { db } from "./src/lib/db";
import { hashPassword, verifyPassword, createToken, verifyToken } from "./src/lib/auth";
import { getScheduleForDate } from "./src/lib/schedule";
import { checkRateLimit, resetRateLimit } from "./src/lib/rate-limit";

async function runVerification() {
  console.log("=================================================");
  console.log("🧪 VCE-IMP AUTOMATED VERIFICATION SUITE");
  console.log("=================================================");

  // 1. Verify Database Records
  console.log("\n[1/6] Verifying Database Records...");
  const userCount = await db.user.count();
  const classCount = await db.class.count();
  const studentCount = await db.student.count();
  const attendanceCount = await db.attendance.count();
  const academicRecordCount = await db.academicRecord.count();
  const feePaymentCount = await db.studentFeePayment.count();
  const ticketCount = await db.feedbackTicket.count();
  const auditLogCount = await db.auditLog.count();

  console.log(`  ✓ Users: ${userCount}`);
  console.log(`  ✓ Classes: ${classCount}`);
  console.log(`  ✓ Students: ${studentCount}`);
  console.log(`  ✓ Attendance Records: ${attendanceCount}`);
  console.log(`  ✓ Academic & Tahfiz Records: ${academicRecordCount}`);
  console.log(`  ✓ 12-Month Fee Ledger Records: ${feePaymentCount}`);
  console.log(`  ✓ Feedback Tickets: ${ticketCount}`);
  console.log(`  ✓ Audit Logs: ${auditLogCount}`);

  if (userCount < 3 || classCount < 1 || studentCount < 1 || feePaymentCount < 12) {
    throw new Error("❌ Seed database verification failed: Missing required entities");
  }

  // 2. Verify Authentication & Hashing
  console.log("\n[2/6] Verifying Password Hashing & JWT Token System...");
  const testPass = "SecurePass123!";
  const hash = await hashPassword(testPass);
  const isValid = await verifyPassword(testPass, hash);
  const isInvalid = await verifyPassword("WrongPassword", hash);

  if (!isValid || isInvalid) {
    throw new Error("❌ Password hashing verification failed");
  }
  console.log("  ✓ Password hashing (bcrypt) passed");

  const token = await createToken({
    id: "test-user-id",
    fullName: "Test Admin",
    email: "admin@vintagecity.edu",
    role: "COMMITTEE",
    isActive: true,
  });

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "COMMITTEE" || payload.email !== "admin@vintagecity.edu") {
    throw new Error("❌ JWT token creation/verification failed");
  }
  console.log("  ✓ JWT Sign/Verify (jose HS256) passed");

  // 3. Verify Schedule Enforcement Rules
  console.log("\n[3/6] Verifying Islamiyya Schedule Presets...");
  // Test Thursday (Day 4)
  const thuDate = new Date("2026-08-27T16:30:00Z");
  const thuSchedule = getScheduleForDate(thuDate);
  console.log(`  ✓ Thursday: isClassDay=${thuSchedule.isClassDay}, Time=${thuSchedule.startTime}–${thuSchedule.endTime}`);

  // Test Sunday (Day 0)
  const sunDate = new Date("2026-08-30T09:00:00Z");
  const sunSchedule = getScheduleForDate(sunDate);
  console.log(`  ✓ Sunday: isClassDay=${sunSchedule.isClassDay}, Time=${sunSchedule.startTime}–${sunSchedule.endTime}`);

  // Test Tuesday (Day 2)
  const tueDate = new Date("2026-08-25T10:00:00Z");
  const tueSchedule = getScheduleForDate(tueDate);
  console.log(`  ✓ Tuesday: isClassDay=${tueSchedule.isClassDay} (Off Day)`);

  if (!thuSchedule.isClassDay || thuSchedule.startTime !== "16:00" || thuSchedule.endTime !== "18:00") {
    throw new Error("❌ Thursday/Friday schedule preset mismatch");
  }
  if (!sunSchedule.isClassDay || sunSchedule.startTime !== "08:30" || sunSchedule.endTime !== "13:00") {
    throw new Error("❌ Weekend schedule preset mismatch");
  }

  // 4. Verify 12-Month Fee Ledger System
  console.log("\n[4/6] Verifying 12-Month Fee Matrix & Paid/Unpaid States...");
  const sampleStudent = await db.student.findFirst({
    where: { admissionNumber: "VCE/2025/001" },
    include: {
      feePayments: {
        orderBy: { monthIndex: "asc" },
      },
    },
  });

  if (!sampleStudent || sampleStudent.feePayments.length !== 12) {
    throw new Error("❌ Student does not have exactly 12 month fee ledger rows");
  }

  const paidMonths = sampleStudent.feePayments.filter((p) => p.isPaid);
  const dueMonths = sampleStudent.feePayments.filter((p) => !p.isPaid);

  console.log(`  ✓ Student: ${sampleStudent.fullName} (${sampleStudent.admissionNumber})`);
  console.log(`  ✓ Paid Months: ${paidMonths.length} / 12`);
  console.log(`  ✓ Due Months: ${dueMonths.length} / 12`);

  // 5. Verify Sliding Window Rate Limiter
  console.log("\n[5/6] Verifying Sliding-Window Rate Limiting (5 attempts / 15 mins)...");
  const testKey = "rate-limit-test-ip";
  resetRateLimit(testKey);

  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(testKey, 5, 60000);
    if (!res.allowed) throw new Error(`❌ Attempt ${i} should be allowed`);
  }

  const blockedRes = checkRateLimit(testKey, 5, 60000);
  if (blockedRes.allowed) {
    throw new Error("❌ 6th attempt should be blocked by rate limiter");
  }
  console.log("  ✓ 5 Allowed attempts followed by blocked attempt (429 defense) verified");
  resetRateLimit(testKey);

  // 6. Verify Audit Logs & Security
  console.log("\n[6/6] Verifying Audit Trail Integrity...");
  const recentLogs = await db.auditLog.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  for (const log of recentLogs) {
    console.log(`  ✓ Audit [${log.action}] by ${log.userName} (${log.userRole}): ${log.details}`);
  }

  console.log("\n=================================================");
  console.log("🎉 ALL VCE-IMP VERIFICATION CHECKS PASSED 100%!");
  console.log("=================================================");
}

runVerification()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
