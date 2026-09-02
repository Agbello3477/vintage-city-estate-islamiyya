import { db } from "./db";
import { headers } from "next/headers";
import { getSession } from "./auth";

export interface CreateAuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  userId?: string;
  userName?: string;
  userRole?: string;
}

export async function recordAuditLog(params: CreateAuditLogParams) {
  try {
    let { userId, userName, userRole } = params;

    if (!userId) {
      const session = await getSession();
      if (session) {
        userId = session.id;
        userName = session.fullName;
        userRole = session.role;
      }
    }

    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

    return await db.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || "System / Guest",
        userRole: userRole || "ANONYMOUS",
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: params.details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
    return null;
  }
}
