export type Role = "COMMITTEE" | "TEACHER" | "PARENT";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  COMMITTEE: 3,
  TEACHER: 2,
  PARENT: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  COMMITTEE: "Super Admin (Committee)",
  TEACHER: "Islamiyya Ustadh / Teacher",
  PARENT: "Student Parent / Guardian",
};
