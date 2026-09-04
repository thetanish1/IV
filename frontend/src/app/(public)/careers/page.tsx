import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Code2,
  Globe,
  Server,
  Clock,
  MapPin,
  Zap,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

export const metadata = {
  title: "Careers | InternVision Tech",
  description:
    "Join the InternVision Tech team. We are hiring Software Engineering Interns, AI/ML Engineering Interns, Frontend React Developers, and Backend Spring Boot Developers for Virtual & Remote roles.",
};

const jobs = [
  {
    id: "software-intern",
    icon: Zap,
    badge: "Virtual Internship",
    badgeStyle: "bg-brand-500 text-white",
    title: "Software Engineering Intern",
    type: "Paid · 3 Months",
    location: "Virtual Internship (Remote)",
    posted: "Open Now",
    summary:
      "Kick-start your engineering career by working on real production projects alongside senior engineers in our 100% Virtual Pre-Hire Internship Program. You will contribute to both frontend and backend features of our EdTech platform remotely.",
    responsibilities: [
      "Build and ship production features in React / Next.js",
      "Write REST API consumers and integrate FastAPI endpoints",
      "Participate in daily virtual standups, PR reviews, and sprint planning",
      "Write unit tests and document your code thoroughly",
      "Learn Git-based CI/CD workflows and automated cloud deployments",
    ],
    requirements: [
      "Available for 100% Virtual Internship (Remote work from anywhere in India)",
      "Currently pursuing or recently completed a B.Tech / BCA / MCA / B.Sc in CS/IT or related field",
      "Familiarity with HTML, CSS, JavaScript, and Python",
      "Basic understanding of React or any frontend framework",
      "High self-motivation and eagerness to collaborate with senior developer mentors online",
      "Good written and verbal communication in English",
    ],
    techStack: ["React", "Next.js", "Python", "FastAPI", "PostgreSQL", "Git"],
    perks: ["Paid stipend", "1:1 Virtual Mentorship", "Verified Certificate of Completion", "Pre-Placement Offer (PPO) Consideration"],
    color: "border-brand-500",
    accentBg: "bg-brand-500/10",
  },
  {
    id: "ai-ml-intern",
    icon: BrainCircuit,
    badge: "Virtual Internship",
    badgeStyle: "bg-purple-600 text-white",
    title: "AI / ML Engineering Intern",
    type: "Paid · 3 / 6 Months",
    location: "Virtual Internship (Remote)",
    posted: "Open Now",
    summary:
      "Work on cutting-edge AI features, intelligent chatbots, LLM agent workflows, and machine learning pipelines. Collaborate with our AI research team on real-world datasets and model deployments in a flexible remote environment.",
    responsibilities: [
      "Develop and fine-tune Machine Learning and Deep Learning models using PyTorch / HuggingFace",
      "Build LLM agent workflows, prompt engineering pipelines, and RAG architectures",
      "Integrate AI inference endpoints with FastAPI backend services",
      "Clean, preprocess, and evaluate large multimodal training datasets",
      "Benchmark model latency, token efficiency, and output quality",
    ],
    requirements: [
      "Available for 100% Virtual Internship (Remote work)",
      "Strong Python programming and mathematical foundation (Linear Algebra, Calculus, Probability)",
      "Hands-on experience with PyTorch, TensorFlow, Scikit-Learn, or Hugging Face",
      "Understanding of Transformer architectures, embeddings, vector databases, and LLMs",
      "Familiarity with Git and RESTful API development",
      "Passion for building intelligent agentic systems",
    ],
    techStack: ["Python", "PyTorch", "Hugging Face", "LangChain", "OpenAI / Anthropic APIs", "FastAPI", "Vector DBs"],
    perks: ["Paid stipend", "GPU Cloud Compute Credits", "1:1 Mentorship with AI Engineers", "PPO Consideration"],
    color: "border-purple-500",
    accentBg: "bg-purple-500/10",
  },
  {
    id: "frontend-developer",
    icon: Globe,
    badge: "Full-Time",
    badgeStyle: "bg-white text-black",
    title: "Frontend Developer (React & Next.js)",
    type: "Full-Time · Permanent",
    location: "Virtual / Remote",
    posted: "Open Now",
    summary:
      "We are looking for a passionate Frontend Developer to design and build high-performance, accessible user interfaces for our rapidly growing EdTech platform used by 5,000+ students across India.",
    responsibilities: [
      "Develop pixel-perfect, responsive UIs from Figma designs",
      "Build reusable component libraries using React 18+ and Next.js 15",
      "Own the performance budget — Core Web Vitals, bundle size, lazy loading",
      "Integrate with FastAPI REST endpoints and Razorpay payment flows",
      "Champion accessibility (WCAG 2.1) and cross-browser compatibility",
      "Collaborate with design, backend, and product teams remotely",
    ],
    requirements: [
      "Available for remote full-time work",
      "2+ years of production experience with React.js & Next.js",
      "Proficiency in TypeScript and modern ES2022+ JavaScript",
      "Strong understanding of CSS, Tailwind CSS, and responsive design",
      "Familiarity with REST APIs, SWR/React Query, and state management",
      "Experience with testing (Jest, React Testing Library)",
    ],
    techStack: ["React 18+", "Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion", "Jest"],
    perks: ["Competitive salary", "Flexible remote work", "Home office stipend", "Learning budget ₹30k/yr", "Health insurance"],
    color: "border-white",
    accentBg: "bg-white/5",
  },
  {
    id: "backend-developer",
    icon: Server,
    badge: "Full-Time",
    badgeStyle: "bg-ink-700 text-white border border-ink-600",
    title: "Backend Developer (FastAPI & Spring Boot)",
    type: "Full-Time · Permanent",
    location: "Virtual / Remote",
    posted: "Open Now",
    summary:
      "Join our engineering team as a Backend Developer to architect scalable microservices, build high-throughput APIs, and own the data layer of InternVision Tech's core platform.",
    responsibilities: [
      "Design and develop RESTful APIs using FastAPI and Python 3.11+",
      "Build and maintain microservices with clean, testable code (SOLID / DDD)",
      "Model and optimize PostgreSQL / Supabase schemas; write efficient queries",
      "Implement JWT authentication, OAuth2, and role-based access control (RBAC)",
      "Set up CI/CD pipelines with Docker, GitHub Actions, and cloud deployment",
      "Instrument services with logging, metrics, and tracing",
    ],
    requirements: [
      "Available for remote full-time work",
      "3+ years of backend experience with Python/FastAPI or Java/Spring Boot",
      "Strong understanding of REST API design patterns and HTTP semantics",
      "Hands-on experience with SQLAlchemy/JPA and PostgreSQL / Supabase",
      "Familiarity with Docker and containerised deployments",
      "Knowledge of JWT / OAuth2 authentication flows",
      "Experience writing unit and integration tests (pytest / JUnit 5)",
    ],
    techStack: ["Python 3.11", "FastAPI", "PostgreSQL", "Supabase", "Docker", "pytest", "GitHub Actions"],
    perks: ["Competitive salary", "Remote work flexibility", "Home office allowance", "Health insurance", "Paid leaves"],
    color: "border-ink-600",
    accentBg: "bg-ink-800/40",
  },
];

export default function CareersPage() {
  return (
    <div className="space-y-20 pb-24">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-ink-950 py-24 px-4">
        <div className="absolute inset-0 bg-grid-ink-800/20 bg-[length:32px_32px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn delay={0.05} direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500 text-white text-xs font-semibold uppercase tracking-wider mb-6 -rotate-1 origin-left shadow-lg">
              <Briefcase className="w-3.5 h-3.5" />
              We&apos;re Hiring — InternVision Tech
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
              Build the Future<br />
              <span className="text-brand-400">With Us.</span>
            </h1>
            <p className="text-lg sm:text-xl text-ink-300 max-w-2xl leading-relaxed border-l-2 border-brand-500 pl-6">
              InternVision Tech is offering paid{" "}
              <strong className="text-white font-bold">Virtual Internships & Remote Engineering Roles</strong>{" "}
              giving developers nationwide the opportunity to build industry-scale products.
            </p>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { label: "Open Positions", value: "4" },
                { label: "Team Size", value: "15+" },
                { label: "Students Impacted", value: "5k+" },
                { label: "Work Mode", value: "Virtual / Remote" },
              ].map((stat) => (
                <div key={stat.label} className="bg-ink-900 border border-ink-800 px-6 py-4">
                  <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-ink-400 font-bold uppercase tracking-wide mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Job Listings ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <FadeIn delay={0.05} direction="up">
          <div className="border-l-4 border-white pl-6 mb-12">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Open Positions</h2>
            <p className="text-ink-400 text-lg mt-2">
              4 roles — from Virtual Internships to Core Engineering.
            </p>
          </div>
        </FadeIn>

        {jobs.map((job, idx) => {
          const Icon = job.icon;
          return (
            <FadeIn key={job.id} delay={0.1 * (idx + 1)} direction="up">
              <article
                id={job.id}
                className={`bg-ink-950 border-2 ${job.color} p-8 md:p-10 space-y-8 scroll-mt-24 hover:shadow-[6px_6px_0px_#ffffff10] transition-shadow`}
              >
                {/* Job header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 shrink-0 ${job.accentBg} border border-ink-700 flex items-center justify-center text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${job.badgeStyle}`}>
                          {job.badge}
                        </span>
                        <span className="text-xs text-ink-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {job.type}
                        </span>
                        <span className="text-xs text-ink-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">{job.title}</h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 border border-brand-500/30 px-3 py-1 bg-brand-500/10 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                    {job.posted}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-ink-300 text-base leading-relaxed border-l-2 border-ink-700 pl-4">
                  {job.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Responsibilities */}
                  <div>
                    <h4 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5" /> Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {job.responsibilities.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-sm text-ink-300">
                          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" /> Requirements
                    </h4>
                    <ul className="space-y-2">
                      {job.requirements.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-sm text-ink-300">
                          <CheckCircle2 className="w-4 h-4 text-ink-500 shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tech stack */}
                <div>
                  <h4 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.techStack.map((tech) => (
                      <span key={tech} className="px-3 py-1.5 text-xs font-medium bg-ink-900 text-ink-300 border border-ink-800">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Perks */}
                <div>
                  <h4 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3">What you get</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.perks.map((perk) => (
                      <span key={perk} className="px-3 py-1.5 text-xs font-semibold bg-brand-600/10 text-brand-400 border border-brand-500/20">
                        ✦ {perk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 border-t border-ink-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-xs text-ink-500">
                    To apply, visit our Internship Application page and select your track.
                  </p>
                  <Link
                    href="/apply"
                    id={`apply-${job.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white transition hover:-translate-y-0.5 shrink-0"
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            </FadeIn>
          );
        })}
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn delay={0.1} direction="up">
          <div className="bg-brand-600 p-12 md:p-16 space-y-6 relative overflow-hidden shadow-[8px_8px_0px_#ffffff]">
            <div className="max-w-2xl relative z-10 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                Don&apos;t see your role?
              </h2>
              <p className="text-brand-100 text-lg leading-relaxed">
                We&apos;re always looking for exceptional people. Send your portfolio and resume to{" "}
                <a href="mailto:internvisiontechhr@gmail.com" className="underline font-semibold">
                  internvisiontechhr@gmail.com
                </a>
              </p>
              <Link
                href="/contact"
                id="careers-contact-cta"
                className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold bg-white text-black hover:bg-ink-100 transition-transform hover:-translate-y-1 shadow-lg"
              >
                Get in Touch <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
