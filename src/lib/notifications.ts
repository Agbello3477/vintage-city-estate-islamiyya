import { db } from "./db";

export type NotificationType =
  | "ATTENDANCE"
  | "TAHFIZ"
  | "ACADEMIC"
  | "FEE"
  | "TICKET"
  | "ENROLLMENT"
  | "BROADCAST"
  | "SYSTEM";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates a single in-app notification for a specified user.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    return await db.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Creates bulk in-app notifications (e.g. for broadcast announcements or class alerts).
 */
export async function createBulkNotifications(
  notifications: Array<CreateNotificationParams>
) {
  if (!notifications.length) return { count: 0 };
  try {
    const data = notifications.map((n) => ({
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link || null,
      metadata: n.metadata ? JSON.stringify(n.metadata) : null,
      isRead: false,
    }));
    return await db.notification.createMany({ data });
  } catch (error) {
    console.error("Failed to create bulk notifications:", error);
    return { count: 0 };
  }
}

/**
 * Automatically resolves the parent linked to a student and sends them a notification.
 */
export async function notifyParentOfStudent(
  studentId: string,
  payload: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: { parentId: true, fullName: true },
    });

    if (!student || !student.parentId) return null;

    return await createNotification({
      userId: student.parentId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      link: payload.link,
      metadata: payload.metadata,
    });
  } catch (error) {
    console.error("Failed to notify parent of student:", error);
    return null;
  }
}

/**
 * Sends a notification to all active Committee / Admin users.
 */
export async function notifyCommittee(payload: {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const committeeUsers = await db.user.findMany({
      where: { role: "COMMITTEE", isActive: true },
      select: { id: true },
    });

    if (!committeeUsers.length) return { count: 0 };

    const notifications: CreateNotificationParams[] = committeeUsers.map((u) => ({
      userId: u.id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      link: payload.link,
      metadata: payload.metadata,
    }));

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error("Failed to notify committee members:", error);
    return { count: 0 };
  }
}

/**
 * Sends a notification to a specific Teacher.
 */
export async function notifyTeacher(
  teacherId: string,
  payload: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    metadata?: Record<string, any>;
  }
) {
  return await createNotification({
    userId: teacherId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    link: payload.link,
    metadata: payload.metadata,
  });
}

/**
 * Broadcasts an announcement notification to target roles ("ALL", "COMMITTEE", "TEACHER", "PARENT").
 */
export async function notifyAllUsers(
  targetRole: "ALL" | "COMMITTEE" | "TEACHER" | "PARENT",
  payload: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    const whereClause: any = { isActive: true };
    if (targetRole !== "ALL") {
      whereClause.role = targetRole;
    }

    const recipients = await db.user.findMany({
      where: whereClause,
      select: { id: true, role: true },
    });

    if (!recipients.length) return { count: 0 };

    const notifications: CreateNotificationParams[] = recipients.map((u) => {
      // Determine role-based link if not explicitly given
      let link = payload.link;
      if (!link) {
        if (u.role === "PARENT") link = "/parent";
        else if (u.role === "TEACHER") link = "/teacher";
        else link = "/committee";
      }

      return {
        userId: u.id,
        title: payload.title,
        message: payload.message,
        type: payload.type || "BROADCAST",
        link,
        metadata: payload.metadata,
      };
    });

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error("Failed to broadcast notifications:", error);
    return { count: 0 };
  }
}

/**
 * Retrieves notifications for a specific user.
 */
export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; onlyUnread?: boolean; type?: string }
) {
  try {
    const where: any = { userId };
    if (options?.onlyUnread) {
      where.isRead = false;
    }
    if (options?.type && options.type !== "ALL") {
      where.type = options.type;
    }

    return await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
    });
  } catch (error) {
    console.error("Failed to fetch user notifications:", error);
    return [];
  }
}

/**
 * Gets count of unread notifications for a user.
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    return await db.notification.count({
      where: { userId, isRead: false },
    });
  } catch (error) {
    console.error("Failed to count unread notifications:", error);
    return 0;
  }
}
