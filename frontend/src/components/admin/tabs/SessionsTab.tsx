"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  Clock,
  Video,
  Users,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Sparkles,
  Search,
  Download,
  X,
  AlertCircle,
  Eye,
  Layers,
  ChevronRight,
} from "lucide-react";
import { apiRequest, getImageUrl } from "@/lib/api-client";
import { AdminSearchBar, StatusBadge, Pagination } from "../common";

interface LiveSessionItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  key_takeaways?: string[];
  session_date: string;
  session_time: string;
  duration: string;
  is_free: boolean;
  price_inr: number;
  thumbnail_url?: string;
  instructor_name?: string;
  instructor_role?: string;
  instructor_avatar?: string;
  meeting_platform?: string;
  meeting_link?: string;
  max_seats?: number;
  category?: string;
  tags?: string[];
  is_published: boolean;
  booking_count?: number;
  created_at: string;
}

interface SessionBookingItem {
  id: number;
  session_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  college_or_company?: string;
  status: string;
  ticket_code: string;
  payment_id?: string;
  amount_paid: number;
  created_at: string;
  session_title?: string;
  session_date?: string;
  session_time?: string;
  duration?: string;
  meeting_platform?: string;
}

export default function SessionsTab() {
  const [sessions, setSessions] = useState<LiveSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSessionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Attendees modal
  const [selectedSessionForBookings, setSelectedSessionForBookings] = useState<LiveSessionItem | null>(null);
  const [bookings, setBookings] = useState<SessionBookingItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTakeaways, setFormTakeaways] = useState<string[]>(["", ""]);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formDuration, setFormDuration] = useState("90 Mins");
  const [formIsFree, setFormIsFree] = useState(true);
  const [formPrice, setFormPrice] = useState(0);
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formInstructorName, setFormInstructorName] = useState("Suraj Kumar");
  const [formInstructorRole, setFormInstructorRole] = useState("Senior Technical Mentor");
  const [formMeetingPlatform, setFormMeetingPlatform] = useState("Google Meet");
  const [formMeetingLink, setFormMeetingLink] = useState("");
  const [formMaxSeats, setFormMaxSeats] = useState(150);
  const [formCategory, setFormCategory] = useState("Technical Workshop");
  const [formTags, setFormTags] = useState("GitHub, DevOps, CI/CD");
  const [formIsPublished, setFormIsPublished] = useState(true);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<LiveSessionItem[]>("/sessions/admin/all");
      setSessions(data || []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const openCreateModal = () => {
    setEditingSession(null);
    setFormTitle("");
    setFormSlug("");
    setFormDescription("");
    setFormTakeaways(["Hands-on practical implementation", "Industry best practices & architecture"]);
    setFormDate("Saturday, 25 Oct 2026");
    setFormTime("06:00 PM IST");
    setFormDuration("90 Mins");
    setFormIsFree(true);
    setFormPrice(0);
    setFormThumbnail("https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=1000&auto=format&fit=crop");
    setFormInstructorName("Suraj Kumar");
    setFormInstructorRole("Senior Technical Mentor");
    setFormMeetingPlatform("Google Meet");
    setFormMeetingLink("https://meet.google.com/ivt-live");
    setFormMaxSeats(150);
    setFormCategory("Technical Workshop");
    setFormTags("GitHub, Docker, Web Development");
    setFormIsPublished(true);
    setShowCreateModal(true);
  };

  const openEditModal = (session: LiveSessionItem) => {
    setEditingSession(session);
    setFormTitle(session.title);
    setFormSlug(session.slug);
    setFormDescription(session.description);
    setFormTakeaways(session.key_takeaways && session.key_takeaways.length > 0 ? session.key_takeaways : [""]);
    setFormDate(session.session_date);
    setFormTime(session.session_time);
    setFormDuration(session.duration);
    setFormIsFree(session.is_free);
    setFormPrice(session.price_inr || 0);
    setFormThumbnail(session.thumbnail_url || "");
    setFormInstructorName(session.instructor_name || "InternVision Team");
    setFormInstructorRole(session.instructor_role || "Senior Mentor");
    setFormMeetingPlatform(session.meeting_platform || "Google Meet");
    setFormMeetingLink(session.meeting_link || "");
    setFormMaxSeats(session.max_seats || 150);
    setFormCategory(session.category || "Technical Workshop");
    setFormTags(session.tags ? session.tags.join(", ") : "");
    setFormIsPublished(session.is_published);
    setShowCreateModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");
      const res = await fetch(`${apiBase}/sessions/upload-thumbnail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image file");
      }

      const data = await res.json();
      if (data.url) {
        setFormThumbnail(data.url);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload thumbnail");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate.trim() || !formTime.trim() || !formDuration.trim()) {
      alert("Please fill in Session Title, Date, Time, and Duration.");
      return;
    }

    try {
      setIsSubmitting(true);
      const tagsArray = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const takeawaysClean = formTakeaways.filter((t) => t.trim().length > 0);

      const payload = {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim(),
        key_takeaways: takeawaysClean,
        session_date: formDate.trim(),
        session_time: formTime.trim(),
        duration: formDuration.trim(),
        is_free: formIsFree,
        price_inr: formIsFree ? 0 : Number(formPrice),
        thumbnail_url: formThumbnail.trim() || undefined,
        instructor_name: formInstructorName.trim(),
        instructor_role: formInstructorRole.trim(),
        meeting_platform: formMeetingPlatform.trim(),
        meeting_link: formMeetingLink.trim() || undefined,
        max_seats: Number(formMaxSeats),
        category: formCategory.trim(),
        tags: tagsArray,
        is_published: formIsPublished,
      };

      if (editingSession) {
        await apiRequest(`/sessions/${editingSession.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast("Session updated successfully!");
      } else {
        await apiRequest(`/sessions`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast("Session created and published successfully!");
      }

      setShowCreateModal(false);
      fetchSessions();
    } catch (err: any) {
      alert(err.message || "Failed to save session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (session: LiveSessionItem) => {
    if (!confirm(`Are you sure you want to delete session "${session.title}" and all its bookings?`)) {
      return;
    }
    try {
      await apiRequest(`/sessions/${session.id}`, { method: "DELETE" });
      showToast(`Session "${session.title}" deleted.`);
      fetchSessions();
    } catch (err: any) {
      alert(err.message || "Failed to delete session");
    }
  };

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const copySharableUrl = (session: LiveSessionItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://internvisiontech.me";
    const sharableUrl = `${origin}/sessions/${session.slug}`;
    navigator.clipboard.writeText(sharableUrl);
    setCopiedId(session.id);
    showToast(`Sharable URL copied: /sessions/${session.slug}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openBookingsModal = async (session: LiveSessionItem) => {
    setSelectedSessionForBookings(session);
    setBookingsLoading(true);
    try {
      const data = await apiRequest<SessionBookingItem[]>(`/sessions/admin/bookings?session_id=${session.id}`);
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to load attendees:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to remove this student booking?")) return;
    try {
      await apiRequest(`/sessions/admin/bookings/${bookingId}`, { method: "DELETE" });
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      fetchSessions();
    } catch (err: any) {
      alert(err.message || "Failed to delete booking");
    }
  };

  const exportBookingsCSV = () => {
    if (!selectedSessionForBookings || bookings.length === 0) return;
    const headers = ["Ticket Code", "Student Name", "Email", "Phone", "College / Org", "Status", "Amount (INR)", "Date"];
    const rows = bookings.map((b) => [
      b.ticket_code,
      `"${b.student_name.replace(/"/g, '""')}"`,
      b.student_email,
      b.student_phone,
      `"${(b.college_or_company || "").replace(/"/g, '""')}"`,
      b.status,
      b.amount_paid,
      new Date(b.created_at).toLocaleDateString(),
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendees_${selectedSessionForBookings.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.instructor_name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q);

      const matchType =
        filterType === "ALL" || (filterType === "FREE" && s.is_free) || (filterType === "PAID" && !s.is_free);

      return matchSearch && matchType;
    });
  }, [sessions, searchTerm, filterType]);

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSessions.slice(start, start + itemsPerPage);
  }, [filteredSessions, currentPage, itemsPerPage]);

  const totalBookingsCount = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.booking_count || 0), 0);
  }, [sessions]);

  const freeCount = sessions.filter((s) => s.is_free).length;
  const paidCount = sessions.filter((s) => !s.is_free).length;

  return (
    <div className="space-y-6 pt-1">
      {/* Toast Banner */}
      {actionMessage && (
        <div className="fixed top-4 right-4 z-50 bg-brand-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <Sparkles className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-400">
              Total Sessions
            </span>
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{sessions.length}</div>
          <div className="text-xs text-gray-500 dark:text-ink-400 mt-1">Live masterclasses & workshops</div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-400">
              Total Bookings
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalBookingsCount}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Registered participants</div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-400">
              Free Sessions
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{freeCount}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">100% Free community access</div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-ink-400">
              Paid / Premium
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{paidCount}</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Specialized masterclasses</div>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="bg-white dark:bg-ink-950 border border-gray-200 dark:border-ink-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="w-full md:w-80">
          <AdminSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search sessions, speakers, tags..."
            accentColor="blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-ink-900 rounded-lg border border-gray-200 dark:border-ink-800 text-xs font-medium">
            <button
              onClick={() => {
                setFilterType("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                filterType === "ALL"
                  ? "bg-white dark:bg-ink-800 text-brand-600 dark:text-white font-bold shadow-sm"
                  : "text-gray-600 dark:text-ink-400 hover:text-gray-900"
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => {
                setFilterType("FREE");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                filterType === "FREE"
                  ? "bg-white dark:bg-ink-800 text-brand-600 dark:text-white font-bold shadow-sm"
                  : "text-gray-600 dark:text-ink-400 hover:text-gray-900"
              }`}
            >
              Free ({freeCount})
            </button>
            <button
              onClick={() => {
                setFilterType("PAID");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                filterType === "PAID"
                  ? "bg-white dark:bg-ink-800 text-brand-600 dark:text-white font-bold shadow-sm"
                  : "text-gray-600 dark:text-ink-400 hover:text-gray-900"
              }`}
            >
              Paid ({paidCount})
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Session
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-ink-950 border border-gray-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-ink-900/60 border-b border-gray-200 dark:border-ink-800 text-xs uppercase tracking-wider text-gray-700 dark:text-ink-300 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Session Info</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Attendees</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-ink-800/60 text-xs text-gray-900 dark:text-ink-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-ink-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      Loading live sessions...
                    </div>
                  </td>
                </tr>
              ) : paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-ink-400">
                    No sessions match your search criteria. Click &quot;Add New Session&quot; to create one.
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50/70 dark:hover:bg-ink-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-ink-900 flex-shrink-0 border border-gray-200 dark:border-ink-800">
                          {session.thumbnail_url ? (
                            <img
                              src={getImageUrl(session.thumbnail_url)}
                              alt={session.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-gray-900 dark:text-white truncate" title={session.title}>
                            {session.title}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-ink-400 flex items-center gap-1.5">
                            <span className="text-brand-600 dark:text-brand-400 font-mono">/sessions/{session.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        {session.session_date}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-ink-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {session.session_time}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                        {session.duration}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {session.is_free ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                          FREE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                          ₹{session.price_inr} INR
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openBookingsModal(session)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-ink-800 hover:bg-brand-500/20 text-gray-800 dark:text-ink-200 hover:text-brand-400 transition font-semibold"
                        title="Click to view registered students"
                      >
                        <Users className="w-3.5 h-3.5 text-brand-500" />
                        <span>{session.booking_count || 0} enrolled</span>
                        <ChevronRight className="w-3 h-3 ml-0.5 opacity-60" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      {session.is_published ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-gray-400" />
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => copySharableUrl(session)}
                          title="Copy Direct Sharable Link"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-ink-800 hover:bg-gray-100 dark:hover:bg-ink-800 text-gray-600 dark:text-ink-400 transition"
                        >
                          {copiedId === session.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <a
                          href={`/sessions/${session.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Public Page"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-ink-800 hover:bg-gray-100 dark:hover:bg-ink-800 text-gray-600 dark:text-ink-400 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => openEditModal(session)}
                          title="Edit Session Details"
                          className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteSession(session)}
                          title="Delete Session"
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-ink-800 flex justify-end">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-ink-950 border border-gray-200 dark:border-ink-800 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <Video className="w-5 h-5 text-brand-500" />
              {editingSession ? "Edit Live Session" : "Create New Live Session"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-ink-400 mb-6">
              Configure session name, schedule, pricing (free/paid), duration, and thumbnail banner.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Session Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                  Session Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub Mastery & Open Source Engineering, Docker & Kubernetes Deep Dive"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!editingSession && !formSlug) {
                      setFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/[\s_-]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      );
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              {/* Slug (Sharable URL) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                  Sharable URL Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 text-xs bg-gray-100 dark:bg-ink-800 border border-r-0 border-gray-300 dark:border-ink-800 text-gray-500 dark:text-ink-400 rounded-l-lg font-mono">
                    /sessions/
                  </span>
                  <input
                    type="text"
                    placeholder="github-mastery-workshop"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-r-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              {/* Date, Time, Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saturday, 25 Oct 2026"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 06:00 PM IST"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 90 Mins or 2 Hours"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Free vs Paid Pricing Option */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300">
                  Access & Pricing Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      formIsFree
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                        : "bg-white dark:bg-ink-950 border-gray-200 dark:border-ink-800 text-gray-700 dark:text-ink-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricing_type"
                      checked={formIsFree}
                      onChange={() => {
                        setFormIsFree(true);
                        setFormPrice(0);
                      }}
                      className="sr-only"
                    />
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-xs font-bold">100% Free Session</div>
                      <div className="text-[10px] opacity-75">No payment required for booking</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      !formIsFree
                        ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold"
                        : "bg-white dark:bg-ink-950 border-gray-200 dark:border-ink-800 text-gray-700 dark:text-ink-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricing_type"
                      checked={!formIsFree}
                      onChange={() => setFormIsFree(false)}
                      className="sr-only"
                    />
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold">Paid Masterclass</div>
                      <div className="text-[10px] opacity-75">Custom fee in INR</div>
                    </div>
                  </label>
                </div>

                {!formIsFree && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-ink-300 mb-1">
                      Price in ₹ INR
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="99"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 rounded-lg text-xs bg-white dark:bg-ink-950 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload Option */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300">
                  Thumbnail Banner Image
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Image Preview */}
                  <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-ink-800 border border-gray-300 dark:border-ink-700 flex-shrink-0 flex items-center justify-center">
                    {formThumbnail ? (
                      <img
                        src={getImageUrl(formThumbnail)}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-ink-950 border border-gray-300 dark:border-ink-700 text-gray-800 dark:text-ink-100 hover:bg-gray-100 dark:hover:bg-ink-800 transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-brand-500" />
                        {isUploading ? "Uploading..." : "Upload Image File"}
                      </button>
                      <span className="text-[11px] text-gray-500 dark:text-ink-400">PNG, JPG, WEBP (Max 5MB)</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Or paste external image URL (e.g. Unsplash / Cloudinary)"
                        value={formThumbnail}
                        onChange={(e) => setFormThumbnail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-ink-950 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mentor / Instructor info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Speaker / Mentor Name
                  </label>
                  <input
                    type="text"
                    placeholder="Suraj Kumar"
                    value={formInstructorName}
                    onChange={(e) => setFormInstructorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Speaker Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="Senior Technical Lead & Architect"
                    value={formInstructorRole}
                    onChange={(e) => setFormInstructorRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Meeting platform & link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Meeting Platform
                  </label>
                  <select
                    value={formMeetingPlatform}
                    onChange={(e) => setFormMeetingPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="YouTube Live">YouTube Live</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Meeting Link (Emailed to attendees)
                  </label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/xyz-abcd-efg"
                    value={formMeetingLink}
                    onChange={(e) => setFormMeetingLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              {/* Category, Tags, Max Seats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Git & DevOps, Cloud"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="GitHub, Docker, Next.js"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                    Max Seats
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={formMaxSeats}
                    onChange={(e) => setFormMaxSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300 mb-1">
                  Session Overview / Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what this masterclass covers, practical demos, and career takeaways..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Key Takeaways Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-ink-300">
                    What Students Will Learn (Bullet points)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormTakeaways([...formTakeaways, ""])}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Bullet Point
                  </button>
                </div>

                {formTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">#{idx + 1}</span>
                    <input
                      type="text"
                      placeholder="e.g. Setting up production CI/CD pipelines..."
                      value={takeaway}
                      onChange={(e) => {
                        const updated = [...formTakeaways];
                        updated[idx] = e.target.value;
                        setFormTakeaways(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                    {formTakeaways.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormTakeaways(formTakeaways.filter((_, i) => i !== idx))}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Published Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">Publish Live to Public Site</div>
                  <div className="text-[11px] text-gray-500 dark:text-ink-400">
                    When enabled, this session appears on the public booking catalog immediately.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-ink-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-ink-300 hover:bg-gray-100 dark:hover:bg-ink-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : editingSession ? (
                    "Update Session"
                  ) : (
                    "Create & Publish Session"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTENDEES / BOOKINGS MODAL */}
      {selectedSessionForBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white dark:bg-ink-950 border border-gray-200 dark:border-ink-800 rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedSessionForBookings(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-ink-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-500" />
                  Attendee Registry: {selectedSessionForBookings.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-ink-400 mt-0.5">
                  {bookings.length} students registered &bull; {selectedSessionForBookings.session_date} &bull;{" "}
                  {selectedSessionForBookings.session_time}
                </p>
              </div>

              <button
                onClick={exportBookingsCSV}
                disabled={bookings.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            {/* Attendee search */}
            <div className="py-3">
              <input
                type="text"
                placeholder="Search registered attendees by name, email, phone, ticket code..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-ink-900 border border-gray-300 dark:border-ink-800 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-ink-800 mt-2">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-ink-900 border-b border-gray-200 dark:border-ink-800 uppercase font-semibold text-gray-600 dark:text-ink-400">
                  <tr>
                    <th className="py-2.5 px-3">Ticket Code</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">College / Org</th>
                    <th className="py-2.5 px-3">Pass Type</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-ink-800">
                  {bookingsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Loading attendee list...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No students have registered for this session yet.
                      </td>
                    </tr>
                  ) : (
                    bookings
                      .filter((b) => {
                        const q = bookingSearch.toLowerCase();
                        return (
                          !q ||
                          b.student_name.toLowerCase().includes(q) ||
                          b.student_email.toLowerCase().includes(q) ||
                          b.student_phone.toLowerCase().includes(q) ||
                          b.ticket_code.toLowerCase().includes(q)
                        );
                      })
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-ink-900/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                            {b.ticket_code}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">{b.student_name}</td>
                          <td className="py-2.5 px-3 text-gray-600 dark:text-ink-300">{b.student_email}</td>
                          <td className="py-2.5 px-3 text-gray-600 dark:text-ink-300">{b.student_phone}</td>
                          <td className="py-2.5 px-3 text-gray-500 dark:text-ink-400">
                            {b.college_or_company || "—"}
                          </td>
                          <td className="py-2.5 px-3">
                            {b.amount_paid > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">
                                Paid ₹{b.amount_paid}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                                Free Pass
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition"
                              title="Cancel / Remove Attendee"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedSessionForBookings(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-ink-800 text-gray-800 dark:text-ink-200 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-ink-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
