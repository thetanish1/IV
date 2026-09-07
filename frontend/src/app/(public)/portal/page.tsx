"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  Code2,
  ExternalLink,
  Send,
  Sparkles,
  BookOpen,
  Briefcase,
  Layers,
  ArrowRight,
  Loader2,
  Check,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  FileText,
  Lightbulb,
  Globe,
  Image as ImageIcon,
  UploadCloud,
  X,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, getImageUrl } from "@/lib/api-client";
import { PortalData, WeeklyTaskItem, MilestoneProjectItem, StudentDoubtItem } from "@/types";
import { FadeIn } from "@/components/animations/FadeIn";
import UserAuthModal from "@/components/UserAuthModal";

export default function StudentPortalPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Portal State
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"allocation" | "submission" | "doubts">("allocation");

  // Task Submission Modal / Form State
  const [submittingTask, setSubmittingTask] = useState<WeeklyTaskItem | MilestoneProjectItem | null>(null);
  const [subForm, setSubForm] = useState({
    project_topic: "",
    github_url: "",
    live_url: "",
    documentation_url: "",
    notes: "",
    tools_used: "",
  });
  const [submittingLoading, setSubmittingLoading] = useState(false);
  const [subSuccessMsg, setSubSuccessMsg] = useState("");
  const [subErrorMsg, setSubErrorMsg] = useState("");

  // Unlock Request Modal State
  const [unlockTask, setUnlockTask] = useState<WeeklyTaskItem | MilestoneProjectItem | null>(null);
  const [unlockReason, setUnlockReason] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockSuccessMsg, setUnlockSuccessMsg] = useState("");
  const [unlockErrorMsg, setUnlockErrorMsg] = useState("");

  // Doubt Form State
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [doubtForm, setDoubtForm] = useState({
    subject: "",
    question: "",
    code_snippet: "",
  });
  const [doubtImage, setDoubtImage] = useState<File | null>(null);
  const [doubtImagePreview, setDoubtImagePreview] = useState<string | null>(null);
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [doubtSuccessMsg, setDoubtSuccessMsg] = useState("");
  const [doubtErrorMsg, setDoubtErrorMsg] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const handleDoubtImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setDoubtErrorMsg("Please select a valid image file (PNG, JPG, WebP, GIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDoubtErrorMsg("Image size exceeds 10MB limit.");
      return;
    }
    setDoubtImage(file);
    setDoubtImagePreview(URL.createObjectURL(file));
    setDoubtErrorMsg("");
  };

  const removeDoubtImage = () => {
    setDoubtImage(null);
    if (doubtImagePreview) URL.revokeObjectURL(doubtImagePreview);
    setDoubtImagePreview(null);
  };

  useEffect(() => {
    const email = localStorage.getItem("user_email") || localStorage.getItem("admin_email");
    const name = localStorage.getItem("user_name");
    setUserEmail(email);
    setUserName(name);
    setAuthChecked(true);

    if (email) {
      fetchPortalData(email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPortalData = async (email: string) => {
    setLoading(true);
    try {
      const data = await apiRequest<PortalData>(`/portal/my-internship?email=${encodeURIComponent(email)}`);
      setPortalData(data);
    } catch (err: unknown) {
      console.error("Failed to load portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (task: WeeklyTaskItem | MilestoneProjectItem) => {
    setSubmittingTask(task);
    setSubSuccessMsg("");
    setSubErrorMsg("");
    const existing = task.submission;
    setSubForm({
      project_topic: existing?.project_topic || "",
      github_url: existing?.github_url || "",
      live_url: existing?.live_url || "",
      documentation_url: existing?.documentation_url || "",
      notes: existing?.notes || "",
      tools_used: (existing?.tools_used || []).join(", "),
    });
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTask || !userEmail) return;
    setSubmittingLoading(true);
    setSubErrorMsg("");

    try {
      const toolsArr = subForm.tools_used
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await apiRequest(`/portal/tasks/submit?email=${encodeURIComponent(userEmail)}`, {
        method: "POST",
        body: JSON.stringify({
          task_key: submittingTask.key,
          title: submittingTask.title,
          project_topic: subForm.project_topic || undefined,
          github_url: subForm.github_url || undefined,
          live_url: subForm.live_url || undefined,
          documentation_url: subForm.documentation_url || undefined,
          notes: subForm.notes || undefined,
          tools_used: toolsArr,
        }),
      });

      setSubSuccessMsg("Submission uploaded successfully! Our mentors will review your work.");
      setTimeout(() => {
        setSubmittingTask(null);
        fetchPortalData(userEmail);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit task";
      setSubErrorMsg(msg);
    } finally {
      setSubmittingLoading(false);
    }
  };

  const handleRequestUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockTask || !userEmail || !unlockReason.trim()) return;
    setUnlockLoading(true);
    setUnlockErrorMsg("");

    try {
      await apiRequest(`/portal/tasks/request-unlock?email=${encodeURIComponent(userEmail)}`, {
        method: "POST",
        body: JSON.stringify({
          task_key: unlockTask.key,
          task_title: unlockTask.title,
          reason: unlockReason.trim(),
        }),
      });

      setUnlockSuccessMsg("Unlock request submitted to admin! You will be notified once reviewed.");
      setTimeout(() => {
        setUnlockTask(null);
        setUnlockReason("");
        fetchPortalData(userEmail);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send unlock request";
      setUnlockErrorMsg(msg);
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleSubmitDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !doubtForm.subject.trim() || !doubtForm.question.trim()) return;
    setDoubtLoading(true);
    setDoubtErrorMsg("");

    try {
      let uploadedImageUrl: string | undefined = undefined;

      if (doubtImage) {
        const formData = new FormData();
        formData.append("file", doubtImage);

        const rawBase = (
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:8000/api"
        ).replace(/\/api\/?$/, "").replace(/\/$/, "");

        const uploadRes = await fetch(`${rawBase}/api/portal/doubts/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to upload screenshot image.");
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      const autoModuleName = portalData?.domain_title || portalData?.role_preference 
        ? `${portalData.domain_title || portalData.role_preference}${portalData.duration ? ` • ${portalData.duration}` : ""}`
        : "Technical Internship Track";

      await apiRequest(`/portal/doubts?email=${encodeURIComponent(userEmail)}`, {
        method: "POST",
        body: JSON.stringify({
          module_name: autoModuleName,
          subject: doubtForm.subject.trim(),
          question: doubtForm.question.trim(),
          code_snippet: doubtForm.code_snippet.trim() || undefined,
          image_url: uploadedImageUrl,
        }),
      });

      setDoubtSuccessMsg("Query submitted! Our technical mentors will reply in your portal thread.");
      setTimeout(() => {
        setShowDoubtModal(false);
        setDoubtForm({ subject: "", question: "", code_snippet: "" });
        removeDoubtImage();
        setDoubtSuccessMsg("");
        fetchPortalData(userEmail);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit doubt";
      setDoubtErrorMsg(msg);
    } finally {
      setDoubtLoading(false);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-xs font-mono text-ink-400">Loading Student Internship Workspace...</p>
      </div>
    );
  }

  // Not Logged In State
  if (!userEmail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <UserAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Sign In to Student Portal"
          subtitle="Log in with your applicant email to access task allocation, submission desk, and mentor helpdesk."
          onSuccess={(data) => {
            setUserEmail(data.user_email);
            setUserName(data.user_name);
            setShowAuthModal(false);
            fetchPortalData(data.user_email);
          }}
        />
        <div className="max-w-md w-full glass-card p-8 border border-ink-800 text-center space-y-6">
          <div className="w-14 h-14 bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto rounded-xl">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Student Internship Portal</h2>
            <p className="text-xs text-ink-400 leading-relaxed">
              Please sign in with your applicant account to view your assigned tasks, weekly submissions, and 1:1 mentor query desk.
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 font-bold text-white transition flex items-center justify-center gap-2 rounded-lg"
          >
            Sign In / Access Portal <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // No Application Found State
  if (!portalData || !portalData.has_application) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="max-w-lg mx-auto glass-card p-8 border border-ink-800 space-y-6">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto rounded-xl">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">No Application Found</h2>
            <p className="text-xs text-ink-400 leading-relaxed">
              We couldn&apos;t find an active internship application linked to <span className="text-brand-400 font-semibold">{userEmail}</span>.
            </p>
          </div>
          <button
            onClick={() => router.push("/apply")}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 font-bold text-white transition flex items-center justify-center gap-2 rounded-lg"
          >
            Apply for Virtual Internship <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Application Rejected State
  if (portalData.is_rejected || (portalData.status || "").toLowerCase() === "rejected") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <FadeIn direction="up">
          <div className="glass-card p-8 sm:p-10 border border-red-500/30 bg-red-950/20 space-y-8 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-3 py-1 border border-red-500/30 rounded-full">
                  Status: Review Concluded
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Application Notice: {portalData.full_name || userName || userEmail?.split("@")[0]}
                </h1>
                <p className="text-xs text-ink-400">
                  Track Applied: <span className="text-brand-400 font-semibold">{portalData.role_preference || "Virtual Internship"}</span> ({portalData.duration})
                </p>
              </div>
            </div>

            <div className="p-6 bg-ink-900/80 border border-ink-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" /> Admissions Update
              </h3>
              <p className="text-xs text-ink-300 leading-relaxed">
                Thank you for applying to the InternVision Tech Virtual Internship Program. Following a comprehensive review of all candidates, admissions for the current cohort have reached full enrollment capacity.
              </p>
              <p className="text-xs text-ink-400 leading-relaxed">
                You are eligible to enhance your project portfolio and re-apply for upcoming cohorts.
              </p>
            </div>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={() => router.push("/apply")}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 font-bold text-white text-xs rounded-lg transition"
              >
                Apply for Next Internship Cohort →
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  // Application Pending State (Under Review)
  if (!portalData.is_accepted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <FadeIn direction="up">
          <div className="glass-card p-8 sm:p-10 border border-ink-800 space-y-8 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink-800/80 pb-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 border border-amber-500/20 rounded-full">
                  Status: Admissions Review Pending
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome, {portalData.full_name || userName || userEmail?.split("@")[0]}!
                </h1>
                <p className="text-xs text-ink-400">
                  Track Applied: <span className="text-brand-400 font-semibold">{portalData.role_preference || "Virtual Internship"}</span> ({portalData.duration})
                </p>
              </div>

              <button
                onClick={() => userEmail && fetchPortalData(userEmail)}
                className="px-3.5 py-2 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Clock className="w-3.5 h-3.5" /> Refresh Status
              </button>
            </div>

            <div className="p-6 bg-ink-900/60 border border-ink-800 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" /> Application Workflow Progress
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Step 1: Application Received
                  </div>
                  <p className="text-[11px] text-ink-400">Submitted successfully and logged in database.</p>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Clock className="w-4 h-4 animate-spin" /> Step 2: Admissions Review
                  </div>
                  <p className="text-[11px] text-ink-400">Engineering faculty reviewing candidate credentials.</p>
                </div>

                <div className="p-4 bg-ink-950 border border-ink-800 rounded-lg space-y-1.5 opacity-60">
                  <div className="flex items-center gap-2 text-ink-400 font-bold text-xs">
                    <Lock className="w-4 h-4" /> Step 3: Workspace & Tasks Unlock
                  </div>
                  <p className="text-[11px] text-ink-500">Unlocks automatically once admin accepts your application.</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-ink-400 text-center leading-relaxed">
              Once the admin approves your application, your official Offer Letter email will be dispatched and the full <strong>Task Allocation, Weekly Submissions, and Doubt Helpdesk</strong> will activate immediately here.
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  // ACCEPTED & CONFIRMED INTERN WORKSPACE
  const weeklyTasks = Array.isArray(portalData?.weekly_tasks) ? portalData.weekly_tasks : [];
  const completedCount = weeklyTasks.filter((t) => t?.submission && t.submission.status === "approved").length;
  const submittedCount = weeklyTasks.filter((t) => t?.submission).length;
  const progressPercent = Math.round((submittedCount / (weeklyTasks.length || 1)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ─── Top Header Card ────────────────────────────────────────────── */}
      <FadeIn direction="up">
        <div className="glass-card p-6 sm:p-8 border border-ink-800 relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Selection Status: Accepted & Active
                </span>
                <span className="text-[11px] font-semibold text-brand-400 bg-brand-500/10 px-3 py-1 border border-brand-500/20 rounded-full">
                  {portalData.domain_title || portalData.role_preference}
                </span>
                <span className="text-[11px] font-mono text-ink-400 bg-ink-900 px-3 py-1 border border-ink-800 rounded-full">
                  Duration: {portalData.duration}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Internship Workspace: {portalData.full_name || userName || userEmail.split("@")[0]}
              </h1>
              <p className="text-xs text-ink-400">
                Logged in as <span className="text-brand-400 font-mono">{userEmail}</span> • Day {portalData.days_elapsed ?? 0} of Internship Track
              </p>
            </div>

            {/* Overall Progress Widget */}
            <div className="p-4 bg-ink-900/80 border border-ink-800 rounded-xl min-w-[240px] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-400 font-medium">Submission Progress</span>
                <span className="text-brand-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-ink-950 h-2 rounded-full overflow-hidden border border-ink-800">
                <div
                  className="bg-gradient-to-r from-brand-600 to-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-ink-500 text-right">
                {submittedCount} of {weeklyTasks.length} Weekly Milestones Submitted
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ─── Navigation Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-ink-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("allocation")}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 rounded-t-lg ${
            activeTab === "allocation"
              ? "border-brand-500 text-brand-400 bg-brand-500/10"
              : "border-transparent text-ink-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" /> 1. Task Allocation & Syllabus
        </button>

        <button
          onClick={() => setActiveTab("submission")}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 rounded-t-lg ${
            activeTab === "submission"
              ? "border-brand-500 text-brand-400 bg-brand-500/10"
              : "border-transparent text-ink-400 hover:text-white"
          }`}
        >
          <Code2 className="w-4 h-4" /> 2. Task Submission & Unlock Desk
        </button>

        <button
          onClick={() => setActiveTab("doubts")}
          className={`px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 rounded-t-lg ${
            activeTab === "doubts"
              ? "border-brand-500 text-brand-400 bg-brand-500/10"
              : "border-transparent text-ink-400 hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4" /> 3. Query & Doubts Desk ({portalData.doubts?.length || 0})
        </button>
      </div>

      {/* ─── TAB 1: TASK ALLOCATION & SYLLABUS ──────────────────────────── */}
      {activeTab === "allocation" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Domain Task Allocation Roadmap</h2>
              <p className="text-xs text-ink-400">
                Curated industry tasks tailored specifically for <span className="text-brand-400 font-semibold">{portalData.domain_title}</span>
              </p>
            </div>
            <button
              onClick={() => setActiveTab("submission")}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              Go to Submission Desk <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month 1: 4 Weekly Tasks */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-brand-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Month 1: Core Foundation & Weekly Deliverables
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {weeklyTasks.map((task) => (
                <div
                  key={task.key}
                  className="glass-card p-6 border border-ink-800 rounded-xl space-y-4 relative overflow-hidden flex flex-col justify-between hover:border-ink-700 transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/20">
                        WEEK {task.week}
                      </span>
                      {task.is_unlocked ? (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <Unlock className="w-3.5 h-3.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[11px] text-ink-500 flex items-center gap-1 font-mono">
                          <Lock className="w-3.5 h-3.5" /> Day {task.required_days}+
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">{task.title}</h4>
                    <p className="text-xs text-ink-300 leading-relaxed">{task.objective}</p>

                    {task.tech_stack && task.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {task.tech_stack.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-ink-900/90 border border-ink-800 text-brand-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-ink-800/80">
                    <p className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">Required Deliverables:</p>
                    <ul className="space-y-1.5">
                      {task.deliverables.map((d, i) => (
                        <li key={i} className="text-xs text-ink-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>

                    {task.evaluation_focus && (
                      <div className="p-2.5 rounded-lg bg-ink-950 border border-ink-800/70 text-[11px] text-ink-400">
                        <strong className="text-ink-200">Mentor Evaluation Focus:</strong> {task.evaluation_focus}
                      </div>
                    )}

                    {task.submission ? (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-semibold flex items-center justify-between mt-2">
                        <span>Submitted ({(task.submission.status || "submitted").toUpperCase()})</span>
                        <button
                          onClick={() => {
                            setActiveTab("submission");
                            handleOpenSubmitModal(task);
                          }}
                          className="underline hover:text-emerald-300"
                        >
                          View / Update
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTab("submission");
                          if (task.is_unlocked) {
                            handleOpenSubmitModal(task);
                          }
                        }}
                        className={`w-full py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 mt-2 ${
                          task.is_unlocked
                            ? "bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
                            : "bg-ink-950 text-ink-500 cursor-not-allowed border border-ink-800"
                        }`}
                      >
                        {task.is_unlocked ? "Open Submission Form →" : `Locked until Day ${task.required_days}`}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Month 2: Milestone Project (for 3M / 6M) */}
          {portalData.month2_project && (
            <div className="space-y-4 pt-4 border-t border-ink-800">
              <h3 className="text-sm font-extrabold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Month 2: Full-Scale Industry Project
              </h3>

              <div className="glass-card p-6 sm:p-8 border border-brand-500/30 rounded-xl space-y-6 bg-brand-950/20">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30">
                      MILESTONE PROJECT
                    </span>
                    <span className="text-xs text-ink-400 font-mono">Month 2 (Days 28–60)</span>
                  </div>
                  <h4 className="text-xl font-extrabold text-white">{portalData.month2_project.title}</h4>
                  <p className="text-xs text-ink-300 leading-relaxed max-w-3xl">
                    {portalData.month2_project.objective}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Choose from Pre-Defined Real-World Project Blueprints or Propose Custom Topic:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(portalData.month2_project.curated_list || []).map((p) => (
                      <div key={p.id} className="p-4 bg-ink-900/90 border border-ink-800 rounded-lg space-y-2">
                        <h5 className="text-sm font-bold text-white text-brand-300">{p.title}</h5>
                        <p className="text-[11px] text-ink-400 leading-relaxed">{p.description}</p>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {p.tech_stack.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-ink-950 text-ink-400 px-2 py-0.5 rounded border border-ink-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-ink-400">
                    Custom Topic Allowed: Enter your custom title & description in submission.
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab("submission");
                      if (portalData.month2_project?.is_unlocked) {
                        handleOpenSubmitModal(portalData.month2_project);
                      }
                    }}
                    className={`px-6 py-2.5 font-bold text-xs rounded-lg transition ${
                      portalData.month2_project.is_unlocked
                        ? "bg-brand-600 hover:bg-brand-500 text-white"
                        : "bg-ink-900 text-ink-500 border border-ink-800"
                    }`}
                  >
                    {portalData.month2_project.is_unlocked ? "Submit Month 2 Project →" : "Unlocks in Month 2 (Day 28)"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Month 3: Personal Portfolio (for 3M / 6M) */}
          {portalData.month3_portfolio && (
            <div className="space-y-4 pt-4 border-t border-ink-800">
              <h3 className="text-sm font-extrabold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" /> Month 3: Personal Developer Portfolio & Deployed Showcase
              </h3>

              <div className="glass-card p-6 border border-ink-800 rounded-xl space-y-4 bg-ink-900/60">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">{portalData.month3_portfolio.title}</h4>
                  <p className="text-xs text-ink-300 leading-relaxed">
                    Build and deploy your modern personal portfolio showcasing your GitHub projects, live links, resume download, and skills learned throughout the internship.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-ink-400">Must include deployed live URL (e.g. Vercel/Netlify) and GitHub code link.</span>
                  <button
                    onClick={() => {
                      setActiveTab("submission");
                      if (portalData.month3_portfolio?.is_unlocked) {
                        handleOpenSubmitModal(portalData.month3_portfolio);
                      }
                    }}
                    className={`px-5 py-2 text-xs font-bold rounded-lg transition ${
                      portalData.month3_portfolio.is_unlocked
                        ? "bg-brand-600 hover:bg-brand-500 text-white"
                        : "bg-ink-900 text-ink-500 border border-ink-800"
                    }`}
                  >
                    {portalData.month3_portfolio.is_unlocked ? "Submit Portfolio Link →" : "Unlocks in Month 3"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Months 4-6: Real-Life Capstone (for 6M) */}
          {portalData.month4_6_capstone && (
            <div className="space-y-4 pt-4 border-t border-ink-800">
              <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Months 4–6: Enterprise Real-Life Capstone Project
              </h3>

              <div className="glass-card p-6 sm:p-8 border border-purple-500/30 rounded-xl space-y-4 bg-purple-950/20">
                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold text-white">{portalData.month4_6_capstone.title}</h4>
                  <p className="text-xs text-ink-300 leading-relaxed max-w-3xl">
                    {portalData.month4_6_capstone.objective}
                  </p>
                </div>
                <div className="p-4 bg-ink-950 border border-purple-500/20 rounded-lg space-y-2 text-xs text-ink-300">
                  <p className="font-bold text-purple-300">Capstone Deliverables:</p>
                  <p>• Full stack architecture (Frontend, Backend APIs, Relational Database, AI services).</p>
                  <p>• Bi-weekly progress updates logged with tools used and module summaries.</p>
                  <p>• Dedicated 1:1 mentor code reviews & architecture consultation.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("submission");
                    if (portalData.month4_6_capstone?.is_unlocked) {
                      handleOpenSubmitModal(portalData.month4_6_capstone);
                    }
                  }}
                  className={`px-6 py-2.5 text-xs font-bold rounded-lg transition ${
                    portalData.month4_6_capstone.is_unlocked
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-ink-900 text-ink-500 border border-ink-800"
                  }`}
                >
                  {portalData.month4_6_capstone.is_unlocked ? "Submit Capstone Update →" : "Unlocks in Month 4 (Day 84)"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: TASK SUBMISSION DESK ────────────────────────────────── */}
      {activeTab === "submission" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white">Task Submission & Review Desk</h2>
            <p className="text-xs text-ink-400">
              Submit your GitHub repositories, live demo links, and documentation for mentor evaluation.
            </p>
          </div>

          <div className="space-y-4">
            {weeklyTasks.map((task) => (
              <div
                key={task.key}
                className={`p-6 glass-card border rounded-xl space-y-4 transition ${
                  task.submission
                    ? "border-emerald-500/40 bg-emerald-950/10"
                    : task.is_unlocked
                    ? "border-brand-500/40 bg-brand-950/10"
                    : "border-ink-800 opacity-80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/20">
                        WEEK {task.week}
                      </span>
                      {task.submission ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Status: {(task.submission.status || "submitted").toUpperCase()}
                        </span>
                      ) : task.is_unlocked ? (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                          Ready for Submission
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-ink-500 bg-ink-900 px-2.5 py-0.5 rounded border border-ink-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked (Opens Day {task.required_days})
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{task.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.is_unlocked ? (
                      <button
                        onClick={() => handleOpenSubmitModal(task)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
                      >
                        {task.submission ? "Update Submission" : "Submit Work Now →"}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUnlockTask(task);
                          setUnlockSuccessMsg("");
                          setUnlockErrorMsg("");
                        }}
                        className="px-3.5 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border border-ink-700"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        {task.unlock_request?.status === "pending" ? "Unlock Requested (Pending)" : "Request Admin Unlock"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Existing Submission Details */}
                {task.submission && (
                  <div className="p-4 bg-ink-950 border border-ink-800 rounded-lg space-y-2 text-xs">
                    <div className="flex flex-wrap gap-4 text-ink-300">
                      {task.submission.github_url && (
                        <a
                          href={task.submission.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-400 hover:underline"
                        >
                          <Code2 className="w-3.5 h-3.5" /> GitHub Repo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {task.submission.live_url && (
                        <a
                          href={task.submission.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {task.submission.submitted_at && (
                        <span className="text-ink-500">
                          Submitted on {new Date(task.submission.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {task.submission.notes && (
                      <p className="text-ink-400 italic">“{task.submission.notes}”</p>
                    )}

                    {task.submission.admin_feedback && (
                      <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded mt-2 text-xs">
                        <strong className="text-brand-400">Mentor Review Feedback:</strong>
                        <p className="text-ink-200 mt-0.5">{task.submission.admin_feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: QUERIES & DOUBTS DESK ───────────────────────────────── */}
      {activeTab === "doubts" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Interactive Query & Doubts Helpdesk</h2>
              <p className="text-xs text-ink-400">
                Facing blockers or technical issues during your tasks? Ask our senior engineering mentors directly.
              </p>
            </div>
            <button
              onClick={() => {
                setShowDoubtModal(true);
                setDoubtSuccessMsg("");
                setDoubtErrorMsg("");
              }}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" /> Ask a Question / Doubt
            </button>
          </div>

          {/* Doubt List */}
          {(!portalData.doubts || portalData.doubts.length === 0) ? (
            <div className="glass-card p-10 border border-ink-800 text-center space-y-4 rounded-xl">
              <HelpCircle className="w-10 h-10 text-ink-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Doubts Raised Yet</h3>
                <p className="text-xs text-ink-400 max-w-md mx-auto">
                  Have a question about task requirements, code logic, or deployment? Click above to open a ticket with our mentors.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {portalData.doubts.map((d) => (
                <div
                  key={d.id}
                  className={`p-6 glass-card border rounded-xl space-y-4 ${
                    d.status === "answered"
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : "border-ink-800 bg-ink-900/60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-800/80 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/20">
                        {d.module_name}
                      </span>
                      <h4 className="text-sm font-bold text-white">{d.subject}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                          d.status === "answered"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {d.status === "answered" ? "✓ ANSWERED" : "⏳ OPEN / PENDING"}
                      </span>
                      <span className="text-[10px] text-ink-500">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-300 leading-relaxed">{d.question}</p>

                  {/* Attached Error Screenshot */}
                  {d.image_url && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-ink-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Attached Error Screenshot:
                      </div>
                      <div className="relative inline-block group rounded-lg overflow-hidden border border-ink-800 bg-black/50 max-w-sm">
                        <img
                          src={getImageUrl(d.image_url)}
                          alt="Error Screenshot"
                          className="max-h-48 w-auto object-contain cursor-pointer transition group-hover:opacity-90"
                          onClick={() => setExpandedImage(getImageUrl(d.image_url))}
                        />
                        <button
                          type="button"
                          onClick={() => setExpandedImage(getImageUrl(d.image_url))}
                          className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white rounded text-[10px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <ZoomIn className="w-3 h-3" /> Click to Zoom
                        </button>
                      </div>
                    </div>
                  )}

                  {d.code_snippet && (
                    <pre className="p-3 bg-ink-950 border border-ink-800 text-[11px] font-mono text-ink-300 rounded-lg overflow-x-auto">
                      <code>{d.code_snippet}</code>
                    </pre>
                  )}

                  {/* Admin Reply */}
                  {d.admin_reply && (
                    <div className="p-4 bg-brand-950/30 border border-brand-500/30 rounded-lg space-y-1.5 mt-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Reply from {d.answered_by || "Senior Mentor"}:</span>
                        {d.answered_at && (
                          <span className="text-[10px] text-ink-500 font-normal">
                            ({new Date(d.answered_at).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white leading-relaxed">{d.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SUBMISSION MODAL ───────────────────────────────────────────── */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-lg w-full p-6 border border-ink-700 space-y-5 rounded-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                  Submission Desk
                </span>
                <h3 className="text-lg font-bold text-white">{submittingTask.title}</h3>
              </div>
              <button
                onClick={() => setSubmittingTask(null)}
                className="text-ink-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {subSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium text-center rounded-lg">
                {subSuccessMsg}
              </div>
            )}
            {subErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center rounded-lg">
                {subErrorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitTask} className="space-y-4 text-xs">
              {submittingTask.key === "month2_project" && (
                <div className="space-y-1.5">
                  <label className="text-ink-300 font-semibold">Project Title / Topic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Cloud SaaS Platform (or Custom Title)"
                    value={subForm.project_topic}
                    onChange={(e) => setSubForm({ ...subForm, project_topic: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white rounded-lg focus:border-brand-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-brand-400" /> GitHub Repository URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/your-username/your-repository"
                  value={subForm.github_url}
                  onChange={(e) => setSubForm({ ...subForm, github_url: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white rounded-lg focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" /> Live Demo / Deployed Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://your-project.vercel.app"
                  value={subForm.live_url}
                  onChange={(e) => setSubForm({ ...subForm, live_url: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white rounded-lg focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold">Tools / Technologies Used (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js 15, FastAPI, PostgreSQL, Docker"
                  value={subForm.tools_used}
                  onChange={(e) => setSubForm({ ...subForm, tools_used: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white rounded-lg focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold">Implementation Notes & Key Learnings</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of what you built, architecture decisions, and any challenges overcome..."
                  value={subForm.notes}
                  onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white rounded-lg focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  className="w-1/2 py-3 bg-ink-800 hover:bg-ink-700 text-ink-300 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLoading}
                  className="w-1/2 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Task →"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ─── UNLOCK REQUEST MODAL ───────────────────────────────────────── */}
      {unlockTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-md w-full p-6 border border-ink-700 space-y-4 rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Admin Unlock Request
                </span>
                <h3 className="text-base font-bold text-white">{unlockTask.title}</h3>
              </div>
              <button
                onClick={() => setUnlockTask(null)}
                className="text-ink-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {unlockSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium text-center rounded-lg">
                {unlockSuccessMsg}
              </div>
            )}
            {unlockErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center rounded-lg">
                {unlockErrorMsg}
              </div>
            )}

            <form onSubmit={handleRequestUnlock} className="space-y-4 text-xs">
              <p className="text-ink-300 leading-relaxed">
                If you missed a weekly deadline or require early access to this module, state your reason below. The admin will review and manually unlock your task submission slot.
              </p>

              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold">Reason for Unlock Request *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Completed ahead of schedule / College semester exam delay and ready to submit now..."
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white rounded-lg focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUnlockTask(null)}
                  className="w-1/2 py-2.5 bg-ink-800 hover:bg-ink-700 text-ink-300 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlockLoading}
                  className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {unlockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request →"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ─── DOUBT SUBMISSION MODAL ─────────────────────────────────────── */}
      {showDoubtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-lg w-full p-6 border border-ink-700 space-y-4 rounded-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                  1:1 Mentor Support Desk
                </span>
                <h3 className="text-base font-bold text-white">Ask a Technical Doubt</h3>
              </div>
              <button
                onClick={() => setShowDoubtModal(false)}
                className="text-ink-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {doubtSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium text-center rounded-lg">
                {doubtSuccessMsg}
              </div>
            )}
            {doubtErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center rounded-lg">
                {doubtErrorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitDoubt} className="space-y-4 text-xs">
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-brand-400 block font-semibold">Track & Milestone Context</span>
                  <span className="text-white font-medium text-xs">
                    {portalData?.domain_title || portalData?.role_preference || "Technical Internship Track"}
                    {portalData?.duration ? ` • ${portalData.duration}` : ""}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium border border-emerald-500/30">
                  Auto-routed to Mentors
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold">Subject / Question Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Error with PostgreSQL connection pooling or Docker port mapping"
                  value={doubtForm.subject}
                  onChange={(e) => setDoubtForm({ ...doubtForm, subject: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white rounded-lg focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the exact error message, expected behavior, and steps you tried..."
                  value={doubtForm.question}
                  onChange={(e) => setDoubtForm({ ...doubtForm, question: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white rounded-lg focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-brand-400" /> Code Snippet / Error Logs (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste relevant error traceback or code snippet here..."
                  value={doubtForm.code_snippet}
                  onChange={(e) => setDoubtForm({ ...doubtForm, code_snippet: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 px-3.5 py-2.5 text-white font-mono text-[11px] rounded-lg focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              {/* Error Screenshot Upload */}
              <div className="space-y-1.5">
                <label className="text-ink-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Error Screenshot / Bug Image (Optional)
                  </span>
                  <span className="text-[10px] text-ink-500">Max 10MB (PNG, JPG, WebP)</span>
                </label>

                {!doubtImagePreview ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-ink-700 hover:border-pink-500/50 bg-ink-900/50 hover:bg-ink-900 rounded-lg p-4 cursor-pointer transition">
                    <UploadCloud className="w-6 h-6 text-ink-400 mb-1" />
                    <span className="text-xs text-ink-300 font-medium">Click or drag screenshot here</span>
                    <span className="text-[10px] text-ink-500 mt-0.5">Attach visual error logs or IDE screenshot</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                      className="hidden"
                      onChange={handleDoubtImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative p-2 bg-ink-900 border border-ink-700 rounded-lg flex items-center gap-3">
                    <img
                      src={doubtImagePreview}
                      alt="Doubt Preview"
                      className="w-14 h-14 object-cover rounded border border-ink-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{doubtImage?.name}</div>
                      <div className="text-[10px] text-ink-400">
                        {doubtImage ? `${(doubtImage.size / 1024).toFixed(1)} KB` : ""} • Image attached
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeDoubtImage}
                      className="p-1.5 text-ink-400 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDoubtModal(false);
                    removeDoubtImage();
                  }}
                  className="w-1/2 py-2.5 bg-ink-800 hover:bg-ink-700 text-ink-300 font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={doubtLoading}
                  className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {doubtLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Query →"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ─── FULL-SCREEN IMAGE LIGHTBOX MODAL ───────────────────────── */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <X className="w-5 h-5" /> Close (ESC)
            </button>
            <img
              src={expandedImage}
              alt="Expanded Error Screenshot"
              className="max-h-[85vh] max-w-full object-contain rounded-lg border border-ink-700 shadow-2xl"
            />
            <div className="mt-3 flex items-center gap-4">
              <a
                href={expandedImage}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand-400 hover:underline flex items-center gap-1 bg-ink-900/80 px-3 py-1.5 rounded border border-ink-700"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
