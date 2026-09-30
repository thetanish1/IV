"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  ShieldCheck,
  Rocket,
  CheckCircle2,
} from "lucide-react";

interface AppleCardItem {
  id: string;
  category: string;
  title: string;
  description: string;
  graphicType: "stack" | "mentor" | "credential" | "deploy";
  linkText: string;
  linkHref: string;
}

const APPLE_CARDS: AppleCardItem[] = [
  {
    id: "production-stack",
    category: "Production Engineering",
    title: "Live Industry Stacks. Build what tech leaders use.",
    description: "Work hands-on with Next.js 15, FastAPI, Docker, and PostgreSQL with real GitHub pull requests, CI/CD pipelines, and cloud hosting.",
    graphicType: "stack",
    linkText: "View Internship Domains",
    linkHref: "/apply",
  },
  {
    id: "mentor-guidance",
    category: "1:1 Mentorship",
    title: "Direct Code Reviews from Senior Engineers.",
    description: "Get personalized line-by-line code feedback, architecture guidance, and mock technical interview rounds to accelerate your growth.",
    graphicType: "mentor",
    linkText: "Learn About Mentorship",
    linkHref: "/apply",
  },
  {
    id: "verified-credential",
    category: "Verified Credentials",
    title: "Instant Digital Validation. Stand out on LinkedIn.",
    description: "Receive a tamper-proof, industry-verifiable digital certificate and evaluation report with instant QR authentication for employers.",
    graphicType: "credential",
    linkText: "Verify Any Certificate",
    linkHref: "/verify-certificate",
  },
  {
    id: "real-projects",
    category: "Real Project Execution",
    title: "End-to-End Delivery. From Zero to Cloud.",
    description: "Whether building scalable SaaS platforms or college capstone projects, we emphasize clean architecture, live hosting, and full code ownership.",
    graphicType: "deploy",
    linkText: "Explore Projects & Tracks",
    linkHref: "/contact?service=final-year-project",
  },
];

export default function AppleWhyChooseUs() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 420;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 select-none">
      {/* Header (Apple Typography & Structure) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
            Why InternVision is the best place to build your tech career.
          </h2>
        </div>
        <Link
          href="/apply"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors group shrink-0 pb-1"
        >
          Explore Tracks
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Horizontal Scrollable Carousel Cards */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {APPLE_CARDS.map((card) => (
          <div
            key={card.id}
            className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 snap-start bg-ink-900/90 text-white rounded-[28px] p-7 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:-translate-y-1 relative group overflow-hidden min-h-[480px] border border-ink-800 hover:border-brand-500/50"
          >
            {/* Top Text Content */}
            <div className="space-y-3 z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 block">
                {card.category}
              </span>
              <h3 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-[1.18] group-hover:text-brand-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-ink-300 leading-relaxed pt-1">
                {card.description}
              </p>
            </div>

            {/* Visual Graphic Representation (Apple Aesthetic) */}
            <div className="my-6 py-4 flex items-center justify-center relative z-10">
              {card.graphicType === "stack" && (
                <div className="w-full bg-ink-950 text-neutral-100 rounded-2xl p-4 shadow-xl border border-ink-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] font-mono text-ink-400">production_stack.ts</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Next.js 15", "FastAPI", "Docker", "PostgreSQL", "Tailwind"].map((t) => (
                      <span key={t} className="text-[10px] font-medium bg-ink-900 text-brand-300 px-2 py-0.5 rounded border border-ink-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {card.graphicType === "mentor" && (
                <div className="w-full bg-ink-950 border border-ink-800 rounded-2xl p-4 shadow-md space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                      SR
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Senior Staff Engineer</div>
                      <div className="text-[10px] text-ink-400">PR #42 Review Approved</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-ink-900 rounded-lg border border-ink-800 text-[11px] text-ink-200 font-mono">
                    ✨ &quot;Clean architecture &amp; optimal database indexing. Ready for deployment!&quot;
                  </div>
                </div>
              )}

              {card.graphicType === "credential" && (
                <div className="w-full bg-gradient-to-br from-ink-950 via-ink-900 to-brand-950 text-white rounded-2xl p-4 shadow-xl border border-ink-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                      <CheckCircle2 className="w-3 h-3" /> Verifiable
                    </div>
                    <div className="text-xs font-bold text-white">IVT Verified Certificate</div>
                    <div className="text-[10px] text-ink-400 font-mono">ID: IVT/2026/PROD</div>
                  </div>
                  <div className="w-12 h-12 bg-ink-900 border border-ink-700 text-brand-400 rounded-xl flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-7 h-7 text-brand-400" />
                  </div>
                </div>
              )}

              {card.graphicType === "deploy" && (
                <div className="w-full bg-ink-950 text-white rounded-2xl p-4 shadow-xl border border-ink-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live in Production
                    </div>
                    <span className="text-[10px] text-ink-400 font-mono">99.9% Uptime</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-300 bg-ink-900 p-2 rounded border border-ink-800 font-mono">
                    <Rocket className="w-3.5 h-3.5 text-brand-400" />
                    https://app.internvisiontech.me
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Link & Apple-style Circle Action */}
            <div className="pt-2 border-t border-ink-800 flex items-center justify-between z-10">
              <Link
                href={card.linkHref}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1"
              >
                {card.linkText} <ArrowRight className="w-3 h-3" />
              </Link>

              <Link
                href={card.linkHref}
                aria-label={`Open ${card.category}`}
                className="w-9 h-9 rounded-full bg-ink-800 hover:bg-ink-700 text-ink-200 border border-ink-700 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4 text-ink-300" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Apple Circle Controls at Bottom Right) */}
      <div className="flex items-center justify-end gap-2.5 pt-4">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous Slide"
          className="w-10 h-10 rounded-full bg-ink-900/90 hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-ink-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          aria-label="Next Slide"
          className="w-10 h-10 rounded-full bg-ink-900/90 hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-ink-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
