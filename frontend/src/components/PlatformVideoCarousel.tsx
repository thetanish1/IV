"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, ShieldCheck, Rocket, Phone } from "lucide-react";

interface VideoSlide {
  id: string;
  title: string;
  badge: string;
  icon: any;
  description: string;
  src: string;
}

const VIDEO_SLIDES: VideoSlide[] = [
  {
    id: "courses",
    title: "Course Catalog & Bootcamps",
    badge: "1. Courses Overview",
    icon: BookOpen,
    description: "Explore comprehensive learning tracks in Web Dev, AI/ML, Cloud DevOps, and Python.",
    src: "/courses-video.mp4",
  },
  {
    id: "verify",
    title: "Instant Certificate Verification",
    badge: "2. Verify Certificate",
    icon: ShieldCheck,
    description: "Live cryptographic credential validation trusted by top companies and recruiters.",
    src: "/verify-certificate.mp4",
  },
  {
    id: "apply",
    title: "Virtual Internship Application",
    badge: "3. Apply for Internship",
    icon: Rocket,
    description: "Streamlined 1-click application portal with immediate track allocation and onboarding.",
    src: "/apply-internship.mp4",
  },
  {
    id: "contact",
    title: "Contact & Mentorship Support",
    badge: "4. Student Support",
    icon: Phone,
    description: "24/7 Discord community support, 1:1 engineering reviews, and quick assistance.",
    src: "/contact.mp4",
  },
];

export default function PlatformVideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % VIDEO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + VIDEO_SLIDES.length) % VIDEO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % VIDEO_SLIDES.length);
  };

  const getSlidePosition = (index: number) => {
    const total = VIDEO_SLIDES.length;
    const diff = (index - currentIndex + total) % total;

    if (diff === 0) return "center";
    if (diff === 1 || (currentIndex === total - 1 && index === 0)) return "right";
    if (diff === total - 1 || (currentIndex === 0 && index === total - 1)) return "left";
    return "hidden";
  };

  return (
    <div className="relative w-full overflow-hidden py-6">
      {/* 3D Carousel Stage */}
      <div className="relative max-w-6xl mx-auto h-[260px] sm:h-[360px] md:h-[440px] flex items-center justify-center">
        {VIDEO_SLIDES.map((slide, index) => {
          const position = getSlidePosition(index);
          if (position === "hidden") return null;

          const isCenter = position === "center";
          const isLeft = position === "left";
          const isRight = position === "right";

          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{
                x: isCenter ? "0%" : isLeft ? "-45%" : "45%",
                scale: isCenter ? 1 : 0.82,
                opacity: isCenter ? 1 : 0.45,
                zIndex: isCenter ? 30 : 10,
                rotateY: isLeft ? 8 : isRight ? -8 : 0,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                if (isLeft) handlePrev();
                if (isRight) handleNext();
              }}
              className={`absolute w-[82%] sm:w-[68%] md:w-[58%] max-w-3xl aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer select-none transition-shadow ${
                isCenter
                  ? "border-2 border-brand-500 shadow-[0_0_40px_rgba(37,99,235,0.3)] bg-ink-950"
                  : "border border-ink-800 bg-ink-950 hover:opacity-75"
              }`}
            >
              {/* Video Element (100% Muted, Continuous Silent Loop, No Controls) */}
              <video
                src={slide.src}
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Center Slide Active Glow Border Mask */}
              {isCenter && (
                <div className="absolute inset-0 ring-1 ring-inset ring-brand-400/40 pointer-events-none rounded-2xl md:rounded-3xl" />
              )}
            </motion.div>
          );
        })}

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-6 z-40 p-2.5 sm:p-3 rounded-full bg-ink-950/80 hover:bg-brand-600 text-white border border-white/10 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-ink-950/80 hover:bg-brand-600 text-white border border-white/10 backdrop-blur-md transition-all hover:scale-110 shadow-xl"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Active Slide Info & Indicators */}
      <div className="max-w-xl mx-auto text-center space-y-3 pt-6 px-4">
        {/* Badge & Title */}
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
            {React.createElement(VIDEO_SLIDES[currentIndex].icon, { className: "w-3.5 h-3.5" })}
            {VIDEO_SLIDES[currentIndex].badge}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {VIDEO_SLIDES[currentIndex].title}
        </h3>

        <p className="text-xs sm:text-sm text-ink-300 max-w-md mx-auto leading-relaxed">
          {VIDEO_SLIDES[currentIndex].description}
        </p>

        {/* Dots Indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {VIDEO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === i
                  ? "w-8 bg-brand-500"
                  : "w-2 bg-ink-700 hover:bg-ink-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
