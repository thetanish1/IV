"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, CheckCircle2, Terminal, QrCode } from "lucide-react";

interface RecognitionCard {
  id: string;
  category: string;
  title: string;
  description: string;
  type: "logo" | "mission" | "verification";
  imageSrc?: string;
  imageAlt?: string;
  badge: string;
  linkHref: string;
  linkText: string;
}

const CARDS: RecognitionCard[] = [
  {
    id: "digital-india",
    category: "DIGITAL EMPOWERMENT",
    title: "Digital India Skilling Initiative.",
    description: "Empowering engineering students with modern remote digital development labs and cloud workflows aligned with national digitalization goals.",
    type: "logo",
    imageSrc: "/logos/digital-india.png",
    imageAlt: "Digital India - Power To Empower",
    badge: "Government Initiative",
    linkHref: "/apply",
    linkText: "Explore Digital Tracks",
  },
  {
    id: "msme",
    category: "GOVERNMENT OF INDIA",
    title: "MSME Accredited & Recognized.",
    description: "Officially registered under the Ministry of Micro, Small & Medium Enterprises (Govt. of India). Recognized credentials accepted across Indian tech startups.",
    type: "logo",
    imageSrc: "/logos/msme.png",
    imageAlt: "MSME - Ministry of Micro, Small & Medium Enterprises",
    badge: "Govt. of India Recognized",
    linkHref: "/verify-certificate",
    linkText: "Learn About Accreditation",
  },
  {
    id: "aicte",
    category: "ACADEMIC FRAMEWORK",
    title: "AICTE Aligned Curriculum.",
    description: "Structured to fulfill mandatory AICTE academic internship points and capstone requirements for B.Tech, BCA, MCA, and BS degree programs.",
    type: "logo",
    imageSrc: "/logos/aicte.png",
    imageAlt: "AICTE - All India Council for Technical Education",
    badge: "Degree Credits Ready",
    linkHref: "/apply",
    linkText: "View Internship Syllabus",
  },
  {
    id: "mission-experience",
    category: "OUR CORE MISSION",
    title: "Solving the Freshers' 'No Experience' Dilemma.",
    description: "Companies demand prior internship experience, but nobody hires without proof. We provide 1, 2, and 3-month virtual internships with real GitHub pull requests and mentor code reviews.",
    type: "mission",
    badge: "1, 2 & 3-Month Tracks",
    linkHref: "/apply",
    linkText: "Start Internship Track",
  },
  {
    id: "instant-verification",
    category: "CREDENTIAL INTEGRITY",
    title: "100% Tamper-Proof Digital Verification.",
    description: "Every issued certificate includes a cryptographic verification ID and scannable QR code for instant recruiter validation on our 24/7 public registry.",
    type: "verification",
    badge: "Instant Verification",
    linkHref: "/verify-certificate",
    linkText: "Verify Any Certificate",
  },
];

export default function AppleMissionRecognition() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    checkScroll();
    const current = scrollRef.current;
    if (current) {
      current.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (current) {
        current.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none">
      {/* ─── APPLE STORE STYLE HEADER WITH RIGHT NAVIGATION BUTTONS ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Nationally Accredited &amp; Mission Driven
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.12]">
            Setup and support for your career.{" "}
            <span className="text-ink-400 font-normal">Backed by national standards.</span>
          </h2>
          <p className="text-ink-400 text-sm sm:text-base leading-relaxed pt-1">
            Empowering freshers with government-recognized frameworks, hands-on production codebases, and verifiable proof-of-work.
          </p>
        </div>

        {/* Right-Side Apple Navigation Controls */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto pb-1">
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-11 h-11 rounded-full bg-ink-900 hover:bg-ink-800 disabled:opacity-30 disabled:hover:bg-ink-900 border border-ink-700 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-11 h-11 rounded-full bg-ink-900 hover:bg-ink-800 disabled:opacity-30 disabled:hover:bg-ink-900 border border-ink-700 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── HORIZONTAL SCROLLING APPLE CARDS CONTAINER ─── */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CARDS.map((card) => (
          <div
            key={card.id}
            className="w-[310px] sm:w-[370px] min-h-[480px] bg-ink-900/90 text-white rounded-[28px] p-7 sm:p-8 flex flex-col justify-between shrink-0 snap-start shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-ink-800 hover:border-brand-500/50 hover:shadow-[0_25px_60px_rgba(37,99,235,0.25)] hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Top Text Content */}
            <div className="space-y-3 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-ink-400">
                  {card.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ink-800 text-ink-200 border border-ink-700">
                  {card.badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug group-hover:text-brand-400 transition-colors">
                {card.title}
              </h3>

              <p className="text-ink-300 text-xs sm:text-sm leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Middle Artwork / Logo Area (Apple Style) */}
            <div className="my-6 flex items-center justify-center min-h-[160px] relative">
              {card.type === "logo" && card.imageSrc && (
                <div className="w-full h-36 flex items-center justify-center p-3 rounded-2xl bg-white border border-ink-700/60 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt || card.title}
                    width={260}
                    height={110}
                    className="max-h-24 w-auto object-contain drop-shadow-sm"
                  />
                </div>
              )}

              {card.type === "mission" && (
                <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-ink-950 via-zinc-950 to-brand-950/70 p-4 border border-ink-800 flex flex-col justify-center space-y-2 text-white shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <Terminal className="w-4 h-4 text-brand-400" />
                    <span>git commit -m &quot;feat: real production project&quot;</span>
                  </div>
                  <div className="text-[11px] text-ink-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-ink-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> 1:1 Senior Engineering Code Reviews
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Production Repository &amp; Live Deployment
                    </div>
                  </div>
                </div>
              )}

              {card.type === "verification" && (
                <div className="w-full h-36 rounded-2xl bg-ink-950 border border-ink-800 p-4 flex items-center justify-between gap-3 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <div className="space-y-1 text-left">
                    <div className="text-xs font-black uppercase text-brand-400 tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Official Registry
                    </div>
                    <div className="text-[11px] text-ink-300 font-mono">ID: IVT/2026/VERIFIED</div>
                    <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded inline-block">
                      Grade A+ Distinction
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-white border border-ink-700 flex items-center justify-center p-1 shadow-sm shrink-0">
                    <QrCode className="w-12 h-12 text-zinc-900" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Link Action */}
            <div className="pt-2 border-t border-ink-800 flex items-center justify-between z-10">
              <Link
                href={card.linkHref}
                className="text-xs sm:text-sm font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all"
              >
                <span>{card.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-ink-500 text-xs">InternVision ✦</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
