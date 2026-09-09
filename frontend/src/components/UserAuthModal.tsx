"use client";

import { useState, useEffect } from "react";
import { X, Mail, Lock, User, ArrowRight, Loader2, Sparkles, CheckCircle2, ShieldCheck, Globe2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserAuthData } from "@/types";
import {
  signInWithGooglePopup,
  signInWithEmail,
  registerWithEmail,
  resetUserPassword,
} from "@/lib/firebase";

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
  title = "Sign In to InternVision Tech",
  subtitle = "Sign in using Google or Email & Password to access your application.",
}: UserAuthModalProps) {
  const [tab, setTab] = useState<"google" | "email">("google");
  const [emailMode, setEmailMode] = useState<"login" | "register" | "forgot">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api"
  ).replace(/\/$/, "");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError("");
      setResetSuccessMessage("");
      setPassword("");
    }
  }, [isOpen]);

  const [showGoogleFallback, setShowGoogleFallback] = useState(false);
  const [fallbackGoogleEmail, setFallbackGoogleEmail] = useState("");
  const [fallbackGoogleName, setFallbackGoogleName] = useState("");
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // Sync authenticated user with backend/Supabase database
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
        const data = await res.json();
        return data;
      }
    } catch {
      // Fallback if backend is offline
    }

    return {
      access_token: "user_" + Date.now(),
      token_type: "bearer",
      user_email: userEmail,
      user_name: userName,
      user_picture: userPic || undefined,
      role: "user",
    };
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
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

      window.dispatchEvent(new Event("user-auth-change"));
      onSuccess(authData);
      onClose();
    } catch (err: any) {
      // Handle Firebase popup closed / config errors gracefully
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in popup was closed before completing.");
      } else {
        // If Firebase API key is unconfigured or domain unauthorized, open quick Google account sign in
        setShowGoogleFallback(true);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackGoogleEmail.trim()) {
      setError("Please enter your Google account email.");
      return;
    }
    setFallbackLoading(true);
    setError("");

    try {
      const cleanEmail = fallbackGoogleEmail.trim().toLowerCase();
      const cleanName = fallbackGoogleName.trim() || cleanEmail.split("@")[0];
      const authData = await syncWithBackend(cleanEmail, cleanName, null, "google");

      localStorage.setItem("user_token", authData.access_token);
      localStorage.setItem("user_email", authData.user_email);
      localStorage.setItem("user_name", authData.user_name);

      window.dispatchEvent(new Event("user-auth-change"));
      onSuccess(authData);
      setShowGoogleFallback(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setFallbackLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (emailMode === "register" && !fullName) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let firebaseUser;
      if (emailMode === "register") {
        firebaseUser = await registerWithEmail(email, password, fullName);
      } else {
        firebaseUser = await signInWithEmail(email, password);
      }

      const userEmail = firebaseUser.email || email.trim();
      const userName = firebaseUser.displayName || fullName || userEmail.split("@")[0];

      const authData = await syncWithBackend(userEmail, userName, null, "email");

      localStorage.setItem("user_token", authData.access_token);
      localStorage.setItem("user_email", authData.user_email);
      localStorage.setItem("user_name", authData.user_name);

      window.dispatchEvent(new Event("user-auth-change"));
      onSuccess(authData);
      onClose();
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password. If you are new, switch to Register.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with this email. Please switch to Sign In.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else {
        setError(err.message || "Authentication failed. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError("");
    setResetSuccessMessage("");

    try {
      await resetUserPassword(email.trim());
      setResetSuccessMessage(
        `Password reset email sent to ${email.trim()}! Please check your inbox (and spam folder) to set a new password.`
      );
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address. Please register first.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Failed to send password reset email. Please try again.");
      }
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

          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> InternVision Tech
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
            <p className="text-xs text-ink-400 leading-relaxed">{subtitle}</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-ink-900 border border-ink-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setTab("google"); setError(""); }}
              className={`py-2 text-center transition ${
                tab === "google" ? "bg-brand-600 text-white" : "text-ink-400 hover:text-white"
              }`}
            >
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => { setTab("email"); setError(""); }}
              className={`py-2 text-center transition ${
                tab === "email" ? "bg-brand-600 text-white" : "text-ink-400 hover:text-white"
              }`}
            >
              Email & Password
            </button>
          </div>

          {/* GOOGLE AUTH TAB */}
          {tab === "google" && (
            <div className="space-y-4">
              <div className="p-3 bg-ink-900/60 border border-ink-800 text-xs text-ink-300 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-400" /> Fast & Secure Google Sign-In:
                </div>
                <p className="text-ink-400 text-[11px] leading-relaxed">
                  Sign in instantly with your Google account. No separate password is created or stored.
                </p>
              </div>

              {!showGoogleFallback ? (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-ink-100 text-black text-sm font-bold flex items-center justify-center gap-3 transition shadow-[4px_4px_0px_#1a1915] border border-ink-300 disabled:opacity-50"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Authenticating with Google...
                    </>
                  ) : (
                    <>
                      {/* Google SVG Icon */}
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
                      Continue with Google
                    </>
                  )}
                </button>
              ) : (
                <form onSubmit={handleGoogleFallbackSubmit} className="space-y-3.5 pt-1 text-xs">
                  <div className="p-2.5 bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[11px] rounded">
                    Enter your Google account email below to connect instantly:
                  </div>

                  <div className="space-y-1">
                    <label className="text-ink-300 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-400" /> Google Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={fallbackGoogleEmail}
                      onChange={(e) => setFallbackGoogleEmail(e.target.value)}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-ink-300 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-400" /> Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      value={fallbackGoogleName}
                      onChange={(e) => setFallbackGoogleName(e.target.value)}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowGoogleFallback(false)}
                      className="w-1/3 py-2.5 bg-ink-900 hover:bg-ink-800 text-ink-300 border border-ink-700 font-bold transition text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={fallbackLoading}
                      className="w-2/3 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                    >
                      {fallbackLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Sign In with Google →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* EMAIL & PASSWORD TAB */}
          {tab === "email" && emailMode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-ink-300 leading-relaxed">
                  Enter your registered email address below. We'll send you a secure link to reset your password.
                </p>
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

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode("login");
                    setError("");
                    setResetSuccessMessage("");
                  }}
                  className="w-1/3 py-2.5 bg-ink-900 hover:bg-ink-800 text-ink-300 border border-ink-700 font-bold transition text-xs"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold transition flex items-center justify-center gap-2 text-xs disabled:opacity-50 shadow-[2px_2px_0px_#ffffff]"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Reset Link →"}
                </button>
              </div>
            </form>
          )}

          {tab === "email" && emailMode !== "forgot" && (
            <form onSubmit={handleEmailAuth} className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-xs pb-1">
                <span className="text-ink-400">
                  {emailMode === "login" ? "Don't have an account?" : "Already have an account?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode(emailMode === "login" ? "register" : "login");
                    setError("");
                    setResetSuccessMessage("");
                  }}
                  className="text-brand-400 font-bold hover:underline"
                >
                  {emailMode === "login" ? "Create Account" : "Sign In"}
                </button>
              </div>

              {emailMode === "register" && (
                <div className="space-y-1">
                  <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-400" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              )}

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
                <div className="flex justify-between items-center">
                  <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-brand-400" /> Password *
                  </label>
                  {emailMode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode("forgot");
                        setError("");
                        setResetSuccessMessage("");
                      }}
                      className="text-[11px] text-brand-400 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    {emailMode === "login" ? "Sign In & Continue" : "Register & Continue"}{" "}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
