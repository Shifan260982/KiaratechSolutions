"use client";

import { useEffect, useState, type FocusEvent, type PointerEvent } from "react";

/**
 * Auto-advancing carousel state. Rotation pauses while hovered or focused, can be
 * stopped by the visitor (WCAG 2.2.2), and never starts under reduced motion.
 */
export function useCarousel(count: number, intervalMs = 6000) {
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [held, setHeld] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const playing = count > 1 && !stopped && !held && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearTimeout(id);
  }, [playing, index, count, intervalMs]);

  return {
    index,
    goTo: setIndex,
    playing,
    autoplayOn: !stopped && !reducedMotion,
    toggle: () => setStopped((s) => !s),
    // Spread onto the carousel root.
    holdProps: {
      onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && setHeld(true),
      onPointerLeave: () => setHeld(false),
      onFocus: () => setHeld(true),
      onBlur: (e: FocusEvent) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false),
    },
  };
}
