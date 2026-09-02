# 🕌 Vintage City Estate Islamiyya Management Portal (VCE-IMP)

A secure, scalable, role-based School Management & Parent Portal for **Vintage City Estate Islamiyya**. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, and JWT authentication with HTTP-Only cookies, token revocation, sliding-window rate limiting, and immutable audit logs.

---

## 🌟 Key Features & Modules

### 1. Role-Based Access Control (RBAC) & Multi-Role Dashboards
- **Committee (Super Admin):** Executive metrics, User & Ustadh provisioning, Class curriculum assignment, Student admissions, 12-Month Fee Ledger override & financial audit, School-wide attendance audit, Academic master gradebook, Parent complaint triage, and Immutable system audit trail.
- **Teacher (Islamiyya Ustadh):** Assigned classes view, Dynamic batch attendance with 1-click Check-in/Check-out and live session clock, Tahfiz (Quran memorization) & exam grading, and Class fee verification.
- **Parent Portal:** Enrolled children summary, Live daily session timestamps & attendance rate, 12-Month Fee status (Red Due / Green Paid pills), Academic growth charts & printable/exportable official PDF Term Progress Report Card, and Direct feedback/complaint ticketing with category tracking.

### 2. Dynamic Attendance Module (Schedule Enforcement)
- **Schedule Presets:**
  - *Thursday & Friday:* 4:00 PM – 6:00 PM (16:00 – 18:00)
  - *Saturday & Sunday:* 8:30 AM – 1:00 PM (08:30 – 13:00)
- **Teacher Actions:** 1-Click "Batch Check-In All", "Batch Check-Out All", status toggles (*Present, Late, Absent, Excused*), and custom remarks.
- **Parent Transparency:** Real-time visibility into exact check-in/out timestamps, attendance percentage, and missed session alerts.

### 3. 12-Month Fee Ledger System
- **Pill Grid:** Visual 12-month matrix from Month 1 to Month 12.
- **Visual Status UI:**
  - *Unpaid / Due:* Bold Red pill (`bg-rose-50 text-rose-700 border-rose-200`).
  - *Paid:* Crisp Green badge (`bg-emerald-50 text-emerald-700 border-emerald-200`) with payment timestamp.
- **Role Permissions:** Committee & Teachers can toggle fee status with custom amount and audit logging.

### 4. Performance & Tahfiz Grade Tracking
- **Subjects:** Memorization (Tahfiz/Quran - Surah, Ayah range, Tajweed & Makharij), Hadith, Fiqh, Arabic Language, General Islamiyya.
- **Visual Analytics:** Interactive Recharts subject breakdown and Islamic competency radar charts.
- **Exportable PDF Report Card:** Official Vintage City Estate Islamiyya Term Progress Report Card with school crest, student metadata, subject ledger, GPA/Percentage, attendance stats, and committee seal.

### 5. Parent-Committee Communication Channel
- **Categories:** Academic, Facilities, Welfare, Fees.
- **Triage Workflow:** Filter by *Open/Unread*, *In Review*, and *Resolved* with official committee resolution replies.

### 6. Security & International Best Practices
- **Password Hashing:** `bcryptjs` with salt rounds.
- **Session Management:** HS256 JWT in HTTP-Only, SameSite=Lax/Strict cookies with token revocation table.
- **Sliding-Window Rate Limiting:** 5 attempts per 15-minute sliding window on authentication and API routes.
- **Data Validation:** Strict Zod schema validation on all inputs.
- **Audit Logging:** Immutable audit records for every sensitive action (grade modifications, fee status overrides, student enrollments, user mutations).

---

## 🔑 Demo Personas & Credentials

For instant evaluation, the login page features a **1-Click Demo Persona Switcher**:

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Alhaji Faruq Al-Mansoor** | `admin@vintagecity.edu` | `Admin@12345` | Super Admin (Committee) |
| **Dr. Amina Belgore** | `committee2@vintagecity.edu` | `Admin@12345` | Super Admin (Committee) |
| **Ustadh Ahmad Sulaiman** | `ustadh.ahmad@vintagecity.edu` | `Teacher@12345` | Islamiyya Ustadh (Teacher) |
| **Ustadh Usman Dan Fodio** | `ustadh.usman@vintagecity.edu` | `Teacher@12345` | Islamiyya Ustadh (Teacher) |
| **Muallima Zainab Bello** | `muallima.zainab@vintagecity.edu` | `Teacher@12345` | Islamiyya Ustadh (Teacher) |
| **Engr. Ibrahim Abdullahi** | `parent.ibrahim@gmail.com` | `Parent@12345` | Parent / Guardian |
| **Hajiya Fatima Garba** | `parent.fatima@gmail.com` | `Parent@12345` | Parent / Guardian |
| **Mallam Musa Sani** | `parent.musa@gmail.com` | `Parent@12345` | Parent / Guardian |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Run Verification Suite
```bash
npx tsx test-e2e.ts
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) to view the portal.
