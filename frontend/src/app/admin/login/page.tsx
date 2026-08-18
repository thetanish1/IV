"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FadeIn } from "@/components/animations/FadeIn";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@internvision.tech",
      password: "Admin@123456",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);

      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Authentication failed");
      }

      const responseData = await res.json();
      localStorage.setItem("token", responseData.access_token);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <FadeIn delay={0.1} direction="up">
        <div className="max-w-md w-full glass-card p-8 border border-ink-800 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-brand-600/20 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Admin Authentication</h2>
            <p className="text-xs text-ink-400">Secure JWT portal for InternVision Tech administrators</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-400" /> Admin Email
              </label>
              <input
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
                type="password"
                {...register("password")}
                className="w-full bg-ink-900 border border-ink-700 px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="p-3 bg-ink-900/60 border border-ink-800 text-[11px] text-ink-400 space-y-1">
              <p className="font-semibold text-ink-300">Default Credentials:</p>
              <p>Email: <span className="font-mono text-brand-400">admin@internvision.tech</span></p>
              <p>Password: <span className="font-mono text-brand-400">Admin@123456</span></p>
            </div>

            <button
              type="submit"
              disabled={loading}
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
