"use client";

import { useState, type ReactNode } from "react";
import type { SubmitResult } from "@/lib/api";
import { buttonClass } from "./ui";

// Shared by the enquiry and job application forms.
export const inputClass =
  "mt-1.5 block w-full rounded-sm border border-line-strong bg-paper px-3 py-2.5 text-base text-ink placeholder:text-muted transition-colors focus:border-blue focus:outline-2 focus:outline-offset-0 focus:outline-blue aria-[invalid=true]:border-danger";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

export function FormAlerts({ attempted, errorCount, result }: { attempted: boolean; errorCount: number; result: SubmitResult | null }) {
  return (
    <>
      {attempted && errorCount > 0 && (
        <p role="alert" className="rounded-sm border border-danger px-4 py-3 text-sm text-danger">
          Please correct {errorCount === 1 ? "1 field" : `${errorCount} fields`} below.
        </p>
      )}
      {result?.status === "error" && (
        <p role="alert" className="rounded-sm border border-danger px-4 py-3 text-sm text-danger">
          {result.message}
        </p>
      )}
    </>
  );
}

/** Confirmation panel shown after a valid submission. Takes focus so screen readers announce it. */
export function NotConnected({ title, text, children, onBack }: { title: string; text: string; children?: ReactNode; onBack: () => void }) {
  return (
    <div role="status" tabIndex={-1} ref={(el) => el?.focus()} className="rounded-sm border border-ink bg-paper p-6 focus:outline-none">
      <h2 className="text-heading font-semibold">{title}</h2>
      <p className="mt-2 leading-relaxed text-muted-strong">{text}</p>
      {children}
      {/* Own block, so it never sits on the same line as the email link above it. */}
      <div className="mt-6">
        <button type="button" onClick={onBack} className={buttonClass("secondary")}>
          Back to the form
        </button>
      </div>
    </div>
  );
}

/** Hidden from people and assistive tech; bots that fill every field reveal themselves. The API discards those. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor="website">Leave this field empty</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

/** The honeypot's value at submit time. */
export const honeypotValue = (form: HTMLFormElement | null) =>
  (form?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

/** Copies `text` for visitors whose email links open the wrong app, or nothing (common with webmail). */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("failed"); // no clipboard access (old browser or blocked permission)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-line-strong bg-paper px-3 font-secondary text-sm font-semibold text-navy transition-colors duration-150 hover:border-blue hover:text-blue"
      >
        {state === "copied" ? (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 text-blue">
            <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
            <rect x="5.5" y="5.5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 3.5v-1h-8v8h1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
        {state === "copied" ? "Copied" : label}
      </button>
      <span aria-live="polite" className={state === "failed" ? "basis-full text-sm text-muted-strong" : "sr-only"}>
        {state === "copied" ? `${text} copied to clipboard.` : state === "failed" ? `Copying is not available here. Select ${text} to copy it.` : ""}
      </span>
    </>
  );
}
