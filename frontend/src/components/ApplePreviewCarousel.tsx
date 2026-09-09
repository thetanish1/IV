"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

interface AppleSlide {
  id: string;
  badge: string;
  title: string;
  lead: string;
  description: string;
  image: string;
  link: string;
}

const APPLE_SLIDES: AppleSlide[] = [
  {
    id: "courses",
    badge: "Course Catalog",
    title: "Industry-Grade Bootcamps.",
    lead: "Master production technologies.",
    description: "Deep-dive into Full-Stack Web Development, AI/ML Engineering, and Cloud DevOps with real GitHub code reviews and live projects.",
    image: "/preview-courses.jpg",
    link: "/courses",
  },
  {
    id: "verify",
    badge: "Instant Verification",
    title: "Verifiable Digital Credentials.",
    lead: "Cryptographic validation.",
    description: "Instant QR & Certificate ID authenticity checking trusted by tech companies, hiring managers, and verified LinkedIn profiles.",
    image: "/preview-verify.jpg",
    link: "/verify-certificate",
  },
  {
    id: "apply",
    badge: "Internship Track",
    title: "Virtual Internship Portal.",
    lead: "1-Click fast onboarding.",
    description: "Flexible 1, 3, or 6-month durations across 9 high-demand engineering tracks with weekly task milestones and mentor evaluations.",
    image: "/preview-apply.jpg",
    link: "/apply",
  },
  {
    id: "contact",
    badge: "Mentorship & Community",
    title: "24/7 Engineering Support.",
    lead: "Direct senior guidance.",
    description: "Dedicated Discord community, 1:1 technical doubt resolution, resume optimization, and mock technical interview sessions.",
    image: "/preview-contact.jpg",
    link: "/contact",
  },
];

export default function ApplePreviewCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-advance every 4.5 seconds when not hovering
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % APPLE_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + APPLE_SLIDES.length) % APPLE_SLIDES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % APPLE_SLIDES.length);
  };

  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cards Viewport */}
      <div className="relative overflow-hidden pt-4 pb-8">
        <motion.div
          animate={{ x: `-${activeIndex * 100}%` }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full"
        >
          {APPLE_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="w-full shrink-0 px-2 sm:px-4"
            >
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Apple-style Curved Screenshot Container */}
                <div className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-ink-950 border border-ink-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] group">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={idx === 0}
                    quality={90}
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-103"
                  />
                  {/* Subtle glassmorphism gloss */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/[0.03] pointer-events-none" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-lg">
                      <Sparkles className="w-3 h-3 text-brand-400" />
                      {slide.badge}
                    </span>
                  </div>
                </div>

                {/* Apple-Style Text Block Underneath Screenshot */}
                <div className="text-left space-y-2 max-w-3xl pt-1">
                  <p className="text-base sm:text-lg md:text-xl text-ink-100 leading-relaxed font-normal">
                    <strong className="font-bold text-white tracking-tight">{slide.title} </strong>
                    <span className="text-ink-200">{slide.lead} </span>
                    <span className="text-ink-400">{slide.description}</span>
                  </p>

                  <div className="pt-2">
                    <Link
                      href={slide.link}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors group"
                    >
                      Explore {slide.badge}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Controls (Apple Circular Arrows & Progress Dots) */}
      <div className="flex items-center justify-between max-w-4xl mx-auto pt-2 px-2 sm:px-4">
        {/* Progress Indicator Pills */}
        <div className="flex items-center gap-2">
          {APPLE_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-8 bg-brand-500" : "w-2 bg-ink-800 hover:bg-ink-600"
              }`}
            />
          ))}
        </div>

        {/* Circular Arrow Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="p-2.5 sm:p-3 rounded-full bg-ink-900/90 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="p-2.5 sm:p-3 rounded-full bg-ink-900/90 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
