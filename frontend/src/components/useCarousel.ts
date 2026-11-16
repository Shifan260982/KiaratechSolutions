"use client";

import { useEffect, useState, type FocusEvent, type PointerEvent } from "react";

/**
 * Auto-advancing carousel state. Hovering pauses rotation for a short beat, then it moves on;
 * keyboard focus pauses it for as long as focus stays inside. It can be stopped by the visitor
 * (WCAG 2.2.2) and never starts under reduced motion.
 */
export function useCarousel(count: number, intervalMs = 6000, hoverPauseMs = 3000) {
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const playing = count > 1 && !stopped && !hovered && !focused && !reducedMotion;

  // A hover holds the current slide for hoverPauseMs, then goes to the next one and rotation carries on.
  useEffect(() => {
    if (!hovered || focused || stopped || reducedMotion || count < 2) return;
    const id = window.setTimeout(() => {
      setHovered(false);
      setIndex((i) => (i + 1) % count);
    }, hoverPauseMs);
    return () => window.clearTimeout(id);
  }, [hovered, focused, stopped, reducedMotion, count, hoverPauseMs]);

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
      onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && setHovered(true),
      onPointerLeave: () => setHovered(false),
      // Only keyboard focus holds the slide: a mouse click on a control would otherwise freeze it.
      onFocus: (e: FocusEvent) => e.target.matches(":focus-visible") && setFocused(true),
      onBlur: (e: FocusEvent) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false),
    },
  };
}
