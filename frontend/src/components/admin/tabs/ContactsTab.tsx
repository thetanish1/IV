import React, { useState, useEffect, useCallback } from "react";
import { Mail, Trash2, Send, RefreshCw, Loader2 } from "lucide-react";
import { ContactQueryItem } from "@/types";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";
import StatusBadge from "../common/StatusBadge";
import Pagination from "../common/Pagination";
import AdminSearchBar from "../common/AdminSearchBar";
import ContactReplyModal from "./ContactReplyModal";

interface ContactsTabProps {
  onRefreshStats: () => void;
}

export default function ContactsTab({ onRefreshStats }: ContactsTabProps) {
  const [contactsList, setContactsList] = useState<ContactQueryItem[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactFilter, setContactFilter] = useState("all");
  const [contactSearch, setContactSearch] = useState("");
  const [contactPage, setContactPage] = useState(1);
  const [contactTotalPages, setContactTotalPages] = useState(1);
  const [contactTotalCount, setContactTotalCount] = useState(0);

  const [replyingContact, setReplyingContact] = useState<ContactQueryItem | null>(null);
  const [contactReplyText, setContactReplyText] = useState("");
  const [sendingContactReply, setSendingContactReply] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<number | null>(null);
  const [deletingAllContacts, setDeletingAllContacts] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const params = new URLSearchParams();
      if (contactFilter !== "all") params.set("status", contactFilter);
      if (contactSearch.trim()) params.set("q", contactSearch.trim());
      params.set("page", String(contactPage));
      params.set("limit", "15");

      const data = await apiRequest<{
        total: number;
        page: number;
        limit: number;
        total_pages: number;
        items: ContactQueryItem[];
      }>(`/admin/contacts?${params.toString()}`);

      if (data && Array.isArray(data.items)) {
        setContactsList(data.items);
        setContactTotalPages(data.total_pages || 1);
        setContactTotalCount(data.total || 0);
      } else {
        setContactsList([]);
      }
    } catch (err) {
      console.error("Failed to load contact queries", err);
      setContactsList([]);
    } finally {
      setLoadingContacts(false);
    }
  }, [contactFilter, contactSearch, contactPage]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleUpdateContactStatus = async (id: number, newStatus: string) => {
    try {
      await apiRequest(`/admin/contacts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setContactsList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      onRefreshStats();
    } catch (err) {
      console.error("Failed to update contact status", err);
    }
  };

  const handleSendContactReply = async () => {
    if (!replyingContact || !contactReplyText.trim()) return;
    setSendingContactReply(true);
    try {
      await apiRequest(`/admin/contacts/${replyingContact.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ admin_reply: contactReplyText.trim() }),
      });
      setContactsList((prev) =>
        prev.map((c) =>
          c.id === replyingContact.id
            ? {
                ...c,
                status: "replied",
                admin_reply: contactReplyText.trim(),
                replied_at: new Date().toISOString(),
              }
            : c
        )
      );
      setReplyingContact(null);
      setContactReplyText("");
      onRefreshStats();
    } catch (err) {
      console.error("Failed to send contact reply", err);
      alert("Failed to send reply email. Please check your network connection.");
    } finally {
      setSendingContactReply(false);
    }
  };

  const handleDeleteContact = async (id: number, senderName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the inquiry from "${senderName}"?`)) return;
    setDeletingContactId(id);
    try {
      await apiRequest(`/admin/contacts/${id}`, { method: "DELETE" });
      setContactsList((prev) => prev.filter((c) => c.id !== id));
      onRefreshStats();
    } catch (err) {
      console.error("Failed to delete contact inquiry", err);
    } finally {
      setDeletingContactId(null);
    }
  };

  const handleDeleteAllContacts = async () => {
    if (!window.confirm("⚠️ DANGER: Permanently delete ALL contact inquiries from database?")) return;
    setDeletingAllContacts(true);
    try {
      await apiRequest("/admin/contacts/all", { method: "DELETE" });
      setContactsList([]);
      setContactTotalCount(0);
      onRefreshStats();
    } catch (err) {
      console.error("Failed to delete all contact queries", err);
    } finally {
      setDeletingAllContacts(false);
    }
  };

  return (
    <FadeIn delay={0.2} direction="up">
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Contact Inquiries & Candidate Queries
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Direct inquiries sent via the public contact page. Reply via email and resolve student queries.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AdminSearchBar
              placeholder="Search contact queries..."
              value={contactSearch}
              onChange={(val) => {
                setContactSearch(val);
                setContactPage(1);
              }}
              accentColor="blue"
            />
            <select
              value={contactFilter}
              onChange={(e) => {
                setContactFilter(e.target.value);
                setContactPage(1);
              }}
              className="bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors cursor-pointer font-medium"
            >
              <option value="all">All Inquiries</option>
              <option value="new">New / Unread</option>
              <option value="read">Read / In-Progress</option>
              <option value="replied">Replied / Resolved</option>
            </select>
            <button
              type="button"
              onClick={fetchContacts}
              className="p-2 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A30] transition shadow-sm"
              title="Refresh Contact Queries"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {contactsList.length > 0 && (
              <button
                type="button"
                disabled={deletingAllContacts}
                onClick={handleDeleteAllContacts}
                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-950/60 dark:border-red-800/70 dark:text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                title="Permanently delete all contact queries"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete All
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loadingContacts ? (
            <div className="p-12 text-center border border-gray-200 dark:border-[#27272A] rounded-xl bg-white dark:bg-[#18181B] shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
            </div>
          ) : contactsList.length === 0 ? (
            <div className="p-12 text-center border border-gray-200 dark:border-[#27272A] rounded-xl bg-white dark:bg-[#18181B] shadow-sm text-gray-500 dark:text-gray-400 text-sm">
              No contact inquiries found.
            </div>
          ) : (
            contactsList.map((c) => (
              <div
                key={c.id}
                className={`p-5 rounded-xl border transition-all ${
                  c.status === "new"
                    ? "bg-blue-50/40 border-blue-200 dark:bg-blue-950/20 dark:border-blue-500/40 shadow-sm"
                    : c.status === "replied"
                    ? "bg-white dark:bg-[#18181B] border-emerald-200 dark:border-emerald-500/30"
                    : "bg-white border-gray-200 shadow-sm dark:bg-[#18181B] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={c.status} type="contact" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{c.subject}</h3>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>From: <strong className="text-gray-800 dark:text-gray-200">{c.name}</strong></span>
                      <span>•</span>
                      <a
                        href={`mailto:${c.email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        {c.email}
                      </a>
                      <span>•</span>
                      <span className="text-gray-400 dark:text-gray-500">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingContact(c);
                        setContactReplyText(c.admin_reply || "");
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {c.admin_reply ? "Edit Reply / Re-send" : "Reply to User"}
                    </button>

                    {c.status === "new" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateContactStatus(c.id, "read")}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-[#222226] dark:hover:bg-[#2A2A30] dark:text-gray-300 border border-gray-300 dark:border-[#2E2E33] rounded-lg text-xs font-medium transition whitespace-nowrap shadow-sm"
                        title="Mark inquiry as read"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={deletingContactId === c.id}
                      onClick={() => handleDeleteContact(c.id, c.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inquiry Message Body */}
                <div className="mt-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-[#1F1F23] p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                  {c.message}
                </div>

                {/* Official Admin Reply Snippet if answered */}
                {c.admin_reply && (
                  <div className="mt-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                      <span>✓ Official Reply Sent ({c.replied_by || "Admin Support"})</span>
                      {c.replied_at && (
                        <span className="text-gray-500 dark:text-gray-400 font-normal">
                          {new Date(c.replied_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                      {c.admin_reply}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <Pagination
          currentPage={contactPage}
          totalPages={contactTotalPages}
          totalItems={contactTotalCount}
          itemName="inquiries"
          onPageChange={(p) => setContactPage(p)}
        />

        {/* Contact Reply Modal */}
        <ContactReplyModal
          contact={replyingContact}
          replyText={contactReplyText}
          setReplyText={setContactReplyText}
          sendingReply={sendingContactReply}
          onClose={() => setReplyingContact(null)}
          onSendReply={handleSendContactReply}
        />
      </div>
    </FadeIn>
  );
}
