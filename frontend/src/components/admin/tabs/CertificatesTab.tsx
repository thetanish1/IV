import React, { useState, useEffect, useCallback } from "react";
import { Award, Plus, Copy, Check, ExternalLink, Trash2, Loader2, RefreshCw } from "lucide-react";
import { CertificateItem } from "@/types";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";
import AdminSearchBar from "../common/AdminSearchBar";
import IssueCertificateModal from "./IssueCertificateModal";

export default function CertificatesTab() {
  const [certificatesList, setCertificatesList] = useState<CertificateItem[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [certSearch, setCertSearch] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [certError, setCertError] = useState("");
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  const initialCertForm = {
    certificate_id: "",
    student_name: "",
    student_email: "",
    program_title: "Full Stack Web Development Co-Op",
    track_type: "Virtual Internship",
    duration: "3 Months",
    issue_date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    grade: "Distinction (Grade A+)",
    skills_acquired: "Next.js 15, React 19, TypeScript, FastAPI, PostgreSQL",
    instructor_name: "Suraj Kumar, HR & Manager",
  };
  const [newCertForm, setNewCertForm] = useState(initialCertForm);

  const fetchCertificates = useCallback(async () => {
    setLoadingCerts(true);
    try {
      let endpoint = "/certificates";
      if (certSearch) {
        endpoint += `?search=${encodeURIComponent(certSearch)}`;
      }
      const data = await apiRequest<CertificateItem[]>(endpoint);
      setCertificatesList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load certificates", err);
      setCertificatesList([]);
    } finally {
      setLoadingCerts(false);
    }
  }, [certSearch]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertForm.student_name.trim() || !newCertForm.student_email.trim() || !newCertForm.program_title.trim()) {
      setCertError("Please fill in recipient name, email, and program title.");
      return;
    }
    setIssuing(true);
    setCertError("");
    try {
      const now = new Date();
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const mmm = months[now.getMonth()];
      const yy = String(now.getFullYear()).slice(-2);
      const yyyy = String(now.getFullYear());
      const randSeq = String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0");
      const autoId = `IVT/${mmm}${yy}/${yyyy}/${randSeq}`;
      const generatedId = newCertForm.certificate_id.trim().toUpperCase() || autoId;

      const payload = {
        certificate_id: generatedId,
        student_name: newCertForm.student_name.trim(),
        student_email: newCertForm.student_email.trim().toLowerCase(),
        program_title: newCertForm.program_title.trim(),
        track_type: newCertForm.track_type,
        duration: newCertForm.duration.trim(),
        issue_date: newCertForm.issue_date.trim() || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        grade: newCertForm.grade.trim() || "Distinction (Grade A+)",
        skills_acquired: newCertForm.skills_acquired.split(",").map((s) => s.trim()).filter(Boolean),
        instructor_name: newCertForm.instructor_name.trim() || "Suraj Kumar, HR & Manager",
      };

      await apiRequest<CertificateItem>("/certificates", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowIssueModal(false);
      setNewCertForm(initialCertForm);
      fetchCertificates();
    } catch (err: any) {
      setCertError(err.message || "Failed to issue certificate");
    } finally {
      setIssuing(false);
    }
  };

  const handleDeleteCertificate = async (certId: string) => {
    if (!confirm(`Are you sure you want to delete and revoke Certificate ${certId}?`)) return;
    setDeletingCertId(certId);
    try {
      await apiRequest(`/certificates/${encodeURIComponent(certId)}`, { method: "DELETE" });
      setCertificatesList((prev) => (Array.isArray(prev) ? prev : []).filter((c) => c.certificate_id !== certId));
    } catch (err) {
      console.error("Failed to delete certificate", err);
    } finally {
      setDeletingCertId(null);
    }
  };

  return (
    <FadeIn delay={0.2} direction="up">
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Certificate Registry & Verification
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Issue and manage official digital certificates signed by{" "}
              <strong className="text-gray-800 dark:text-gray-200">Suraj Kumar, HR & Manager</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AdminSearchBar
              placeholder="Search certificate or student..."
              value={certSearch}
              onChange={(val) => setCertSearch(val)}
              accentColor="blue"
            />
            <button
              type="button"
              onClick={() => setShowIssueModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Issue Certificate
            </button>
            <button
              type="button"
              onClick={fetchCertificates}
              className="p-2 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A30] transition shadow-sm"
              title="Refresh certificates"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-[#151518] text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-[#27272A] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Certificate ID</th>
                  <th className="px-5 py-3.5 font-semibold">Recipient</th>
                  <th className="px-5 py-3.5 font-semibold">Program & Track</th>
                  <th className="px-5 py-3.5 font-semibold">Duration & Date</th>
                  <th className="px-5 py-3.5 font-semibold">Grade / Honors</th>
                  <th className="px-5 py-3.5 font-semibold">Authority</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#27272A]">
                {loadingCerts ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
                    </td>
                  </tr>
                ) : certificatesList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                      No certificates found. Click &quot;Issue Certificate&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  certificatesList.map((cert) => (
                    <tr key={cert.certificate_id} className="hover:bg-gray-50/80 dark:hover:bg-[#1F1F23]/60 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        <div className="flex items-center gap-2">
                          <span>{cert.certificate_id}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cert.certificate_id);
                              setCopiedCertId(cert.certificate_id);
                              setTimeout(() => setCopiedCertId(null), 2000);
                            }}
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
                            title="Copy Certificate ID"
                          >
                            {copiedCertId === cert.certificate_id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{cert.student_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{cert.student_email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-gray-800 dark:text-gray-200 font-medium">{cert.program_title}</div>
                        <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-[#222226] dark:text-gray-300 border border-gray-200 dark:border-[#2E2E33] mt-0.5">
                          {cert.track_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-700 dark:text-gray-300">
                        <div>{cert.duration}</div>
                        <div className="text-gray-400 dark:text-gray-500">{cert.issue_date}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-yellow-400 dark:border-yellow-500/20">
                          {cert.grade}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-700 dark:text-gray-300">
                        {cert.instructor_name}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/verify-certificate?id=${encodeURIComponent(cert.certificate_id)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:border-blue-500/40 dark:text-blue-300 rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-sm"
                            title="View Public Verification"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Verify
                          </a>
                          <button
                            type="button"
                            disabled={deletingCertId === cert.certificate_id}
                            onClick={() => handleDeleteCertificate(cert.certificate_id)}
                            className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-500 dark:bg-[#222226] dark:hover:bg-red-900/50 dark:text-gray-400 dark:hover:text-red-400 border border-gray-300 dark:border-[#2E2E33] rounded-lg transition disabled:opacity-50 shadow-sm"
                            title="Revoke and Delete Certificate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Certificate Modal */}
        {showIssueModal && (
          <IssueCertificateModal
            form={newCertForm}
            setForm={setNewCertForm}
            issuing={issuing}
            error={certError}
            onClose={() => setShowIssueModal(false)}
            onSubmit={handleIssueCertificate}
          />
        )}
      </div>
    </FadeIn>
  );
}
