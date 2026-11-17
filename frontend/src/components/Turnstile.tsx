"use client";

import { useEffect, useEffectEvent, useImperativeHandle, useRef, useState, type Ref } from "react";
import { api } from "@/lib/api";
import { FieldError } from "./FormParts";

type TurnstileApi = {
  render(element: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset(): void };

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<TurnstileApi> | null = null;

/** Loads Cloudflare's script once per page, however many widgets render. */
function loadTurnstile(): Promise<TurnstileApi> {
  loading ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
    script.onerror = () => {
      loading = null; // allow a retry on the next mount
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * Cloudflare Turnstile security check. Most visitors see a brief "Verifying" and a tick; only suspicious traffic is
 * asked to click. Tokens are single-use: the form calls `reset()` after every attempt that reached the server.
 */
export function Turnstile({
  action,
  onToken,
  error,
  ref,
}: {
  action: "enquiry" | "application";
  onToken: (token: string) => void;
  error?: string;
  ref?: Ref<TurnstileHandle>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const emit = useEffectEvent(onToken);

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      onToken("");
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: api.turnstileSiteKey,
          action,
          theme: "light",
          size: "flexible",
          "refresh-expired": "auto",
          callback: (token: string) => emit(token),
          "expired-callback": () => emit(""),
          "error-callback": () => emit(""),
        });
      })
      .catch(() => setLoadFailed(true));
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [action]);

  return (
    <div>
      <div ref={container} className="min-h-[65px]" />
      {loadFailed && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          The security check could not load. Check your connection or pause content blockers for this site, then reload the page.
        </p>
      )}
      <FieldError id="captchaToken-error" message={error} />
    </div>
  );
}
