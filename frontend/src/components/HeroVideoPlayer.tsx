"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles } from "lucide-react";

interface HeroVideoPlayerProps {
  src?: string;
  className?: string;
}

export default function HeroVideoPlayer({
  src = "/hero-video.mp4",
  className = "",
}: HeroVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = clickX / rect.width;
    video.currentTime = newProgress * video.duration;
  };

  return (
    <div
      className={`relative group rounded-2xl overflow-hidden border border-brand-500/30 bg-ink-950/80 backdrop-blur-xl shadow-2xl shadow-brand-500/10 transition-all duration-300 hover:border-brand-500/60 ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Ambient background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-600/30 to-blue-600/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity -z-10 pointer-events-none" />

      {/* Video Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
        />

        {/* Center Play Overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-brand-500 transition-all z-20 backdrop-blur-sm border border-white/20"
          >
            <Play className="w-7 h-7 fill-current ml-1" />
          </button>
        )}

        {/* Top Tag */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Sparkles className="w-3 h-3 text-brand-400" /> Platform Overview
        </div>

        {/* Floating Custom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 z-20 transition-opacity duration-200 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0 md:opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div
            className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer overflow-hidden hover:h-2 transition-all relative"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="text-[10px] hidden sm:inline">{isMuted ? "Unmute" : "Sound On"}</span>
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              aria-label="Fullscreen"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
