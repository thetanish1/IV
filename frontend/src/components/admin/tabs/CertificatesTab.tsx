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
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" /> Certificate Registry & Verification
            </h2>
            <p className="text-xs text-ink-400 mt-0.5">
              Issue and manage official digital certificates signed by{" "}
              <strong className="text-white">Suraj Kumar, HR & Manager</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AdminSearchBar
              placeholder="Search certificate or student..."
              value={certSearch}
              onChange={(val) => setCertSearch(val)}
              accentColor="emerald"
            />
            <button
              type="button"
              onClick={() => setShowIssueModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Issue Certificate
            </button>
            <button
              type="button"
              onClick={fetchCertificates}
              className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition"
              title="Refresh certificates"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-ink-900/50 text-ink-400 font-medium border-b border-ink-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Certificate ID</th>
                  <th className="px-5 py-3.5 font-medium">Recipient</th>
                  <th className="px-5 py-3.5 font-medium">Program & Track</th>
                  <th className="px-5 py-3.5 font-medium">Duration & Date</th>
                  <th className="px-5 py-3.5 font-medium">Grade / Honors</th>
                  <th className="px-5 py-3.5 font-medium">Authority</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/50">
                {loadingCerts ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-400" />
                    </td>
                  </tr>
                ) : certificatesList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-ink-500 text-sm">
                      No certificates found. Click &quot;Issue Certificate&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  certificatesList.map((cert) => (
                    <tr key={cert.certificate_id} className="hover:bg-ink-900/30 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-emerald-400">
                        <div className="flex items-center gap-2">
                          <span>{cert.certificate_id}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cert.certificate_id);
                              setCopiedCertId(cert.certificate_id);
                              setTimeout(() => setCopiedCertId(null), 2000);
                            }}
                            className="text-ink-400 hover:text-white transition"
                            title="Copy Certificate ID"
                          >
                            {copiedCertId === cert.certificate_id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{cert.student_name}</div>
                        <div className="text-xs text-ink-400 font-mono">{cert.student_email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-ink-200 font-medium">{cert.program_title}</div>
                        <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-ink-800 text-ink-400 mt-0.5">
                          {cert.track_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-ink-300">
                        <div>{cert.duration}</div>
                        <div className="text-ink-500">{cert.issue_date}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          {cert.grade}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-ink-300">
                        {cert.instructor_name}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/verify-certificate?id=${encodeURIComponent(cert.certificate_id)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-ink-900 hover:bg-ink-800 text-brand-400 hover:text-brand-300 border border-ink-800 rounded-lg text-xs font-medium transition flex items-center gap-1"
                            title="View Public Verification"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Verify
                          </a>
                          <button
                            type="button"
                            disabled={deletingCertId === cert.certificate_id}
                            onClick={() => handleDeleteCertificate(cert.certificate_id)}
                            className="p-1.5 bg-ink-900 hover:bg-red-600/30 text-ink-400 hover:text-red-400 border border-ink-800 rounded-lg transition disabled:opacity-50"
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
