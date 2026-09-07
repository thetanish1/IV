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
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" /> Contact Inquiries & Candidate Queries
            </h2>
            <p className="text-xs text-ink-400 mt-0.5">
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
              accentColor="cyan"
            />
            <select
              value={contactFilter}
              onChange={(e) => {
                setContactFilter(e.target.value);
                setContactPage(1);
              }}
              className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="all">All Inquiries</option>
              <option value="new">New / Unread</option>
              <option value="read">Read / In-Progress</option>
              <option value="replied">Replied / Resolved</option>
            </select>
            <button
              type="button"
              onClick={fetchContacts}
              className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition"
              title="Refresh Contact Queries"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {contactsList.length > 0 && (
              <button
                type="button"
                disabled={deletingAllContacts}
                onClick={handleDeleteAllContacts}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                title="Permanently delete all contact queries"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete All
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loadingContacts ? (
            <div className="p-12 text-center border border-ink-800 rounded-xl bg-ink-950/30">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
            </div>
          ) : contactsList.length === 0 ? (
            <div className="p-12 text-center border border-ink-800 rounded-xl bg-ink-950/30 text-ink-500 text-sm">
              No contact inquiries found.
            </div>
          ) : (
            contactsList.map((c) => (
              <div
                key={c.id}
                className={`p-5 rounded-xl border transition-all ${
                  c.status === "new"
                    ? "bg-cyan-950/10 border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                    : c.status === "replied"
                    ? "bg-emerald-950/10 border-emerald-500/30"
                    : "bg-ink-950/30 border-ink-800 hover:border-ink-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-ink-800/60">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={c.status} type="contact" />
                      <h3 className="text-base font-bold text-white">{c.subject}</h3>
                    </div>
                    <div className="text-xs text-ink-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>From: <strong className="text-white">{c.name}</strong></span>
                      <span>•</span>
                      <a
                        href={`mailto:${c.email}`}
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        {c.email}
                      </a>
                      <span>•</span>
                      <span className="text-ink-500">
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
                      className="px-3.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {c.admin_reply ? "Edit Reply / Re-send" : "Reply to User"}
                    </button>

                    {c.status === "new" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateContactStatus(c.id, "read")}
                        className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-ink-300 border border-ink-700 rounded-lg text-xs font-medium transition whitespace-nowrap"
                        title="Mark inquiry as read"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={deletingContactId === c.id}
                      onClick={() => handleDeleteContact(c.id, c.name)}
                      className="p-1.5 text-ink-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inquiry Message Body */}
                <div className="mt-3 text-sm text-ink-200 whitespace-pre-wrap leading-relaxed bg-ink-900/40 p-4 rounded-xl border border-ink-800/80">
                  {c.message}
                </div>

                {/* Official Admin Reply Snippet if answered */}
                {c.admin_reply && (
                  <div className="mt-3 p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>✓ Official Reply Sent ({c.replied_by || "Admin Support"})</span>
                      {c.replied_at && (
                        <span className="text-ink-500 font-normal">
                          {new Date(c.replied_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-200 whitespace-pre-wrap leading-relaxed">
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
