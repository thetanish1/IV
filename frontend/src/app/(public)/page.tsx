"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Rocket,
  ShieldCheck,
  Trophy,
  Globe,
  Database,
  Smartphone,
  Server,
  Lock,
  Palette,
  Terminal,
  Layers,
  Sparkles,
  Check,
} from "lucide-react";
import { Float } from "@/components/animations/Float";
import HeroVideoPlayer from "@/components/HeroVideoPlayer";
import { apiRequest } from "@/lib/api-client";

interface DomainTrack {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: any;
  color: string;
  tech: string[];
  role: string;
}

const INTERNSHIP_DOMAINS: DomainTrack[] = [
  {
    id: "full-stack",
    title: "Full Stack Web Development",
    description: "Architect scalable full-stack applications with Next.js 15, React 19, FastAPI, PostgreSQL, and modern Tailwind CSS with cloud deployment.",
    badge: "Most Popular",
    icon: Globe,
    color: "from-blue-600 to-indigo-600",
    tech: ["Next.js 15", "React 19", "FastAPI", "PostgreSQL", "Tailwind CSS"],
    role: "Full Stack Web Development",
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning Engineering",
    description: "Develop end-to-end ML pipelines, deep neural networks with PyTorch, fine-tune LLMs, and build Vector RAG agents with FastAPI inference serving.",
    badge: "Trending in 2026",
    icon: Cpu,
    color: "from-purple-600 to-pink-600",
    tech: ["Python", "PyTorch", "OpenAI API", "LangChain", "Vector DBs"],
    role: "AI & Machine Learning Engineering",
  },
  {
    id: "python",
    title: "Python Development & Automation",
    description: "Master advanced Python OOP, AsyncIO concurrency, web scraping engines, microservices architecture, and Docker cloud packaging.",
    badge: "Core Engineering",
    icon: Terminal,
    color: "from-amber-500 to-orange-600",
    tech: ["Python 3.12", "AsyncIO", "FastAPI", "Docker", "Playwright"],
    role: "Python Developer",
  },
  {
    id: "java",
    title: "Java & Enterprise Spring Boot",
    description: "Master Core Java 21, Collections, Data Structures & Algorithms, multi-threading, Spring Boot microservices, and JPA Hibernate persistence.",
    badge: "Enterprise Track",
    icon: Server,
    color: "from-red-600 to-amber-600",
    tech: ["Java 21", "Spring Boot", "OOP & DSA", "Hibernate", "PostgreSQL"],
    role: "Java Programming & Core Engineering",
  },
  {
    id: "android",
    title: "Native Android App Development",
    description: "Build high-performance native Android apps using Kotlin, declarative Jetpack Compose UI, MVVM architecture, Coroutines, and Room Database.",
    badge: "Mobile Engineering",
    icon: Smartphone,
    color: "from-emerald-500 to-teal-600",
    tech: ["Kotlin", "Jetpack Compose", "Coroutines", "Retrofit", "Room DB"],
    role: "Android App Development",
  },
  {
    id: "data-science",
    title: "Data Science & Visual Analytics",
    description: "Wrangle massive datasets with Pandas/NumPy, build predictive machine learning models, and create interactive business intelligence dashboards.",
    badge: "High Growth",
    icon: Database,
    color: "from-teal-600 to-cyan-600",
    tech: ["Pandas", "NumPy", "Scikit-Learn", "Tableau", "Statistical Modeling"],
    role: "Data Science & Analytics",
  },
  {
    id: "devops",
    title: "Cloud DevOps & Kubernetes",
    description: "Containerize apps with Docker, manage Kubernetes clusters, build automated CI/CD pipelines with GitHub Actions, and write AWS Terraform code.",
    badge: "Cloud Infrastructure",
    icon: Layers,
    color: "from-blue-500 to-cyan-500",
    tech: ["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"],
    role: "Cloud DevOps & Kubernetes Mastery",
  },
  {
    id: "cyber-security",
    title: "Cyber Security & Ethical Hacking",
    description: "Perform web penetration testing, evaluate OWASP Top 10 vulnerabilities, conduct network analysis with Wireshark, and audit security architectures.",
    badge: "Defensive & Offensive",
    icon: Lock,
    color: "from-emerald-600 to-green-700",
    tech: ["Linux", "Metasploit", "Wireshark", "Burp Suite", "OWASP"],
    role: "Cyber Security & Ethical Hacking",
  },
  {
    id: "ui-ux",
    title: "UI/UX Design & Product Frontend",
    description: "Create design systems, interactive prototypes in Figma, conduct user research, and convert pixel-perfect interfaces into responsive Tailwind CSS code.",
    badge: "Design Systems",
    icon: Palette,
    color: "from-pink-600 to-rose-600",
    tech: ["Figma", "Design Systems", "Wireframing", "Tailwind CSS", "Prototyping"],
    role: "UI/UX Design & Frontend",
  },
];

export default function HomePage() {
  const [showCourses, setShowCourses] = useState(false);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const data = await apiRequest<{ show_courses?: boolean | string }>("/settings");
        setShowCourses(data?.show_courses === true || data?.show_courses === "true");
      } catch {
        // default hidden
      }
    };
    checkSettings();
    window.addEventListener("site-settings-changed", checkSettings);
    return () => window.removeEventListener("site-settings-changed", checkSettings);
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* ─── HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-12">
        <div className="absolute inset-0 bg-ink-950 -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500 text-white text-xs font-semibold uppercase tracking-wider -rotate-1 shadow-lg">
            <Rocket className="w-3.5 h-3.5" />
            Virtual Pre-Hire Internship Program 2026
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl">
            Transform Your Passion Into A <br />
            <span className="text-brand-400">Production Tech Career</span>
          </h1>

          <p className="text-base sm:text-lg text-ink-300 max-w-2xl leading-relaxed mx-auto">
            Gain industry-grade engineering experience with hands-on weekly tasks, real client projects, and verified digital certificates across 9 high-demand technology tracks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2 w-full">
            <div className="flex flex-col items-center w-full sm:w-auto">
              <Link
                href="/apply"
                className="w-full sm:w-auto px-8 py-4 font-bold bg-white text-black hover:bg-ink-100 flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-lg"
              >
                Apply For Virtual Internship
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-ink-500 mt-2 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Virtual • Flexible Durations (1M / 3M / 6M)
              </p>
            </div>

            <div className="flex flex-col items-center w-full sm:w-auto">
              <Link
                href="/verify-certificate"
                className="w-full sm:w-auto px-8 py-4 font-bold bg-transparent hover:bg-ink-900 text-white border border-ink-700 hover:border-brand-500 flex items-center justify-center gap-2.5 transition-all shadow-sm group"
              >
                <ShieldCheck className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
                Certificate Verification
              </Link>
              <p className="text-xs text-ink-500 mt-2 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Credential Authenticity
              </p>
            </div>
          </div>

          {/* ─── CONTINUOUS LIVE VIDEO SHOWCASE (GIF-LIKE) ─────────────── */}
          <div className="w-full max-w-4xl pt-4">
            <HeroVideoPlayer src="/hero-video.mp4" />
          </div>
        </div>
      </section>

      {/* ─── STATS TRUST STRIP ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 pb-12 mt-16 max-w-5xl mx-auto border-t border-b border-ink-800">
        <div className="space-y-2 group md:translate-y-4">
          <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-brand-400 transition-colors tracking-tighter">100+</div>
          <div className="text-sm font-bold text-ink-400 uppercase tracking-wide">Students Trained</div>
        </div>
        <div className="space-y-2 group">
          <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-brand-400 transition-colors tracking-tighter">10+</div>
          <div className="text-sm font-bold text-ink-400 uppercase tracking-wide">Projects Done</div>
        </div>
        <div className="space-y-2 group md:-translate-y-2">
          <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-brand-400 transition-colors tracking-tighter">4.9</div>
          <div className="text-sm font-bold text-ink-400 uppercase tracking-wide">Satisfaction Score</div>
        </div>
        <div className="space-y-2 group md:translate-y-2">
          <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-brand-400 transition-colors tracking-tighter">9+</div>
          <div className="text-sm font-bold text-ink-400 uppercase tracking-wide">Internship Tracks</div>
        </div>
      </div>

      {/* ─── INTERNSHIP DOMAINS SHOWCASE ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-l-4 border-brand-500 pl-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
              ✦ Industry-Ready Engineering Programs
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Virtual Internship Domains
            </h2>
            <p className="text-ink-400 text-base sm:text-lg leading-relaxed">
              Choose your specialized track. Each program includes task allocations, 1:1 mentor code reviews, production projects, and verified digital certificates.
            </p>
          </div>
          <Link
            href="/apply"
            className="px-6 py-3 font-bold bg-brand-600 hover:bg-brand-500 text-white text-xs uppercase tracking-wider rounded transition shrink-0 flex items-center gap-2"
          >
            Apply for Any Track <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {INTERNSHIP_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <div
                key={domain.id}
                className="glass-card p-7 border border-ink-800 rounded-2xl flex flex-col justify-between space-y-6 hover:border-brand-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-ink-900 border border-ink-700 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 bg-brand-500/10 px-2.5 py-1 border border-brand-500/30 rounded-full">
                      {domain.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-ink-400 leading-relaxed">
                      {domain.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {domain.tech.map((t) => (
                      <span key={t} className="text-[10px] font-medium bg-ink-900 text-ink-300 px-2 py-0.5 rounded border border-ink-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-ink-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-ink-400 font-medium">
                    <span>Durations: 1M / 3M / 6M</span>
                    <span className="text-emerald-400 font-semibold">100% Virtual</span>
                  </div>

                  <Link
                    href={`/apply?role=${encodeURIComponent(domain.role)}`}
                    className="w-full py-2.5 bg-ink-900 hover:bg-brand-600 text-ink-200 hover:text-white text-xs font-bold rounded-lg border border-ink-700 hover:border-brand-500 transition-all flex items-center justify-center gap-1.5"
                  >
                    Apply for this Track <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── WHY CHOOSE US ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left space-y-4 mb-16 max-w-2xl border-l-4 border-white pl-6">
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Why Choose InternVision Tech?</h2>
          <p className="text-ink-400 text-lg">
            We bridge the gap between academic theory and real-world software engineering standards. No fluff, just production code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 bg-ink-950 border-2 border-ink-800 p-10 space-y-6 md:translate-y-8 rounded-xl">
            <div className="w-14 h-14 bg-brand-500 text-white flex items-center justify-center shadow-[4px_4px_0px_#ffffff] rounded-lg">
              <Code2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase">Production-Grade Stack</h3>
            <p className="text-ink-400 text-base leading-relaxed">
              Work with Next.js 15, FastAPI, Docker, and PostgreSQL with real GitHub workflows, code reviews, and live cloud deployment pipelines.
            </p>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="bg-ink-950 border border-ink-800 p-8 flex gap-6 items-start hover:border-brand-500 transition-colors rounded-xl">
              <div className="w-12 h-12 shrink-0 bg-ink-900 border border-ink-700 text-white flex items-center justify-center rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">1:1 Technical Mentorship</h3>
                <p className="text-ink-400 text-sm leading-relaxed">
                  Get direct code reviews, resume polishing, and mock technical interview sessions from senior engineers who actively work in the software industry.
                </p>
              </div>
            </div>

            <div className="bg-ink-950 border border-ink-800 p-8 flex gap-6 items-start hover:border-brand-500 transition-colors md:ml-8 rounded-xl">
              <div className="w-12 h-12 shrink-0 bg-ink-900 border border-ink-700 text-white flex items-center justify-center rounded-lg">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Verified Digital Credentials</h3>
                <p className="text-ink-400 text-sm leading-relaxed">
                  Earn an industry-verifiable digital certificate and performance evaluation report to share with hiring recruiters and on LinkedIn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OPTIONAL COURSES SECTION (Shown ONLY if enabled by Admin) ── */}
      {showCourses && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 border-l-4 border-white pl-6">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Featured Bootcamps</h2>
              <p className="text-ink-400 text-sm mt-1">Accelerate your skills with our top-rated programs.</p>
            </div>
            <Link href="/courses" className="text-sm font-bold text-brand-400 hover:underline">
              View All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-ink-950 border border-ink-800 rounded-xl space-y-4">
              <h3 className="text-xl font-bold text-white">Full Stack Web Development</h3>
              <p className="text-xs text-ink-400">Master Next.js 15, FastAPI, and PostgreSQL with hands-on projects.</p>
              <Link href="/courses/full-stack-web-development" className="inline-block px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded">
                Enroll Free →
              </Link>
            </div>

            <div className="p-8 bg-ink-950 border border-ink-800 rounded-xl space-y-4">
              <h3 className="text-xl font-bold text-white">AI & Machine Learning Engineering</h3>
              <p className="text-xs text-ink-400">Build neural networks, RAG architectures, and fine-tune LLMs.</p>
              <Link href="/courses/ai-machine-learning-engineering" className="inline-block px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded">
                Enroll Free →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA SECTION ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-brand-600 p-10 md:p-16 text-left space-y-6 relative overflow-hidden shadow-[8px_8px_0px_#ffffff] rounded-2xl">
          <div className="max-w-3xl relative z-10 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
              Ready to Step Into Tech?
            </h2>
            <p className="text-brand-100 text-base md:text-lg leading-relaxed">
              Apply today for our upcoming batch. Flexible 1, 3, or 6-month internship durations tailored to your college academic schedule.
            </p>
            <div className="pt-2">
              <Link
                href="/apply"
                className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold bg-white text-black hover:bg-ink-100 transition-transform hover:-translate-y-1 shadow-lg rounded-lg"
              >
                Start Free Application <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
