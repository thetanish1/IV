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
            <Mail className="w-3.5 h-3.5" /> Official Email Response
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{contact.subject}</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>To: <strong className="text-gray-800 dark:text-gray-200">{contact.name}</strong></span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">{contact.email}</span>
            <span>•</span>
            <span className="text-gray-400 dark:text-gray-500">
              Received: {contact.created_at ? new Date(contact.created_at).toLocaleString() : ""}
            </span>
          </div>
        </div>

        {/* Original Message */}
        <div className="space-y-2 bg-gray-50 dark:bg-[#1F1F23] p-4 border border-gray-200 dark:border-zinc-800 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Original Message from User</h4>
          <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{contact.message}</p>
        </div>

        {/* Admin Reply Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-700 dark:text-blue-400 tracking-wider">
            Official Response Message *
          </label>
          <textarea
            rows={5}
            required
            placeholder="Type your official response to this inquiry..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-zinc-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            ✦ Sending this reply will immediately dispatch a branded email directly to <strong className="text-gray-900 dark:text-white">{contact.email}</strong> and mark this ticket as <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Replied</span>.
          </p>
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
