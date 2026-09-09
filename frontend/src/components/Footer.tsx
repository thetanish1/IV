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
    try {
      const data = await apiRequest<{ show_courses?: boolean | string; show_careers?: boolean | string }>("/settings");
      if (data) {
        setSettings({
          show_courses: data.show_courses === true || data.show_courses === "true",
          show_careers: data.show_careers === true || data.show_careers === "true",
        });
      }
    } catch {
      // fallback defaults
    }
  };

  useEffect(() => {
    fetchSettings();
    window.addEventListener("site-settings-changed", fetchSettings);
    return () => window.removeEventListener("site-settings-changed", fetchSettings);
  }, []);

  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-ink-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
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
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              {settings.show_courses && (
                <li><Link href="/courses" className="hover:text-white transition text-brand-400 hover:text-brand-300">Course Catalog</Link></li>
              )}
              <li><Link href="/apply" className="hover:text-white transition">Internship Application</Link></li>
              <li><Link href="/verify-certificate" className="hover:text-white transition flex items-center gap-1.5"><span className="text-brand-400">✓</span> Certificate Verification</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Programs</h4>
            <ul className="space-y-2">
              <li><Link href="/apply" className="hover:text-white transition">1 Month Foundation</Link></li>
              <li><Link href="/apply" className="hover:text-white transition">3 Months Advanced Track</Link></li>
              <li><Link href="/apply" className="hover:text-white transition">6 Months Industrial Co-Op</Link></li>
              <li><Link href="/portal" className="hover:text-white transition text-brand-400">Student Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-wider">Legal & Policies</h4>
            <ul className="space-y-2 mb-5">
              <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/rules" className="hover:text-white transition">Internship Rules</Link></li>
              <li><Link href="/agreement" className="hover:text-white transition">Student Agreement</Link></li>
            </ul>

            <h4 className="font-semibold text-white mb-2 text-xs uppercase tracking-wider">Connect</h4>
            <div className="flex gap-2.5 mb-4">
              <a href="mailto:internvisiontechhr@gmail.com" title="Email HR" className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center hover:bg-ink-800 hover:text-brand-400 transition">
                <Mail className="w-4 h-4" />
              </a>
              <Link href="/contact" title="Support Helpdesk" className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center hover:bg-ink-800 hover:text-brand-400 transition">
                <MessageCircle className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-[11px] text-ink-500">© 2026 InternVision Tech Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

