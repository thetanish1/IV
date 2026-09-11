"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ExternalLink, MessageCircle, Users, Mail } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function Footer() {
  const [settings, setSettings] = useState<{ show_courses: boolean; show_careers: boolean }>({
    show_courses: false,
    show_careers: false,
  });

  const fetchSettings = async () => {
    if (typeof window !== "undefined") {
      const cachedCourses = localStorage.getItem("show_courses");
      const cachedCareers = localStorage.getItem("show_careers");
      if (cachedCourses !== null || cachedCareers !== null) {
        setSettings({
          show_courses: cachedCourses === "true",
          show_careers: cachedCareers === "true",
        });
      }
    }
    try {
      const data = await apiRequest<{ show_courses?: boolean | string; show_careers?: boolean | string }>(
        `/settings?_t=${Date.now()}`
      );
      if (data) {
        const cVal = data.show_courses === true || data.show_courses === "true";
        const carVal = data.show_careers === true || data.show_careers === "true";
        setSettings({
          show_courses: cVal,
          show_careers: carVal,
        });
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("show_courses", String(cVal));
            localStorage.setItem("show_careers", String(carVal));
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
        setSettings({
          show_courses: Boolean(e.detail.show_courses),
          show_careers: Boolean(e.detail.show_careers),
        });
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
            <div className="flex gap-2.5 pt-1">
              <a
                href="mailto:support@internvisiontech.me"
                title="Email Support"
                className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-ink-400 hover:text-white hover:bg-ink-800 hover:border-ink-700 transition"
              >
                <Mail className="w-4 h-4" />
              </a>
              <Link
                href="/contact"
                title="Support Helpdesk"
                className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-ink-400 hover:text-white hover:bg-ink-800 hover:border-ink-700 transition"
              >
                <MessageCircle className="w-4 h-4" />
              </Link>
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
              <li><Link href="/verify-certificate" className="hover:text-white transition flex items-center gap-1.5"><span className="text-brand-400">✓</span> Certificate Verification</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Support</Link></li>
            </ul>
          </div>

          {/* Col 3: Programs */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Programs</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/apply" className="hover:text-white transition">1 Month Foundation</Link></li>
              <li><Link href="/apply" className="hover:text-white transition">3 Months Advanced Track</Link></li>
              <li><Link href="/apply" className="hover:text-white transition">6 Months Industrial Co-Op</Link></li>
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

          {/* Col 5: Official Contacts (Dedicated Right Column) */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Official Contacts</h4>
            <div className="space-y-2 text-xs text-ink-300">
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">Support Desk</span>
                <a href="mailto:support@internvisiontech.me" className="text-brand-400 hover:underline font-mono text-xs">
                  support@internvisiontech.me
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">HR & Internships</span>
                <a href="mailto:hr@internvisiontech.me" className="text-brand-400 hover:underline font-mono text-xs">
                  hr@internvisiontech.me
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">Billing & Accounts</span>
                <a href="mailto:billing@internvisiontech.me" className="text-brand-400 hover:underline font-mono text-xs">
                  billing@internvisiontech.me
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-ink-500 uppercase tracking-wide">General Inquiries</span>
                <a href="mailto:contact@internvisiontech.me" className="text-brand-400 hover:underline font-mono text-xs">
                  contact@internvisiontech.me
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-ink-900 pt-8 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500">
          <p>© 2026 InternVision Tech Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
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

