"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sparkles, BookOpen, GraduationCap, Phone, Shield, ShieldCheck, Menu, X, Home, Briefcase, User, LogOut, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAuthModal from "@/components/UserAuthModal";
import { apiRequest } from "@/lib/api-client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [settings, setSettings] = useState<{ show_courses: boolean; show_careers: boolean }>({
    show_courses: false,
    show_careers: false,
  });

  const fetchSettings = async () => {
    try {
      const data = await apiRequest<{ show_courses: boolean; show_careers: boolean }>("/settings");
      if (data) setSettings(data);
    } catch {
      // fallback defaults
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [pathname]);

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

  // 30-Second Automatic Login Popup if not logged in (strictly disabled on all /admin routes)
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setShowAuthModal(false);
      return;
    }

    const timer = setTimeout(() => {
      if (pathname.startsWith("/admin")) return;
      const token = localStorage.getItem("user_token");
      const email = localStorage.getItem("user_email");
      const dismissed = sessionStorage.getItem("auth_popup_dismissed");
      if (!token && !email && !dismissed) {
        setShowAuthModal(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    // Ensure scrolling is always enabled and any lingering modal/Razorpay backdrop is cleaned up on route change
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.querySelectorAll(".razorpay-container").forEach((el) => el.remove());
    if (pathname.startsWith("/admin")) {
      setShowAuthModal(false);
    }
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

  const handleCloseAuthModal = () => {
    sessionStorage.setItem("auth_popup_dismissed", "true");
    setShowAuthModal(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {!pathname.startsWith("/admin") && (
        <UserAuthModal
          isOpen={showAuthModal}
          onClose={handleCloseAuthModal}
          title="Sign In to InternVision Tech"
          subtitle="Sign in with Google or Email & Password to apply for Virtual Internships & access your student task portal."
          onSuccess={(userData) => {
            setUserEmail(userData.user_email);
            setUserName(userData.user_name);
            setShowAuthModal(false);
            if (pathname === "/" || pathname === "/apply") {
              router.push("/portal");
            }
          }}
        />
      )}

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
              href="/apply"
              className={`flex items-center gap-1.5 transition-colors ${
                isActive("/apply") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Internships
            </Link>

            {/* Student Portal Link (Prominent when logged in) */}
            {userEmail && (
              <Link
                href="/portal"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  isActive("/portal")
                    ? "bg-brand-500/20 text-brand-300 font-bold border border-brand-500/40"
                    : "text-brand-400 hover:text-brand-300 font-semibold"
                }`}
              >
                <Sparkles className="w-4 h-4 text-brand-400" />
                My Portal
              </Link>
            )}

            {/* Courses link shown ONLY if enabled in site_settings */}
            {settings.show_courses && (
              <Link
                href="/courses"
                className={`flex items-center gap-1.5 transition-colors ${
                  isActive("/courses") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Courses
              </Link>
            )}

            {/* Careers link shown ONLY if enabled in site_settings */}
            {settings.show_careers && (
              <Link
                href="/careers"
                className={`flex items-center gap-1.5 transition-colors ${
                  isActive("/careers") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Careers
              </Link>
            )}

            <Link
              href="/verify-certificate"
              className={`flex items-center gap-1.5 transition-colors ${
                isActive("/verify-certificate") ? "text-brand-400 font-semibold" : "text-ink-300 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Verify Certificate
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

            {/* User status badge or Login */}
            {userEmail ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/portal"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 hover:text-white text-xs font-medium transition rounded"
                  title="View Student Portal"
                >
                  <User className="w-3.5 h-3.5 text-brand-400" />
                  <span className="max-w-[120px] truncate">{userName || userEmail.split("@")[0]}</span>
                </Link>
                <button
                  onClick={handleUserLogout}
                  title="Sign Out"
                  className="p-1.5 bg-ink-900 hover:bg-ink-800 text-ink-400 hover:text-white border border-ink-700 transition rounded"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider bg-brand-600 hover:bg-brand-500 text-white transition hover:-translate-y-0.5 shadow-[2px_2px_0px_#ffffff]"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
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
                href="/apply"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 border border-ink-800 transition-colors ${
                  isActive("/apply")
                    ? "bg-brand-500/10 text-brand-400 font-semibold border-brand-500/20"
                    : "bg-ink-900 text-ink-300 hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Internships
              </Link>

              {userEmail && (
                <Link
                  href="/portal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 border border-ink-800 transition-colors ${
                    isActive("/portal")
                      ? "bg-brand-500/20 text-brand-300 font-bold border-brand-500/40"
                      : "bg-ink-900 text-brand-400 font-semibold hover:text-brand-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  My Internship Portal
                </Link>
              )}

              {settings.show_courses && (
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
              )}

              {settings.show_careers && (
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
              )}
              <Link
                href="/verify-certificate"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 border border-ink-800 transition-colors ${
                  isActive("/verify-certificate")
                    ? "bg-brand-500/10 text-brand-400 font-semibold border-brand-500/20"
                    : "bg-ink-900 text-ink-300 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Verify Certificate
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
                {userEmail ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleUserLogout();
                    }}
                    className="px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold bg-ink-900 text-ink-300 hover:text-white border border-ink-800 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out ({userName || userEmail.split("@")[0]})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold uppercase bg-brand-600 text-white transition"
                  >
                    <LogIn className="w-4 h-4" />
                    Login / Apply
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}


