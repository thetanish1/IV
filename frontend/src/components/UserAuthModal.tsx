"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mail, Lock, User, ArrowRight, Loader2, Globe2, Sparkles, CheckCircle2, ShieldCheck, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserAuthData } from "@/types";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: UserAuthData) => void;
  title?: string;
  subtitle?: string;
}

export default function UserAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign In Required Before Applying",
  subtitle = "Sign in with Google, then confirm your email & password to proceed.",
}: UserAuthModalProps) {
  const [authStep, setAuthStep] = useState<"initial" | "password_step">("initial");
  const [tab, setTab] = useState<"google" | "direct">("google");
  
  // User input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [googleCredential, setGoogleCredential] = useState<string>("");
  const [googlePicture, setGooglePicture] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api"
  ).replace(/\/$/, "");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError("");
      setAuthStep("initial");
      setPassword("");
    }
  }, [isOpen]);

  // Load Google Identity Services SDK
  useEffect(() => {
    if (!isOpen) return;
    if (!googleClientId || googleClientId.includes("<your")) return;

    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: googleBtnRef.current.offsetWidth || 340,
        });
        setGoogleReady(true);
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
  }, [isOpen, googleClientId, authStep]);

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

  const handleGoogleCredential = async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError("");
    try {
      const payload = parseJwt(response.credential);
      const parsedEmail = payload?.email || "";
      const parsedName = payload?.name || parsedEmail.split("@")[0];
      const parsedPic = payload?.picture || "";

      setEmail(parsedEmail);
      setFullName(parsedName);
      setGooglePicture(parsedPic);
      setGoogleCredential(response.credential);

      // Move to Step 2: Enter password
      setAuthStep("password_step");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleEmailProceed = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    const name = fullName || email.split("@")[0];
    setFullName(name);
    setGoogleCredential("mock_credential_" + Date.now());
    setAuthStep("password_step");
  };

  const handleCompleteGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password to proceed.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/auth/user/google-with-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: googleCredential,
          email,
          full_name: fullName,
          password,
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

      window.dispatchEvent(new Event("user-auth-change"));
      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to finalize account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDirectEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/auth/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName || email.split("@")[0],
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

      window.dispatchEvent(new Event("user-auth-change"));
      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-ink-950 border-2 border-brand-500/50 p-6 sm:p-8 shadow-[12px_12px_0px_#000000] z-10 space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-ink-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with InternVision Tech branding */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> InternVision Tech
              </div>
              <span className="text-xs text-ink-400 font-semibold">Portal Sign-In</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {authStep === "password_step" ? "Account Security Verification" : "Applicant Sign-In"}
            </h2>
            <p className="text-xs text-ink-400 leading-relaxed">
              {authStep === "password_step"
                ? "Enter your password to verify your account with InternVision Tech."
                : "Sign in with your email to unlock and submit your internship application."}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: INITIAL GOOGLE SIGN IN OR DIRECT CREDENTIALS */}
          {authStep === "initial" && (
            <div className="space-y-5">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-ink-900 border border-ink-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setTab("google"); setError(""); }}
                  className={`py-2 text-center transition ${
                    tab === "google" ? "bg-brand-600 text-white" : "text-ink-400 hover:text-white"
                  }`}
                >
                  1. Google Sign-In
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("direct"); setError(""); }}
                  className={`py-2 text-center transition ${
                    tab === "direct" ? "bg-brand-600 text-white" : "text-ink-400 hover:text-white"
                  }`}
                >
                  Direct Email & Pass
                </button>
              </div>

              {tab === "google" ? (
                <div className="space-y-4">
                  <div className="p-3 bg-ink-900/60 border border-ink-800 text-xs text-ink-300 space-y-1">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand-400" /> InternVision Tech Verification:
                    </div>
                    <p className="text-ink-400 text-[11px] leading-relaxed">
                      Enter your Google Account email below, then verify with your password to proceed.
                    </p>
                  </div>

                  {/* Official Google One-Tap/Button if client ID is configured */}
                  {googleClientId && !googleClientId.includes("<your") && (
                    <div className="relative">
                      {googleLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/80">
                          <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                        </div>
                      )}
                      <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
                      <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-ink-800" />
                        <span className="text-[10px] text-ink-500 font-medium uppercase tracking-widest">or enter email</span>
                        <div className="flex-1 h-px bg-ink-800" />
                      </div>
                    </div>
                  )}

                  {/* In-UI Email Input (No Browser Prompt) */}
                  <form onSubmit={handleGoogleEmailProceed} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-brand-400" /> Google Account Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
                        autoFocus
                      />
                      <p className="text-[11px] text-ink-500">
                        💡 Hint: Enter your active Google or university email ID.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 shadow-[4px_4px_0px_#1a1915]"
                    >
                      <Globe2 className="w-4 h-4 text-white" /> Continue with Google <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleDirectEmailSubmit} className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-400" /> Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brand-400" /> Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-[2px_2px_0px_#ffffff]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In & Proceed <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: PASSWORD ENTRY AFTER GOOGLE EMAIL IS ENTERED */}
          {authStep === "password_step" && (
            <form onSubmit={handleCompleteGoogleAuth} className="space-y-4 text-sm">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">InternVision Tech Verification</div>
                    <div className="text-xs font-bold text-white truncate">{fullName || email.split("@")[0]}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold rounded">
                  Active
                </span>
              </div>

              {/* Automatically Displayed Email Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address
                  </label>
                  <span className="text-[10px] text-brand-400 font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full bg-ink-900/60 border border-ink-800 px-3.5 py-2 text-ink-200 text-sm cursor-not-allowed select-none font-medium focus:outline-none"
                />
              </div>

              {/* PASSWORD ENTRY */}
              <div className="space-y-1.5">
                <label className="text-xs text-brand-400 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-brand-400" /> Enter Account Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-ink-900 border-2 border-brand-500/80 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-400 text-sm shadow-[0_0_10px_rgba(255,107,0,0.15)]"
                  autoFocus
                />
                <p className="text-[11px] text-ink-500">
                  💡 Hint: Enter your password to complete verification with InternVision Tech.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthStep("initial")}
                  className="px-4 py-3 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-[2px_2px_0px_#ffffff]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Logging In...
                    </>
                  ) : (
                    <>
                      Login to InternVision Tech <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
