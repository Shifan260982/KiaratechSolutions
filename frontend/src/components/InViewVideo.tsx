"use client";

import { useEffect, useRef } from "react";

/**
 * Plays muted while at least half of it is on screen and pauses when scrolled away.
 * Browsers only allow autoplay when muted; the controls let visitors unmute or replay.
 * Reduced-motion visitors get the poster and press play themselves.
 */
export function InViewVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {}); // autoplay can still be blocked; controls remain
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      playsInline
      controls
      preload="metadata"
      className="aspect-video w-full rounded-lg bg-navy shadow-[0_18px_40px_-20px_rgb(2_33_98/0.45)]"
    />
  );
}
