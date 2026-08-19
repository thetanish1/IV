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
  Key,
  Globe2,
  LogOut,
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";
import UserAuthModal from "@/components/UserAuthModal";
import { UserAuthData } from "@/types";

export default function InternshipApplyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineGoogleBtnRef = useRef<HTMLDivElement>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAuthData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Inline Sign-In Gate State (when not signed in)
  const [authStep, setAuthStep] = useState<"initial" | "password_step">("initial");
  const [authTab, setAuthTab] = useState<"google" | "direct">("google");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [googleCredential, setGoogleCredential] = useState("");
  const [googlePicture, setGooglePicture] = useState("");
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
    skills: "React, Next.js, Python, TypeScript",
    experience_description: "",
    cover_letter: "",
    role_preference: "Full Stack Web Development",
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

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

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

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // Initialize inline Google button when unauthenticated
  useEffect(() => {
    if (currentUser || !authChecked) return;
    if (!googleClientId || googleClientId.includes("<your")) return;

    const initGoogle = () => {
      if (window.google && inlineGoogleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(inlineGoogleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 320,
        });
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    }
  }, [currentUser, authChecked, authStep]);

  const handleGoogleCredential = async (response: { credential: string }) => {
    setGoogleLoading(true);
    setAuthError("");
    try {
      const payload = parseJwt(response.credential);
      const parsedEmail = payload?.email || "";
      const parsedName = payload?.name || parsedEmail.split("@")[0];
      const parsedPic = payload?.picture || "";

      setAuthEmail(parsedEmail);
      setAuthFullName(parsedName);
      setGooglePicture(parsedPic);
      setGoogleCredential(response.credential);

      // Move to password step
      setAuthStep("password_step");
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleMockGoogleLogin = () => {
    const inputEmail = prompt("Enter your Google Account email:", "student@gmail.com");
    if (!inputEmail) return;
    const name = inputEmail.split("@")[0];
    setAuthEmail(inputEmail);
    setAuthFullName(name);
    setGoogleCredential("mock_credential_" + Date.now());
    setAuthStep("password_step");
  };

  const handleCompleteGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPassword) {
      setAuthError("Please enter your password to complete registration and apply.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch(`${apiBase}/auth/user/google-with-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: googleCredential,
          email: authEmail,
          full_name: authFullName,
          password: authPassword,
          picture: googlePicture,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Authentication failed");
      }

      const data: UserAuthData = await res.json();
      localStorage.setItem("user_token", data.access_token);
      localStorage.setItem("user_email", data.user_email);
      localStorage.setItem("user_name", data.user_name);
      if (data.user_picture) localStorage.setItem("user_picture", data.user_picture);

      setCurrentUser(data);
      setFormData((prev) => ({
        ...prev,
        email: data.user_email,
        full_name: prev.full_name || data.user_name,
      }));

      window.dispatchEvent(new Event("user-auth-change"));
    } catch (err: any) {
      setAuthError(err.message || "Failed to finalize account. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDirectAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please enter both email and password.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch(`${apiBase}/auth/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          full_name: authFullName || authEmail.split("@")[0],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Authentication failed");
      }

      const data: UserAuthData = await res.json();
      localStorage.setItem("user_token", data.access_token);
      localStorage.setItem("user_email", data.user_email);
      localStorage.setItem("user_name", data.user_name);
      if (data.user_picture) localStorage.setItem("user_picture", data.user_picture);

      setCurrentUser(data);
      setFormData((prev) => ({
        ...prev,
        email: data.user_email,
        full_name: prev.full_name || data.user_name,
      }));

      window.dispatchEvent(new Event("user-auth-change"));
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Please verify your credentials.");
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
    setAuthStep("initial");
    window.dispatchEvent(new Event("user-auth-change"));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
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
          skills: skillsArray.length > 0 ? skillsArray : ["Full Stack Development"],
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
      {/* User Auth Modal fallback */}
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
            Pre-Hire Internship Program 2026
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-[0.95]">
            Apply For <span className="text-brand-400">Internship</span>
          </h1>
          <p className="text-ink-300 text-base sm:text-lg font-medium pt-2 max-w-2xl leading-relaxed">
            Join our hands-on engineering track. Work on real production software with 1:1 senior developer mentorship, resume coaching, and verified completion credentials.
          </p>
        </div>
      </FadeIn>

      {/* ─────────────────────────────────────────────────────────────
          MANDATORY SIGN-IN GATE: If not logged in, show 2-step portal
          ───────────────────────────────────────────────────────────── */}
      {authChecked && !currentUser && (
        <FadeIn delay={0.1} direction="up">
          <div className="bg-ink-950 border-2 border-brand-500 p-6 sm:p-10 shadow-[10px_10px_0px_#1a1915] space-y-8">
            <div className="space-y-2 border-b border-ink-800 pb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" /> Sign-In Mandatory Before Applying
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {authStep === "password_step" ? "2. Set Account Password" : "1. Sign In to Begin Application"}
              </h2>
              <p className="text-ink-300 text-sm">
                {authStep === "password_step"
                  ? "Enter your password to link with your Google profile. The admin will verify credentials and application status."
                  : "First sign in with your Google account, then enter your email and password to access the internship form."}
              </p>
            </div>

            {authError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {authError}
              </div>
            )}

            {authStep === "initial" ? (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="grid grid-cols-2 p-1 bg-ink-900 border border-ink-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setAuthTab("google"); setAuthError(""); }}
                    className={`py-2.5 text-center transition ${
                      authTab === "google" ? "bg-brand-600 text-white" : "text-ink-400 hover:text-white"
                    }`}
                  >
                    1. Google Sign-In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthTab("direct"); setAuthError(""); }}
                    className={`py-2.5 text-center transition ${
                      authTab === "direct" ? "bg-brand-600 text-white" : "text-ink-400 hover:text-white"
                    }`}
                  >
                    Direct Email & Password
                  </button>
                </div>

                {authTab === "google" ? (
                  <div className="space-y-5 text-center">
                    <div className="p-4 bg-ink-900 border border-ink-800 text-left text-xs text-ink-300 space-y-1.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-brand-400" /> Fast 2-Step Application Gate:
                      </div>
                      <p className="text-ink-400 text-xs">
                        1. Sign in using Google.<br />
                        2. Enter your password to complete registration & unlock the application form.
                      </p>
                    </div>

                    <div className="flex justify-center relative">
                      {googleLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/80">
                          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                        </div>
                      )}
                      {googleClientId && !googleClientId.includes("<your") ? (
                        <div ref={inlineGoogleBtnRef} className="w-full flex justify-center min-h-[44px]" />
                      ) : (
                        <button
                          type="button"
                          onClick={handleMockGoogleLogin}
                          className="w-full py-4 px-6 bg-ink-900 border-2 border-brand-500 hover:border-brand-400 text-white font-bold text-base flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 shadow-[4px_4px_0px_#ffffff]"
                        >
                          <Globe2 className="w-5 h-5 text-brand-400" /> Sign In with Google Account
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleDirectAuthSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-400" /> Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Aarav Sharma"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="student@example.com"
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
                      className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-base flex items-center justify-center gap-2 transition shadow-[4px_4px_0px_#ffffff]"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                        </>
                      ) : (
                        <>
                          Sign In & Unlock Application <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleCompleteGoogleAuth} className="space-y-5 max-w-md mx-auto text-left">
                <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600/30 border border-brand-500 flex items-center justify-center text-brand-400 font-bold shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs text-brand-400 font-bold uppercase tracking-wider">Google Identity Verified</div>
                    <div className="text-sm font-semibold text-white truncate">{authEmail}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-400" /> Default Username / Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-400" /> Default Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-brand-400" /> Enter Your Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter a secure password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    autoFocus
                  />
                  <p className="text-[11px] text-ink-400">
                    Password is saved to your account and visible to administrators for verification.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep("initial")}
                    className="px-5 py-3.5 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 text-sm font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 py-3.5 font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-[4px_4px_0px_#ffffff]"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Finalizing...
                      </>
                    ) : (
                      <>
                        Unlock Application Form <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </FadeIn>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VERIFIED APPLICANT STATUS BAR (Only shown when authenticated)
          ───────────────────────────────────────────────────────────── */}
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

      {/* ─────────────────────────────────────────────────────────────
          APPLICATION FORM (Strictly unlocked when authenticated)
          ───────────────────────────────────────────────────────────── */}
      {currentUser && (
        <FadeIn delay={0.12} direction="up">
          <div className="bg-ink-950 p-6 sm:p-12 border-2 border-ink-800 space-y-10 shadow-[12px_12px_0px_#1a1915]">
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* SECTION 1: PERSONAL & CONTACT */}
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 border-b border-ink-800 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> 1. Personal & Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-400" /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Aarav Sharma"
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
                      placeholder="aarav@example.com"
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
                      <MapPin className="w-3.5 h-3.5 text-brand-400" /> Current City / State
                    </label>
                    <input
                      type="text"
                      placeholder="Pune, Maharashtra"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ACADEMIC PROFILE */}
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
                      placeholder="Indian Institute of Technology, Bombay"
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
                      placeholder="B.Tech Computer Science / BCA"
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

              {/* SECTION 4: PROFESSIONAL INFORMATION & DESCRIPTION */}
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
                      placeholder="React, Next.js, Python, FastAPI, Docker, PostgreSQL, Tailwind CSS"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-400" /> Professional Experience & Projects Description *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your prior work experience, personal coding projects, open-source contributions, or technical problem solving you have done..."
                      value={formData.experience_description}
                      onChange={(e) => setFormData({ ...formData, experience_description: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-700 p-4 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Why should we hire you? / Statement of Purpose
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us what excites you about this internship and what goals you want to accomplish during the program..."
                      value={formData.cover_letter}
                      onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-700 p-4 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: RESUME UPLOAD SECTION */}
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 border-b border-ink-800 pb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 6. Internship Track & Duration
                </h3>

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
                      <option value="Full Stack Web Development">Full Stack Web Development (Next.js & FastAPI)</option>
                      <option value="AI & Machine Learning Engineering">AI & Machine Learning Engineering (PyTorch & LLMs)</option>
                      <option value="Backend Engineering">Backend Engineering (Java / Spring Boot / Python)</option>
                      <option value="Frontend Engineering">Frontend Engineering (React, TypeScript & Tailwind)</option>
                      <option value="Cloud DevOps & Kubernetes">Cloud DevOps & Kubernetes</option>
                      <option value="Cyber Security & Ethical Hacking">Cyber Security & Ethical Hacking</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-400" /> Preferred Internship Duration *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {["1 Month", "3 Months", "6 Months"].map((dur) => (
                        <div
                          key={dur}
                          onClick={() => setFormData({ ...formData, duration: dur })}
                          className={`cursor-pointer p-4 border text-center transition ${
                            formData.duration === dur
                              ? "bg-brand-600/20 border-brand-500 text-white shadow-[2px_2px_0px_#ffffff20]"
                              : "bg-ink-900 border-ink-800 text-ink-400 hover:border-ink-700"
                          }`}
                        >
                          <div className="font-bold text-base text-white">{dur}</div>
                          <div className="text-[11px] text-ink-400 mt-1">
                            {dur === "1 Month" && "Foundation Bootcamp & Mentorship"}
                            {dur === "3 Months" && "Standard Industrial Internship"}
                            {dur === "6 Months" && "Advanced Product Co-Op Program"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 text-xl font-black bg-brand-600 hover:bg-brand-500 text-white shadow-[4px_4px_0px_#ffffff] hover:translate-y-1 hover:shadow-[0px_0px_0px_#ffffff] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
