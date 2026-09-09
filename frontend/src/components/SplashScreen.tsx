"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Only show once per session or on direct fresh visit
    const hasSeenSplash = sessionStorage.getItem("iv_splash_seen");
    if (hasSeenSplash) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("iv_splash_seen", "true");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07090e] overflow-hidden select-none pointer-events-auto"
        >
          {/* Ambient Background Graphic */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-bg.png"
              alt="InternVision Splash"
              fill
              priority
              className="object-cover object-center opacity-40 scale-105 filter blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]" />
          </div>

          {/* Center Brand Identity */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-5 px-6 text-center"
          >
            {/* 3D Glowing Sphere Logo */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full bg-brand-500/20 blur-2xl animate-pulse" />
              <Image
                src="/logo.png"
                alt="InternVision Logo"
                width={84}
                height={84}
                priority
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_10px_25px_rgba(37,99,235,0.6)]"
              />
            </div>

            {/* Typography */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <span>InternVision</span>
                <span className="text-brand-400">Tech</span>
              </h1>
              <p className="text-xs sm:text-sm text-ink-300 font-medium tracking-wide">
                Virtual Pre-Hire Internship Program
              </p>
            </div>

            {/* Futuristic Mini Progress Bar */}
            <div className="w-44 h-1 bg-white/10 rounded-full overflow-hidden mt-2 relative">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="w-full h-full bg-gradient-to-r from-brand-600 via-blue-400 to-brand-500 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
