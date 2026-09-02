"use client";

import React, { useState, useTransition } from "react";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { submitFeedbackTicketAction, respondTicketAction } from "@/lib/actions";
import {
  MessageSquarePlus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Building,
  Heart,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

export interface TicketItem {
  id: string;
  category: "ACADEMIC" | "FACILITIES" | "WELFARE" | "FEES";
  title: string;
  message: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  committeeResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  parent: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
  student?: {
    id: string;
    fullName: string;
    admissionNumber: string;
  } | null;
}

interface TicketManagementProps {
  tickets: TicketItem[];
  userRole: "COMMITTEE" | "PARENT" | "TEACHER";
  childrenOptions?: Array<{ id: string; fullName: string; admissionNumber: string }>;
}

export function TicketManagement({
  tickets,
  userRole,
  childrenOptions = [],
}: TicketManagementProps) {
  const [isPending, startTransition] = useTransition();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [responseModal, setResponseModal] = useState<{
    isOpen: boolean;
    ticket?: TicketItem;
  }>({ isOpen: false });

  // Create Form State
  const [createCategory, setCreateCategory] = useState<"ACADEMIC" | "FACILITIES" | "WELFARE" | "FEES">("ACADEMIC");
  const [createStudentId, setCreateStudentId] = useState<string>("");
  const [createTitle, setCreateTitle] = useState("");
  const [createMessage, setCreateMessage] = useState("");

  // Respond Form State
  const [respondStatus, setRespondStatus] = useState<"OPEN" | "IN_REVIEW" | "RESOLVED">("RESOLVED");
  const [respondMessage, setRespondMessage] = useState("");

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("category", createCategory);
    if (createStudentId) formData.append("studentId", createStudentId);
    formData.append("title", createTitle);
    formData.append("message", createMessage);

    startTransition(async () => {
      try {
        const res = await submitFeedbackTicketAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Feedback ticket submitted to Islamiyya Committee!");
          setCreateTitle("");
          setCreateMessage("");
          setIsCreateOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to submit ticket");
      }
    });
  };

  const handleRespondSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseModal.ticket) return;

    const formData = new FormData();
    formData.append("ticketId", responseModal.ticket.id);
    formData.append("status", respondStatus);
    formData.append("committeeResponse", respondMessage);

    startTransition(async () => {
      try {
        const res = await respondTicketAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Official committee response sent and recorded!");
          setRespondMessage("");
          setResponseModal({ isOpen: false });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update response");
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ACADEMIC":
        return <BookOpen className="w-3.5 h-3.5 text-emerald-700" />;
      case "FACILITIES":
        return <Building className="w-3.5 h-3.5 text-amber-700" />;
      case "WELFARE":
        return <Heart className="w-3.5 h-3.5 text-rose-700" />;
      case "FEES":
        return <DollarSign className="w-3.5 h-3.5 text-sky-700" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="danger">Unread / Open</Badge>;
      case "IN_REVIEW":
        return <Badge variant="warning">In Review</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {["ALL", "OPEN", "IN_REVIEW", "RESOLVED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === status
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {status === "ALL" ? "All Tickets" : status.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="FACILITIES">Facilities</option>
            <option value="WELFARE">Welfare</option>
            <option value="FEES">Fees</option>
          </select>
        </div>

        {userRole === "PARENT" && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="primary"
            size="sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Submit New Ticket</span>
          </Button>
        )}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No feedback or complaint tickets found matching the selected filters.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-emerald-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {getCategoryIcon(ticket.category)}
                    <span>{ticket.category}</span>
                  </span>
                  {getStatusBadge(ticket.status)}
                  {ticket.student && (
                    <span className="text-xs text-slate-500 font-medium">
                      &bull; Student: <strong className="text-slate-700">{ticket.student.fullName}</strong>
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  Submitted: {formatDate(ticket.createdAt)} ({ticket.parent.fullName})
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-base">{ticket.title}</h4>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                  {ticket.message}
                </p>
              </div>

              {/* Committee Response Section */}
              {ticket.committeeResponse ? (
                <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Official Islamiyya Committee Response</span>
                    </span>
                    {ticket.respondedAt && (
                      <span className="text-[11px] text-emerald-700/80 font-normal">
                        {formatDate(ticket.respondedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{ticket.committeeResponse}</p>
                </div>
              ) : userRole === "COMMITTEE" ? (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setRespondStatus(ticket.status === "OPEN" ? "IN_REVIEW" : ticket.status);
                      setResponseModal({ isOpen: true, ticket });
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Respond / Update Triage</span>
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-amber-700 italic flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting review and resolution by the Islamiyya Committee.</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Parent Create Ticket Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Submit Feedback / Complaint Ticket"
        subtitle="Your ticket will be routed directly to the Islamiyya Committee"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={createCategory}
                onChange={(e) => setCreateCategory(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ACADEMIC">Academic / Memorization</option>
                <option value="FACILITIES">Facilities & Classroom</option>
                <option value="WELFARE">Student Welfare</option>
                <option value="FEES">Fees & Payments</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Related Child (Optional)
              </label>
              <select
                value={createStudentId}
                onChange={(e) => setCreateStudentId(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">General / Not child specific</option>
                {childrenOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.admissionNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ticket Subject / Title
            </label>
            <input
              type="text"
              placeholder="e.g., Request for additional Tahfiz review session"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Message
            </label>
            <textarea
              rows={4}
              placeholder="Please provide specific details so the committee can address your inquiry promptly..."
              value={createMessage}
              onChange={(e) => setCreateMessage(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Committee Response Modal */}
      <Modal
        isOpen={responseModal.isOpen}
        onClose={() => setResponseModal({ isOpen: false })}
        title="Triage & Respond to Ticket"
        subtitle={`Parent: ${responseModal.ticket?.parent.fullName} &bull; [${responseModal.ticket?.category}]`}
        maxWidth="lg"
      >
        <form onSubmit={handleRespondSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">{responseModal.ticket?.title}</p>
            <p className="text-slate-600">{responseModal.ticket?.message}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Update Status
            </label>
            <select
              value={respondStatus}
              onChange={(e) => setRespondStatus(e.target.value as any)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="IN_REVIEW">In Review (Under investigation)</option>
              <option value="RESOLVED">Resolved (Official resolution provided)</option>
              <option value="OPEN">Reopen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Committee Response
            </label>
            <textarea
              rows={4}
              placeholder="Type the committee's official feedback/action plan for the parent..."
              value={respondMessage}
              onChange={(e) => setRespondMessage(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResponseModal({ isOpen: false })}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Official Response</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
