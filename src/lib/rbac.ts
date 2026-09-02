import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { Role, SessionUser } from "@/types";

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    if (session.role === "COMMITTEE") redirect("/committee");
    if (session.role === "TEACHER") redirect("/teacher");
    if (session.role === "PARENT") redirect("/parent");
    redirect("/login");
  }
  return session;
}

export function canManageClass(user: SessionUser, classTeacherId?: string | null): boolean {
  if (user.role === "COMMITTEE") return true;
  if (user.role === "TEACHER" && classTeacherId === user.id) return true;
  return false;
}

export function canViewStudent(user: SessionUser, studentParentId: string, classTeacherId?: string | null): boolean {
  if (user.role === "COMMITTEE") return true;
  if (user.role === "TEACHER" && classTeacherId === user.id) return true;
  if (user.role === "PARENT" && studentParentId === user.id) return true;
  return false;
}
