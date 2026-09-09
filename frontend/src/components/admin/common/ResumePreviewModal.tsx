"use client";

import React, { useState } from "react";
import { FileText, ExternalLink, Download, X, RefreshCw, Eye, AlertCircle, ShieldCheck } from "lucide-react";

interface ResumePreviewModalProps {
  resume: { url: string; name: string } | null;
  onClose: () => void;
}

export default function ResumePreviewModal({ resume, onClose }: ResumePreviewModalProps) {
  const [viewerMode, setViewerMode] = useState<"object" | "google" | "direct">("object");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  if (!resume) return null;

  const rawUrl = resume.url;
  const isHttp = rawUrl.startsWith("http://") || rawUrl.startsWith("https://");

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api"
  ).replace(/\/$/, "");

  // Stream proxy URL to prevent CORS/X-Frame issues
  const proxyUrl = isHttp
    ? `${apiBase}/applications/resume-proxy?url=${encodeURIComponent(rawUrl)}`
    : rawUrl;

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;

  const activeUrl = viewerMode === "google" ? googleViewerUrl : viewerMode === "direct" ? rawUrl : proxyUrl;

  const handleReload = () => {
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Topbar */}
        <div className="p-4 border-b border-gray-200 dark:border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/90 dark:bg-[#141417]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                Candidate Resume Document — {resume.name}
              </h3>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-lg font-mono">
                {rawUrl}
              </div>
            </div>
          </div>

          {/* Controls & Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Engine Switcher */}
            <div className="flex items-center bg-gray-200 dark:bg-[#27272A] p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => {
                  setViewerMode("object");
                  handleReload();
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  viewerMode === "object"
                    ? "bg-white dark:bg-[#18181B] text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Direct PDF Engine with high-fidelity streaming"
              >
                PDF Engine
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewerMode("google");
                  handleReload();
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  viewerMode === "google"
                    ? "bg-white dark:bg-[#18181B] text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Google Docs Cloud PDF Engine"
              >
                Cloud Engine
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewerMode("direct");
                  handleReload();
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  viewerMode === "direct"
                    ? "bg-white dark:bg-[#18181B] text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Direct Cloudinary Stream"
              >
                Direct Link
              </button>
            </div>

            <button
              type="button"
              onClick={handleReload}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
              title="Reload Viewer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open New Tab
            </a>

            <a
              href={rawUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-100 dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#27272A] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-gray-300 dark:border-[#2E2E33]"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Preview Frame Container */}
        <div className="flex-1 w-full bg-gray-100 dark:bg-[#121214] relative overflow-hidden flex flex-col">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-[#18181B]/80 z-10 space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Rendering resume document via {viewerMode === "google" ? "Cloud Engine" : viewerMode === "direct" ? "Direct Stream" : "PDF Engine"}...
              </p>
            </div>
          )}

          {viewerMode === "object" ? (
            <object
              key={`${activeUrl}-${iframeKey}`}
              data={activeUrl}
              type="application/pdf"
              className="w-full flex-1 border-0"
              onLoad={() => setIframeLoaded(true)}
            >
              <iframe
                src={googleViewerUrl}
                onLoad={() => setIframeLoaded(true)}
                className="w-full h-full border-0"
                title="Fallback Resume Preview"
              />
            </object>
          ) : (
            <iframe
              key={`${activeUrl}-${iframeKey}`}
              src={activeUrl}
              onLoad={() => setIframeLoaded(true)}
              className="w-full flex-1 border-0"
              title="Candidate Resume Preview"
            />
          )}

          {/* Bottom Fallback Bar */}
          <div className="p-2 px-4 bg-gray-50 dark:bg-[#18181B] border-t border-gray-200 dark:border-[#27272A] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Document loaded from Secure Storage
            </span>
            <div className="flex items-center gap-3">
              {viewerMode !== "object" && (
                <button
                  type="button"
                  onClick={() => setViewerMode("object")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Switch to PDF Engine
                </button>
              )}
              {viewerMode !== "google" && (
                <button
                  type="button"
                  onClick={() => setViewerMode("google")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Switch to Cloud Engine
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
