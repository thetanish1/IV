import React from "react";
import { X, MessageSquare, Image as ImageIcon, ZoomIn, Loader2, Send } from "lucide-react";
import { StudentDoubtItem } from "@/types";
import { getImageUrl } from "@/lib/api-client";

interface DoubtReplyModalProps {
  doubt: StudentDoubtItem | null;
  replyText: string;
  setReplyText: (t: string) => void;
  sendingReply: boolean;
  onClose: () => void;
  onSendReply: () => void;
  onZoomImage: (url: string) => void;
}

export default function DoubtReplyModal({
  doubt,
  replyText,
  setReplyText,
  sendingReply,
  onClose,
  onSendReply,
  onZoomImage,
}: DoubtReplyModalProps) {
  if (!doubt) return null;

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
            <MessageSquare className="w-3.5 h-3.5" /> Technical Mentor Resolution
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{doubt.subject}</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Student: <strong className="text-gray-800 dark:text-gray-200">{doubt.student_name}</strong> ({doubt.student_email}) •{" "}
            <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">{doubt.domain_track}</span> •{" "}
            <span className="text-gray-600 dark:text-gray-300 font-mono">{doubt.module_name}</span>
          </div>
        </div>

        {/* Doubt Question Body */}
        <div className="space-y-2 bg-gray-50 dark:bg-[#1F1F23] p-4 border border-gray-200 dark:border-zinc-800 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Student Question / Blocker</h4>
          <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{doubt.question}</p>
        </div>

        {/* Code Snippet if any */}
        {doubt.code_snippet && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Code Snippet</h4>
            <div className="p-3 bg-gray-900 text-blue-300 dark:bg-black/90 border border-gray-800 dark:border-zinc-800 rounded-xl font-mono text-xs overflow-x-auto">
              <pre>{doubt.code_snippet}</pre>
            </div>
          </div>
        )}

        {/* Attached Error Screenshot */}
        {doubt.image_url && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Attached Screenshot:
            </h4>
            <div className="relative inline-block group rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-black/50">
              <img
                src={getImageUrl(doubt.image_url)}
                alt="Error Screenshot"
                className="max-h-56 w-auto object-contain cursor-pointer hover:opacity-90 transition"
                onClick={() => onZoomImage(getImageUrl(doubt.image_url))}
              />
              <button
                type="button"
                onClick={() => onZoomImage(getImageUrl(doubt.image_url))}
                className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 text-white rounded text-[10px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
              >
                <ZoomIn className="w-3 h-3" /> Full View
              </button>
            </div>
          </div>
        )}

        {/* Mentor Reply Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-700 dark:text-blue-400 tracking-wider">
            Mentor Solution & Resolution *
          </label>
          <textarea
            rows={5}
            required
            placeholder="Explain the solution, code fix, or step-by-step guidance for the student..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A30] dark:hover:bg-[#323238] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sendingReply || !replyText.trim()}
            onClick={onSendReply}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/20"
          >
            {sendingReply ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending Resolution...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Solution to Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
