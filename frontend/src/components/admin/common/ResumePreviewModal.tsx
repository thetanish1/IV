import React from "react";
import { FileText, ExternalLink, Download, X } from "lucide-react";

interface ResumePreviewModalProps {
  resume: { url: string; name: string } | null;
  onClose: () => void;
}

export default function ResumePreviewModal({ resume, onClose }: ResumePreviewModalProps) {
  if (!resume) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-ink-950 border-2 border-brand-500/40 rounded-xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-ink-800 flex items-center justify-between bg-ink-900">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Resume Document — {resume.name}</h3>
              <div className="text-[11px] text-ink-400 truncate max-w-md">{resume.url}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            <a
              href={resume.url}
              download
              className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded text-xs font-semibold flex items-center gap-1.5 transition border border-ink-700"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-400 hover:text-white rounded hover:bg-ink-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Preview Frame */}
        <div className="flex-1 w-full bg-ink-900 relative">
          <iframe
            src={resume.url}
            className="w-full h-full border-0"
            title="Candidate Resume Preview"
          />
        </div>
      </div>
    </div>
  );
}
