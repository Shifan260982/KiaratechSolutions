import type { ReactNode } from "react";
import type { SubmitResult } from "@/lib/enquiry";
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
      <button type="button" onClick={onBack} className={`${buttonClass("secondary")} mt-5`}>
        Back to the form
      </button>
    </div>
  );
}
