"use client";

import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Maximize, Sparkles } from "lucide-react";

interface HeroVideoPlayerProps {
  src?: string;
  className?: string;
}

export default function HeroVideoPlayer({
  src = "/hero-video.mp4",
  className = "",
}: HeroVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Ensure continuous auto playback like a GIF
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      // Browser autoplay policy fallback (already muted)
    });
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <div
      className={`relative group rounded-3xl overflow-hidden border border-brand-500/30 bg-ink-950/90 backdrop-blur-2xl shadow-2xl shadow-brand-500/15 transition-all duration-500 hover:border-brand-500/60 ${className}`}
    >
      {/* Ambient background glows */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-600/30 via-blue-600/20 to-brand-400/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity -z-10 pointer-events-none" />

      {/* Video Container - Continuous GIF playback */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="w-full h-full object-cover select-none"
        />

        {/* Live Badge */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Platform Preview
        </div>

        {/* Subtle Bottom Controls (Audio & Fullscreen on hover) */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="p-2 rounded-xl bg-ink-950/80 hover:bg-brand-600 border border-white/10 text-white transition-colors flex items-center gap-1.5 text-xs font-medium backdrop-blur-md shadow-lg"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-ink-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="p-2 rounded-xl bg-ink-950/80 hover:bg-brand-600 border border-white/10 text-white transition-colors backdrop-blur-md shadow-lg"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
