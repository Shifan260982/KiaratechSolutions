"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Slides its content in from the right when scrolled into view.
 * Renders visible by default; the entrance is armed only when the element starts below
 * the fold with JavaScript running and motion allowed (same rules as AboutGreeting).
 */
export function SlideIn({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<"static" | "armed" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setStage("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStage("shown");
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const motion = stage === "shown" ? "transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" : "";
  const state = stage === "armed" ? "translate-x-16 opacity-0" : "translate-x-0 opacity-100";

  return (
    <div ref={ref} className={`${motion} ${state} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
