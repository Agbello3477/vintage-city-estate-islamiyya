"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  BookOpen,
  Award,
  CreditCard,
  MessageSquareWarning,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { BroadcastModal } from "@/components/notifications/BroadcastModal";
import { SessionUser } from "@/types";
import { toast } from "sonner";

export interface ClientNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  metadata: string | null;
  createdAt: string;
}

interface NotificationsClientProps {
  initialNotifications: ClientNotification[];
  user: SessionUser;
}

export function NotificationsClient({
  initialNotifications,
  user,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<ClientNotification[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filtered list
  const filteredList = notifications.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === "ALL" || n.type === selectedType;
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "UNREAD" && !n.isRead) ||
      (statusFilter === "READ" && n.isRead);

    return matchSearch && matchType && matchStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, statusFilter]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      try {
        await markNotificationReadAction(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      } catch {
        toast.error("Failed to mark notification as read");
      }
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      try {
        await markAllNotificationsReadAction();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      } catch {
        toast.error("Failed to mark notifications as read");
      }
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await deleteNotificationAction(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification deleted");
      } catch {
        toast.error("Failed to delete notification");
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ATTENDANCE":
        return <CalendarCheck className="w-5 h-5 text-sky-600" />;
      case "TAHFIZ":
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case "ACADEMIC":
        return <Award className="w-5 h-5 text-amber-600" />;
      case "FEE":
        return <CreditCard className="w-5 h-5 text-emerald-700" />;
      case "TICKET":
        return <MessageSquareWarning className="w-5 h-5 text-purple-600" />;
      case "ENROLLMENT":
        return <GraduationCap className="w-5 h-5 text-teal-600" />;
      case "BROADCAST":
        return <Megaphone className="w-5 h-5 text-rose-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Notifications & Activity Center</h2>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-200">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time activity alerts, academic updates, attendance logs, and Islamiyya announcements
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              <CheckCheck className="w-4 h-4 text-emerald-700" />
              <span>Mark all as read</span>
            </Button>
          )}

          {user.role === "COMMITTEE" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsBroadcastOpen(true)}
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Announcement</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="ATTENDANCE">Attendance Logs</option>
            <option value="TAHFIZ">Tahfiz & Quran</option>
            <option value="ACADEMIC">Academic Grades</option>
            <option value="FEE">Fee Status</option>
            <option value="TICKET">Feedback Tickets</option>
            <option value="ENROLLMENT">Enrollments</option>
            <option value="BROADCAST">Announcements</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="UNREAD">Unread Only</option>
            <option value="READ">Read Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredList.length}</strong> of {notifications.length} alerts
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
            <h4 className="text-sm font-bold text-slate-700">No notifications found</h4>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || selectedType !== "ALL" || statusFilter !== "ALL"
                ? "Try adjusting your search or category filters."
                : "You do not have any notification records yet."}
            </p>
          </div>
        ) : (
          paginatedList.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) handleMarkAsRead(item.id);
                if (item.link) router.push(item.link);
              }}
              className={`p-4 sm:p-5 transition-all flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 ${
                !item.isRead ? "bg-emerald-50/30" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    !item.isRead
                      ? "bg-white border-emerald-200 shadow-xs"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  {getTypeIcon(item.type)}
                </div>

                {/* Details */}
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm ${
                        !item.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                      }`}
                    >
                      {item.title}
                    </h3>
                    {!item.isRead && (
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                      {item.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      &bull; {new Date(item.createdAt).toLocaleDateString()}
                    </span>

                    {item.link && (
                      <span className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
                        <span>Go to section</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item.id)}
                    title="Mark as read"
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  title="Delete alert"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredList.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}

      {/* Broadcast Modal for Committee */}
      {user.role === "COMMITTEE" && (
        <BroadcastModal
          isOpen={isBroadcastOpen}
          onClose={() => setIsBroadcastOpen(false)}
        />
      )}
    </div>
  );
}
