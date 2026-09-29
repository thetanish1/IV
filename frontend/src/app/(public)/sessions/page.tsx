"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  Users,
  Search,
  Sparkles,
  Share2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  X,
  Radio,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, getImageUrl } from "@/lib/api-client";

interface LiveSession {
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
  meeting_platform?: string;
  max_seats?: number;
  category?: string;
  tags?: string[];
  is_published: boolean;
  booking_count?: number;
}

const DEFAULT_SESSIONS: LiveSession[] = [
  {
    id: 1,
    title: "GitHub Mastery & Open Source Engineering",
    slug: "github-mastery-open-source-engineering",
    description:
      "Master enterprise Git workflows, GitHub Actions CI/CD automation, pull request reviews, and building impactful open-source contributions.",
    key_takeaways: [
      "Advanced Git branching, rebasing, stash & conflict resolution",
      "Building automated CI/CD workflows with GitHub Actions",
      "Crafting high-impact GitHub portfolios & open source contributions",
      "Production Pull Request reviews and collaborative workflow",
    ],
    session_date: "Saturday, 25 Oct 2026",
    session_time: "06:00 PM IST",
    duration: "90 Mins",
    is_free: true,
    price_inr: 0,
    thumbnail_url:
      "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=1000&auto=format&fit=crop",
    instructor_name: "Suraj Kumar",
    instructor_role: "Senior Engineering Lead & Mentor",
    meeting_platform: "Google Meet",
    max_seats: 200,
    category: "Git & Open Source",
    tags: ["GitHub", "Git", "Open Source", "CI/CD", "DevOps"],
    is_published: true,
    booking_count: 84,
  },
  {
    id: 2,
    title: "Docker & Kubernetes Containerization Deep Dive",
    slug: "docker-kubernetes-containerization-deep-dive",
    description:
      "From zero to production microservices: Learn multi-stage Docker builds, container orchestration, Kubernetes pods, deployments, and cloud scalability.",
    key_takeaways: [
      "Writing ultra-lightweight multi-stage Dockerfiles for apps",
      "Multi-container orchestration with Docker Compose",
      "Core Kubernetes primitives: Pods, Services & Deployments",
      "Zero-downtime rolling updates & cloud microservices scaling",
    ],
    session_date: "Sunday, 26 Oct 2026",
    session_time: "05:30 PM IST",
    duration: "2 Hours",
    is_free: true,
    price_inr: 0,
    thumbnail_url:
      "https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=1000&auto=format&fit=crop",
    instructor_name: "Tanish Dewase",
    instructor_role: "Cloud DevOps Architect",
    meeting_platform: "Google Meet",
    max_seats: 150,
    category: "Cloud & DevOps",
    tags: ["Docker", "Kubernetes", "DevOps", "Microservices", "Containers"],
    is_published: true,
    booking_count: 112,
  },
  {
    id: 3,
    title: "Full Stack Architecture with Next.js 15 & FastAPI",
    slug: "fullstack-nextjs15-fastapi-architecture",
    description:
      "Build enterprise web applications using React Server Components, Next.js 15 App Router, high-throughput asynchronous Python FastAPI, and PostgreSQL.",
    key_takeaways: [
      "Architecting scalable Next.js 15 App Router with SSR & SSG",
      "High-speed Async REST API design & validation with FastAPI",
      "PostgreSQL connection pooling and query optimization",
      "Securing production applications with JWT & rate limiting",
    ],
    session_date: "Saturday, 01 Nov 2026",
    session_time: "07:00 PM IST",
    duration: "2.5 Hours",
    is_free: false,
    price_inr: 99,
    thumbnail_url:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    instructor_name: "InternVision Tech Team",
    instructor_role: "Principal Full Stack Architect",
    meeting_platform: "Google Meet",
    max_seats: 100,
    category: "Web Development",
    tags: ["Next.js 15", "FastAPI", "React", "TypeScript", "PostgreSQL"],
    is_published: true,
    booking_count: 67,
  },
];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>(DEFAULT_SESSIONS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "FREE" | "PAID">("ALL");

  // Booking modal state
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentCollege, setStudentCollege] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Auto-fill student profile from localStorage if logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("user_email") || "";
      const storedName = localStorage.getItem("user_name") || "";
      const storedPhone = localStorage.getItem("user_phone") || "";
      const storedCollege = localStorage.getItem("user_college") || "";
      if (storedEmail) setStudentEmail(storedEmail);
      if (storedName) setStudentName(storedName);
      if (storedPhone) setStudentPhone(storedPhone);
      if (storedCollege) setStudentCollege(storedCollege);
    }
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<LiveSession[]>("/sessions");
      if (data && data.length > 0) {
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to load sessions from API, using default catalog", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareSession = (session: LiveSession, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://internvisiontech.me";
    const shareUrl = `${origin}/sessions/${session.slug}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedSlug(session.slug);
      showToast(`🔗 Sharable link copied: /sessions/${session.slug}`);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const openBookingModal = (session: LiveSession) => {
    setSelectedSession(session);
    setConfirmedBooking(null);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    if (!studentName.trim() || !studentEmail.trim() || !studentPhone.trim()) {
      alert("Please fill in your Name, Email, and Phone Number.");
      return;
    }

    try {
      setBookingLoading(true);
      const res = await apiRequest<any>("/sessions/book", {
        method: "POST",
        body: JSON.stringify({
          session_id: selectedSession.id,
          session_slug: selectedSession.slug,
          student_name: studentName.trim(),
          student_email: studentEmail.trim().toLowerCase(),
          student_phone: studentPhone.trim(),
          college_or_company: studentCollege.trim(),
        }),
      });

      if (res && res.success) {
        setConfirmedBooking(res);
        // Refresh session counts
        fetchSessions();
      } else {
        alert(res?.message || "Booking submission failed. Please try again.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to book session");
    } finally {
      setBookingLoading(false);
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.instructor_name?.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q));

      const matchCategory = selectedCategory === "ALL" || s.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchType =
        filterType === "ALL" || (filterType === "FREE" && s.is_free) || (filterType === "PAID" && !s.is_free);

      return matchQuery && matchCategory && matchType;
    });
  }, [sessions, searchQuery, selectedCategory, filterType]);

  return (
    <div className="min-h-screen bg-ink-950 text-white font-sans selection:bg-brand-500 selection:text-white pb-24">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-brand-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-brand-400/40"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-12 sm:pb-16 overflow-hidden border-b border-ink-800/80">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Live Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live Interactive Workshops & Masterclasses</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]"
          >
            Level Up Your Engineering Skills with <span className="gradient-text">Live Mentorship</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-ink-300 max-w-2xl mx-auto mt-4 sm:mt-5 leading-relaxed"
          >
            Join hands-on live sessions on GitHub, Docker, Kubernetes, Next.js, and Cloud DevOps. Learn directly from
            industry engineers with real code walkthroughs and Q&A.
          </motion.p>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mt-8 sm:mt-10"
          >
            <div className="p-3.5 rounded-xl bg-ink-900/60 border border-ink-800 text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-white">100% Live</div>
              <div className="text-[11px] sm:text-xs text-ink-400 mt-0.5">Interactive Q&A</div>
            </div>
            <div className="p-3.5 rounded-xl bg-ink-900/60 border border-ink-800 text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">Free Passes</div>
              <div className="text-[11px] sm:text-xs text-ink-400 mt-0.5">Available for Students</div>
            </div>
            <div className="p-3.5 rounded-xl bg-ink-900/60 border border-ink-800 text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-brand-400">Sharable Pass</div>
              <div className="text-[11px] sm:text-xs text-ink-400 mt-0.5">Instant Ticket Code</div>
            </div>
            <div className="p-3.5 rounded-xl bg-ink-900/60 border border-ink-800 text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-white">Certificates</div>
              <div className="text-[11px] sm:text-xs text-ink-400 mt-0.5">Upon Completion</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-ink-800/80">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search sessions, topics (e.g. GitHub, Docker)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-900 border border-ink-800 text-xs sm:text-sm text-white placeholder-ink-400 focus:outline-none focus:border-brand-500 transition shadow-inner"
            />
          </div>

          {/* Pricing & Category Filter pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 p-1 bg-ink-900 rounded-xl border border-ink-800 text-xs font-semibold">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "ALL"
                    ? "bg-brand-600 text-white shadow-sm font-bold"
                    : "text-ink-400 hover:text-white"
                }`}
              >
                All Sessions
              </button>
              <button
                onClick={() => setFilterType("FREE")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "FREE"
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "text-ink-400 hover:text-white"
                }`}
              >
                Free Only
              </button>
              <button
                onClick={() => setFilterType("PAID")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "PAID"
                    ? "bg-amber-600 text-white shadow-sm font-bold"
                    : "text-ink-400 hover:text-white"
                }`}
              >
                Paid Masterclasses
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/40"
                    : "bg-ink-900 text-ink-400 hover:text-white border border-ink-800"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-ink-900/40 border border-ink-800 space-y-4">
            <Video className="w-12 h-12 text-ink-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Live Sessions Found</h3>
            <p className="text-xs sm:text-sm text-ink-400 max-w-md mx-auto">
              We couldn&apos;t find any sessions matching &quot;{searchQuery}&quot;. Try adjusting your search query or
              filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setFilterType("ALL");
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredSessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group flex flex-col rounded-2xl bg-ink-900/60 border border-ink-800 hover:border-brand-500/40 transition-all duration-300 shadow-xl overflow-hidden hover:shadow-brand-500/5 hover:-translate-y-1"
              >
                {/* Thumbnail Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-ink-950">
                  <img
                    src={getImageUrl(session.thumbnail_url)}
                    alt={session.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

                  {/* Pricing Badge (Top Left) */}
                  <div className="absolute top-3 left-3">
                    {session.is_free ? (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/90 backdrop-blur-md text-white border border-emerald-400/30 shadow-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        100% FREE PASS
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/90 backdrop-blur-md text-white border border-amber-400/30 shadow-lg">
                        ₹{session.price_inr} INR
                      </span>
                    )}
                  </div>

                  {/* Share Link Button (Top Right) */}
                  <button
                    onClick={(e) => handleShareSession(session, e)}
                    title="Copy Sharable Link"
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-brand-600 text-white backdrop-blur-md transition border border-white/10"
                  >
                    {copiedSlug === session.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Duration pill (Bottom Right of banner) */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                    <Clock className="w-3 h-3 text-brand-400" />
                    <span>{session.duration}</span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Date & Platform info */}
                    <div className="flex items-center gap-3 text-xs text-brand-400 font-semibold mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {session.session_date}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-ink-300">
                        <Clock className="w-3 h-3" />
                        {session.session_time}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/sessions/${session.slug}`}>{session.title}</Link>
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-ink-300 mt-2 line-clamp-2 leading-relaxed">{session.description}</p>

                    {/* Key Takeaways Checklist Preview */}
                    {session.key_takeaways && session.key_takeaways.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                          Key Highlights:
                        </div>
                        {session.key_takeaways.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-ink-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-4 border-t border-ink-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs text-ink-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-[10px] font-bold">
                          {session.instructor_name?.charAt(0) || "M"}
                        </div>
                        <span className="text-white font-medium text-[11px]">{session.instructor_name}</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        {session.booking_count || 0} registered
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/sessions/${session.slug}`}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-ink-200 hover:text-white bg-ink-800 hover:bg-ink-700 transition border border-ink-700"
                      >
                        Details
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </Link>

                      <button
                        onClick={() => openBookingModal(session)}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition shadow-md shadow-brand-600/20"
                      >
                        Book Seat
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-ink-950 border border-ink-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedSession(null);
                  setConfirmedBooking(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-ink-900 hover:bg-ink-800 text-ink-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              {!confirmedBooking ? (
                // Booking Form View
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Seat Registration</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                    {selectedSession.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink-300 mb-6 bg-ink-900/70 p-3 rounded-xl border border-ink-800">
                    <span className="flex items-center gap-1 text-white font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      {selectedSession.session_date}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      {selectedSession.session_time} ({selectedSession.duration})
                    </span>
                    <span>&bull;</span>
                    <span className="font-bold text-emerald-400">
                      {selectedSession.is_free ? "FREE" : `₹${selectedSession.price_inr} INR`}
                    </span>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Suraj Kumar"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink-900 border border-ink-800 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1">
                        Email Address (For ticket pass & meeting link) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. you@example.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ink-900 border border-ink-800 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1">
                          WhatsApp / Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 9876543210"
                          value={studentPhone}
                          onChange={(e) => setStudentPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-ink-900 border border-ink-800 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1">
                          College / Company
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. IIT Bombay"
                          value={studentCollege}
                          onChange={(e) => setStudentCollege(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-ink-900 border border-ink-800 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 mt-4"
                    >
                      {bookingLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Reserving Seat...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Get Ticket Pass</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                // Success Ticket Pass View
                <div className="text-center space-y-4 py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
                    🎉
                  </div>

                  <h3 className="text-2xl font-extrabold text-white">You&apos;re Registered!</h3>
                  <p className="text-xs sm:text-sm text-ink-300 max-w-sm mx-auto">
                    Your seat for <strong className="text-white">{confirmedBooking.session_title}</strong> has been
                    confirmed.
                  </p>

                  {/* Digital Ticket Card */}
                  <div className="bg-ink-900 border-2 border-dashed border-brand-500/40 rounded-2xl p-5 text-left space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-ink-800 pb-2.5">
                      <span className="text-[11px] font-mono text-ink-400 uppercase tracking-wider">
                        Event Access Pass
                      </span>
                      <span className="text-xs font-mono font-bold bg-brand-600/30 text-brand-300 px-2 py-0.5 rounded border border-brand-500/40">
                        {confirmedBooking.ticket_code}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-white font-bold">{confirmedBooking.student_name}</div>
                      <div className="text-ink-400">{confirmedBooking.student_email}</div>
                    </div>

                    <div className="pt-2 border-t border-ink-800 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-ink-400">Date:</span>
                        <div className="font-semibold text-white">{confirmedBooking.session_date}</div>
                      </div>
                      <div>
                        <span className="text-ink-400">Time:</span>
                        <div className="font-semibold text-white">{confirmedBooking.session_time}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-ink-400">
                    A confirmation ticket has been dispatched to <strong>{confirmedBooking.student_email}</strong>.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        const origin = typeof window !== "undefined" ? window.location.origin : "";
                        const shareUrl = `${origin}/sessions/${selectedSession?.slug}`;
                        navigator.clipboard.writeText(shareUrl);
                        showToast("Sharable session URL copied!");
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-ink-200 text-xs font-bold border border-ink-800 flex items-center justify-center gap-1.5 transition"
                    >
                      <Copy className="w-3.5 h-3.5 text-brand-400" />
                      Share with Friends
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSession(null);
                        setConfirmedBooking(null);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
