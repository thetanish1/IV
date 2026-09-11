"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, Loader2, Globe2, Sparkles, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FadeIn } from "@/components/animations/FadeIn";
import { AdminButton } from "@/components/admin/common";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api"
  ).replace(/\/$/, "");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!googleClientId || googleClientId.includes("<your")) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "square",
          width: googleButtonRef.current.offsetWidth || 400,
        });
        setGoogleReady(true);
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  const handleGoogleCredential = async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Google authentication failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("admin_token", data.access_token);
      try {
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        if (payload.sub) localStorage.setItem("admin_email", payload.sub);
      } catch {
        localStorage.setItem("admin_email", "admin");
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("user-auth-change"));
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");

    try {
      const emailClean = data.email.trim().toLowerCase();
      const passwordClean = data.password.trim();

      const formData = new URLSearchParams();
      formData.append("username", emailClean);
      formData.append("password", passwordClean);

      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Authentication failed");
      }

      const responseData = await res.json();
      localStorage.setItem("token", responseData.access_token);
      localStorage.setItem("admin_token", responseData.access_token);
      localStorage.setItem("admin_email", emailClean);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("user-auth-change"));
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8F9FA] dark:bg-ink-950 transition-colors duration-200">
      <FadeIn delay={0.1} direction="up">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950/90 backdrop-blur-md p-8 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto rounded-2xl border border-brand-200 dark:border-brand-500/30 shadow-sm">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Admin Authentication</h2>
            <p className="text-xs text-gray-500 dark:text-ink-400">
              Secure administrative access for <span className="text-brand-600 dark:text-brand-300 font-bold">InternVision Tech</span> platform
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs text-center font-semibold shadow-sm">
              {error}
            </div>
          )}

          {/* Google Sign-In Section */}
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 dark:text-ink-400 text-center font-bold uppercase tracking-wider">
              Quick Sign-In
            </p>

            {googleClientId && !googleClientId.includes("<your") ? (
              <div className="relative">
                {googleLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-ink-950/80 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-600 dark:text-brand-400" />
                  </div>
                )}
                <div
                  ref={googleButtonRef}
                  id="google-signin-btn"
                  className="w-full min-h-[44px]"
                />
                {!googleReady && (
                  <div className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 text-gray-500 dark:text-ink-400 text-xs font-semibold shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading Google Sign-In…
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 text-gray-500 dark:text-ink-400 text-xs font-semibold cursor-not-allowed opacity-60 select-none shadow-sm">
                <Globe2 className="w-4 h-4" />
                Sign in with Google
                <span className="text-[10px] text-red-500 ml-1">(GOOGLE_CLIENT_ID not set)</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-ink-800" />
            <span className="text-[10px] text-gray-400 dark:text-ink-400 font-bold uppercase tracking-widest">or credentials</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-ink-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-700 dark:text-ink-300 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@internvision.tech"
                {...register("email")}
                className="w-full bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-ink-400 focus:outline-none focus:border-brand-500 transition text-xs shadow-inner"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-700 dark:text-ink-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Password
              </label>
              <input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-ink-400 focus:outline-none focus:border-brand-500 transition text-xs shadow-inner"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Login to Admin Console <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Marker Footer */}
          <div className="pt-2 border-t border-gray-100 dark:border-ink-800/80 flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-ink-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>256-bit Encrypted Token Verification</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
