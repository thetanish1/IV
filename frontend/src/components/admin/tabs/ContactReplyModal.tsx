import React from "react";
import { X, Mail, Loader2, Send } from "lucide-react";
import { ContactQueryItem } from "@/types";

interface ContactReplyModalProps {
  contact: ContactQueryItem | null;
  replyText: string;
  setReplyText: (t: string) => void;
  sendingReply: boolean;
  onClose: () => void;
  onSendReply: () => void;
}

export default function ContactReplyModal({
  contact,
  replyText,
  setReplyText,
  sendingReply,
  onClose,
  onSendReply,
}: ContactReplyModalProps) {
  if (!contact) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6 rounded-2xl"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-lg">
            <Mail className="w-3.5 h-3.5" /> Official Email Response
          </div>
          <h2 className="text-xl font-bold text-white mt-2">{contact.subject}</h2>
          <div className="text-xs text-ink-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>To: <strong className="text-white">{contact.name}</strong></span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">{contact.email}</span>
            <span>•</span>
            <span className="text-ink-500">
              Received: {contact.created_at ? new Date(contact.created_at).toLocaleString() : ""}
            </span>
          </div>
        </div>

        {/* Original Message */}
        <div className="space-y-2 bg-ink-900/60 p-4 border border-ink-800 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider">Original Message from User</h4>
          <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">{contact.message}</p>
        </div>

        {/* Admin Reply Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-cyan-400 tracking-wider">
            Official Response Message *
          </label>
          <textarea
            rows={5}
            required
            placeholder="Type your official response to this inquiry..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-ink-900 border border-ink-700/80 rounded-xl p-3 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-cyan-500"
          />
          <p className="text-[11px] text-ink-400">
            ✦ Sending this reply will immediately dispatch a branded email directly to <strong className="text-white">{contact.email}</strong> and mark this ticket as <span className="text-emerald-400">Replied</span>.
          </p>
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
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-600/30"
          >
            {sendingReply ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Email...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Email Response
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
