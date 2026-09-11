"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  User,
  Mail,
  Phone,
  Sparkles,
  Award,
  Building2,
  Code2,
  FileCheck,
  Send,
  Zap,
} from "lucide-react";
import { Course } from "@/types";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";

// Detailed curriculum content per course slug
const COURSE_CURRICULUM: Record<
  string,
  {
    summary: string;
    modules: { title: string; desc: string; topics: string[] }[];
    outcomes: string[];
    prerequisites: string[];
  }
> = {
  "full-stack-web-development": {
    summary:
      "A complete end-to-end engineering track taking you from fundamental web technologies to building and shipping full-stack production systems using Next.js 15, React 19, FastAPI, and PostgreSQL.",
    modules: [
      {
        title: "Module 1: Modern Frontend Architecture (Next.js 15 & React 19)",
        desc: "Master Server Components, client-side reactivity, streaming SSR, and file-based App Router layout patterns.",
        topics: ["Next.js 15 App Router", "React 19 Hooks & Actions", "TypeScript", "Tailwind CSS"],
      },
      {
        title: "Module 2: High-Throughput Backend APIs (Python & FastAPI)",
        desc: "Design RESTful APIs with Pydantic validation, dependency injection, and asynchronous request handling.",
        topics: ["FastAPI Routing", "Pydantic Schemas", "Async Python 3.12+", "Error Handlers"],
      },
      {
        title: "Module 3: Relational Databases & ORM (PostgreSQL & Supabase)",
        desc: "Architect scalable relational database schemas, write optimized SQL queries, and manage migrations.",
        topics: ["PostgreSQL", "SQLAlchemy 2.0", "Supabase Connection Pooling", "Alembic Migrations"],
      },
      {
        title: "Module 4: Authentication, Security & Payments",
        desc: "Implement JWT auth, Google OAuth, Role-Based Access Control (RBAC), and Razorpay payment workflows.",
        topics: ["JWT & Refresh Tokens", "Google OAuth", "RBAC Middleware", "Webhook Verification"],
      },
      {
        title: "Module 5: Docker Containerization, CI/CD & Cloud Deployment",
        desc: "Package applications into lightweight multi-stage Docker images and deploy with GitHub Actions to cloud infra.",
        topics: ["Docker & Compose", "GitHub Actions CI/CD", "Vercel & Railway Deployment", "Monitoring"],
      },
    ],
    outcomes: [
      "Ship full-stack production web applications with 100% TypeScript type safety",
      "Design and deploy production REST microservices with FastAPI and PostgreSQL",
      "Implement robust user authentication, role management, and database pooling",
      "Deploy scalable applications using Docker and automated CI/CD pipelines",
    ],
    prerequisites: ["Basic familiarity with HTML, CSS, and JavaScript", "Fundamental understanding of any programming language"],
  },
  "ai-machine-learning-engineering": {
    summary:
      "Deep dive into Artificial Intelligence, Deep Learning with PyTorch, Large Language Models (LLMs), RAG pipelines, and building autonomous agentic AI applications.",
    modules: [
      {
        title: "Module 1: Python for AI & Mathematical Foundations",
        desc: "Core linear algebra, multivariable calculus, probability, and vectorized numerical compute with NumPy & Pandas.",
        topics: ["NumPy & Pandas", "Linear Algebra for ML", "Calculus & Gradients", "Data Preprocessing"],
      },
      {
        title: "Module 2: Machine Learning & Statistical Modeling",
        desc: "Supervised and unsupervised algorithms, feature engineering, loss functions, cross-validation, and metrics.",
        topics: ["Scikit-Learn", "Regression & Classification", "Random Forests & XGBoost", "Clustering & PCA"],
      },
      {
        title: "Module 3: Deep Learning & Neural Networks with PyTorch",
        desc: "Build CNNs, RNNs, and custom neural network architectures with backpropagation and GPU compute optimization.",
        topics: ["PyTorch Tensor Compute", "Custom Loss Functions", "CNNs & Computer Vision", "Transfer Learning"],
      },
      {
        title: "Module 4: Transformers, Hugging Face & LLM Fine-Tuning",
        desc: "Understand self-attention mechanisms, tokenization, Hugging Face pipelines, LoRA, and parameter-efficient fine-tuning.",
        topics: ["Self-Attention & Transformer Architecture", "Hugging Face Hub", "PEFT & LoRA", "Model Quantization"],
      },
      {
        title: "Module 5: RAG Architectures, Vector Databases & AI Agents",
        desc: "Build production Retrieval-Augmented Generation systems using LangChain, Chroma/Pinecone, and LLM reasoning loops.",
        topics: ["LangChain & LlamaIndex", "Vector Embeddings", "Hybrid Search & Reranking", "Autonomous Tool-calling Agents"],
      },
    ],
    outcomes: [
      "Train, fine-tune, and evaluate Deep Learning models using PyTorch & Hugging Face",
      "Build production RAG pipelines with semantic vector search and LLM context routing",
      "Deploy scalable AI inference microservices with FastAPI and streaming token responses",
      "Architect autonomous AI agent workflows with multi-step reasoning capabilities",
    ],
    prerequisites: ["Proficiency in Python programming", "Basic linear algebra and calculus understanding"],
  },
  "cloud-devops-kubernetes-mastery": {
    summary:
      "Master cloud infrastructure, container orchestration with Kubernetes, automated CI/CD workflows, Terraform Infrastructure as Code, and production observability.",
    modules: [
      {
        title: "Module 1: Linux Administration & Cloud Networking",
        desc: "Linux kernel fundamentals, SSH, shell scripting, DNS, reverse proxies, and VPC cloud networking concepts.",
        topics: ["Linux Shell & Systemd", "Nginx Reverse Proxy", "TCP/IP & DNS", "AWS VPC Subnets & Gateways"],
      },
      {
        title: "Module 2: Containerization with Docker",
        desc: "Build secure, lightweight container images, multi-stage builds, container networking, and local Compose setups.",
        topics: ["Dockerfile Optimization", "Multi-stage Builds", "Docker Compose", "Container Security"],
      },
      {
        title: "Module 3: Kubernetes Cluster Orchestration",
        desc: "Deploy and manage resilient workloads with Pods, Deployments, Services, ConfigMaps, Secrets, and Ingress Controllers.",
        topics: ["Kubernetes Architecture", "K8s Manifests", "Ingress & TLS (Cert-Manager)", "Horizontal Pod Autoscaling"],
      },
      {
        title: "Module 4: Infrastructure as Code (Terraform) & AWS",
        desc: "Provision reproducible cloud infrastructure on AWS (EC2, S3, RDS, EKS) using Terraform state management.",
        topics: ["Terraform HCL", "AWS EKS Clusters", "State Locking & Modules", "IAM Least Privilege"],
      },
      {
        title: "Module 5: CI/CD Pipelines & Site Reliability Engineering (SRE)",
        desc: "Build zero-downtime deployment pipelines with GitHub Actions, Prometheus monitoring, Grafana dashboards, and alerts.",
        topics: ["GitHub Actions Workflows", "ArgoCD GitOps", "Prometheus & Grafana", "Centralized Logging"],
      },
    ],
    outcomes: [
      "Provision and manage enterprise-grade Kubernetes clusters in production environments",
      "Automate cloud deployments with GitHub Actions and GitOps workflows",
      "Write clean, modular Infrastructure as Code using Terraform and AWS",
      "Set up comprehensive monitoring, metrics collection, and alerting stacks",
    ],
    prerequisites: ["Familiarity with command line / terminal", "Basic understanding of web application architecture"],
  },
  "cyber-security-ethical-hacking": {
    summary:
      "Comprehensive training in ethical hacking, web penetration testing, network packet analysis, vulnerability management, and defensive security engineering.",
    modules: [
      {
        title: "Module 1: Security Fundamentals & Network Architecture",
        desc: "OSI model, network protocols (TCP/IP, UDP, ICMP), firewall configuration, and traffic analysis with Wireshark.",
        topics: ["Network Protocols", "Wireshark Packet Analysis", "Port Scanning (Nmap)", "Firewalls & VPNs"],
      },
      {
        title: "Module 2: Linux Security & Shell Scripting",
        desc: "Kali Linux tools, file permissions, privilege escalation techniques, and automating security tasks with Bash/Python.",
        topics: ["Kali Linux Ecosystem", "Privilege Escalation", "Bash & Python Automation", "Log Analysis"],
      },
      {
        title: "Module 3: Web Application Security (OWASP Top 10)",
        desc: "Discover, exploit, and remediate SQL injection, XSS, CSRF, SSRF, Broken Access Control, and auth flaws using Burp Suite.",
        topics: ["Burp Suite Professional", "SQL Injection & XSS", "Authentication Bypass", "API Security Testing"],
      },
      {
        title: "Module 4: Penetration Testing & Exploit Frameworks",
        desc: "Perform end-to-end authorized penetration tests using Metasploit, exploit databases, and post-exploitation strategies.",
        topics: ["Metasploit Framework", "Vulnerability Scanning", "Password Cracking (Hashcat/John)", "Post-Exploitation"],
      },
      {
        title: "Module 5: Defensive Security & Security Operations (SOC)",
        desc: "SIEM monitoring, threat detection, incident response, secure code review, and cryptography standards.",
        topics: ["SIEM (Splunk / Wazuh)", "Incident Response", "Applied Cryptography (RSA/AES)", "Hardening & Compliance"],
      },
    ],
    outcomes: [
      "Conduct professional penetration tests and vulnerability assessments",
      "Identify and remediate OWASP Top 10 web vulnerabilities and API flaws",
      "Analyze network traffic and investigate security incidents effectively",
      "Understand enterprise defensive controls, SIEM monitoring, and compliance",
    ],
    prerequisites: ["Basic computer networking knowledge", "Comfort using command-line interfaces"],
  },
  "data-science-ai": {
    summary:
      "Master statistical data analysis, machine learning algorithms, deep learning with TensorFlow/PyTorch, exploratory data analytics, and generative AI data pipelines.",
    modules: [
      {
        title: "Module 1: Advanced Python & Numerical Computing",
        desc: "Python for data analysis, vectorization with NumPy, complex data structures, and memory-efficient data processing.",
        topics: ["NumPy Arrays & Matrices", "Pandas DataFrames", "Data Wrangling & Cleaning", "Handling Missing Data"],
      },
      {
        title: "Module 2: Exploratory Data Analysis & Visualization",
        desc: "Transform raw datasets into actionable insights using Matplotlib, Seaborn, Plotly, and interactive dashboards.",
        topics: ["Statistical Distributions", "Correlation & Covariance", "Seaborn & Plotly", "Business Dashboarding"],
      },
      {
        title: "Module 3: Applied Machine Learning & Predictive Modeling",
        desc: "Supervised and unsupervised ML algorithms, regression, classification, clustering, cross-validation, and Scikit-Learn pipelines.",
        topics: ["Linear & Logistic Regression", "Decision Trees & Random Forests", "Gradient Boosting (XGBoost)", "K-Means & PCA"],
      },
      {
        title: "Module 4: Deep Learning & Neural Networks",
        desc: "Neural network architectures, CNNs for computer vision, RNNs/Transformers for NLP, and PyTorch model training.",
        topics: ["Artificial Neural Networks (ANN)", "Convolutional Networks (CNN)", "Transfer Learning", "PyTorch Framework"],
      },
      {
        title: "Module 5: Generative AI & Big Data Analytics",
        desc: "Vector embeddings, LLM data processing, SQL database integration, model evaluation, and cloud model serving.",
        topics: ["SQL & Database Aggregations", "Vector Embeddings", "Model Deployment (FastAPI/Streamlit)", "MLOps Basics"],
      },
    ],
    outcomes: [
      "Build end-to-end data analytics pipelines from data ingestion to model deployment",
      "Develop and fine-tune predictive machine learning and deep learning models",
      "Perform high-impact exploratory data analysis with interactive visualizations",
      "Integrate generative AI and vector databases for intelligent data solutions",
    ],
    prerequisites: ["Basic programming concepts in any language", "Fundamental high-school mathematics and statistics"],
  },
  "java-programming": {
    summary:
      "Comprehensive Java engineering program covering Object-Oriented Programming (OOP), Data Structures & Algorithms, Multithreading, and enterprise Spring Boot microservices.",
    modules: [
      {
        title: "Module 1: Core Java & Modern Syntax (Java 21)",
        desc: "Variables, control flow, methods, arrays, Memory management (Stack vs Heap), and Garbage Collection in Java.",
        topics: ["Java 21 Features", "JVM Architecture & Memory", "Methods & Parameter Passing", "Exception Handling"],
      },
      {
        title: "Module 2: Object-Oriented Programming (OOP) Deep Dive",
        desc: "Master Inheritance, Polymorphism, Abstraction, Encapsulation, Interfaces, and SOLID architectural design principles.",
        topics: ["SOLID Design Principles", "Abstract Classes & Interfaces", "Generics & Collections Framework", "Lambda Expressions & Streams"],
      },
      {
        title: "Module 3: Data Structures & Algorithmic Problem Solving",
        desc: "Arrays, LinkedLists, Stacks, Queues, Binary Trees, Graphs, Sorting algorithms, and Big-O time/space complexity.",
        topics: ["LinkedLists & Trees", "Recursion & Dynamic Programming", "Sorting & Searching", "LeetCode Pattern Mastery"],
      },
      {
        title: "Module 4: Multithreading, Concurrency & Database Integration",
        desc: "Java Concurrency API, ExecutorService, thread safety, synchronization, and JDBC database access with MySQL.",
        topics: ["Thread Lifecycle & Synchronization", "Executor Framework", "JDBC & HikariCP", "MySQL & Relational Modeling"],
      },
      {
        title: "Module 5: Spring Boot & Enterprise Microservices",
        desc: "Build production RESTful APIs, Spring Data JPA, Hibernate ORM, authentication security, and Docker containerization.",
        topics: ["Spring Boot 3 REST APIs", "Hibernate & Spring Data JPA", "Spring Security & JWT", "Microservices Architecture"],
      },
    ],
    outcomes: [
      "Master Object-Oriented Programming and modern Java 21 development standards",
      "Solve complex Data Structures & Algorithms problems with optimal time complexity",
      "Build scalable, high-throughput enterprise REST microservices using Spring Boot",
      "Integrate relational databases with Hibernate ORM and Spring Data JPA",
    ],
    prerequisites: ["Basic computer literacy", "Prior coding experience is helpful but not mandatory"],
  },
  "android-app-development": {
    summary:
      "Modern native Android app development using Kotlin, Jetpack Compose, MVVM architectural pattern, Coroutines, Retrofit networking, and Firebase backend.",
    modules: [
      {
        title: "Module 1: Kotlin Programming Language Essentials",
        desc: "Kotlin syntax, null-safety, functional programming, data classes, extension functions, and collections.",
        topics: ["Kotlin Syntax & Null Safety", "Data Classes & Lambdas", "Extension Functions", "Kotlin Coroutines & Flow"],
      },
      {
        title: "Module 2: Declarative UI with Jetpack Compose",
        desc: "Build reactive, modern Android user interfaces with Jetpack Compose, State Management, and Material Design 3.",
        topics: ["Composable Functions", "State & Recomposition", "Layouts & Modifiers", "Material 3 Design System"],
      },
      {
        title: "Module 3: Android Architecture & MVVM Pattern",
        desc: "Clean Architecture, ViewModel, LiveData / StateFlow, Room Local Database, and Navigation Component.",
        topics: ["MVVM Architectural Pattern", "ViewModel & StateFlow", "Room Database & SQLite", "Navigation Compose"],
      },
      {
        title: "Module 4: REST API Integration & Networking",
        desc: "Connect Android applications to backend APIs using Retrofit, OkHttp, JSON serialization, and asynchronous image loading.",
        topics: ["Retrofit & OkHttp", "JSON Parsing (Kotlinx Serialization)", "Coil Image Loading", "Error & Offline Handling"],
      },
      {
        title: "Module 5: Firebase Backend, Push Notifications & Play Store Release",
        desc: "Firebase Authentication, Cloud Firestore, Firebase Cloud Messaging (FCM), app signing, and Google Play Store distribution.",
        topics: ["Firebase Auth & Firestore", "FCM Push Notifications", "App Performance & ProGuard", "Play Store Publishing"],
      },
    ],
    outcomes: [
      "Build and publish modern, reactive Android apps using Kotlin and Jetpack Compose",
      "Implement industry-standard MVVM architecture with Room and Retrofit",
      "Integrate cloud databases, authentication, and push notifications via Firebase",
      "Package, sign, and distribute production applications to the Google Play Store",
    ],
    prerequisites: ["Basic understanding of programming fundamentals and OOP concepts"],
  },
};

const getDefaultCourse = (slug: string): Course | null => {
  const fallbackTitles: Record<string, string> = {
    "full-stack-web-development": "Full Stack Web Development Bootcamp",
    "data-science-ai": "Data Science & AI Bootcamp",
    "java-programming": "Java Programming & Core Engineering",
    "android-app-development": "Android App Development Bootcamp",
    "ai-machine-learning-engineering": "AI & Machine Learning Engineering",
    "cloud-devops-kubernetes-mastery": "Cloud DevOps & Kubernetes Mastery",
    "cyber-security-ethical-hacking": "Cyber Security & Ethical Hacking",
  };

  if (!fallbackTitles[slug]) return null;

  return {
    id: slug as any,
    title: fallbackTitles[slug],
    slug: slug,
    description:
      COURSE_CURRICULUM[slug]?.summary ||
      "Production-grade engineering bootcamp designed to give you industry-ready software engineering skills.",
    price_inr: 1,
    duration:
      slug === "ai-machine-learning-engineering"
        ? "12 Weeks"
        : slug === "cloud-devops-kubernetes-mastery" || slug === "data-science-ai"
        ? "10 Weeks"
        : "8 Weeks",
    level:
      slug === "ai-machine-learning-engineering"
        ? "Advanced"
        : slug === "cyber-security-ethical-hacking" || slug === "java-programming"
        ? "Beginner - Intermediate"
        : "Intermediate",
    technologies:
      slug === "full-stack-web-development"
        ? ["Next.js", "React", "TypeScript", "FastAPI", "PostgreSQL", "Tailwind CSS"]
        : slug === "data-science-ai"
        ? ["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "Tableau"]
        : slug === "java-programming"
        ? ["Java 21", "Spring Boot", "OOP", "DSA", "Hibernate", "MySQL"]
        : slug === "android-app-development"
        ? ["Kotlin", "Jetpack Compose", "Android Studio", "Coroutines", "Retrofit", "Firebase"]
        : slug === "ai-machine-learning-engineering"
        ? ["Python", "PyTorch", "OpenAI API", "LangChain", "Vector DBs"]
        : slug === "cloud-devops-kubernetes-mastery"
        ? ["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"]
        : ["Linux", "Metasploit", "Wireshark", "Burp Suite", "Python"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const defaultCourse = getDefaultCourse(resolvedParams.id);
  const [course, setCourse] = useState<Course | null>(defaultCourse);
  const [loading, setLoading] = useState(!defaultCourse);

  // Enrollment & Direct Payment State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    order_id?: string;
    payment_id?: string;
    amount_inr?: number;
    course_title?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    student_name: "",
    student_email: "",
    student_phone: "",
    college: "",
  });
  const [showCourses, setShowCourses] = useState<boolean | null>(null);

  const checkSettings = async () => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("show_courses");
      if (cached !== null) {
        setShowCourses(cached === "true");
      }
    }
    try {
      const data = await apiRequest<{ show_courses?: boolean | string }>(`/settings?_t=${Date.now()}`);
      if (data) {
        const isEnabled = data.show_courses === true || data.show_courses === "true";
        setShowCourses(isEnabled);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("show_courses", String(isEnabled));
          } catch {}
        }
      } else {
        setShowCourses(false);
      }
    } catch {
      setShowCourses(false);
    }
  };

  useEffect(() => {
    checkSettings();
    const handleSettingsEvent = (e: any) => {
      if (e?.detail && typeof e.detail.show_courses !== "undefined") {
        setShowCourses(Boolean(e.detail.show_courses));
      } else {
        checkSettings();
      }
    };
    window.addEventListener("site-settings-changed", handleSettingsEvent);
    window.addEventListener("storage", checkSettings);
    return () => {
      window.removeEventListener("site-settings-changed", handleSettingsEvent);
      window.removeEventListener("storage", checkSettings);
    };
  }, []);

  // Pre-fill user data from localStorage and check enrolled state
  useEffect(() => {
    const email = localStorage.getItem("user_email") || "";
    const name = localStorage.getItem("user_name") || "";
    if (email) {
      setFormData((prev) => ({
        ...prev,
        student_email: email,
        student_name: name || prev.student_name,
      }));
    }

    try {
      const enrolledList: string[] = JSON.parse(localStorage.getItem("enrolled_courses") || "[]");
      const currentSlug = resolvedParams?.id || course?.slug;
      if (currentSlug && (enrolledList.includes(currentSlug) || (course?.id && enrolledList.includes(String(course.id))))) {
        setIsEnrolled(true);
      }
    } catch {}
  }, [resolvedParams, course]);

  useEffect(() => {
    if (showCourses) {
      fetchCourseDetails();
    } else if (showCourses === false) {
      setLoading(false);
    }
  }, [resolvedParams.id, showCourses]);

  const fetchCourseDetails = async () => {
    try {
      const data = await apiRequest<Course>(`/courses/${resolvedParams.id}`, {}, 5000);
      if (data && data.title) {
        setCourse(data);
      }
    } catch {
      // If backend is waking up or offline, fallback data is already set and displayed cleanly
      if (!course) {
        const fallback = getDefaultCourse(resolvedParams.id);
        if (fallback) setCourse(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  // Direct Course Payment Handler (₹1 Instant Confirmation)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_name || !formData.student_email || !formData.student_phone) {
      setErrorMsg("Please fill in all required contact details.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        course_id: typeof course?.id === "number" ? course.id : undefined,
        course_slug: course?.slug || resolvedParams.id,
        student_name: formData.student_name.trim(),
        student_email: formData.student_email.trim().toLowerCase(),
        student_phone: formData.student_phone.trim(),
        college: formData.college.trim(),
        payment_method: "cashfree",
      };

      let res: any = null;
      try {
        res = await apiRequest("/courses/enroll-direct", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (firstErr: any) {
        // Fallback to payments router if needed
        res = await apiRequest("/payments/direct-enroll-pay", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (res && res.success) {
        setPaymentDetails({
          order_id: res.order_id,
          payment_id: res.payment_id,
          amount_inr: res.amount_inr || 1,
          course_title: res.course_title || course?.title,
        });
        setSubmittedSuccess(true);
        setIsEnrolled(true);

        // Save to localStorage
        try {
          const enrolledList: string[] = JSON.parse(localStorage.getItem("enrolled_courses") || "[]");
          const slugToAdd = course?.slug || resolvedParams.id;
          if (!enrolledList.includes(slugToAdd)) {
            enrolledList.push(slugToAdd);
            localStorage.setItem("enrolled_courses", JSON.stringify(enrolledList));
          }
        } catch {}
      } else {
        throw new Error(res?.message || "Payment could not be completed.");
      }
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("blocked")) {
        setErrorMsg("Network request blocked or server starting up. If you use Brave Shields or an AdBlocker, please pause it for this site and try again.");
      } else {
        setErrorMsg(msg || "Payment transaction could not be completed. Please try again.");
      }
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-36">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-3xl font-black text-white">Bootcamp Not Found</h2>
        <p className="text-ink-400 text-sm">The course you are looking for does not exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 text-brand-400 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    );
  }

  const curriculum = COURSE_CURRICULUM[course.slug] || {
    summary: course.description,
    modules: [
      {
        title: "Module 1: Foundations & Architecture",
        desc: "Core principles, system design, and setting up the development workspace.",
        topics: course.technologies.slice(0, 3),
      },
      {
        title: "Module 2: Advanced Engineering & Implementations",
        desc: "Hands-on projects, real-world data pipelines, and production coding.",
        topics: course.technologies.slice(2),
      },
    ],
    outcomes: [
      "Ship scalable production features with industry-grade code quality",
      "Collaborate in simulated sprint environments with senior engineer code reviews",
      "Earn a verified course completion certificate and Pre-Placement Offer (PPO) consideration",
    ],
    prerequisites: ["High motivation and basic programming concepts in any language"],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
      {/* TOP BREADCRUMB */}
      <FadeIn delay={0.05} direction="up">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-bold text-ink-400 hover:text-white transition uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Bootcamps
        </Link>
      </FadeIn>

      {/* HEADER HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <FadeIn delay={0.1} direction="up">
            <div className="space-y-6 border-l-8 border-brand-500 pl-6 sm:pl-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1 text-xs font-black bg-white text-black uppercase tracking-widest shadow-[2px_2px_0px_#2563eb]">
                  {course.level}
                </span>
                <span className="text-ink-300 text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider bg-ink-900 border border-ink-800 px-3 py-1">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  {course.duration}
                </span>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 px-3 py-1">
                  ✦ Nominal Fee · ₹1 Only
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-[0.95]">
                {course.title}
              </h1>

              <p className="text-ink-300 text-base sm:text-lg leading-relaxed max-w-3xl">
                {curriculum.summary}
              </p>
            </div>
          </FadeIn>

          {/* TECHNOLOGIES */}
          <FadeIn delay={0.15} direction="up">
            <div className="bg-ink-950 border-2 border-ink-800 p-8 space-y-5 shadow-[8px_8px_0px_#1a1915]">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Code2 className="w-5 h-5 text-brand-400" /> Core Tech Stack & Tooling
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {course.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 text-xs font-bold bg-ink-900 text-brand-300 border border-ink-700 uppercase tracking-wide"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* CURRICULUM MODULES */}
          <FadeIn delay={0.2} direction="up">
            <div className="bg-ink-950 border-2 border-ink-800 p-8 sm:p-10 space-y-8 shadow-[8px_8px_0px_#1a1915]">
              <div className="border-b border-ink-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Syllabus & Modules</h3>
                  <p className="text-ink-400 text-xs mt-1">Structured week-by-week curriculum with hands-on project deliverables.</p>
                </div>
                <span className="text-xs font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1">
                  {curriculum.modules.length} Intensive Modules
                </span>
              </div>

              <div className="space-y-6">
                {curriculum.modules.map((mod, i) => (
                  <div key={mod.title} className="p-5 bg-ink-900 border border-ink-800 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded bg-brand-600/20 text-brand-400 font-black text-xs flex items-center justify-center shrink-0 border border-brand-500/30">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-white">{mod.title}</h4>
                        <p className="text-ink-300 text-xs mt-1 leading-relaxed">{mod.desc}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pl-10 pt-1">
                      {mod.topics.map((t) => (
                        <span key={t} className="px-2.5 py-0.5 text-[11px] font-semibold bg-ink-950 text-ink-300 border border-ink-800 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* UNLOCKED COURSE MATERIALS & LEARNING WORKSPACE (Visible upon Enrollment & ₹1 Payment) */}
          {isEnrolled && (
            <FadeIn delay={0.28} direction="up">
              <div className="bg-gradient-to-b from-ink-900 to-ink-950 border-2 border-emerald-500 p-8 sm:p-10 space-y-8 shadow-[8px_8px_0px_#059669]">
                <div className="border-b border-emerald-500/30 pb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider mb-2">
                      <Sparkles className="w-4 h-4" /> Enrolled · Lifetime Access Unlocked
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      Course Learning Portal & Deliverables
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded">
                    ✓ Verified Active Seat
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-ink-950 border border-ink-800 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-brand-400" /> GitHub Repository & Starter Kit
                    </h4>
                    <p className="text-xs text-ink-300 leading-relaxed">
                      Clone the official course boilerplate, starter branches, and solution guides.
                    </p>
                    <a
                      href="https://github.com/thetanish1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 hover:underline pt-1"
                    >
                      Open Repository <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-5 bg-ink-950 border border-ink-800 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" /> Live Discord & Mentor Workspace
                    </h4>
                    <p className="text-xs text-ink-300 leading-relaxed">
                      Direct access to the private cohort channel with 24/7 senior mentor assistance.
                    </p>
                    <a
                      href="/portal"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline pt-1"
                    >
                      Enter Student Portal <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Modules Checklist */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Assigned Sprint Modules & Hands-on Labs:
                  </h4>
                  <div className="space-y-3">
                    {curriculum.modules.map((mod, idx) => (
                      <div
                        key={mod.title}
                        className="p-4 bg-ink-950/80 border border-ink-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/40">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-white">{mod.title}</div>
                            <div className="text-xs text-ink-400">{mod.topics.join(" • ")}</div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold rounded uppercase tracking-wider self-start sm:self-auto">
                          Ready to Study
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* LEARNING OUTCOMES */}
          <FadeIn delay={0.25} direction="up">
            <div className="bg-ink-950 border-2 border-ink-800 p-8 sm:p-10 space-y-6 shadow-[8px_8px_0px_#1a1915]">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Award className="w-6 h-6 text-emerald-400" /> What You Will Achieve
              </h3>
              <ul className="space-y-3.5 text-sm text-ink-300">
                {curriculum.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* SIDEBAR ENROLLMENT CARD */}
        <div className="lg:col-span-4 space-y-6">
          <FadeIn delay={0.15} direction="up">
            <div className="bg-ink-950 border-2 border-brand-500 p-8 space-y-8 sticky top-24 shadow-[10px_10px_0px_#1a1915]">
              <div className="space-y-2 border-b border-ink-800 pb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 uppercase tracking-wider inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Nominal Fee · ₹1 Only
                  </span>
                  {isEnrolled && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/40 uppercase tracking-wider inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Access
                    </span>
                  )}
                </div>
                <div className="text-4xl font-black text-white tracking-tight">₹{course.price_inr ?? 1} <span className="text-base text-ink-400 font-normal">only</span></div>
                <p className="text-xs text-ink-400 leading-relaxed">
                  Direct cohort seat reservation with instant syllabus unlock, live projects, and 1:1 mentor code reviews.
                </p>
              </div>

              <div className="space-y-3">
                {isEnrolled ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEnrollModal(true);
                        setSubmittedSuccess(true);
                      }}
                      className="w-full py-4 text-base font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-[4px_4px_0px_#ffffff] hover:translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Enrolled (View Receipt)
                    </button>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Payment Verified (₹1 Captured). Full materials unlocked!</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEnrollModal(true);
                        setSubmittedSuccess(false);
                        setErrorMsg("");
                      }}
                      className="w-full py-4 text-base font-black uppercase tracking-wider bg-brand-600 hover:bg-brand-500 text-white shadow-[4px_4px_0px_#ffffff] hover:translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
                    >
                      <Zap className="w-5 h-5" /> Pay ₹1 & Enroll Now
                    </button>
                    <p className="text-center text-[11px] text-ink-400">
                      Instant automatic activation via Cashfree / Direct Checkout.
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-3.5 pt-4 border-t border-ink-800 text-xs font-semibold text-ink-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Certificate of Completion</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1:1 Code Reviews with Senior Mentors</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pre-Placement Offer (PPO) Consideration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Private Discord / GitHub Workspace Access</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* DIRECT PAYMENT & ENROLLMENT MODAL */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-950 border-2 border-brand-500 max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-[12px_12px_0px_#000000]">
            <button
              onClick={() => setShowEnrollModal(false)}
              className="absolute top-4 right-4 text-ink-400 hover:text-white p-2 text-base font-bold"
              aria-label="Close"
            >
              ✕
            </button>

            {submittedSuccess ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase">Payment Verified & Access Unlocked!</h3>
                  <p className="text-xs text-ink-300 max-w-sm mx-auto leading-relaxed">
                    Congratulations, <strong className="text-white">{formData.student_name || "Student"}</strong>! Your payment of{" "}
                    <strong className="text-emerald-400">₹{paymentDetails?.amount_inr || course.price_inr || 1}</strong> for{" "}
                    <strong className="text-brand-400">{course.title}</strong> has been successfully captured.
                  </p>
                </div>

                <div className="p-4 bg-ink-900 border border-ink-800 text-xs text-ink-300 text-left space-y-2 rounded">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transaction Audit Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-400 pt-1">
                    <div>
                      <span className="font-semibold text-ink-300">Order ID:</span>
                      <div className="font-mono text-white text-[10px] break-all">{paymentDetails?.order_id || "order_verified"}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-ink-300">Payment ID:</span>
                      <div className="font-mono text-emerald-400 text-[10px] break-all">{paymentDetails?.payment_id || "pay_captured"}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-300 font-semibold pt-1">
                    ✓ Status: Confirmed & Logged in Admin Panel
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider transition shadow-[2px_2px_0px_#ffffff]"
                >
                  Start Learning Now →
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1 border-b border-ink-800 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Instant Direct Checkout
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight pt-1">
                    Complete Course Enrollment
                  </h3>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-ink-400">{course.title}</span>
                    <span className="font-bold text-emerald-400 text-sm">₹{course.price_inr ?? 1}</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handlePaymentSubmit} className="space-y-4 text-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-400" /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={formData.student_name}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address (For Receipt & Course Access) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. aarav.sharma@example.com"
                      value={formData.student_email}
                      onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-400" /> WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={formData.student_phone}
                      onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-ink-300 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-400" /> College / University Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VNIT Nagpur / IIT Bombay"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
                    />
                  </div>

                  {/* Payment fee summary box */}
                  <div className="p-3 bg-ink-900 border border-ink-800 rounded flex items-center justify-between text-xs">
                    <span className="text-ink-400">Total Payable Amount:</span>
                    <span className="text-base font-black text-emerald-400">₹{course.price_inr ?? 1}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-[4px_4px_0px_#ffffff] cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" /> Pay ₹{course.price_inr ?? 1} & Unlock Instant Access
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
