"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  Users,
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
  Zap,
  ArrowLeft,
  MessageCircle,
  FileCode,
  Terminal,
  Compass,
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
  meeting_link?: string;
  max_seats?: number;
  category?: string;
  tags?: string[];
  is_published: boolean;
  booking_count?: number;
}

export default function SingleSessionSharablePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentCollege, setStudentCollege] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill from localStorage if logged in
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

  useEffect(() => {
    async function fetchSessionDetail() {
      try {
        setLoading(true);
        const data = await apiRequest<LiveSession>(`/sessions/${slug}`);
        if (data && data.title) {
          setSession(data);
        } else {
          setError("Session not found");
        }
      } catch (err: any) {
        console.error("Failed to load session:", err);
        setError("Could not load session details");
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchSessionDetail();
    }
  }, [slug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getFullShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return `https://internvisiontech.me/sessions/${slug}`;
  };

  const handleCopyLink = () => {
    const url = getFullShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("🔗 Sharable link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareToWhatsApp = () => {
    const url = getFullShareUrl();
    const text = `Join this live masterclass: "${session?.title}" with InternVision Tech! 🚀 Register here: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToLinkedIn = () => {
    const url = getFullShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
  };

  const shareToTwitter = () => {
    const url = getFullShareUrl();
    const text = `Excited to join "${session?.title}" by @InternVisionTech! Register for your seat here:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!studentName.trim() || !studentEmail.trim() || !studentPhone.trim()) {
      alert("Please fill in your Name, Email, and Phone Number.");
      return;
    }

    try {
      setBookingLoading(true);
      const res = await apiRequest<any>("/sessions/book", {
        method: "POST",
        body: JSON.stringify({
          session_id: session.id,
          session_slug: session.slug,
          student_name: studentName.trim(),
          student_email: studentEmail.trim().toLowerCase(),
          student_phone: studentPhone.trim(),
          college_or_company: studentCollege.trim(),
        }),
      });

      if (res && res.success) {
        setConfirmedBooking(res);
      } else {
        alert(res?.message || "Booking submission failed. Please try again.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to reserve seat");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-semibold text-ink-300">Loading Session Details...</div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-ink-900 border border-ink-800 text-center space-y-4 shadow-2xl">
          <Video className="w-12 h-12 text-brand-500 mx-auto opacity-75" />
          <h2 className="text-xl font-bold">Session Not Found</h2>
          <p className="text-xs text-ink-300">
            The session link you followed might have expired or does not exist.
          </p>
          <Link
            href="/sessions"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Explore All Live Sessions
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Top Navigation breadcrumbs */}
      <div className="border-b border-ink-800/80 bg-ink-950/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-xs">
          <Link
            href="/sessions"
            className="flex items-center gap-1.5 text-ink-400 hover:text-brand-400 transition font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Sessions</span>
          </Link>

          {/* Quick Share Buttons Bar */}
          <div className="flex items-center gap-2">
            <span className="text-ink-400 hidden sm:inline">Share:</span>
            <button
              onClick={handleCopyLink}
              title="Copy link"
              className="p-1.5 rounded-lg bg-ink-900 hover:bg-brand-600 border border-ink-800 text-ink-300 hover:text-white transition flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-bold hidden md:inline">Copy Link</span>
            </button>
            <button
              onClick={shareToWhatsApp}
              title="Share on WhatsApp"
              className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-600 border border-emerald-800/50 text-emerald-400 hover:text-white transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={shareToLinkedIn}
              title="Share on LinkedIn"
              className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-600 border border-blue-800/50 text-blue-400 hover:text-white transition flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </button>
            <button
              onClick={shareToTwitter}
              title="Share on X"
              className="p-1.5 rounded-lg bg-ink-900 hover:bg-ink-800 border border-ink-800 text-ink-300 hover:text-white transition flex items-center justify-center"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Left Column: Rich Session Overview (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Banner Media Card */}
            <div className="relative rounded-3xl overflow-hidden border border-ink-800 bg-ink-900 shadow-2xl h-64 sm:h-96 w-full">
              <img
                src={getImageUrl(session.thumbnail_url)}
                alt={session.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                {session.is_free ? (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/90 text-white backdrop-blur-md shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    100% FREE PASS
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/90 text-white backdrop-blur-md shadow-lg">
                    ₹{session.price_inr} INR MASTERCLASS
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-ink-200 border border-white/10">
                  {session.category || "Technical Workshop"}
                </span>
              </div>

              {/* Bottom Schedule Pill on Banner */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    {session.session_date}
                  </div>
                  <span className="text-ink-400">&bull;</span>
                  <div className="flex items-center gap-1.5 text-ink-300">
                    <Clock className="w-4 h-4 text-brand-400" />
                    {session.session_time}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-brand-300">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Duration: {session.duration}</span>
                </div>
              </div>
            </div>

            {/* Session Headline & Description */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                {session.title}
              </h1>

              <p className="text-sm sm:text-base text-ink-300 leading-relaxed">
                {session.description}
              </p>

              {/* Tags */}
              {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {session.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-ink-900 border border-ink-800 text-brand-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What You Will Learn / Key Highlights */}
            {session.key_takeaways && session.key_takeaways.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-ink-900/60 border border-ink-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-400" />
                  What You Will Master in this Masterclass
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {session.key_takeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor / Mentor Showcase */}
            <div className="p-6 sm:p-8 rounded-3xl bg-ink-900/60 border border-ink-800 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                {session.instructor_name?.charAt(0) || "M"}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  Presented by Industry Mentor
                </div>
                <h4 className="text-lg font-bold text-white">{session.instructor_name}</h4>
                <p className="text-xs text-ink-300">
                  {session.instructor_role || "Senior Technical Lead & Curriculum Mentor at InternVision Tech"}
                </p>
              </div>
            </div>

            {/* Perks Included */}
            <div className="p-6 sm:p-8 rounded-3xl bg-ink-900/40 border border-ink-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                What is Included with Every Registration:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-ink-900 border border-ink-800/80 space-y-1">
                  <div className="font-bold text-white">Live Interactive Q&A</div>
                  <div className="text-ink-400 text-[11px]">Ask your questions directly to the mentor.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-ink-900 border border-ink-800/80 space-y-1">
                  <div className="font-bold text-white">Digital Pass & Certificate</div>
                  <div className="text-ink-400 text-[11px]">Receive participation credentials.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-ink-900 border border-ink-800/80 space-y-1">
                  <div className="font-bold text-white">Code & Starter Repos</div>
                  <div className="text-ink-400 text-[11px]">Access all practical source codes.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Registration Card (4-5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="p-6 sm:p-8 rounded-3xl bg-ink-900/90 border-2 border-brand-500/30 shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                    Live Workshop Pass
                  </span>
                  {session.is_free ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      FREE TICKET
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      ₹{session.price_inr} INR
                    </span>
                  )}
                </div>

                <div className="text-2xl font-extrabold text-white">
                  {session.is_free ? "Free Entry Pass" : `₹${session.price_inr} Registration`}
                </div>
                <div className="text-xs text-ink-300">
                  {session.booking_count || 0} students already registered for this session.
                </div>
              </div>

              {!confirmedBooking ? (
                // Booking Form
                <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-300 mb-1">
                      College / Company (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Bombay"
                      value={studentCollege}
                      onChange={(e) => setStudentCollege(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-ink-800 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white transition shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 mt-4"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming Seat...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{session.is_free ? "Register Free Seat" : `Pay ₹${session.price_inr} & Book`}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-ink-400">
                    Instant confirmation ticket will be generated & dispatched to your email.
                  </p>
                </form>
              ) : (
                // Success Pass
                <div className="text-center space-y-4 py-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
                    🎟️
                  </div>
                  <h4 className="text-xl font-bold text-white">Seat Confirmed!</h4>
                  <div className="bg-ink-950 border-2 border-dashed border-brand-500/40 rounded-2xl p-4 text-left space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-400">Ticket Pass:</span>
                      <span className="font-mono font-bold text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded">
                        {confirmedBooking.ticket_code}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white">{confirmedBooking.student_name}</div>
                    <div className="text-[11px] text-ink-400">{confirmedBooking.student_email}</div>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand-400" />
                    Share This Masterclass
                  </button>
                </div>
              )}

              {/* Trust Badge */}
              <div className="pt-4 border-t border-ink-800/80 flex items-center gap-3 text-xs text-ink-400">
                <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Verified live event hosted on Google Meet with interactive Q&A.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
