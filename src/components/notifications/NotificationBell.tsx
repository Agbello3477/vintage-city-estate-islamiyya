"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CalendarCheck,
  BookOpen,
  Award,
  CreditCard,
  MessageSquareWarning,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
} from "lucide-react";
import {
  fetchNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/actions";
import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  metadata: string | null;
  createdAt: Date | string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load initial notifications and set up polling
  const loadNotifications = async () => {
    try {
      const res = await fetchNotificationsAction({ limit: 15 });
      if (res) {
        setNotifications(res.notifications as any);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 15 seconds for fresh alerts
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      try {
        await markAllNotificationsReadAction();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      } catch {
        toast.error("Failed to mark notifications as read");
      }
    });
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationReadAction(item.id).catch(console.error);
    }

    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    } else {
      router.push("/notifications");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ATTENDANCE":
        return <CalendarCheck className="w-4 h-4 text-sky-600" />;
      case "TAHFIZ":
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case "ACADEMIC":
        return <Award className="w-4 h-4 text-amber-600" />;
      case "FEE":
        return <CreditCard className="w-4 h-4 text-emerald-700" />;
      case "TICKET":
        return <MessageSquareWarning className="w-4 h-4 text-purple-600" />;
      case "ENROLLMENT":
        return <GraduationCap className="w-4 h-4 text-teal-600" />;
      case "BROADCAST":
        return <Megaphone className="w-4 h-4 text-rose-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  const filteredNotifications =
    activeTab === "UNREAD"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-xl transition-all border border-emerald-700/60 focus:outline-none focus:ring-2 focus:ring-amber-400"
        title="Notifications & Activity Alerts"
        aria-label="View notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-amber-300 animate-wiggle" />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-emerald-950 shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[400px] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">Notifications & Alerts</h3>
              {unreadCount > 0 && (
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={isPending}
                  className="text-[10px] bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 hover:text-white px-2 py-1 rounded-lg border border-emerald-600 transition-all font-semibold flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-emerald-300 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5 bg-slate-50/70 text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  activeTab === "ALL"
                    ? "bg-white text-emerald-800 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("UNREAD")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  activeTab === "UNREAD"
                    ? "bg-white text-emerald-800 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>Full History</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeTab === "UNREAD"
                    ? "You are all caught up!"
                    : "Important activity updates will appear here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 sm:p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50/90 ${
                    !item.isRead ? "bg-emerald-50/40" : "bg-white"
                  }`}
                >
                  {/* Icon Box */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      !item.isRead
                        ? "bg-white border-emerald-200 shadow-xs"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs truncate ${
                          !item.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        &bull; {new Date(item.createdAt).toLocaleDateString()}
                      </span>

                      {item.link && (
                        <span className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5">
                          <span>View</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors inline-flex items-center gap-1"
            >
              <span>Go to Notifications Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
