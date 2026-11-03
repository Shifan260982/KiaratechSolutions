"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Clock for the looping project mockups, in seconds. It starts from 0 on every page load, ticks only
 * while the scene is on screen, holds the still `start` frame under reduced motion, and can be paused
 * by the visitor (WCAG 2.2.2).
 */
export function useSceneClock<T extends Element>(start: number) {
  const ref = useRef<T>(null);
  const [t, setT] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null); // the visitor's play/pause, once they press it
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const playing = choice ?? !reducedMotion;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    let id = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - prev, 100) / 1000; // cap so a backgrounded tab does not jump ahead
      prev = now;
      setT((v) => v + dt);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, inView]);

  const still = reducedMotion && choice === null;
  return { ref, t: still ? start : t, playing, toggle: () => setChoice(!playing) };
}

/** Pause/play control, pinned to the bottom-right of a `relative` scene wrapper. */
export function PlayToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Pause animation" : "Play animation"}
      className="absolute bottom-0 right-0 z-10 flex size-7 items-center justify-center rounded-full border border-line bg-paper text-navy transition-colors hover:border-blue hover:text-blue"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3" fill="currentColor">
        {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
      </svg>
    </button>
  );
}

export const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** Eased 0 → 1 as t runs from a to b. */
export const ramp = (t: number, a: number, b: number) => {
  const s = clamp((t - a) / (b - a));
  return s * s * (3 - 2 * s);
};
export const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
/** 0 → 1 → 0 across [a, b], for button presses. */
export const press = (t: number, a: number, b: number) => Math.sin(Math.PI * clamp((t - a) / (b - a)));
/** Centres an absolutely positioned element on (x%, y%). */
export const at = (x: number, y: number, extra = ""): CSSProperties => ({ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) ${extra}` });

export type CursorKey = [t: number, x: number, y: number];

/** Cursor position (% of the scene) along eased keyframes. */
export function cursorAt(keys: CursorKey[], t: number): [number, number] {
  for (let i = 1; i < keys.length; i++) {
    const [t1, x1, y1] = keys[i];
    if (t <= t1) {
      const [t0, x0, y0] = keys[i - 1];
      const s = ramp(t, t0, t1);
      return [lerp(x0, x1, s), lerp(y0, y1, s)];
    }
  }
  const [, x, y] = keys[keys.length - 1];
  return [x, y];
}

/** Mouse pointer with a click ripple that runs for 0.4 s after each time in `clicks`. */
export function Cursor({ t, x, y, opacity, clicks }: { t: number; x: number; y: number; opacity: number; clicks: number[] }) {
  const last = clicks.findLast((c) => c <= t) ?? -1;
  const ripple = clamp((t - last) / 0.4);
  return (
    <span aria-hidden="true" className="pointer-events-none absolute z-20" style={{ left: `${x}%`, top: `${y}%`, opacity }}>
      {ripple > 0 && ripple < 1 && (
        <span className="absolute size-6 rounded-full border-2 border-blue" style={{ left: -12, top: -12, opacity: 1 - ripple, transform: `scale(${0.3 + ripple})` }} />
      )}
      <svg viewBox="0 0 12 16" className="relative w-3 drop-shadow-sm">
        <path d="M0.5 0.5v13l3.4-3.3 2.3 5.1 2.1-0.9-2.3-5h4.6z" fill="#102a56" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
