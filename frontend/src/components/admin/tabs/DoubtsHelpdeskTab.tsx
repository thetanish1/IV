import React, { useState, useEffect, useCallback } from "react";
import { MessageSquare, RefreshCw, Loader2, Image as ImageIcon, ZoomIn } from "lucide-react";
import { StudentDoubtItem } from "@/types";
import { apiRequest, getImageUrl } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";
import StatusBadge from "../common/StatusBadge";
import DurationFilterSelect from "../common/DurationFilterSelect";
import DoubtReplyModal from "./DoubtReplyModal";

interface DoubtsHelpdeskTabProps {
  onZoomImage: (url: string) => void;
}

export default function DoubtsHelpdeskTab({ onZoomImage }: DoubtsHelpdeskTabProps) {
  const [doubtsList, setDoubtsList] = useState<StudentDoubtItem[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [doubtFilter, setDoubtFilter] = useState("all");
  const [doubtDurationFilter, setDoubtDurationFilter] = useState("all");

  const [replyingDoubt, setReplyingDoubt] = useState<StudentDoubtItem | null>(null);
  const [doubtReplyText, setDoubtReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchDoubts = useCallback(async () => {
    setLoadingDoubts(true);
    try {
      const params = new URLSearchParams();
      if (doubtFilter !== "all") params.set("status", doubtFilter);
      if (doubtDurationFilter !== "all") params.set("duration", doubtDurationFilter);

      const data = await apiRequest<{ items: StudentDoubtItem[]; total: number } | StudentDoubtItem[]>(
        `/admin/doubts?${params.toString()}`
      );
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
      setDoubtsList(list);
    } catch (err) {
      console.error("Failed to load doubts", err);
      setDoubtsList([]);
    } finally {
      setLoadingDoubts(false);
    }
  }, [doubtFilter, doubtDurationFilter]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  const handleSendDoubtReply = async () => {
    if (!replyingDoubt || !doubtReplyText.trim()) return;
    setSendingReply(true);
    try {
      await apiRequest<StudentDoubtItem>(`/admin/doubts/${replyingDoubt.id}/reply`, {
        method: "POST",
        body: JSON.stringify({
          admin_reply: doubtReplyText.trim(),
        }),
      });
      setDoubtsList((prev) =>
        (Array.isArray(prev) ? prev : []).map((d) =>
          d.id === replyingDoubt.id ? { ...d, admin_reply: doubtReplyText.trim(), status: "answered" } : d
        )
      );
      setReplyingDoubt(null);
      setDoubtReplyText("");
    } catch (err) {
      console.error("Failed to send doubt reply", err);
      alert("Failed to send reply. Please check your network connection.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <FadeIn delay={0.2} direction="up">
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Technical Doubts & Mentor Desk
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Direct 2-way query resolution desk for student code snippets, bugs, and module doubts.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={doubtFilter}
              onChange={(e) => setDoubtFilter(e.target.value)}
              className="bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors cursor-pointer font-medium"
            >
              <option value="all">All Queries</option>
              <option value="open">Open / Unanswered</option>
              <option value="answered">Resolved / Answered</option>
            </select>
            <DurationFilterSelect
              value={doubtDurationFilter}
              onChange={(val) => setDoubtDurationFilter(val)}
              accentColor="blue"
            />
            <button
              type="button"
              onClick={fetchDoubts}
              className="p-2 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A30] transition shadow-sm"
              title="Refresh Doubts"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loadingDoubts ? (
            <div className="p-12 text-center border border-gray-200 dark:border-[#27272A] rounded-xl bg-white dark:bg-[#18181B] shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
            </div>
          ) : doubtsList.length === 0 ? (
            <div className="p-12 text-center border border-gray-200 dark:border-[#27272A] rounded-xl bg-white dark:bg-[#18181B] shadow-sm text-gray-500 dark:text-gray-400 text-sm">
              No student queries found.
            </div>
          ) : (
            doubtsList.map((d) => (
              <div
                key={d.id}
                className={`p-5 rounded-xl border transition-all ${
                  d.status === "open"
                    ? "bg-blue-50/40 border-blue-200 dark:bg-blue-950/20 dark:border-blue-500/30"
                    : "bg-white border-gray-200 shadow-sm dark:bg-[#18181B] dark:border-[#27272A] hover:border-gray-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={d.status} type="doubt" />
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{d.domain_track}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-600">•</span>
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{d.module_name}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5">{d.subject}</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      From: <strong className="text-gray-800 dark:text-gray-200">{d.student_name}</strong> ({d.student_email}) •{" "}
                      {new Date(d.created_at).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyingDoubt(d);
                      setDoubtReplyText(d.admin_reply || "");
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition self-start shadow-sm whitespace-nowrap"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {d.admin_reply ? "Edit Reply" : "Answer Query"}
                  </button>
                </div>

                {/* Question body */}
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-3 whitespace-pre-wrap leading-relaxed">{d.question}</p>

                {/* Code snippet if any */}
                {d.code_snippet && (
                  <div className="mt-3 p-3 bg-gray-900 text-gray-100 dark:bg-black/80 dark:border-zinc-800 border rounded-lg font-mono text-xs overflow-x-auto">
                    <pre>{d.code_snippet}</pre>
                  </div>
                )}

                {/* Attached Error Screenshot */}
                {d.image_url && (
                  <div className="mt-3 flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-lg max-w-md">
                    <img
                      src={getImageUrl(d.image_url)}
                      alt="Error Screenshot"
                      className="w-14 h-14 object-cover rounded border border-gray-300 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition shrink-0"
                      onClick={() => onZoomImage(getImageUrl(d.image_url))}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" /> Error Screenshot Attached
                      </div>
                      <button
                        type="button"
                        onClick={() => onZoomImage(getImageUrl(d.image_url))}
                        className="text-[11px] text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white underline mt-1 flex items-center gap-1"
                      >
                        <ZoomIn className="w-3 h-3" /> Click to inspect visual error
                      </button>
                    </div>
                  </div>
                )}

                {/* Reply box if answered */}
                {d.admin_reply && (
                  <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                      <span>✓ Mentor Resolution ({d.answered_by || "HR Team"})</span>
                      {d.answered_at && (
                        <span className="text-gray-500 dark:text-gray-400 font-normal">
                          {new Date(d.answered_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                      {d.admin_reply}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Doubt Reply Modal */}
        <DoubtReplyModal
          doubt={replyingDoubt}
          replyText={doubtReplyText}
          setReplyText={setDoubtReplyText}
          sendingReply={sendingReply}
          onClose={() => setReplyingDoubt(null)}
          onSendReply={handleSendDoubtReply}
          onZoomImage={onZoomImage}
        />
      </div>
    </FadeIn>
  );
}
