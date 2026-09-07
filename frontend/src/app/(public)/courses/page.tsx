"use client";

import { useEffect, useState } from"react";
import { BookOpen, Search, Filter, Loader2 } from"lucide-react";
import { Course } from"@/types";
import { apiRequest } from"@/lib/api-client";
import { CourseCard } from"@/components/cards/CourseCard";
import { FadeIn } from "@/components/animations/FadeIn";

const DEFAULT_COURSES: Course[] = [
  {
    id: 1 as any,
    title: "Full Stack Web Development Bootcamp",
    slug: "full-stack-web-development",
    description: "Master modern web development using Next.js 15, React 19, TypeScript, FastAPI, and PostgreSQL. Build production applications from scratch.",
    price_inr: 0,
    duration: "8 Weeks",
    level: "Intermediate",
    technologies: ["Next.js", "React", "TypeScript", "FastAPI", "PostgreSQL"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2 as any,
    title: "Data Science & AI Bootcamp",
    slug: "data-science-ai",
    description: "Master statistical modeling, Exploratory Data Analysis (EDA), machine learning pipelines, Scikit-Learn, deep learning with TensorFlow, and data visualization.",
    price_inr: 0,
    duration: "10 Weeks",
    level: "Intermediate",
    technologies: ["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "Tableau"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3 as any,
    title: "Java Programming & Core Engineering",
    slug: "java-programming",
    description: "Master Core Java 21, Object-Oriented Programming (OOP), Data Structures & Algorithms (DSA), multithreading, and enterprise Spring Boot microservices.",
    price_inr: 0,
    duration: "8 Weeks",
    level: "Beginner",
    technologies: ["Java 21", "Spring Boot", "OOP", "DSA", "Hibernate", "MySQL"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4 as any,
    title: "Android App Development Bootcamp",
    slug: "android-app-development",
    description: "Build high-performance native Android apps with Kotlin, declarative Jetpack Compose UI, MVVM architecture, Coroutines, Retrofit, and Firebase.",
    price_inr: 0,
    duration: "8 Weeks",
    level: "Intermediate",
    technologies: ["Kotlin", "Jetpack Compose", "Android Studio", "Coroutines", "Retrofit", "Firebase"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5 as any,
    title: "AI & Machine Learning Engineering",
    slug: "ai-machine-learning-engineering",
    description: "Deep dive into Neural Networks, LLMs, LangChain, RAG architecture, PyTorch, and fine-tuning open-source models for enterprise AI systems.",
    price_inr: 0,
    duration: "12 Weeks",
    level: "Advanced",
    technologies: ["Python", "PyTorch", "OpenAI API", "LangChain", "Vector DBs"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6 as any,
    title: "Cloud DevOps & Kubernetes Mastery",
    slug: "cloud-devops-kubernetes-mastery",
    description: "Architect high-availability infrastructure with Docker, Kubernetes, Terraform, AWS, and production CI/CD automation pipelines.",
    price_inr: 0,
    duration: "10 Weeks",
    level: "Intermediate",
    technologies: ["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7 as any,
    title: "Cyber Security & Ethical Hacking",
    slug: "cyber-security-ethical-hacking",
    description: "Understand network security, penetration testing, cryptography, web vulnerability assessment, and defensive security strategies.",
    price_inr: 0,
    duration: "8 Weeks",
    level: "Beginner",
    technologies: ["Linux", "Metasploit", "Wireshark", "Burp Suite", "Python"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showCourses, setShowCourses] = useState<boolean | null>(null);

  useEffect(() => {
    checkSettings();
    window.addEventListener("site-settings-changed", checkSettings);
    return () => window.removeEventListener("site-settings-changed", checkSettings);
  }, []);

  const checkSettings = async () => {
    try {
      const data = await apiRequest<{ show_courses?: boolean | string }>("/settings");
      if (data) {
        const isEnabled = data.show_courses === true || data.show_courses === "true";
        setShowCourses(isEnabled);
      } else {
        setShowCourses(false);
      }
    } catch {
      setShowCourses(false);
    }
  };

  useEffect(() => {
    if (showCourses) {
      fetchCourses();
    } else if (showCourses === false) {
      setLoading(false);
    }
  }, [levelFilter, showCourses]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let endpoint = "/courses";
      const params = new URLSearchParams();
      if (levelFilter !== "all") params.set("level", levelFilter);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const data = await apiRequest<Course[]>(endpoint, {}, 5000);
      if (data && data.length > 0) {
        setCourses(data);
      }
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoading(false);
    }
  };

  if (showCourses === false) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-6">
        <div className="w-16 h-16 bg-ink-900 border border-ink-800 text-ink-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8 text-ink-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Course Catalog Offline
          </h1>
          <p className="text-ink-400 text-sm max-w-lg mx-auto">
            Bootcamp courses and enrollment tracks are currently disabled or undergoing curriculum updates. Please check back later.
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <a
            href="/"
            className="px-6 py-2.5 bg-ink-900 hover:bg-ink-800 text-white text-xs font-bold border border-ink-700 transition"
          >
            Return Home
          </a>
          <a
            href="/apply"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-brand-600/30"
          >
            Apply for Internship
          </a>
        </div>
      </div>
    );
  }

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
 <div className="text-left space-y-4 max-w-4xl border-l-8 border-brand-500 pl-6 sm:pl-10">
 <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight uppercase leading-[0.9]">
 Explore Industry <br/><span className="text-brand-400">Bootcamps</span>
 </h1>
 <p className="text-ink-300 text-lg sm:text-xl font-medium pt-4 max-w-2xl">
 Comprehensive, project-driven training programs engineered to make you job-ready.
 </p>
 </div>

 <div className="bg-ink-950 border-2 border-ink-800 p-6 flex flex-col md:flex-row gap-6 items-end justify-between shadow-[8px_8px_0px_#1a1915]">
 <div className="w-full md:w-[28rem] space-y-2">
 <label className="text-xs font-bold text-ink-400 uppercase tracking-widest">Search</label>
 <div className="relative">
 <Search className="w-5 h-5 absolute left-4 top-3.5 text-ink-500"/>
 <input
 type="text"
 placeholder="Search courses or technologies..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full bg-ink-900 border-2 border-ink-700 pl-12 pr-4 py-3 text-base font-medium text-white focus:outline-none focus:border-brand-500 transition-colors"
 />
 </div>
 </div>

 <div className="w-full md:w-64 space-y-2">
 <label className="text-xs font-bold text-ink-400 uppercase tracking-widest flex items-center gap-2">
 <Filter className="w-3.5 h-3.5"/> Filter by Level
 </label>
 <select
 value={levelFilter}
 onChange={(e) => setLevelFilter(e.target.value)}
 className="w-full bg-ink-900 border-2 border-ink-700 px-4 py-3 text-base font-medium text-white focus:outline-none focus:border-brand-500 transition-colors cursor-pointer appearance-none"
 >
 <option value="all">All Levels</option>
 <option value="Beginner">Beginner</option>
 <option value="Intermediate">Intermediate</option>
 <option value="Advanced">Advanced</option>
 </select>
 </div>
 </div>

 {loading ? (
 <div className="flex justify-center items-center py-32">
 <Loader2 className="w-10 h-10 text-brand-500 animate-spin"/>
 </div>
 ) : filteredCourses.length === 0 ? (
 <div className="bg-ink-950 border-2 border-ink-800 p-16 text-center text-ink-400 space-y-4">
 <BookOpen className="w-12 h-12 mx-auto text-ink-600"/>
 <p className="text-xl font-bold text-white">No courses match your search criteria.</p>
 <p className="text-sm text-ink-400">Try clearing filters or searching for different keywords.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 pt-8">
 {filteredCourses.map((course) => (
 <CourseCard key={course.id} course={course} />
 ))}
 </div>
 )}
 </div>
 );
}
