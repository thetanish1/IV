import React from "react";
import { X, Award, Loader2 } from "lucide-react";

interface IssueCertificateModalProps {
  form: {
    certificate_id: string;
    student_name: string;
    student_email: string;
    program_title: string;
    track_type: string;
    duration: string;
    issue_date: string;
    grade: string;
    skills_acquired: string;
    instructor_name: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  issuing: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function IssueCertificateModal({
  form,
  setForm,
  issuing,
  error,
  onClose,
  onSubmit,
}: IssueCertificateModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#2E2E33] p-6 sm:p-8 shadow-2xl space-y-6 rounded-2xl text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A30]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-lg">
            <Award className="w-3.5 h-3.5" /> Issue Digital Credential
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Add New Verified Certificate</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter candidate and course details. The certificate will be instantly verifiable on the public verification portal.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                Certificate Number <span className="text-gray-400 dark:text-gray-500 font-normal">(Auto or Custom)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. IVT/JUN26/2026/0201"
                  value={form.certificate_id}
                  onChange={(e) => setForm({ ...form, certificate_id: e.target.value })}
                  className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                    const mmm = months[now.getMonth()];
                    const yy = String(now.getFullYear()).slice(-2);
                    const yyyy = String(now.getFullYear());
                    const randSeq = String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0");
                    setForm({
                      ...form,
                      certificate_id: `IVT/${mmm}${yy}/${yyyy}/${randSeq}`,
                    });
                  }}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#2A2A30] dark:hover:bg-[#323238] dark:text-gray-300 rounded-lg border border-gray-300 dark:border-zinc-700 whitespace-nowrap font-medium transition"
                >
                  Auto-Gen
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Track Type</label>
              <select
                value={form.track_type}
                onChange={(e) => setForm({ ...form, track_type: e.target.value })}
                className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                <option value="Virtual Internship">Virtual Internship</option>
                <option value="Bootcamp">Bootcamp</option>
                <option value="Industrial Co-Op">Industrial Co-Op</option>
                <option value="Advanced Training">Advanced Training</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Recipient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={form.student_name}
                onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Recipient Email *</label>
              <input
                type="email"
                required
                placeholder="e.g. aarav.sharma@example.com"
                value={form.student_email}
                onChange={(e) => setForm({ ...form, student_email: e.target.value })}
                className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Course / Program Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Web Development Co-Op"
              value={form.program_title}
              onChange={(e) => setForm({ ...form, program_title: e.target.value })}
              className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Duration</label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="8 Weeks">8 Weeks</option>
                <option value="10 Weeks">10 Weeks</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Grade / Honors</label>
              <input
                type="text"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Issue Date</label>
              <input
                type="text"
                value={form.issue_date}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
              Skills Acquired <span className="text-gray-400 dark:text-gray-500 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              value={form.skills_acquired}
              onChange={(e) => setForm({ ...form, skills_acquired: e.target.value })}
              className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A30] dark:hover:bg-[#323238] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={issuing}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-blue-600/20"
            >
              {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              Issue & Sign Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
