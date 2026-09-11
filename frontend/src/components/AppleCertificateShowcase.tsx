"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  ShieldCheck,
  Lock,
  FileCheck2,
  Building2,
  Sparkles,
  ArrowRight,
  Mail,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

interface AppleCardItem {
  id: string;
  category: string;
  headline: string;
  subheadline: string;
  image: string;
  tag: string;
  modalTitle: string;
  modalSubtitle: string;
  modalDescription: string;
  bulletPoints: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

const CARDS: AppleCardItem[] = [
  {
    id: "authentic-verification",
    category: "Authentic Credential Verification.",
    headline: "Search. Confirm. Secure.",
    subheadline: "Instant real-time authentication for recruiters and institutions worldwide.",
    image: "/verify/card_globe_verify.jpg",
    tag: "Global Registry",
    modalTitle: "Instant Worldwide Credential Verification",
    modalSubtitle: "Zero friction, tamper-evident certificate authentication 24/7.",
    modalDescription:
      "Every candidate who successfully finishes an InternVision Tech internship track receives an immutable digital credential recorded in our secure registry. Recruiters and universities can verify credentials instantaneously without manual paperwork or waiting periods.",
    bulletPoints: [
      "Real-time lookup across all historical cohorts and engineering tracks",
      "Cryptographic verification ensures 100% authentic certificate validation",
      "Publicly shareable verification URLs for LinkedIn, resumes, and portfolios",
      "Supported globally by technology recruiters and enterprise hiring teams",
    ],
    ctaLabel: "Test Search Certificate",
    ctaHref: "#search-box",
  },
  {
    id: "tamper-proof-registry",
    category: "The Tamper-Proof Registry.",
    headline: "Guaranteed. Immutable. Verifiable.",
    subheadline: "Every credential contains a unique cryptographic hash tied to deliverables.",
    image: "/verify/card_tamperproof_vault.jpg",
    tag: "Cryptographic Hash",
    modalTitle: "Tamper-Proof Cryptographic Security",
    modalSubtitle: "Tied directly to student milestones, commits, and mentor sign-offs.",
    modalDescription:
      "Unlike conventional certificates that can be forged or altered, every InternVision Tech certificate is assigned a unique alphanumeric cryptographic identifier (e.g., IVT/JUN26/2026/0201). This signature is mathematically sealed in our central database registry upon mentor approval.",
    bulletPoints: [
      "Unique SHA-256 identifier generated per candidate and completion cohort",
      "Permanent immutable ledger that cannot be overwritten, modified, or forged",
      "Direct verification of internship tenure (1 Month, 3 Months, 6 Months)",
      "Protects candidates from identity theft and unauthorized credential duplication",
    ],
    ctaLabel: "View Registry Standards",
    ctaHref: "/terms",
  },
  {
    id: "outcome-code-reviewed",
    category: "Outcome & Code Reviewed.",
    headline: "Production Capstones. Proven Skill.",
    subheadline: "Certificates are only issued after passing rigorous mentor code reviews.",
    image: "/verify/card_audit_dashboard.jpg",
    tag: "100% Code Reviewed",
    modalTitle: "Rigorous Capstone Engineering & Code Review",
    modalSubtitle: "Earned exclusively through verified pull requests and production deliverables.",
    modalDescription:
      "InternVision Tech does not hand out participation certificates. Candidates must build, containerize, and deploy full-stack production capstone systems. Each milestone is inspected by senior engineers for architectural patterns, test coverage, and clean code standards.",
    bulletPoints: [
      "Mandatory GitHub repository inspection and sprint milestone evaluations",
      "Live production deployment validation (Vercel, Docker, AWS, PostgreSQL)",
      "1:1 feedback loops with senior engineering mentors prior to sign-off",
      "Ensures holders possess real-world software engineering competencies",
    ],
    ctaLabel: "Explore Bootcamps",
    ctaHref: "/courses",
  },
  {
    id: "direct-recruiter-support",
    category: "Direct Recruiter Support.",
    headline: "Official Dossiers for Hiring Teams.",
    subheadline: "HR departments can request comprehensive candidate performance records.",
    image: "/verify/card_devices_credentials.jpg",
    tag: "HR & Recruiter Desk",
    modalTitle: "Official Candidate Performance Dossiers",
    modalSubtitle: "Direct background verification and evaluation reports for HR teams.",
    modalDescription:
      "Are you an HR manager or recruiter evaluating an applicant? Our talent operations department provides verified candidate performance dossiers, including task completion rates, mentor recommendations, and capstone repository links upon request.",
    bulletPoints: [
      "Official background verification responses dispatched within 24 business hours",
      "Detailed grading breakdown: Distinction (Grade A+), Merit (Grade A), or Standard",
      "Comprehensive list of verified technical competencies and frameworks",
      "Direct email channel: hr@internvisiontech.me",
    ],
    ctaLabel: "Contact Recruiter Desk",
    ctaHref: "mailto:hr@internvisiontech.me",
  },
];

export function AppleCertificateShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<AppleCardItem | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 border-t border-ink-800/80 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-600/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative">
        {/* Apple Style Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <FadeIn delay={0.05} direction="up">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 border border-brand-500/20 inline-block">
                Credential Integrity & Security
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Verify Credentials.
              </h2>
              <p className="text-ink-400 text-sm sm:text-base max-w-xl">
                Explore the cryptographic principles, code review standards, and verified registries that make InternVision credentials industry-trusted.
              </p>
            </div>
          </FadeIn>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll Left"
              className="w-11 h-11 rounded-full bg-ink-900/80 hover:bg-ink-800 text-ink-300 hover:text-white border border-ink-700/80 hover:border-ink-600 flex items-center justify-center transition-all active:scale-95 shadow-md backdrop-blur-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll Right"
              className="w-11 h-11 rounded-full bg-ink-900/80 hover:bg-ink-800 text-ink-300 hover:text-white border border-ink-700/80 hover:border-ink-600 flex items-center justify-center transition-all active:scale-95 shadow-md backdrop-blur-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container (Apple style smooth horizontal snap scroll) */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CARDS.map((card, index) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="snap-start shrink-0 w-[300px] sm:w-[360px] h-[520px] sm:h-[560px] rounded-[32px] bg-gradient-to-b from-[#18181b] to-[#09090b] border border-white/10 hover:border-brand-500/50 p-7 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] select-none"
            >
              {/* Background Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Card Header Content */}
              <div className="space-y-2.5 z-10 relative">
                <span className="text-[11px] font-bold text-ink-400 uppercase tracking-widest block">
                  {card.category}
                </span>
                <h3 className="text-2xl sm:text-[26px] font-black text-white leading-tight tracking-tight">
                  {card.headline}
                </h3>
                <p className="text-xs sm:text-sm text-ink-300 leading-relaxed font-normal">
                  {card.subheadline}
                </p>
              </div>

              {/* Card Graphic/Illustration */}
              <div className="relative w-full h-[250px] sm:h-[280px] my-auto flex items-center justify-center z-10">
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 group-hover:border-white/20 transition-all duration-500 shadow-inner">
                  <Image
                    src={card.image}
                    alt={card.headline}
                    fill
                    sizes="(max-width: 640px) 300px, 360px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Card Footer with Apple-Style Plus Button */}
              <div className="flex items-center justify-between z-10 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {card.tag}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCard(card);
                  }}
                  aria-label={`Learn more about ${card.headline}`}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md"
                >
                  <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apple-Style Interactive Detail Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-[#121215] border border-white/15 max-w-2xl w-full rounded-[28px] p-6 sm:p-10 space-y-6 relative shadow-2xl overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              aria-label="Close modal"
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-ink-800/80 hover:bg-ink-700 text-ink-300 hover:text-white flex items-center justify-center border border-ink-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pr-10">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-brand-400 uppercase tracking-widest bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
                  {selectedCard.tag}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {selectedCard.modalTitle}
              </h3>
              <p className="text-sm font-semibold text-brand-300">
                {selectedCard.modalSubtitle}
              </p>
            </div>

            {/* Modal Image Preview */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <Image
                src={selectedCard.image}
                alt={selectedCard.modalTitle}
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Modal Description */}
            <p className="text-sm text-ink-300 leading-relaxed">
              {selectedCard.modalDescription}
            </p>

            {/* Bullet Points */}
            <div className="bg-ink-950/70 p-5 rounded-2xl border border-ink-800 space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Key Technical Highlights:
              </span>
              <ul className="space-y-2 text-xs text-ink-300">
                {selectedCard.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-ink-800/80">
              <div className="text-[11px] text-ink-500">
                InternVision Cryptographic Registry Standards · 2026
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-ink-300 hover:text-white rounded-xl text-xs font-bold border border-ink-700 transition"
                >
                  Close
                </button>
                {selectedCard.ctaLabel && (
                  <Link
                    href={selectedCard.ctaHref || "/courses"}
                    onClick={() => setSelectedCard(null)}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-brand-600/30"
                  >
                    {selectedCard.ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AppleCertificateShowcase;
