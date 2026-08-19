"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sparkles, BookOpen, GraduationCap, Phone, Shield, Menu, X, Home, Briefcase, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const checkAuth = () => {
    // Check for Admin authentication
    const adminToken = localStorage.getItem("token");
    const adminEmail = localStorage.getItem("admin_email") || "";
    
    // Check if logged-in admin is tanishdewase222@gmail.com
    let isSuperAdmin = false;
    if (adminToken) {
      if (adminEmail.toLowerCase() === "tanishdewase222@gmail.com") {
        isSuperAdmin = true;
      } else {
        // Parse JWT payload without external library
        try {
          const parts = adminToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.sub && payload.sub.toLowerCase() === "tanishdewase222@gmail.com") {
              isSuperAdmin = true;
            }
          }
        } catch {
          // fallback
        }
      }
    }
    setIsAdmin(isSuperAdmin);

    // Check for Public User authentication
    const publicUserEmail = localStorage.getItem("user_email");
    const publicUserName = localStorage.getItem("user_name");
    setUserEmail(publicUserEmail);
    setUserName(publicUserName);
  };

  useEffect(() => {
    checkAuth();
    // Listen for custom login/logout events across tabs and modals
    window.addEventListener("storage", checkAuth);
    window.addEventListener("user-auth-change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("user-auth-change", checkAuth);
    };
  }, []);

  useEffect(() => {
    // Ensure scrolling is always enabled and any lingering modal/Razorpay backdrop is cleaned up on route change
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.querySelectorAll(".razorpay-container").forEach((el) => el.remove());
    checkAuth();
  }, [pathname]);

  const handleUserLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_picture");
    setUserEmail(null);
    setUserName(null);
    window.dispatchEvent(new Event("user-auth-change"));
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 glass-card border-b border-ink-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <div className="bg-white p-1 rounded-md flex items-center justify-center">
            <Image src="/logo.jpg" alt="InternVision Logo" width={160} height={40} className="h-7 w-auto object-contain" />
          </div>
          <span className="text-white tracking-wide">
            InternVision <span className="text-brand-400">Tech</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive("/") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/courses"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive("/courses") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Courses
          </Link>
          <Link
            href="/apply"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive("/apply") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Internship
          </Link>
          <Link
            href="/careers"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive("/careers") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Careers
          </Link>
          <Link
            href="/contact"
            className={`flex items-center gap-1.5 transition-colors ${
              isActive("/contact") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
            }`}
          >
            <Phone className="w-4 h-4" />
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Admin Portal is ONLY visible when logged in as tanishdewase222@gmail.com */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/40 transition rounded shadow-sm"
              title="Admin Portal (tanishdewase222@gmail.com)"
            >
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              Admin Portal
            </Link>
          )}

          {/* User status badge or Apply Now */}
          {userEmail ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 border border-ink-700 text-ink-300 text-xs font-medium">
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span className="max-w-[120px] truncate">{userName || userEmail.split("@")[0]}</span>
              </div>
              <button
                onClick={handleUserLogout}
                title="Sign Out"
                className="p-1.5 bg-ink-900 hover:bg-ink-800 text-ink-400 hover:text-white border border-ink-700 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/apply"
              className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition hover:-translate-y-0.5"
            >
              Apply Now
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-ink-300 hover:text-white transition"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-0 w-full bg-ink-950 border-b border-ink-800 shadow-2xl p-4 flex flex-col gap-3"
          >
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 border border-ink-800 transition-colors ${
                isActive("/")
                  ? "bg-brand-500/10 text-brand-400 font-semibold border-brand-500/20"
                  : "bg-ink-900 text-ink-300 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              href="/courses"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 border border-ink-800 transition-colors ${
                isActive("/courses")
                  ? "bg-brand-500/10 text-brand-400 font-semibold border-brand-500/20"
                  : "bg-ink-900 text-ink-300 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Courses
            </Link>
            <Link
              href="/apply"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 border border-ink-800 transition-colors ${
                isActive("/apply")
                  ? "bg-brand-500/10 text-brand-400 font-semibold border-brand-500/20"
                  : "bg-ink-900 text-ink-300 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Internship
            </Link>
            <Link
              href="/careers"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 border border-ink-800 transition-colors ${
                isActive("/careers")
                  ? "bg-brand-500/10 text-brand-400 font-semibold border-brand-500/20"
                  : "bg-ink-900 text-ink-300 hover:text-white"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Careers
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 border border-ink-800 transition-colors ${
                isActive("/contact")
                  ? "bg-brand-500/10 text-brand-400 font-semibold border-brand-500/20"
                  : "bg-ink-900 text-ink-300 hover:text-white"
              }`}
            >
              <Phone className="w-4 h-4" />
              Contact
            </Link>

            <div className="grid grid-cols-1 gap-3 pt-1">
              {/* Only show admin portal on mobile if logged in as tanishdewase222@gmail.com */}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-3 text-sm font-semibold bg-brand-600/20 text-brand-400 border border-brand-500/40 transition"
                >
                  <Shield className="w-4 h-4 text-brand-400" />
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/apply"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 flex items-center justify-center text-sm font-semibold bg-brand-600 text-white transition"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

