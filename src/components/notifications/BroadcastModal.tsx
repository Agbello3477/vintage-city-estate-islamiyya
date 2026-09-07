"use client";

import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Megaphone, Users, Send, ShieldAlert, Sparkles } from "lucide-react";
import { broadcastAnnouncementAction } from "@/lib/actions";
import { toast } from "sonner";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BroadcastModal({ isOpen, onClose }: BroadcastModalProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState<"ALL" | "PARENT" | "TEACHER" | "COMMITTEE">("ALL");
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and announcement message");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);
    formData.append("targetRole", targetRole);
    if (link.trim()) formData.append("link", link);

    startTransition(async () => {
      try {
        const res = await broadcastAnnouncementAction(formData);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success(
            `📢 Announcement successfully broadcasted to ${res?.count || "all"} user(s)!`
          );
          setTitle("");
          setMessage("");
          setLink("");
          setTargetRole("ALL");
          onClose();
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to broadcast announcement");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Estate & Islamiyya Announcement"
      subtitle="Send high-priority in-app alerts directly to Parents, Teachers, or the whole Islamiyya community"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Role Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Target Audience</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { role: "ALL", label: "Everyone", desc: "All Users" },
              { role: "PARENT", label: "Parents Only", desc: "All Registered Parents" },
              { role: "TEACHER", label: "Teachers Only", desc: "All Ustadhs" },
              { role: "COMMITTEE", label: "Committee", desc: "Board Members" },
            ].map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => setTargetRole(item.role as any)}
                className={`p-2 rounded-xl text-left border text-xs transition-all ${
                  targetRole === item.role
                    ? "bg-emerald-50 text-emerald-900 border-emerald-400 ring-1 ring-emerald-500 font-bold"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="block font-bold">{item.label}</span>
                <span className="text-[10px] text-slate-400">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Announcement Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Announcement Title
          </label>
          <input
            type="text"
            placeholder="e.g. End-of-Term Examination Schedule / Public Holiday Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Announcement Message */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Announcement Message
          </label>
          <textarea
            rows={4}
            placeholder="Write the full announcement details here. It will immediately show in recipients' notification bells and activity feeds..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>

        {/* Optional Action Link */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Action Link (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. /parent/academics or /parent/fees"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Leave blank to use the default dashboard link.
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={isPending}>
            <Send className="w-4 h-4" />
            <span>Send Broadcast</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
