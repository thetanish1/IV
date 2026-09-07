import React from "react";
import { X, ExternalLink } from "lucide-react";

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageLightboxModal({ imageUrl, onClose }: ImageLightboxModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <X className="w-5 h-5" /> Close (ESC)
        </button>
        <img
          src={imageUrl}
          alt="Expanded Screenshot"
          className="max-h-[85vh] max-w-full object-contain rounded-lg border border-ink-700 shadow-2xl"
        />
        <div className="mt-3 flex items-center gap-4">
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-pink-400 hover:underline flex items-center gap-1 bg-ink-900/80 px-3 py-1.5 rounded border border-ink-700"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution in New Tab
          </a>
        </div>
      </div>
    </div>
  );
}
