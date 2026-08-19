"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, Loader2, Globe2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FadeIn } from "@/components/animations/FadeIn";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Google Identity Services Types ─────────────────────────────────────────
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

  // ── Resolve the correct API base URL (fixes the /api/v1 bug) ──────────────
  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api"
  ).replace(/\/$/, "");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "tanishdewase222@gmail.com",
      password: "Admin@123456",
    },
  });

  // ── Load Google Identity Services script ──────────────────────────────────
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

  // ── Handle Google credential response ────────────────────────────────────
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
      // Decode or retrieve email
      try {
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        if (payload.sub) localStorage.setItem("admin_email", payload.sub);
      } catch {
        localStorage.setItem("admin_email", "tanishdewase222@gmail.com");
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

  // ── Handle standard email/password login ─────────────────────────────────
  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);

      // ✅ Fixed URL: uses NEXT_PUBLIC_API_URL → http://localhost:8000/api/auth/login
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
      localStorage.setItem("admin_email", data.email);
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <FadeIn delay={0.1} direction="up">
        <div className="max-w-md w-full glass-card p-8 border border-ink-800 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-brand-600/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Admin Authentication</h2>
            <p className="text-xs text-ink-400">
              Secure JWT portal for <span className="text-brand-400 font-semibold">InternVision Tech</span> administrators
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* ─── Google Sign-In Section ────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-xs text-ink-400 text-center font-medium uppercase tracking-wider">
              Quick Sign-In
            </p>

            {/* Google renders its own styled button here */}
            {googleClientId && !googleClientId.includes("<your") ? (
              <div className="relative">
                {googleLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/80">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                  </div>
                )}
                <div
                  ref={googleButtonRef}
                  id="google-signin-btn"
                  className="w-full min-h-[44px]"
                />
                {!googleReady && (
                  <div className="w-full py-3 flex items-center justify-center gap-2 bg-ink-800 border border-ink-700 text-ink-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading Google Sign-In…
                  </div>
                )}
              </div>
            ) : (
              /* Placeholder shown when no client ID is configured */
              <div className="w-full py-3 flex items-center justify-center gap-2 bg-ink-800 border border-ink-700 text-ink-400 text-sm cursor-not-allowed opacity-60 select-none">
                <Globe2 className="w-4 h-4" />
                Sign in with Google
                <span className="ml-2 text-[10px] text-red-400">(GOOGLE_CLIENT_ID not set)</span>
              </div>
            )}

            <p className="text-[10px] text-ink-500 text-center leading-relaxed">
              💡 <strong className="text-ink-400">Google users:</strong> Your Google email becomes your username.
              Default password = your Google account email address.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ink-800" />
            <span className="text-[10px] text-ink-500 font-medium uppercase tracking-widest">or use credentials</span>
            <div className="flex-1 h-px bg-ink-800" />
          </div>

          {/* ─── Standard Login Form ───────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-400" /> Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                {...register("email")}
                className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-400" /> Password
              </label>
              <input
                id="admin-password"
                type="password"
                {...register("password")}
                className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Default credentials hint box */}
            <div className="p-3 bg-ink-900/60 border border-ink-800 text-[11px] text-ink-400 space-y-1">
              <p className="font-semibold text-ink-300">Admin Account Credentials:</p>
              <p>Super Admin: <span className="font-mono text-brand-400">tanishdewase222@gmail.com</span></p>
              <p>Password: <span className="font-mono text-brand-400">Admin@123456</span></p>
              <p className="pt-1 border-t border-ink-800 mt-1">
                Google users: password = <span className="font-mono text-brand-400">your.google@email.com</span>
              </p>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Login to Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}
