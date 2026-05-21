"use client";

import { useEffect, useRef, useState } from "react";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + (sec < 10 ? "0" : "") + sec;
}

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.controls = false;

    const onPlay = () => {
      setPlaying(true);
      setShowOverlay(false);
      setControlsVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    };
    const onPause = () => {
      setPlaying(false);
      if (video.currentTime > 0) setShowOverlay(true);
      setControlsVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    const onTime = () => {
      setCurrent(video.currentTime);
    };
    const onMeta = () => setDuration(video.duration);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const showControlsBriefly = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (videoRef.current && !videoRef.current.paused) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  };

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const fullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    const v = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    else if (wrapperRef.current?.requestFullscreen) wrapperRef.current.requestFullscreen();
  };

  const progressPct = duration ? (current / duration) * 100 : 0;

  return (
    <div
      ref={wrapperRef}
      className="video-wrapper rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(124,58,237,0.1)]"
      onPointerMove={showControlsBriefly}
      onTouchStart={showControlsBriefly}
    >
      <video
        ref={videoRef}
        loop
        playsInline
        preload="metadata"
        className="w-full h-auto block"
        onClick={togglePlay}
      >
        <source src="/videofinalfinal.mp4" type="video/mp4" />
      </video>

      <div
        className={`video-overlay${showOverlay ? "" : " hidden"}`}
        onClick={() => videoRef.current?.play()}
      >
        <button className="video-play-btn" aria-label="Reproducir video">
          <div className="video-play-ring video-play-ring-1" />
          <div className="video-play-ring video-play-ring-2" />
          <div className="video-play-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
        <p className="video-play-label">Ver video</p>
      </div>

      <div className={`video-controls${controlsVisible ? " visible" : ""}`}>
        <button
          className="vc-btn"
          aria-label="Play/Pause"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="vc-icon" style={{ display: playing ? "none" : undefined }}>
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="vc-icon" style={{ display: playing ? undefined : "none" }}>
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
        <span className="vc-time">{fmt(current)}</span>
        <div
          ref={progressRef}
          className="vc-progress-bar"
          onPointerDown={(e) => {
            seek(e);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) seek(e);
          }}
        >
          <div className="vc-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="vc-time">{fmt(duration)}</span>
        <button
          className="vc-btn"
          aria-label="Mute"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="vc-icon" style={{ display: muted ? "none" : undefined }}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="vc-icon" style={{ display: muted ? undefined : "none" }}>
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        </button>
        <button
          className="vc-btn"
          aria-label="Fullscreen"
          onClick={(e) => {
            e.stopPropagation();
            fullscreen();
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="vc-icon">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
