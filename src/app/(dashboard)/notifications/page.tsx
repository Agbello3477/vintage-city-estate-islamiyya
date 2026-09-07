import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { NotificationsClient, ClientNotification } from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const notifications = await db.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const formatted: ClientNotification[] = notifications.map((n) => ({
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    link: n.link,
    isRead: n.isRead,
    metadata: n.metadata,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <NotificationsClient
      initialNotifications={formatted}
      user={session}
    />
  );
}
