"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  Code2,
  Layers,
  Cpu,
  ArrowRight,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  HeartHandshake,
  TrendingUp,
  Award,
  Globe,
  Mail,
  Compass,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-white font-sans selection:bg-brand-500 selection:text-white pb-24">
      {/* Background glow accents */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="fixed bottom-20 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 border-b border-ink-800/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Founded in 2022 &bull; Bridging Academia & Industry</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight"
          >
            Empowering the Next Generation of <span className="gradient-text">Tech Innovators</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-ink-300 max-w-3xl mx-auto leading-relaxed"
          >
            At <strong className="text-white">InternVision Tech</strong>, we deliver business-oriented client software solutions and mentor freshers with zero prior industry experience through hands-on, task-based virtual internships that simulate real-world tech engineering workflows.
          </motion.p>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6"
          >
            <div className="p-4 rounded-2xl bg-ink-900/60 border border-ink-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-brand-400">2022</div>
              <div className="text-xs text-ink-400 mt-1 font-medium">Year Established</div>
            </div>
            <div className="p-4 rounded-2xl bg-ink-900/60 border border-ink-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">10,000+</div>
              <div className="text-xs text-ink-400 mt-1 font-medium">Students Mentored</div>
            </div>
            <div className="p-4 rounded-2xl bg-ink-900/60 border border-ink-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-white">100+</div>
              <div className="text-xs text-ink-400 mt-1 font-medium">Happy Clients & Projects</div>
            </div>
            <div className="p-4 rounded-2xl bg-ink-900/60 border border-ink-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">2 Branches</div>
              <div className="text-xs text-ink-400 mt-1 font-medium">Mumbai HQ & Nagpur</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-16 sm:space-y-24">
        {/* Who We Are & Dual Mission */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
              <Compass className="w-4 h-4" />
              <span>Who We Are</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-snug">
              Transforming Academic Knowledge into Production-Grade Engineering
            </h2>
            <p className="text-sm sm:text-base text-ink-300 leading-relaxed">
              InternVision Tech is a forward-thinking engineering and career development firm committed to bridging the gap between academic learning and industry demands.
            </p>
            <p className="text-sm sm:text-base text-ink-300 leading-relaxed">
              We partner with businesses to build robust software systems while empowering college students and fresh graduates who have zero prior experience in the tech sector. Through structured task sprints, continuous code review, and expert guidance, we prepare young engineers for enterprise-level careers.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Client Software Projects */}
            <div className="p-6 rounded-2xl bg-ink-900/70 border border-ink-800 hover:border-brand-500/40 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Client Business Projects</h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                We take real software requirements from commercial clients, build high-performance web and enterprise applications, and fulfill their technical goals.
              </p>
            </div>

            {/* Card 2: Fresher Mentorship */}
            <div className="p-6 rounded-2xl bg-ink-900/70 border border-ink-800 hover:border-emerald-500/40 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Zero-Experience Mentorship</h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                We specialize in mentoring freshers starting from scratch with 0 tech experience, guiding them through practical tasks, debugging, and industry workflows.
              </p>
            </div>

            {/* Card 3: Virtual Task Internships */}
            <div className="p-6 rounded-2xl bg-ink-900/70 border border-ink-800 hover:border-purple-500/40 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Task-Based Virtual Sprints</h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                Interns receive hands-on task modules replicating enterprise ticket systems, source code management, and automated testing cycles.
              </p>
            </div>

            {/* Card 4: Verified Credentials */}
            <div className="p-6 rounded-2xl bg-ink-900/70 border border-ink-800 hover:border-amber-500/40 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Verified Credentials</h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                Instant QR & ID verifiable completion certificates, performance evaluation, and professional recommendation letters.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer (Internship Domains) */}
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Layers className="w-4 h-4" />
              <span>Internship Programs</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">What We Offer</h2>
            <p className="text-xs sm:text-sm text-ink-400">
              Industry-aligned virtual internship tracks tailored for maximum engineering impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Domain 1: Backend */}
            <div className="p-7 rounded-3xl bg-ink-900/80 border border-ink-800 hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Backend Development</h3>
                <p className="text-xs text-ink-300 leading-relaxed">
                  Dive deep into server-side programming, database management, authentication, and RESTful API development. Work with modern technologies like Python FastAPI, Node.js, and PostgreSQL to build scalable backend architectures.
                </p>
                <div className="space-y-2 pt-2 border-t border-ink-800">
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>REST API & Asynchronous Microservices</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Database Schema Design & Query Optimization</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>JWT Auth & Enterprise Security Practices</span>
                  </div>
                </div>
              </div>

              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-ink-800 hover:bg-brand-600 text-white text-xs font-bold transition border border-ink-700"
              >
                <span>Apply for Backend</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Domain 2: Frontend */}
            <div className="p-7 rounded-3xl bg-ink-900/80 border border-ink-800 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Frontend Development</h3>
                <p className="text-xs text-ink-300 leading-relaxed">
                  Enhance your skills in crafting modern user interfaces and responsive web experiences. Learn and apply Next.js 15, React 19, TypeScript, Tailwind CSS, and state management patterns to build interactive products.
                </p>
                <div className="space-y-2 pt-2 border-t border-ink-800">
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>React 19 & Next.js 15 App Router</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>TypeScript Type Safety & Clean Code</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Framer Motion & Modern Interactive UI</span>
                  </div>
                </div>
              </div>

              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-ink-800 hover:bg-purple-600 text-white text-xs font-bold transition border border-ink-700"
              >
                <span>Apply for Frontend</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Domain 3: Full-Stack */}
            <div className="p-7 rounded-3xl bg-ink-900/80 border border-ink-800 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Full-Stack Development</h3>
                <p className="text-xs text-ink-300 leading-relaxed">
                  Get the best of both worlds by engineering end-to-end full-stack systems. Master frontend user interfaces, backend RESTful microservices, and database architecture from conception to cloud deployment.
                </p>
                <div className="space-y-2 pt-2 border-t border-ink-800">
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>End-to-End System Architecture</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full-Stack Integration & State Flow</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Docker & Cloud Deployment Pipelines</span>
                  </div>
                </div>
              </div>

              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-ink-800 hover:bg-emerald-600 text-white text-xs font-bold transition border border-ink-700"
              >
                <span>Apply for Full-Stack</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-ink-900 via-ink-900/80 to-ink-950 border border-ink-800 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Why Choose InternVision Tech</h2>
            <p className="text-xs sm:text-sm text-ink-400">
              We provide the tools, feedback, and mentorship you need to thrive in today’s competitive market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3 p-4 rounded-2xl bg-ink-950/60 border border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Real-World Experience</h4>
              <p className="text-xs text-ink-300 leading-relaxed">
                Work on live, client-grade challenges that solve actual business problems rather than dummy toy projects.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-ink-950/60 border border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Mentorship & Guidance</h4>
              <p className="text-xs text-ink-300 leading-relaxed">
                Receive personalized code reviews and guidance from experienced leads passionate about tech mentorship.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-ink-950/60 border border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Innovative Environment</h4>
              <p className="text-xs text-ink-300 leading-relaxed">
                Be part of a forward-looking environment that promotes creative thinking, agile sprints, and modern tooling.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-ink-950/60 border border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Career Development</h4>
              <p className="text-xs text-ink-300 leading-relaxed">
                Build a portfolio, enhance your resume, and gain the competitive edge needed to land top-tier tech roles.
              </p>
            </div>
          </div>
        </section>

        {/* Corporate Locations & Branches */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
              <MapPin className="w-4 h-4" />
              <span>Our Presence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Headquarters & Operating Branches</h2>
            <p className="text-xs sm:text-sm text-ink-400">
              Serving students and commercial clients across India and globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Main HQ - Mumbai */}
            <div className="p-7 rounded-3xl bg-ink-900/80 border-2 border-brand-500/40 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Primary Headquarters
                </span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Mumbai Headquarters</h3>
                <p className="text-xs text-brand-400 font-semibold mt-0.5">Corporate & Engineering Hub</p>
              </div>
              <p className="text-xs text-ink-300 leading-relaxed">
                Our main headquarters in Mumbai oversees client product deliveries, curriculum design, partnership governance, and nationwide student certifications.
              </p>
              <div className="pt-2 text-xs text-ink-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Second Branch - Nagpur */}
            <div className="p-7 rounded-3xl bg-ink-900/80 border border-ink-800 hover:border-purple-500/40 transition relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Online Operating Branch
                </span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Nagpur Branch</h3>
                <p className="text-xs text-purple-400 font-semibold mt-0.5">Virtual Operations & Mentorship</p>
              </div>
              <p className="text-xs text-ink-300 leading-relaxed">
                Initially operated online, our Nagpur branch coordinates student doubts, project evaluation submissions, and virtual task management.
              </p>
              <div className="pt-2 text-xs text-ink-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>Nagpur, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Bar */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-900/80 via-brand-800/40 to-indigo-950 border border-brand-500/30 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Build Real-World Engineering Skills?
          </h2>
          <p className="text-xs sm:text-sm text-ink-200 max-w-xl mx-auto leading-relaxed">
            Apply for our upcoming virtual internship cohort or contact our team to collaborate on custom business software solutions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/apply"
              className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-brand-500/30 flex items-center gap-2"
            >
              <span>Apply for Internship</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-ink-900 hover:bg-ink-800 text-white text-xs sm:text-sm font-bold rounded-xl transition border border-ink-700 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Us</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
