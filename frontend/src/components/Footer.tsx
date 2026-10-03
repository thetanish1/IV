"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ExternalLink, MessageCircle, Users, Mail, Globe } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function Footer() {
  const [settings, setSettings] = useState<{ show_courses: boolean; show_careers: boolean; show_sessions: boolean }>({
    show_courses: false,
    show_careers: false,
    show_sessions: true,
  });

  const fetchSettings = async () => {
    if (typeof window !== "undefined") {
      const cachedCourses = localStorage.getItem("show_courses");
      const cachedCareers = localStorage.getItem("show_careers");
      const cachedSessions = localStorage.getItem("show_sessions");
      if (cachedCourses !== null || cachedCareers !== null || cachedSessions !== null) {
        setSettings({
          show_courses: cachedCourses === "true",
          show_careers: cachedCareers === "true",
          show_sessions: cachedSessions !== "false",
        });
      }
    }
    try {
      const data = await apiRequest<{
        show_courses?: boolean | string;
        show_careers?: boolean | string;
        show_sessions?: boolean | string;
      }>(
        `/settings?_t=${Date.now()}`
      );
      if (data) {
        const cVal = data.show_courses === true || data.show_courses === "true";
        const carVal = data.show_careers === true || data.show_careers === "true";
        const sVal = data.show_sessions !== false && data.show_sessions !== "false";
        setSettings({
          show_courses: cVal,
          show_careers: carVal,
          show_sessions: sVal,
        });
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("show_courses", String(cVal));
            localStorage.setItem("show_careers", String(carVal));
            localStorage.setItem("show_sessions", String(sVal));
          } catch {}
        }
      }
    } catch {
      // fallback defaults
    }
  };

  useEffect(() => {
    fetchSettings();
    const handleSettingsEvent = (e: any) => {
      if (e?.detail) {
        setSettings((prev) => ({
          show_courses: typeof e.detail.show_courses !== "undefined" ? Boolean(e.detail.show_courses) : prev.show_courses,
          show_careers: typeof e.detail.show_careers !== "undefined" ? Boolean(e.detail.show_careers) : prev.show_careers,
          show_sessions: typeof e.detail.show_sessions !== "undefined" ? Boolean(e.detail.show_sessions) : prev.show_sessions,
        }));
      } else {
        fetchSettings();
      }
    };
    window.addEventListener("site-settings-changed", handleSettingsEvent);
    window.addEventListener("storage", fetchSettings);
    return () => {
      window.removeEventListener("site-settings-changed", handleSettingsEvent);
      window.removeEventListener("storage", fetchSettings);
    };
  }, []);

  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-ink-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white group">
              <div className="relative flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="InternVision Tech Logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <span className="flex items-center gap-1">
                InternVision <span className="text-brand-400">Tech</span>
              </span>
            </Link>
            <p className="text-ink-400 text-xs leading-relaxed">
              Empowering students with industry-grade software engineering bootcamps, hands-on internships, and career placement mentorship.
            </p>
            {/* Social Media & Contact Icons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href="https://www.linkedin.com/company/internvision-tech"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn: InternVision Tech"
                className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-ink-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@InternVisionTech"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube: @InternVisionTech"
                className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-ink-300 hover:text-white hover:bg-red-600 hover:border-red-500 transition shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/internvisiontech/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram: @internvisiontech"
                className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-ink-300 hover:text-white hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 hover:border-pink-500 transition shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.internvisiontech.me/"
                target="_blank"
                rel="noopener noreferrer"
                title="Official Website: internvisiontech.me"
                className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-ink-300 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 transition shadow-sm"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="mailto:hr@internvisiontech.me"
                title="HR & Careers: hr@internvisiontech.me"
                className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-ink-300 hover:text-white hover:bg-brand-600 hover:border-brand-500 transition shadow-sm"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              {settings.show_courses && (
                <li><Link href="/courses" className="hover:text-white transition text-brand-400 hover:text-brand-300">Course Catalog</Link></li>
              )}
              <li><Link href="/apply" className="hover:text-white transition">Internship Application</Link></li>
              {settings.show_sessions && (
                <li><Link href="/sessions" className="hover:text-white transition text-brand-400 font-medium">Book Session</Link></li>
              )}
              <li><Link href="/verify-certificate" className="hover:text-white transition flex items-center gap-1.5"><span className="text-brand-400">✓</span> Certificate Verification</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Support</Link></li>
            </ul>
          </div>

          {/* Col 3: Programs */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Programs</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/apply" className="hover:text-white transition">1 Month Foundation</Link></li>
              <li><Link href="/apply" className="hover:text-white transition">2 Months Project Track</Link></li>
              <li><Link href="/apply" className="hover:text-white transition">3 Months Advanced Track</Link></li>
              <li><Link href="/portal" className="hover:text-white transition text-brand-400 font-medium">Student Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Legal & Policies</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/rules" className="hover:text-white transition">Internship Rules</Link></li>
              <li><Link href="/agreement" className="hover:text-white transition">Student Agreement</Link></li>
            </ul>
          </div>

          {/* Col 5: Official Contacts & Social */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Official Contacts</h4>
            <div className="space-y-2.5 text-xs text-ink-300">
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">HR & Internships</span>
                <a href="mailto:hr@internvisiontech.me" className="text-brand-400 hover:underline font-mono text-xs flex items-center gap-1">
                  <Mail className="w-3 h-3 shrink-0" />
                  hr@internvisiontech.me
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">Official Website</span>
                <a href="https://www.internvisiontech.me/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-mono text-xs flex items-center gap-1">
                  <Globe className="w-3 h-3 shrink-0" />
                  internvisiontech.me
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">LinkedIn</span>
                <a href="https://www.linkedin.com/company/internvision-tech" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs flex items-center gap-1">
                  <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  internvision-tech
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">YouTube Channel</span>
                <a href="https://www.youtube.com/@InternVisionTech" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline text-xs flex items-center gap-1">
                  <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  @InternVisionTech
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">Instagram</span>
                <a href="https://www.instagram.com/internvisiontech/" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline text-xs flex items-center gap-1">
                  <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @internvisiontech
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-ink-900 pt-8 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500">
          <p>© 2026 InternVision Tech Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://www.linkedin.com/company/internvision-tech" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition flex items-center gap-1">
              LinkedIn
            </a>
            <a href="https://www.youtube.com/@InternVisionTech" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition flex items-center gap-1">
              YouTube
            </a>
            <a href="https://www.instagram.com/internvisiontech/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition flex items-center gap-1">
              Instagram
            </a>
            <Link href="/terms" className="hover:text-ink-300 transition">Terms</Link>
            <Link href="/rules" className="hover:text-ink-300 transition">Rules</Link>
            <Link href="/agreement" className="hover:text-ink-300 transition">Agreement</Link>
            <Link href="/contact" className="hover:text-ink-300 transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

