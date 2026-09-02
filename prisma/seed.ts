import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed for Vintage City Estate Islamiyya...");

  // Clean existing tables
  await prisma.revokedToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.feedbackTicket.deleteMany();
  await prisma.studentFeePayment.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const committeePassword = await bcrypt.hash("Admin@12345", salt);
  const teacherPassword = await bcrypt.hash("Teacher@12345", salt);
  const parentPassword = await bcrypt.hash("Parent@12345", salt);

  // 1. Create Users
  // Super Admins / Committee
  const admin = await prisma.user.create({
    data: {
      fullName: "Alhaji Faruq Al-Mansoor",
      email: "admin@vintagecity.edu",
      phoneNumber: "+2348011112222",
      passwordHash: committeePassword,
      role: "COMMITTEE",
      isActive: true,
    },
  });

  const committee2 = await prisma.user.create({
    data: {
      fullName: "Dr. Amina Belgore",
      email: "committee2@vintagecity.edu",
      phoneNumber: "+2348011113333",
      passwordHash: committeePassword,
      role: "COMMITTEE",
      isActive: true,
    },
  });

  // Teachers / Ustadhs
  const ustadhAhmad = await prisma.user.create({
    data: {
      fullName: "Ustadh Ahmad Sulaiman",
      email: "ustadh.ahmad@vintagecity.edu",
      phoneNumber: "+2348022221111",
      passwordHash: teacherPassword,
      role: "TEACHER",
      isActive: true,
    },
  });

  const ustadhUsman = await prisma.user.create({
    data: {
      fullName: "Ustadh Usman Dan Fodio",
      email: "ustadh.usman@vintagecity.edu",
      phoneNumber: "+2348022223333",
      passwordHash: teacherPassword,
      role: "TEACHER",
      isActive: true,
    },
  });

  const muallimaZainab = await prisma.user.create({
    data: {
      fullName: "Muallima Zainab Bello",
      email: "muallima.zainab@vintagecity.edu",
      phoneNumber: "+2348022224444",
      passwordHash: teacherPassword,
      role: "TEACHER",
      isActive: true,
    },
  });

  // Parents
  const parentIbrahim = await prisma.user.create({
    data: {
      fullName: "Engr. Ibrahim Abdullahi",
      email: "parent.ibrahim@gmail.com",
      phoneNumber: "+2348033331111",
      passwordHash: parentPassword,
      role: "PARENT",
      isActive: true,
    },
  });

  const parentFatima = await prisma.user.create({
    data: {
      fullName: "Hajiya Fatima Garba",
      email: "parent.fatima@gmail.com",
      phoneNumber: "+2348033332222",
      passwordHash: parentPassword,
      role: "PARENT",
      isActive: true,
    },
  });

  const parentMusa = await prisma.user.create({
    data: {
      fullName: "Mallam Musa Sani",
      email: "parent.musa@gmail.com",
      phoneNumber: "+2348033333333",
      passwordHash: parentPassword,
      role: "PARENT",
      isActive: true,
    },
  });

  console.log("✅ Users created: Super Admin, Ustadhs, Parents");

  // 2. Create Classes
  const classRawdah = await prisma.class.create({
    data: {
      name: "Rawdah (Early Learners)",
      academicYear: "2025/2026",
      teacherId: muallimaZainab.id,
    },
  });

  const classIbtidaiyah1 = await prisma.class.create({
    data: {
      name: "Ibtidaiyah 1 (Grade 1)",
      academicYear: "2025/2026",
      teacherId: ustadhAhmad.id,
    },
  });

  const classIbtidaiyah2 = await prisma.class.create({
    data: {
      name: "Ibtidaiyah 2 (Grade 2)",
      academicYear: "2025/2026",
      teacherId: ustadhUsman.id,
    },
  });

  const classTahfiz = await prisma.class.create({
    data: {
      name: "Tahfiz Special Class (Advanced Hifz)",
      academicYear: "2025/2026",
      teacherId: ustadhAhmad.id,
    },
  });

  console.log("✅ Classes created");

  // 3. Create Students
  const studentBilal = await prisma.student.create({
    data: {
      admissionNumber: "VCE/2025/001",
      fullName: "Bilal Ibrahim Abdullahi",
      gender: "MALE",
      dateOfBirth: new Date("2016-04-12"),
      classId: classIbtidaiyah1.id,
      parentId: parentIbrahim.id,
    },
  });

  const studentMaryam = await prisma.student.create({
    data: {
      admissionNumber: "VCE/2025/002",
      fullName: "Maryam Ibrahim Abdullahi",
      gender: "FEMALE",
      dateOfBirth: new Date("2014-08-25"),
      classId: classTahfiz.id,
      parentId: parentIbrahim.id,
    },
  });

  const studentZayd = await prisma.student.create({
    data: {
      admissionNumber: "VCE/2025/003",
      fullName: "Zayd Musa Sani",
      gender: "MALE",
      dateOfBirth: new Date("2016-11-03"),
      classId: classIbtidaiyah1.id,
      parentId: parentMusa.id,
    },
  });

  const studentAisha = await prisma.student.create({
    data: {
      admissionNumber: "VCE/2025/004",
      fullName: "Aisha Fatima Garba",
      gender: "FEMALE",
      dateOfBirth: new Date("2019-02-18"),
      classId: classRawdah.id,
      parentId: parentFatima.id,
    },
  });

  const studentAbdullah = await prisma.student.create({
    data: {
      admissionNumber: "VCE/2025/005",
      fullName: "Abdullah Ibrahim Abdullahi",
      gender: "MALE",
      dateOfBirth: new Date("2015-06-30"),
      classId: classIbtidaiyah2.id,
      parentId: parentIbrahim.id,
    },
  });

  const studentKhadijah = await prisma.student.create({
    data: {
      admissionNumber: "VCE/2025/006",
      fullName: "Khadijah Musa Sani",
      gender: "FEMALE",
      dateOfBirth: new Date("2015-09-14"),
      classId: classIbtidaiyah2.id,
      parentId: parentMusa.id,
    },
  });

  console.log("✅ Students enrolled");

  // 4. Create Historical Attendance (Recent Thursday, Friday, Saturday, Sunday dates)
  const sessionDates = [
    { date: "2026-08-20", day: "Thursday", isWeekday: true },
    { date: "2026-08-21", day: "Friday", isWeekday: true },
    { date: "2026-08-22", day: "Saturday", isWeekday: false },
    { date: "2026-08-23", day: "Sunday", isWeekday: false },
    { date: "2026-08-27", day: "Thursday", isWeekday: true },
    { date: "2026-08-28", day: "Friday", isWeekday: true },
    { date: "2026-08-29", day: "Saturday", isWeekday: false },
    { date: "2026-08-30", day: "Sunday", isWeekday: false },
    { date: "2026-08-31", day: "Monday", isWeekday: true }, // Today for testing
  ];

  for (const s of sessionDates) {
    const isWk = s.isWeekday;
    const inTimeBase = isWk ? `${s.date}T16:05:00.000Z` : `${s.date}T08:35:00.000Z`;
    const outTimeBase = isWk ? `${s.date}T17:58:00.000Z` : `${s.date}T12:55:00.000Z`;

    // Bilal
    await prisma.attendance.create({
      data: {
        studentId: studentBilal.id,
        classId: classIbtidaiyah1.id,
        sessionDate: s.date,
        checkInTime: new Date(inTimeBase),
        checkOutTime: new Date(outTimeBase),
        status: "PRESENT",
        markedById: ustadhAhmad.id,
        remarks: "Arrived on time with Quran and Tajweed book",
      },
    });

    // Maryam
    await prisma.attendance.create({
      data: {
        studentId: studentMaryam.id,
        classId: classTahfiz.id,
        sessionDate: s.date,
        checkInTime: new Date(inTimeBase),
        checkOutTime: new Date(outTimeBase),
        status: "PRESENT",
        markedById: ustadhAhmad.id,
        remarks: "Completed 3 Juz revision today",
      },
    });

    // Zayd (LATE once, EXCUSED once)
    const zaydStatus = s.date === "2026-08-21" ? "LATE" : s.date === "2026-08-28" ? "EXCUSED" : "PRESENT";
    await prisma.attendance.create({
      data: {
        studentId: studentZayd.id,
        classId: classIbtidaiyah1.id,
        sessionDate: s.date,
        checkInTime: zaydStatus === "EXCUSED" ? null : new Date(inTimeBase),
        checkOutTime: zaydStatus === "EXCUSED" ? null : new Date(outTimeBase),
        status: zaydStatus,
        markedById: ustadhAhmad.id,
        remarks: zaydStatus === "EXCUSED" ? "Medical appointment with permission letter" : "Participated actively",
      },
    });

    // Aisha
    await prisma.attendance.create({
      data: {
        studentId: studentAisha.id,
        classId: classRawdah.id,
        sessionDate: s.date,
        checkInTime: new Date(inTimeBase),
        checkOutTime: new Date(outTimeBase),
        status: "PRESENT",
        markedById: muallimaZainab.id,
        remarks: "Arabic alphabet recitation perfected",
      },
    });

    // Abdullah
    await prisma.attendance.create({
      data: {
        studentId: studentAbdullah.id,
        classId: classIbtidaiyah2.id,
        sessionDate: s.date,
        checkInTime: new Date(inTimeBase),
        checkOutTime: new Date(outTimeBase),
        status: "PRESENT",
        markedById: ustadhUsman.id,
      },
    });

    // Khadijah
    await prisma.attendance.create({
      data: {
        studentId: studentKhadijah.id,
        classId: classIbtidaiyah2.id,
        sessionDate: s.date,
        checkInTime: new Date(inTimeBase),
        checkOutTime: new Date(outTimeBase),
        status: "PRESENT",
        markedById: ustadhUsman.id,
      },
    });
  }

  console.log("✅ Attendance sessions seeded");

  // 5. Create Academic & Tahfiz Records
  const academicRecordsData = [
    {
      studentId: studentBilal.id,
      classId: classIbtidaiyah1.id,
      subject: "Tahfiz / Quran",
      title: "Surah An-Naba Recitation & Memorization",
      type: "MEMORIZATION_QURAN",
      score: 95,
      totalObtainable: 100,
      assessmentDate: new Date("2026-08-15"),
      teacherFeedback: "Masha Allah, excellent articulation and Makharij al-Huruf.",
      gradedById: ustadhAhmad.id,
    },
    {
      studentId: studentBilal.id,
      classId: classIbtidaiyah1.id,
      subject: "Hadith",
      title: "40 Hadith Nawawi (Hadith 1 to 5)",
      type: "QUIZ",
      score: 19,
      totalObtainable: 20,
      assessmentDate: new Date("2026-08-18"),
      teacherFeedback: "Very good retention of narrators and meanings.",
      gradedById: ustadhAhmad.id,
    },
    {
      studentId: studentBilal.id,
      classId: classIbtidaiyah1.id,
      subject: "Fiqh",
      title: "Conditions of Wudu & Purification Midterm",
      type: "MIDTERM",
      score: 46,
      totalObtainable: 50,
      assessmentDate: new Date("2026-08-22"),
      teacherFeedback: "Clear understanding of the nullifiers of ablution.",
      gradedById: ustadhAhmad.id,
    },
    {
      studentId: studentBilal.id,
      classId: classIbtidaiyah1.id,
      subject: "Arabic Language",
      title: "Basic Arabic Vocabulary & Reading Test",
      type: "TEST",
      score: 28,
      totalObtainable: 30,
      assessmentDate: new Date("2026-08-25"),
      teacherFeedback: "Great handwriting and vowel recognition.",
      gradedById: ustadhAhmad.id,
    },
    {
      studentId: studentBilal.id,
      classId: classIbtidaiyah1.id,
      subject: "General Islamiyya",
      title: "Early Islamic History (Prophet's Biography in Makkah)",
      type: "FINAL_EXAM",
      score: 88,
      totalObtainable: 100,
      assessmentDate: new Date("2026-08-29"),
      teacherFeedback: "Solid grasp of key historical events and moral lessons.",
      gradedById: ustadhAhmad.id,
    },

    // Maryam (Tahfiz Special Class)
    {
      studentId: studentMaryam.id,
      classId: classTahfiz.id,
      subject: "Tahfiz / Quran",
      title: "Juz 29 & 30 Complete Memorization Exam",
      type: "MEMORIZATION_QURAN",
      score: 98,
      totalObtainable: 100,
      assessmentDate: new Date("2026-08-20"),
      teacherFeedback: "Exceptional Tajweed rules applied seamlessly. Ready for Juz 28.",
      gradedById: ustadhAhmad.id,
    },
    {
      studentId: studentMaryam.id,
      classId: classTahfiz.id,
      subject: "Fiqh",
      title: "Rulings of Salah & Sujud As-Sahw",
      type: "MIDTERM",
      score: 48,
      totalObtainable: 50,
      assessmentDate: new Date("2026-08-24"),
      teacherFeedback: "Thorough comprehension of prostrations of forgetfulness.",
      gradedById: ustadhAhmad.id,
    },
    {
      studentId: studentMaryam.id,
      classId: classTahfiz.id,
      subject: "Arabic Language",
      title: "Quranic Arabic Grammar (Al-Nahw)",
      type: "TEST",
      score: 30,
      totalObtainable: 30,
      assessmentDate: new Date("2026-08-28"),
      teacherFeedback: "Perfect score! Outstanding parsing skills.",
      gradedById: ustadhAhmad.id,
    },

    // Abdullah (Ibtidaiyah 2)
    {
      studentId: studentAbdullah.id,
      classId: classIbtidaiyah2.id,
      subject: "Tahfiz / Quran",
      title: "Surah Al-Mulk to Al-Qalam Recitation",
      type: "MEMORIZATION_QURAN",
      score: 91,
      totalObtainable: 100,
      assessmentDate: new Date("2026-08-22"),
      teacherFeedback: "Strong memory, keep practicing Gunnah prolongation.",
      gradedById: ustadhUsman.id,
    },
    {
      studentId: studentAbdullah.id,
      classId: classIbtidaiyah2.id,
      subject: "Fiqh",
      title: "Pillars of Islam & Iman Assessment",
      type: "QUIZ",
      score: 18,
      totalObtainable: 20,
      assessmentDate: new Date("2026-08-26"),
      teacherFeedback: "Very attentive student.",
      gradedById: ustadhUsman.id,
    },
  ];

  for (const record of academicRecordsData) {
    await prisma.academicRecord.create({ data: record });
  }

  console.log("✅ Academic and Tahfiz records seeded");

  // 6. Create 12-Month Fee Ledger System
  // Student Bilal: Months 1 to 7 PAID (₦5,000 each), Months 8 to 12 UNPAID
  const currentYear = "2025/2026";
  const allStudents = [studentBilal, studentMaryam, studentZayd, studentAisha, studentAbdullah, studentKhadijah];

  for (const stu of allStudents) {
    for (let month = 1; month <= 12; month++) {
      let isPaid = false;
      let amountPaid = 0;
      let paidAt: Date | null = null;

      // Bilal & Maryam & Abdullah paid months 1 to 8
      if (["VCE/2025/001", "VCE/2025/002", "VCE/2025/005"].includes(stu.admissionNumber)) {
        if (month <= 8) {
          isPaid = true;
          amountPaid = 5000;
          paidAt = new Date(`2026-0${Math.min(month, 8)}-05T10:00:00.000Z`);
        }
      } else if (stu.admissionNumber === "VCE/2025/003") {
        // Zayd paid months 1 to 6
        if (month <= 6) {
          isPaid = true;
          amountPaid = 5000;
          paidAt = new Date(`2026-0${month}-10T12:00:00.000Z`);
        }
      } else {
        // Others paid months 1 to 7
        if (month <= 7) {
          isPaid = true;
          amountPaid = 5000;
          paidAt = new Date(`2026-0${month}-02T09:30:00.000Z`);
        }
      }

      await prisma.studentFeePayment.create({
        data: {
          studentId: stu.id,
          academicYear: currentYear,
          monthIndex: month,
          isPaid,
          amountPaid,
          paidAt,
          recordedById: admin.id,
        },
      });
    }
  }

  console.log("✅ 12-Month Fee Ledgers created for all students");

  // 7. Create Feedback / Complaint Tickets
  await prisma.feedbackTicket.create({
    data: {
      parentId: parentIbrahim.id,
      studentId: studentBilal.id,
      category: "ACADEMIC",
      title: "Request for Extra Tajweed Coaching for Bilal",
      message: "Assalamu Alaikum. Bilal is eager to prepare for the upcoming Estate Quran Competition. Could we arrange 30 minutes extra review after Saturday sessions?",
      status: "RESOLVED",
      committeeResponse: "Wa Alaikum Assalam Engr. Ibrahim. Ustadh Ahmad has agreed to provide 30-minute Tajweed clinics every Saturday at 1:00 PM starting this weekend.",
      respondedById: admin.id,
      respondedAt: new Date("2026-08-24T14:00:00.000Z"),
    },
  });

  await prisma.feedbackTicket.create({
    data: {
      parentId: parentFatima.id,
      studentId: studentAisha.id,
      category: "FACILITIES",
      title: "Air Conditioning Maintenance in Rawdah Classroom",
      message: "The afternoon heat on Fridays can be heavy for the early learners in the Rawdah section. Could the facility team check the AC unit?",
      status: "IN_REVIEW",
      committeeResponse: "Jazakallahu Khair for the notice. The Estate maintenance technicians are scheduled to inspect and service the AC unit tomorrow morning.",
      respondedById: committee2.id,
      respondedAt: new Date("2026-08-29T11:20:00.000Z"),
    },
  });

  await prisma.feedbackTicket.create({
    data: {
      parentId: parentMusa.id,
      studentId: studentZayd.id,
      category: "FEES",
      title: "Fee Receipt Verification for Term 2",
      message: "Please kindly confirm receipt of bank transfer for Term 2 Islamic studies materials for Zayd.",
      status: "OPEN",
    },
  });

  console.log("✅ Feedback tickets created");

  // 8. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.fullName,
      userRole: admin.role,
      action: "FEE_STATUS_OVERRIDE",
      entityType: "FEE_PAYMENT",
      entityId: studentBilal.id,
      details: "Alhaji Faruq Al-Mansoor verified August 2026 fee payment for Bilal Ibrahim Abdullahi.",
      ipAddress: "192.168.1.10",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: ustadhAhmad.id,
      userName: ustadhAhmad.fullName,
      userRole: ustadhAhmad.role,
      action: "GRADE_MUTATION",
      entityType: "ACADEMIC_RECORD",
      entityId: studentMaryam.id,
      details: "Ustadh Ahmad Sulaiman entered score 98/100 for Maryam Ibrahim Abdullahi in Juz 29 & 30 Exam.",
      ipAddress: "192.168.1.25",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.fullName,
      userRole: admin.role,
      action: "STUDENT_ENROLLMENT",
      entityType: "STUDENT",
      entityId: studentAisha.id,
      details: "Enrolled Aisha Fatima Garba (VCE/2025/004) into Rawdah (Early Learners).",
      ipAddress: "192.168.1.10",
    },
  });

  console.log("✅ Audit logs created");
  console.log("🎉 Database seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
