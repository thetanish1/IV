"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  Building2,
  BookOpen,
  Calendar,
  Code,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  UploadCloud,
  FileText,
  Trash2,
  Link2,
  Code2,
  Globe,
  MapPin,
  Sparkles,
  Lock,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";
import UserAuthModal from "@/components/UserAuthModal";
import { UserAuthData } from "@/types";
import {
  signInWithGooglePopup,
  signInWithEmail,
  registerWithEmail,
} from "@/lib/firebase";

export default function InternshipApplyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAuthData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Inline Sign-In Gate State (when not signed in)
  const [authTab, setAuthTab] = useState<"google" | "email">("google");
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Application Form State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    college: "",
    degree: "",
    year_of_study: "3rd Year",
    cgpa: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    skills: "Python, React, Machine Learning, FastAPI, PostgreSQL",
    experience_description: "",
    cover_letter: "",
    role_preference: "AI & Machine Learning Engineering",
    duration: "3 Months",
    resume_filename: "",
    resume_original_name: "",
  });

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState("");

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api"
  ).replace(/\/$/, "");

  // Sync authenticated user with backend Supabase database
  const syncWithBackend = async (
    userEmail: string,
    userName: string,
    userPic?: string | null,
    provider: string = "google"
  ): Promise<UserAuthData> => {
    try {
      const res = await fetch(`${apiBase}/auth/user/firebase-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          full_name: userName,
          picture: userPic || null,
          provider: provider,
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }

    return {
      access_token: "firebase_" + Date.now(),
      token_type: "bearer",
      user_email: userEmail,
      user_name: userName,
      user_picture: userPic || undefined,
      role: "user",
    };
  };

  // Check auth state on load
  const loadUserAuth = () => {
    const token = localStorage.getItem("user_token");
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");
    const picture = localStorage.getItem("user_picture");

    if (token && email) {
      const user: UserAuthData = {
        access_token: token,
        token_type: "bearer",
        user_email: email,
        user_name: name || email.split("@")[0],
        user_picture: picture,
      };
      setCurrentUser(user);
      setFormData((prev) => ({
        ...prev,
        email: email,
        full_name: prev.full_name || name || email.split("@")[0],
      }));
    } else {
      setCurrentUser(null);
    }
    setAuthChecked(true);
  };

  useEffect(() => {
    loadUserAuth();
    window.addEventListener("user-auth-change", loadUserAuth);
    return () => window.removeEventListener("user-auth-change", loadUserAuth);
  }, []);

  const handleGoogleSignInInline = async () => {
    setGoogleLoading(true);
    setAuthError("");
    try {
      const user = await signInWithGooglePopup();
      const userEmail = user.email || "";
      const userName = user.displayName || userEmail.split("@")[0];
      const userPic = user.photoURL || null;

      const authData = await syncWithBackend(userEmail, userName, userPic, "google");

      localStorage.setItem("user_token", authData.access_token);
      localStorage.setItem("user_email", authData.user_email);
      localStorage.setItem("user_name", authData.user_name);
      if (authData.user_picture) localStorage.setItem("user_picture", authData.user_picture);

      setCurrentUser(authData);
      setFormData((prev) => ({
        ...prev,
        email: authData.user_email,
        full_name: prev.full_name || authData.user_name,
      }));

      window.dispatchEvent(new Event("user-auth-change"));
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setAuthError("Google sign-in popup was closed before completing.");
      } else {
        setAuthError(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuthInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please fill in both email and password.");
      return;
    }
    if (emailMode === "register" && !authFullName) {
      setAuthError("Please enter your full name.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      let firebaseUser;
      if (emailMode === "register") {
        firebaseUser = await registerWithEmail(authEmail, authPassword, authFullName);
      } else {
        firebaseUser = await signInWithEmail(authEmail, authPassword);
      }

      const userEmail = firebaseUser.email || authEmail.trim();
      const userName = firebaseUser.displayName || authFullName || userEmail.split("@")[0];

      const authData = await syncWithBackend(userEmail, userName, null, "email");

      localStorage.setItem("user_token", authData.access_token);
      localStorage.setItem("user_email", authData.user_email);
      localStorage.setItem("user_name", authData.user_name);

      setCurrentUser(authData);
      setFormData((prev) => ({
        ...prev,
        email: authData.user_email,
        full_name: prev.full_name || authData.user_name,
      }));

      window.dispatchEvent(new Event("user-auth-change"));
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setAuthError("Invalid email or password. If you are new, please switch to Register.");
      } else if (err.code === "auth/email-already-in-use") {
        setAuthError("An account already exists with this email. Please switch to Sign In.");
      } else {
        setAuthError(err.message || "Authentication failed. Please verify your credentials.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_picture");
    setCurrentUser(null);
    window.dispatchEvent(new Event("user-auth-change"));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setResumeUploadError("File size exceeds 10MB limit. Please upload a smaller PDF/DOC.");
      return;
    }

    setUploadingResume(true);
    setResumeUploadError("");

    try {
      const bodyData = new FormData();
      bodyData.append("file", file);

      const res = await fetch(`${apiBase}/applications/upload-resume`, {
        method: "POST",
        body: bodyData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || "Failed to upload resume");
      }

      const result = await res.json();
      setFormData((prev) => ({
        ...prev,
        resume_filename: result.filename,
        resume_original_name: file.name,
      }));
    } catch (err: any) {
      setResumeUploadError(err.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setFormData((prev) => ({
      ...prev,
      resume_filename: "",
      resume_original_name: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!formData.resume_filename) {
      setResumeUploadError("Please upload your resume (PDF or DOC) before submitting.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await apiRequest("/applications", {
        method: "POST",
        body: JSON.stringify({
          google_email: currentUser.user_email,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          degree: formData.degree,
          year_of_study: formData.year_of_study,
          skills: skillsArray.length > 0 ? skillsArray : ["AI & ML Engineering", "Full Stack Development"],
          duration: formData.duration,
          role_preference: formData.role_preference,
          linkedin_url: formData.linkedin_url || undefined,
          github_url: formData.github_url || undefined,
          portfolio_url: formData.portfolio_url || undefined,
          experience_description: formData.experience_description || undefined,
          cover_letter: formData.cover_letter || undefined,
          resume_filename: formData.resume_filename || undefined,
        }),
      });

      router.push(
        `/success?type=application&name=${encodeURIComponent(
          formData.full_name
        )}&duration=${encodeURIComponent(formData.duration)}`
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit application. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <UserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setFormData((prev) => ({
            ...prev,
            email: user.user_email,
            full_name: prev.full_name || user.user_name,
          }));
        }}
      />

      {/* HEADER */}
      <FadeIn delay={0.05} direction="up">
        <div className="text-left space-y-4 max-w-3xl border-l-8 border-brand-500 pl-6 sm:pl-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500 text-white text-xs font-bold uppercase tracking-widest shadow-[2px_2px_0px_#1a1915]">
            <GraduationCap className="w-4 h-4" />
            Virtual Pre-Hire Internship Program 2026
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-[0.95]">
            Apply For <span className="text-brand-400">Virtual Internship</span>
          </h1>
          <p className="text-ink-300 text-base sm:text-lg font-medium pt-2 max-w-2xl leading-relaxed">
            Join our 100% remote engineering track. Work on real production software with 1:1 senior developer mentorship, resume coaching, and verified completion credentials.
          </p>
        </div>
      </FadeIn>

      {/* MANDATORY SIGN-IN GATE */}
      {authChecked && !currentUser && (
        <FadeIn delay={0.1} direction="up">
          <div className="bg-ink-950 border-2 border-brand-500 p-6 sm:p-10 shadow-[10px_10px_0px_#1a1915] space-y-8">
            <div className="space-y-2 border-b border-ink-800 pb-5">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> InternVision Tech
                </div>
                <span className="text-xs text-ink-400 font-semibold">Firebase Authentication</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sign In to Begin Application
              </h2>
              <p className="text-ink-300 text-sm">
                Sign in with Google (no password required) or use your Email & Password to unlock the application form.
              </p>
            </div>

            {authError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {authError}
              </div>
            )}

            <div className="space-y-6 max-w-md mx-auto">
              <div className="grid grid-cols-2 p-1 bg-ink-900 border border-ink-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthTab("google"); setAuthError(""); }}
                  className={`py-2.5 text-center transition ${
                    authTab === "google" ? "bg-brand-600 text-white" : "text-ink-400 hover:text-white"
                  }`}
                >
                  Sign in with Google
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab("email"); setAuthError(""); }}
                  className={`py-2.5 text-center transition ${
                    authTab === "email" ? "bg-brand-600 text-white" : "text-ink-400 hover:text-white"
                  }`}
                >
                  Email & Password
                </button>
              </div>

              {authTab === "google" ? (
                <div className="space-y-5 text-left">
                  <div className="p-4 bg-ink-900 border border-ink-800 text-xs text-ink-300 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand-400" /> 1-Click Secure Google Sign-In:
                    </div>
                    <p className="text-ink-400 text-xs">
                      Sign in directly with your Google account. No separate password needed or stored.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignInInline}
                    disabled={googleLoading}
                    className="w-full py-4 px-6 bg-white hover:bg-ink-100 text-black font-bold text-base flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 shadow-[4px_4px_0px_#1a1915] border border-ink-300 disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                        Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        Continue with Google <ArrowRight className="w-5 h-5 text-black" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailAuthInline} className="space-y-4 text-left">
                  <div className="flex justify-between items-center text-xs pb-1">
                    <span className="text-ink-400">
                      {emailMode === "login" ? "Don't have an account?" : "Already have an account?"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode(emailMode === "login" ? "register" : "login");
                        setAuthError("");
                      }}
                      className="text-brand-400 font-bold hover:underline"
                    >
                      {emailMode === "login" ? "Create Account" : "Sign In"}
                    </button>
                  </div>

                  {emailMode === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-400" /> Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brand-400" /> Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-base flex items-center justify-center gap-2 transition shadow-[4px_4px_0px_#ffffff] disabled:opacity-50"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                      </>
                    ) : (
                      <>
                        {emailMode === "login" ? "Sign In & Unlock Application" : "Register & Unlock Application"}{" "}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </FadeIn>
      )}

      {/* VERIFIED APPLICANT STATUS BAR */}
      {currentUser && (
        <FadeIn delay={0.08} direction="up">
          <div className="p-4 bg-ink-900 border border-brand-500/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-ink-400 font-medium">Logged in as verified applicant:</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {currentUser.user_name} <span className="text-brand-400 font-normal">({currentUser.user_email})</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="text-xs font-semibold text-ink-300 hover:text-white underline"
              >
                Switch Account
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white text-xs font-semibold rounded flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* APPLICATION FORM */}
      <div className={`relative transition-all duration-300 ${!currentUser ? "opacity-30 pointer-events-none filter blur-[1px]" : ""}`}>
        <form onSubmit={handleSubmit} className="bg-ink-950 border border-ink-800 p-6 sm:p-10 space-y-10 shadow-2xl">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* SECTION 1: PERSONAL DETAILS */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 border-b border-ink-800 pb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> 1. Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-400" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="aarav.sharma@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-400" /> Phone Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" /> Current City / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagpur, Mumbai, or Remote / Virtual"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMIC BACKGROUND */}
          <div className="space-y-5 pt-6 border-t border-ink-800/80">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 border-b border-ink-800 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> 2. Academic Background
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-400" /> College / University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Indian Institute of Technology / VNIT Nagpur"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-400" /> Degree & Branch *
                </label>
                <input
                  type="text"
                  required
                  placeholder="B.Tech Computer Science / BCA / AI & DS"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" /> Current Year of Study *
                </label>
                <select
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition cursor-pointer"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduated">Graduated / Recent Passout</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-400" /> CGPA / Percentage (Optional)
                </label>
                <input
                  type="text"
                  placeholder="8.5 CGPA / 82%"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PROFESSIONAL LINKS */}
          <div className="space-y-5 pt-6 border-t border-ink-800/80">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 border-b border-ink-800 pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 3. Professional Profiles & Portfolio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-brand-400" /> LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-brand-400" /> GitHub URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-400" /> Portfolio / Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.dev"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: PROFESSIONAL EXPERIENCE & SKILLS */}
          <div className="space-y-5 pt-6 border-t border-ink-800/80">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 border-b border-ink-800 pb-2 flex items-center gap-2">
              <Code className="w-4 h-4" /> 4. Professional Experience & Skills
            </h3>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-brand-400" /> Technical Skills (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Python, PyTorch, LLMs, React, Next.js, FastAPI, Docker, PostgreSQL"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-400" /> Experience & Projects Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your prior coding experience, AI/ML models built, web applications deployed, or technical problem solving..."
                  value={formData.experience_description}
                  onChange={(e) => setFormData({ ...formData, experience_description: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 p-4 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Statement of Purpose / Why InternVision Tech?
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us why you want to join our Virtual Internship Program and what goals you want to accomplish..."
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 p-4 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: RESUME UPLOAD */}
          <div className="space-y-5 pt-6 border-t border-ink-800/80">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 border-b border-ink-800 pb-2 flex items-center gap-2">
              <UploadCloud className="w-4 h-4" /> 5. Resume Upload *
            </h3>

            {resumeUploadError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {resumeUploadError}
              </div>
            )}

            {formData.resume_filename ? (
              <div className="p-4 bg-ink-900 border border-brand-500/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-500/20 text-brand-400 rounded flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{formData.resume_original_name || "Uploaded Resume"}</div>
                    <div className="text-xs text-brand-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded & Ready for review
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="p-2 text-ink-400 hover:text-red-400 transition"
                  title="Remove and upload different resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  uploadingResume
                    ? "border-brand-500 bg-brand-500/5"
                    : "border-ink-700 bg-ink-900/40 hover:border-brand-500 hover:bg-ink-900"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeUpload}
                  className="hidden"
                />

                {uploadingResume ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                    <p className="text-sm font-semibold text-white">Uploading resume securely...</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-ink-800 border border-ink-700 text-brand-400 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Click or Drag & Drop your Resume here</p>
                      <p className="text-xs text-ink-400 mt-1">Accepted formats: PDF, DOC, DOCX (Max 10MB)</p>
                    </div>
                    <span className="px-3 py-1 bg-ink-800 text-brand-400 text-xs font-semibold rounded border border-ink-700">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 6: TRACK & DURATION PREFERENCE */}
          <div className="space-y-5 pt-6 border-t border-ink-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-800 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 6. Internship Track & Mode Preference
              </h3>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                ✦ Virtual Internship (100% Remote)
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-brand-400" /> Preferred Engineering Track *
                </label>
                <select
                  value={formData.role_preference}
                  onChange={(e) => setFormData({ ...formData, role_preference: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition cursor-pointer"
                >
                  <option value="AI & Machine Learning Engineering">AI & Machine Learning Engineering (PyTorch, LangChain & LLMs)</option>
                  <option value="Full Stack Web Development">Full Stack Web Development (Next.js 15, React 19 & FastAPI)</option>
                  <option value="Backend Engineering">Backend Engineering (FastAPI, Python, Spring Boot & PostgreSQL)</option>
                  <option value="Frontend Engineering">Frontend Engineering (React, TypeScript & Tailwind CSS)</option>
                  <option value="Cloud DevOps & Kubernetes">Cloud DevOps & Kubernetes (Docker, AWS & CI/CD)</option>
                  <option value="Cyber Security & Ethical Hacking">Cyber Security & Ethical Hacking</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-ink-300 font-medium">Program Duration *</label>
                <div className="grid grid-cols-3 gap-3">
                  {["1 Month", "3 Months", "6 Months"].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: dur })}
                      className={`py-3 px-4 text-xs font-bold transition border ${
                        formData.duration === dur
                          ? "bg-brand-600 text-white border-brand-500 shadow-[2px_2px_0px_#ffffff]"
                          : "bg-ink-900 text-ink-400 border-ink-800 hover:text-white"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 font-black text-base uppercase tracking-wider bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-3 transition shadow-[6px_6px_0px_#ffffff] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting Virtual Internship Application...
              </>
            ) : (
              <>
                Submit Virtual Internship Application <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
