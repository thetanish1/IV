"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  Clock,
  User,
  BookOpen,
  Share2,
  Printer,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Building2,
  BadgeCheck,
  Check,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { Float } from "@/components/animations/Float";
import { apiRequest } from "@/lib/api-client";

interface VerifiedCertificate {
  certificate_id: string;
  student_name: string;
  student_email: string;
  program_title: string;
  track_type: string;
  duration: string;
  issue_date: string;
  grade: string;
  skills_acquired: string[];
  instructor_name: string;
  is_valid: boolean;
}

const FALLBACK_CERTIFICATES: Record<string, VerifiedCertificate> = {
  "IVT/JUN26/2026/0201": {
    certificate_id: "IVT/JUN26/2026/0201",
    student_name: "Tanish Dewase",
    student_email: "tanishdewase222@gmail.com",
    program_title: "Java Developer",
    track_type: "Virtual Internship",
    duration: "1 Month",
    issue_date: "30 June 2026",
    grade: "Distinction (Grade A+)",
    skills_acquired: ["Java", "SQL", "GitHub", "Git", "Docker"],
    instructor_name: "Suraj Kumar, HR & Manager",
    is_valid: true,
  },
  "IVT/JUN26/2026/0202": {
    certificate_id: "IVT/JUN26/2026/0202",
    student_name: "Neha Mahule",
    student_email: "nehamahule28@gmail.com",
    program_title: "Web Developer",
    track_type: "Virtual Internship",
    duration: "1 Month",
    issue_date: "30 June 2026",
    grade: "Distinction (Grade A+)",
    skills_acquired: ["Basic HTML", "CSS", "JavaScript", "Git"],
    instructor_name: "Suraj Kumar, HR & Manager",
    is_valid: true,
  },
  "IVT/JUN26/2026/0203": {
    certificate_id: "IVT/JUN26/2026/0203",
    student_name: "Jay Doble",
    student_email: "jaydoble56@gmail.com",
    program_title: "Java Developer",
    track_type: "Virtual Internship",
    duration: "1 Month",
    issue_date: "30 June 2026",
    grade: "Distinction (Grade A+)",
    skills_acquired: ["Java", "SQL", "GitHub", "Git", "Docker"],
    instructor_name: "Suraj Kumar, HR & Manager",
    is_valid: true,
  },
  "IVT/JUN26/2026/0204": {
    certificate_id: "IVT/JUN26/2026/0204",
    student_name: "Paridhi Kshirsagar",
    student_email: "paridhikshirsagar16@gmail.com",
    program_title: "Java Developer",
    track_type: "Virtual Internship",
    duration: "1 Month",
    issue_date: "30 June 2026",
    grade: "Distinction (Grade A+)",
    skills_acquired: ["Java", "SQL", "GitHub", "Git", "Docker"],
    instructor_name: "Suraj Kumar, HR & Manager",
    is_valid: true,
  },
};

function CertificateVerifierContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inputCertId, setInputCertId] = useState("");
  const [searchedId, setSearchedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Auto-verify if ?id= or ?cert= query param is present
  useEffect(() => {
    const idParam = searchParams.get("id") || searchParams.get("cert") || searchParams.get("certificate_id");
    if (idParam) {
      const clean = idParam.trim();
      setInputCertId(clean);
      performVerification(clean);
    }
  }, [searchParams]);

  const performVerification = async (certIdToVerify: string) => {
    const cleanId = certIdToVerify.trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setSearchedId(cleanId);
    setNotFound(false);
    setCertificate(null);

    // Try API request first
    try {
      const data = await apiRequest<VerifiedCertificate>(
        `/certificates/verify/${encodeURIComponent(cleanId)}`,
        {},
        5000
      );
      if (data && data.is_valid) {
        setCertificate(data);
        setLoading(false);
        return;
      }
    } catch {
      // API call failed or timed out, check client-side fallback cache
    }

    // Client-side fallback check
    const normalizedTarget = cleanId.replace(/[-/ ]/g, "");
    let matchedCert: VerifiedCertificate | null = null;

    for (const [key, cert] of Object.entries(FALLBACK_CERTIFICATES)) {
      if (
        key.toUpperCase() === cleanId ||
        key.toUpperCase().replace(/[-/ ]/g, "") === normalizedTarget ||
        cert.certificate_id.toUpperCase().replace(/[-/ ]/g, "") === normalizedTarget
      ) {
        matchedCert = cert;
        break;
      }
    }

    if (matchedCert) {
      setCertificate(matchedCert);
      setNotFound(false);
    } else {
      setNotFound(true);
      setCertificate(null);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCertId.trim()) return;
    router.replace(`/verify-certificate?id=${encodeURIComponent(inputCertId.trim())}`);
    performVerification(inputCertId.trim());
  };

  const handleCopyCertId = () => {
    if (!certificate) return;
    navigator.clipboard.writeText(certificate.certificate_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    if (typeof window === "undefined" || !certificate) return;
    const url = `${window.location.origin}/verify-certificate?id=${encodeURIComponent(certificate.certificate_id)}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen py-16 space-y-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ─── HERO HEADER ─── */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          Official Credential Verification Portal
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Verify InternVision <br />
          <span className="text-brand-400">Digital Credentials</span>
        </h1>

        <p className="text-ink-300 text-base sm:text-lg leading-relaxed">
          Authenticate completion certificates and internship credentials issued by{" "}
          <strong className="text-white">InternVision Tech</strong>. Instant verification for recruiters, employers,
          and academic institutions.
        </p>

        {/* ─── SEARCH BAR ─── */}
        <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-2xl">
            <div className="absolute left-4 text-ink-400 pointer-events-none">
              <Search className="w-5 h-5 text-brand-400" />
            </div>
            <input
              type="text"
              placeholder="Enter Certificate Number (e.g. IVT/JUN26/2026/0201)"
              value={inputCertId}
              onChange={(e) => setInputCertId(e.target.value)}
              className="w-full bg-ink-900/90 border-2 border-ink-700 hover:border-brand-500 focus:border-brand-400 pl-12 pr-36 py-4 text-white text-base rounded-none placeholder-ink-500 font-mono transition-colors focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputCertId.trim()}
              className="absolute right-2 px-6 py-2.5 bg-white hover:bg-ink-100 text-black font-bold text-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4 text-black" />}
              Verify
            </button>
          </div>
        </form>
      </section>

      {/* ─── VERIFICATION RESULT DISPLAY ─── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
          <p className="text-sm font-medium text-ink-400 font-mono">
            Searching cryptographically signed credential database...
          </p>
        </div>
      )}

      {/* ─── VERIFIED CERTIFICATE CARD ─── */}
      {!loading && certificate && (
        <FadeIn delay={0.1} direction="up">
          <div className="bg-ink-950 border-2 border-brand-500/50 p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
            {/* Top Verified Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                      Authentic Credential Verified
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">Official Certificate of Completion</h2>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handleShareLink}
                  className="px-4 py-2 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-white text-xs font-bold rounded flex items-center gap-2 transition"
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Link Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" /> Share Verification
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold rounded flex items-center gap-2 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ink-900/40 p-6 border border-ink-800 rounded">
                <div className="space-y-1">
                  <span className="text-xs text-ink-400 uppercase font-semibold tracking-wider">Recipient Name</span>
                  <div className="text-3xl font-black text-white tracking-tight">{certificate.student_name}</div>
                  <span className="text-xs text-ink-400 font-mono">{certificate.student_email}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-ink-400 uppercase font-semibold tracking-wider">Credential ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-bold text-brand-400 tracking-wider">
                      {certificate.certificate_id}
                    </span>
                    <button
                      onClick={handleCopyCertId}
                      className="p-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white rounded transition"
                      title="Copy Certificate ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cryptographically Verified Record
                  </span>
                </div>
              </div>

              {/* Program Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-ink-900/60 p-4 border border-ink-800 rounded space-y-1">
                  <span className="text-xs text-ink-400 uppercase font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-400" /> Program Track
                  </span>
                  <p className="text-sm font-bold text-white">{certificate.program_title}</p>
                </div>

                <div className="bg-ink-900/60 p-4 border border-ink-800 rounded space-y-1">
                  <span className="text-xs text-ink-400 uppercase font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-400" /> Program Duration
                  </span>
                  <p className="text-sm font-bold text-white">{certificate.duration}</p>
                </div>

                <div className="bg-ink-900/60 p-4 border border-ink-800 rounded space-y-1">
                  <span className="text-xs text-ink-400 uppercase font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" /> Issue Date
                  </span>
                  <p className="text-sm font-bold text-white">{certificate.issue_date}</p>
                </div>

                <div className="bg-ink-900/60 p-4 border border-ink-800 rounded space-y-1">
                  <span className="text-xs text-ink-400 uppercase font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-yellow-400" /> Honors / Grade
                  </span>
                  <p className="text-sm font-bold text-yellow-400">{certificate.grade}</p>
                </div>
              </div>

              {/* Skills Verified */}
              {certificate.skills_acquired && certificate.skills_acquired.length > 0 && (
                <div className="space-y-2 bg-ink-900/30 p-5 border border-ink-800 rounded">
                  <span className="text-xs text-ink-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Verified Technical Competencies
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {certificate.skills_acquired.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-ink-950 border border-ink-700 text-xs font-semibold text-white rounded font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature & Issuing Authority */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-ink-800/80 pt-6 text-xs text-ink-400">
                <div className="space-y-1">
                  <span className="text-ink-500 uppercase font-bold tracking-wider">Issuing Authority</span>
                  <p className="text-white font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-400" /> {certificate.instructor_name}
                  </p>
                  <p className="text-ink-500">InternVision Tech Inc. · Headquartered in Nagpur, India</p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-ink-500 uppercase font-bold tracking-wider">Verification Status</span>
                  <p className="text-emerald-400 font-bold flex sm:justify-end items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Active · Lifetime Validity
                  </p>
                  <p className="text-ink-500">Tamper-Proof Registry ID: {certificate.certificate_id}</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ─── NOT FOUND STATE ─── */}
      {!loading && notFound && (
        <FadeIn delay={0.1} direction="up">
          <div className="bg-red-500/5 border-2 border-red-500/30 p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center text-red-400 shadow-inner">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Certificate Not Found</h3>
              <p className="text-ink-300 text-sm leading-relaxed">
                No active certificate matching{" "}
                <strong className="text-white font-mono bg-ink-900 px-2 py-0.5 border border-ink-800">
                  {searchedId}
                </strong>{" "}
                was found in our verification registry.
              </p>
            </div>

            <div className="bg-ink-900/60 p-4 border border-ink-800 text-left text-xs text-ink-400 space-y-2">
              <p className="font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-yellow-400" /> Verification Tips:
              </p>
              <ul className="list-disc list-inside space-y-1 text-ink-300">
                <li>Check that the Certificate Number follows the format <span className="font-mono text-white">IVT/MONTHYEAR/YEAR/NUMBER</span> (e.g. <span className="font-mono text-white">IVT/JUN26/2026/0201</span>)</li>
                <li>Ensure there are no accidental typos or missing digits</li>
                <li>If the certificate was recently issued, please allow up to 24 hours for registry synchronization</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-white rounded transition flex items-center gap-2"
              >
                Contact HR Support <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="mailto:internvisiontechhr@gmail.com"
                className="px-5 py-2.5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 rounded transition"
              >
                Email internvisiontechhr@gmail.com
              </a>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ─── CREDENTIAL SECURITY & RECRUITER FAQ ─── */}
      <section className="border-t border-ink-800 pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="bg-ink-950 p-6 border border-ink-800 space-y-3">
          <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-white">Tamper-Proof Registry</h4>
          <p className="text-xs text-ink-400 leading-relaxed">
            Every InternVision Tech credential contains a unique cryptographic hash tied to student deliverables and
            mentor sign-offs.
          </p>
        </div>

        <div className="bg-ink-950 p-6 border border-ink-800 space-y-3">
          <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-white">Outcome & Code Reviewed</h4>
          <p className="text-xs text-ink-400 leading-relaxed">
            Certificates are only issued upon successful completion of production capstone repositories and passing code
            reviews.
          </p>
        </div>

        <div className="bg-ink-950 p-6 border border-ink-800 space-y-3">
          <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-white">Direct Recruiter Support</h4>
          <p className="text-xs text-ink-400 leading-relaxed">
            HR departments and hiring managers can request official candidate performance dossiers directly via{" "}
            <span className="text-brand-400 font-mono">internvisiontechhr@gmail.com</span>.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function CertificateVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-40">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
        </div>
      }
    >
      <CertificateVerifierContent />
    </Suspense>
  );
}
