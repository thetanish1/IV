import React from "react";
import { X, MessageSquare, Image as ImageIcon, ZoomIn, ExternalLink, Loader2, Send } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-pink-500/40 p-6 sm:p-8 shadow-2xl space-y-6 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-ink-400 hover:text-white transition rounded-lg hover:bg-ink-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-ink-800 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider rounded-lg">
            <MessageSquare className="w-3.5 h-3.5" /> Technical Mentor Resolution
          </div>
          <h2 className="text-xl font-bold text-white mt-2">{doubt.subject}</h2>
          <div className="text-xs text-ink-400 mt-1">
            Student: <strong className="text-white">{doubt.student_name}</strong> ({doubt.student_email}) •{" "}
            <span className="text-brand-400 font-mono">{doubt.domain_track}</span> •{" "}
            <span className="text-ink-300 font-mono">{doubt.module_name}</span>
          </div>
        </div>

        {/* Doubt Question Body */}
        <div className="space-y-2 bg-ink-900/60 p-4 border border-ink-800 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider">Student Question / Blocker</h4>
          <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">{doubt.question}</p>
        </div>

        {/* Code Snippet if any */}
        {doubt.code_snippet && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider">Code Snippet</h4>
            <div className="p-3 bg-black/80 border border-ink-800 rounded-xl font-mono text-xs text-pink-300 overflow-x-auto">
              <pre>{doubt.code_snippet}</pre>
            </div>
          </div>
        )}

        {/* Attached Error Screenshot */}
        {doubt.image_url && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Attached Screenshot:
            </h4>
            <div className="relative inline-block group rounded-xl overflow-hidden border border-ink-800 bg-black/50">
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
          <label className="text-xs font-bold uppercase text-brand-400 tracking-wider">
            Mentor Solution & Resolution *
          </label>
          <textarea
            rows={5}
            required
            placeholder="Explain the solution, code fix, or step-by-step guidance for the student..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-ink-900 border border-ink-700/80 rounded-xl p-3 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-ink-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-ink-300 rounded-lg text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sendingReply || !replyText.trim()}
            onClick={onSendReply}
            className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-pink-600/30"
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
