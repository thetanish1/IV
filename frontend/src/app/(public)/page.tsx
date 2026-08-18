import Link from"next/link";
import { ArrowRight, CheckCircle2, Code2, Cpu, Rocket, ShieldCheck, Users, Trophy, Star } from"lucide-react";
import { FadeIn } from"@/components/animations/FadeIn";
import { Float } from"@/components/animations/Float";

export default function HomePage() {
 return (
 <div className="space-y-24 pb-20">
 {/* HERO SECTION */}
 <section className="relative overflow-hidden min-h-[80vh] grid grid-cols-[minmax(1rem,1fr)_minmax(0,40rem)_minmax(0,1fr)] lg:grid-cols-[minmax(2rem,1fr)_minmax(0,38rem)_minmax(0,1fr)] items-center lg:items-end pb-16">
 <div className="absolute inset-0 bg-ink-950 -z-10"/>

 <div className="col-start-2 pt-32 lg:pt-16 lg:pb-16 space-y-10 text-left z-10">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500 text-white text-xs font-semibold uppercase tracking-wider -rotate-1 origin-bottom-left shadow-lg">
 <Rocket className="w-3.5 h-3.5"/>
 Launch Your Tech Career in 2026
 </div>

 <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.05] max-w-3xl">
 Transform Your Passion Into A <br/><span className="text-brand-400">Production Tech Career</span>
 </h1>

 <p className="text-lg sm:text-xl text-ink-300 max-w-2xl leading-relaxed border-l-2 border-brand-500 pl-6">
 Gain industry-ready skills with hands-on bootcamps, real client projects, and guaranteed internship opportunities tailored for ambitious software engineering students.
 </p>

 <div className="flex flex-col sm:flex-row items-start gap-6 pt-4">
 <div className="flex flex-col items-start">
 <Link
 href="/apply"
 className="w-full sm:w-auto px-8 py-4 font-bold bg-white text-black hover:bg-ink-100 flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
 >
 Apply For Internship
 <ArrowRight className="w-4 h-4"/>
 </Link>
 <p className="text-xs text-ink-500 mt-3 font-medium flex items-center gap-1.5">
 <ShieldCheck className="w-3.5 h-3.5"/> No credit card required
 </p>
 </div>

 <div className="flex flex-col items-start">
 <Link
 href="/courses"
 className="w-full sm:w-auto px-8 py-4 font-bold bg-transparent hover:bg-ink-900 text-white border border-ink-700 flex items-center justify-center transition-all"
 >
 Explore Courses
 </Link>
 </div>
 </div>
 </div>

 {/* Asymmetric art element bleeding right */}
 <div className="col-[2/-1] lg:col-[3/-1] self-stretch hidden lg:flex items-end justify-end pb-16 relative">
 <div className="w-full h-full border-l border-t border-ink-800/50 bg-ink-950 relative overflow-hidden mt-32 ml-16">
 <div className="absolute inset-0 bg-grid-ink-800/30 bg-[length:32px_32px]"/>
 <div className="absolute top-1/2 -translate-y-1/2 -left-12 space-y-4">
 <Float delay={0} yOffset={10}>
 <div className="w-48 h-32 bg-ink-800 border border-ink-700"/>
 </Float>
 <Float delay={0.5} yOffset={15}>
 <div className="w-64 h-32 bg-brand-600/10 border border-brand-500/30 ml-8"/>
 </Float>
 </div>
 </div>
 </div>
 </section>

 {/* STATS STRIP (TRUST BANNER) */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 pb-12 mt-16 max-w-5xl mx-auto border-t border-b border-ink-800">
 <div className="space-y-2 group md:translate-y-4">
 <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-brand-400 transition-colors tracking-tighter">5k+</div>
 <div className="text-sm font-bold text-ink-400 uppercase tracking-wide">Students Trained</div>
 </div>
 <div className="space-y-2 group">
 <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-brand-400 transition-colors tracking-tighter">94%</div>
 <div className="text-sm font-bold text-ink-400 uppercase tracking-wide">Placement Rate</div>
 </div>
 <div className="space-y-2 group md:-translate-y-2">
 <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-brand-400 transition-colors tracking-tighter">4.9</div>
 <div className="text-sm font-bold text-ink-400 uppercase tracking-wide">Satisfaction Score</div>
 </div>
 <div className="space-y-2 group md:translate-y-2">
 <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-brand-400 transition-colors tracking-tighter">100+</div>
 <div className="text-sm font-bold text-ink-400 uppercase tracking-wide">Hiring Partners</div>
 </div>
 </div>


 {/* WHY CHOOSE US */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-left space-y-4 mb-20 max-w-2xl border-l-4 border-white pl-6">
 <h2 className="text-4xl font-black text-white uppercase tracking-tight">Why Choose InternVision Tech?</h2>
 <p className="text-ink-400 text-lg">
 We bridge the gap between academic theory and real-world engineering standards. No fluff, just production code.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
 <div className="md:col-span-5 bg-ink-950 border-2 border-ink-800 p-10 space-y-6 md:translate-y-12">
 <div className="w-14 h-14 bg-brand-500 text-white flex items-center justify-center shadow-[4px_4px_0px_#ffffff]">
 <Code2 className="w-7 h-7"/>
 </div>
 <h3 className="text-2xl font-black text-white uppercase">Production-Grade Stack</h3>
 <p className="text-ink-400 text-base leading-relaxed">
 Learn Next.js 15, FastAPI, Docker, and PostgreSQL with real GitHub workflows and deployment pipelines.
 </p>
 </div>

 <div className="md:col-span-7 space-y-8">
 <div className="bg-ink-950 border border-ink-800 p-8 flex gap-6 items-start hover:border-brand-500 transition-colors">
 <div className="w-12 h-12 shrink-0 bg-ink-900 border border-ink-700 text-white flex items-center justify-center">
 <Cpu className="w-5 h-5"/>
 </div>
 <div>
 <h3 className="text-xl font-bold text-white mb-2">1:1 Mentorship</h3>
 <p className="text-ink-400 text-sm leading-relaxed">
 Get direct code reviews, resume polishing, and mock technical interview sessions from senior engineers who actively work in the industry.
 </p>
 </div>
 </div>

 <div className="bg-ink-950 border border-ink-800 p-8 flex gap-6 items-start hover:border-brand-500 transition-colors md:ml-12">
 <div className="w-12 h-12 shrink-0 bg-ink-900 border border-ink-700 text-white flex items-center justify-center">
 <Trophy className="w-5 h-5"/>
 </div>
 <div>
 <h3 className="text-xl font-bold text-white mb-2">Guaranteed Internship</h3>
 <p className="text-ink-400 text-sm leading-relaxed">
 Choose from 1, 3, or 6-month hands-on internships with real client projects and verified certificates.
 </p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* FEATURED COURSES PREVIEW */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
 <div className="max-w-xl">
 <h2 className="text-4xl font-black text-white uppercase tracking-tight">Featured Bootcamps</h2>
 <p className="text-ink-400 text-lg mt-4">Accelerate your skills with our top-rated, outcome-driven programs designed for the modern web.</p>
 </div>
 <Link href="/courses"className="text-sm font-bold text-brand-400 hover:text-brand-300 flex items-center gap-2 border-b-2 border-brand-400 pb-1">
 View All Courses <ArrowRight className="w-4 h-4"/>
 </Link>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
 <div className="bg-ink-950 border border-ink-800 p-10 flex flex-col justify-between space-y-8 h-full hover:border-ink-600 transition-colors relative">
 <div className="absolute top-0 right-0 p-4">
 <div className="w-2 h-2 bg-brand-500 rounded-full"/>
 </div>
 <div className="space-y-6">
 <div className="flex items-center gap-4">
 <span className="px-3 py-1 text-xs font-bold bg-white text-black uppercase tracking-wider">
 Intermediate
 </span>
 <span className="text-xs text-ink-400 font-bold uppercase tracking-widest">8 Weeks</span>
 </div>
 <h3 className="text-3xl font-black text-white leading-tight">Full Stack Web Development Bootcamp</h3>
 <p className="text-ink-400 text-base leading-relaxed">
 Master Next.js 15, React 19, FastAPI, PostgreSQL, and modern Tailwind CSS. Build scalable web applications.
 </p>
 <div className="flex flex-wrap gap-2 pt-2">
 {["Next.js","React","FastAPI","PostgreSQL"].map((tech) => (
 <span key={tech} className="px-3 py-1.5 text-xs font-medium bg-ink-900 text-ink-300 border border-ink-800">
 {tech}
 </span>
 ))}
 </div>
 </div>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-ink-800">
 <div className="text-3xl font-black text-white">₹4,999</div>
 <Link href="/courses/full-stack-web-development"className="px-6 py-3 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white transition text-center">
 Enroll Now
 </Link>
 </div>
 </div>

 <div className="bg-ink-950 border border-ink-800 p-10 flex flex-col justify-between space-y-8 h-full hover:border-ink-600 transition-colors md:mt-12 relative">
 <div className="space-y-6">
 <div className="flex items-center gap-4">
 <span className="px-3 py-1 text-xs font-bold bg-ink-800 text-white uppercase tracking-wider">
 Advanced
 </span>
 <span className="text-xs text-ink-400 font-bold uppercase tracking-widest">12 Weeks</span>
 </div>
 <h3 className="text-3xl font-black text-white leading-tight">AI & Machine Learning Engineering</h3>
 <p className="text-ink-400 text-base leading-relaxed">
 Build cutting-edge AI models, fine-tune LLMs, integrate PyTorch and Vector DBs into production systems.
 </p>
 <div className="flex flex-wrap gap-2 pt-2">
 {["Python","PyTorch","OpenAI API","LangChain"].map((tech) => (
 <span key={tech} className="px-3 py-1.5 text-xs font-medium bg-ink-900 text-ink-300 border border-ink-800">
 {tech}
 </span>
 ))}
 </div>
 </div>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-ink-800">
 <div className="text-3xl font-black text-white">₹6,999</div>
 <Link href="/courses/ai-machine-learning-engineering"className="px-6 py-3 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white transition text-center">
 Enroll Now
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* CTA SECTION */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
 <div className="bg-brand-600 p-12 md:p-20 text-left space-y-8 relative overflow-hidden shadow-[8px_8px_0px_#ffffff]">
 <div className="max-w-3xl relative z-10 space-y-6">
 <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none">Ready to Step Into Tech?</h2>
 <p className="text-brand-100 text-lg md:text-xl leading-relaxed">
 Apply today for our upcoming batch. Flexible 1, 3, or 6-month internship durations tailored to your academic schedule.
 </p>
 <div className="pt-4">
 <Link
 href="/apply"
 className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold bg-white text-black hover:bg-ink-100 transition-transform hover:-translate-y-1 shadow-lg"
 >
 Start Application <ArrowRight className="w-5 h-5"/>
 </Link>
 </div>
 </div>
 </div>
 </section>
 </div>
 );
}
