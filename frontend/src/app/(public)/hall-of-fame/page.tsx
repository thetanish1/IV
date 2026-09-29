"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Award,
  Star,
  Sparkles,
  Search,
  ExternalLink,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Code2,
  Terminal,
  Filter,
  Users,
  Quote,
  Flame,
  Globe,
} from "lucide-react";
import { apiRequest, getImageUrl } from "@/lib/api-client";

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export interface BestIntern {
  id: number;
  student_name: string;
  student_email?: string | null;
  course: string;
  month_year: string;
  award_title?: string | null;
  image_url?: string | null;
  college?: string | null;
  duration?: string | null;
  project_name?: string | null;
  project_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  achievement_summary?: string | null;
  testimonial?: string | null;
  grade?: string | null;
  rating?: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_at?: string;
}

const DOMAIN_FILTERS = [
  "All Tracks",
  "Full Stack Web Development",
  "AI & Machine Learning Engineering",
  "Java & Enterprise Spring Boot",
  "Native Android App Development",
  "Python Development & Automation",
  "Data Science & Visual Analytics",
  "Cloud DevOps & Kubernetes",
  "Cyber Security & Ethical Hacking",
];

export default function HallOfFamePage() {
  const [interns, setInterns] = useState<BestIntern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("All Tracks");

  useEffect(() => {
    const fetchBestInterns = async () => {
      setLoading(true);
      try {
        const data = await apiRequest<BestIntern[]>("/best-interns");
        setInterns(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load Hall of Fame:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestInterns();
  }, []);

  // Filtered List
  const filteredInterns = useMemo(() => {
    return interns.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.college && item.college.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.project_name && item.project_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.course.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTrack =
        selectedTrack === "All Tracks" ||
        item.course.toLowerCase().includes(selectedTrack.toLowerCase());

      return matchSearch && matchTrack;
    });
  }, [interns, searchQuery, selectedTrack]);

  // Featured Spotlight Interns (top featured or first in list)
  const featuredSpotlight = useMemo(() => {
    const feat = interns.filter((i) => i.is_featured);
    return feat.length > 0 ? feat[0] : interns[0] || null;
  }, [interns]);

  return (
    <div className="space-y-20 pb-24 text-white">
      {/* ─── HERO BANNER ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-inner">
            <Trophy className="w-4 h-4 text-amber-400" />
            InternVision Hall of Fame &amp; Star Achievers
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            Best Interns <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
              Of The Month
            </span>
          </h1>

          <p className="text-base sm:text-lg text-ink-300 max-w-2xl mx-auto leading-relaxed">
            Honoring exceptional student engineers who demonstrated extraordinary technical mastery, engineered production-grade capstones, and set new engineering benchmarks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/apply"
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Apply to Become Next Star Intern
            </Link>
            <Link
              href="/verify-certificate"
              className="px-6 py-3.5 bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white text-xs font-bold rounded-lg border border-ink-700 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verify Student Credentials
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── GOVERNMENT & INSTITUTIONAL RECOGNITIONS STRIP ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-ink-950/90 border border-ink-800 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Nationally Accredited &amp; Recognized
              </span>
              <h3 className="text-base font-bold text-white">
                Internships Aligned with National Skill Standards
              </h3>
              <p className="text-xs text-ink-400">
                Recognized credentials verifiable across major employers and academic institutions.
              </p>
            </div>

            {/* Official Logos Group */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {/* Digital India */}
              <div className="h-14 px-4 py-2 rounded-xl bg-ink-900/90 border border-ink-700/80 hover:border-brand-500/60 transition flex items-center justify-center group shadow-md">
                <Image
                  src="/logos/digital-india.svg"
                  alt="Digital India - Power To Empower"
                  width={150}
                  height={45}
                  className="h-10 w-auto object-contain brightness-105 group-hover:scale-105 transition-transform"
                />
              </div>

              {/* MSME */}
              <div className="h-14 px-4 py-2 rounded-xl bg-ink-900/90 border border-ink-700/80 hover:border-amber-500/60 transition flex items-center justify-center group shadow-md">
                <Image
                  src="/logos/msme.svg"
                  alt="MSME - Ministry of Micro, Small & Medium Enterprises"
                  width={150}
                  height={45}
                  className="h-10 w-auto object-contain brightness-105 group-hover:scale-105 transition-transform"
                />
              </div>

              {/* AICTE */}
              <div className="h-14 px-4 py-2 rounded-xl bg-ink-900/90 border border-ink-700/80 hover:border-blue-500/60 transition flex items-center justify-center group shadow-md">
                <Image
                  src="/logos/aicte.svg"
                  alt="AICTE - All India Council for Technical Education"
                  width={150}
                  height={45}
                  className="h-10 w-auto object-contain brightness-105 group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED SPOTLIGHT INTERN OF THE MONTH ────────────────── */}
      {featuredSpotlight && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 bg-gradient-to-b from-ink-900/90 via-ink-950 to-ink-950 p-8 sm:p-12 shadow-2xl shadow-amber-500/10">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Photo & Award Badge (Left - 5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center text-center space-y-5">
                <div className="relative">
                  {/* Glowing Animated Ring */}
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 opacity-75 blur-md animate-pulse" />

                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-ink-900 shadow-2xl">
                    {featuredSpotlight.image_url ? (
                      <Image
                        src={getImageUrl(featuredSpotlight.image_url)}
                        alt={featuredSpotlight.student_name}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-ink-900 text-amber-400 text-6xl font-black">
                        {featuredSpotlight.student_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Gold Floating Crown Badge */}
                  <div className="absolute -bottom-3 inset-x-0 mx-auto w-max px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-amber-300">
                    <Trophy className="w-3.5 h-3.5 fill-black" />
                    Star Intern • {featuredSpotlight.month_year}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {featuredSpotlight.student_name}
                  </h2>
                  <p className="text-sm font-bold text-amber-400">
                    {featuredSpotlight.course}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
                    <GraduationCap className="w-4 h-4 text-ink-300" />
                    <span>{featuredSpotlight.college || "College of Engineering"}</span>
                  </div>
                </div>

                {/* Social / Portfolio Links */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  {featuredSpotlight.github_url && (
                    <a
                      href={featuredSpotlight.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-ink-900 border border-ink-700 text-ink-300 hover:text-white hover:border-brand-500 transition"
                      title="GitHub Profile"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {featuredSpotlight.linkedin_url && (
                    <a
                      href={featuredSpotlight.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-ink-900 border border-ink-700 text-ink-300 hover:text-white hover:border-brand-500 transition"
                      title="LinkedIn Profile"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                  {featuredSpotlight.project_url && (
                    <a
                      href={featuredSpotlight.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Capstone
                    </a>
                  )}
                </div>
              </div>

              {/* Achievement Story & Highlights (Right - 7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    {featuredSpotlight.award_title || "Top Performer of the Month"}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Excellence in Engineering &amp; Project Execution
                  </h3>
                </div>

                {/* Mentor Citation */}
                {featuredSpotlight.achievement_summary && (
                  <div className="p-5 rounded-2xl bg-ink-900/80 border border-ink-800 space-y-2">
                    <div className="text-xs font-bold text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-brand-400" /> Mentor Technical Review &amp; Citation
                    </div>
                    <p className="text-sm text-ink-200 leading-relaxed">
                      "{featuredSpotlight.achievement_summary}"
                    </p>
                  </div>
                )}

                {/* Key Capstone Project Details */}
                {featuredSpotlight.project_name && (
                  <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/20 space-y-2">
                    <div className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" /> Flagship Capstone Project
                    </div>
                    <div className="text-base font-bold text-white flex items-center justify-between">
                      <span>{featuredSpotlight.project_name}</span>
                      {featuredSpotlight.project_url && (
                        <a
                          href={featuredSpotlight.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
                        >
                          View Code / Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Student Quote */}
                {featuredSpotlight.testimonial && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-ink-900/40 border border-ink-800/60 text-xs text-ink-300 italic">
                    <Quote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p>"{featuredSpotlight.testimonial}"</p>
                  </div>
                )}

                {/* Key Highlights Pill Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-ink-900/90 border border-ink-800 text-center space-y-1">
                    <div className="text-[10px] uppercase font-bold text-ink-500">Duration</div>
                    <div className="text-xs font-bold text-white">{featuredSpotlight.duration || "1-3 Months"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-ink-900/90 border border-ink-800 text-center space-y-1">
                    <div className="text-[10px] uppercase font-bold text-ink-500">Graduation Grade</div>
                    <div className="text-xs font-bold text-emerald-400">{featuredSpotlight.grade || "Distinction (A+)"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-ink-900/90 border border-ink-800 text-center space-y-1 col-span-2 sm:col-span-1">
                    <div className="text-[10px] uppercase font-bold text-ink-500">Verification</div>
                    <div className="text-xs font-bold text-brand-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Digital Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── SEARCH & DOMAIN FILTER TOOLBAR ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-amber-500 pl-6">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              ✦ Hall of Fame Gallery
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              All Honored Interns
            </h2>
            <p className="text-xs sm:text-sm text-ink-400 mt-1">
              Browse top performers across all cohorts, departments, and engineering disciplines.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search by student, college, track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-ink-900/90 border border-ink-700 text-white placeholder-ink-400 focus:outline-none focus:border-amber-500 transition shadow-inner"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DOMAIN_FILTERS.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTrack === track
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "bg-ink-900/80 text-ink-300 hover:text-white hover:bg-ink-800 border border-ink-800"
              }`}
            >
              {track}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-ink-900/50 border border-ink-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-dashed border-ink-800 bg-ink-950/60 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Matching Star Interns Found</h3>
            <p className="text-xs text-ink-400">
              Try adjusting your search criteria or domain track filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTrack("All Tracks");
              }}
              className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg shadow hover:bg-amber-400 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterns.map((item, idx) => {
              const displayImg = item.image_url ? getImageUrl(item.image_url) : null;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="glass-card p-6 sm:p-7 rounded-2xl border border-ink-800 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-5 relative group overflow-hidden shadow-xl"
                >
                  <div className="space-y-4">
                    {/* Top Identity Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-ink-900 border border-ink-700 shrink-0 shadow">
                          {displayImg ? (
                            <Image
                              src={displayImg}
                              alt={item.student_name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-amber-400 text-lg bg-gradient-to-br from-amber-500/20 to-brand-500/20">
                              {item.student_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors truncate">
                            {item.student_name}
                          </h3>
                          <p className="text-xs text-brand-400 font-medium truncate">
                            {item.course}
                          </p>
                          <p className="text-[11px] text-ink-400 truncate flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.college || "College / University"}</span>
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                        {item.month_year}
                      </span>
                    </div>

                    {/* Award Title Badge */}
                    <div className="px-3 py-1.5 rounded-lg bg-ink-900/90 border border-ink-800/80 text-xs font-semibold text-ink-200 flex items-center justify-between">
                      <span className="truncate">{item.award_title || "Star Intern"}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {item.grade || "Grade A+"}
                      </span>
                    </div>

                    {/* Capstone Project */}
                    {item.project_name && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                          Capstone Project
                        </div>
                        <p className="text-xs font-semibold text-white line-clamp-2">
                          {item.project_name}
                        </p>
                      </div>
                    )}

                    {/* Achievement Citation */}
                    {item.achievement_summary && (
                      <p className="text-xs text-ink-300 line-clamp-3 leading-relaxed italic">
                        "{item.achievement_summary}"
                      </p>
                    )}
                  </div>

                  {/* Card Bottom: Links & Verify */}
                  <div className="pt-4 border-t border-ink-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.github_url && (
                        <a
                          href={item.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-ink-900 hover:bg-ink-800 text-ink-300 hover:text-white border border-ink-700 transition"
                          title="GitHub"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {item.linkedin_url && (
                        <a
                          href={item.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-ink-900 hover:bg-ink-800 text-ink-300 hover:text-white border border-ink-700 transition"
                          title="LinkedIn"
                        >
                          <LinkedinIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {item.project_url && (
                        <a
                          href={item.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-ink-900 hover:bg-ink-800 text-brand-400 hover:text-brand-300 border border-ink-700 transition"
                          title="Project Demo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <Link
                      href="/verify-certificate"
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── CALL TO ACTION ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 bg-gradient-to-r from-amber-600 via-brand-700 to-indigo-800 shadow-2xl border border-amber-400/30 space-y-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Join the Next Batch 2026
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
              Ready to Build Your Engineering Legacy?
            </h2>
            <p className="text-amber-100 text-base md:text-lg leading-relaxed">
              Apply today for our 1, 2, or 3-month virtual internships. Master production frameworks, solve real-world problems, and earn your place in the InternVision Hall of Fame.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/apply"
                className="px-8 py-4 font-bold text-base bg-white text-black hover:bg-amber-100 rounded-xl transition shadow-xl hover:-translate-y-1 flex items-center gap-2"
              >
                Apply for Virtual Internship <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
