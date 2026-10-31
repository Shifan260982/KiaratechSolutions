"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { submitEnquiry, type SubmitResult } from "@/lib/enquiry";
import { enquiryTypes, isEnquiryType, limits, validateEnquiry, type EnquiryErrors, type EnquiryInput, type EnquiryType } from "@/lib/validation";
import { buttonClass } from "./ui";

const fieldOrder: (keyof EnquiryInput)[] = ["type", "name", "email", "company", "message", "consent"];

const inputClass =
  "mt-1.5 block w-full rounded-sm border bg-paper px-3 py-2.5 text-base text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-ink aria-[invalid=true]:border-danger";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

/** Reads ?type= from the URL. Wrap in <Suspense fallback={<EnquiryForm />}> so the form is in the static HTML. */
export function EnquiryFormFromUrl() {
  const requestedType = useSearchParams().get("type") ?? "";
  return <EnquiryForm initialType={isEnquiryType(requestedType) ? requestedType : undefined} />;
}

export function EnquiryForm({ initialType = "discovery" }: { initialType?: EnquiryType }) {
  const [values, setValues] = useState<EnquiryInput>({
    name: "",
    email: "",
    company: "",
    type: initialType,
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const update = <K extends keyof EnquiryInput>(key: K, value: EnquiryInput[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (attempted) setErrors(validateEnquiry(next));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAttempted(true);
    const found = validateEnquiry(values);
    setErrors(found);
    const firstInvalid = fieldOrder.find((k) => found[k]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      setResult(await submitEnquiry(values));
    } catch {
      setResult({ status: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.status === "not-connected" || result?.status === "sent") {
    return (
      <div
        role="status"
        tabIndex={-1}
        ref={(el) => el?.focus()}
        className="rounded-sm border border-ink bg-paper p-6 focus:outline-none"
      >
        <h2 className="text-heading font-semibold">Thank you, your details are complete</h2>
        <p className="mt-2 leading-relaxed text-muted-strong">
          {result.status === "sent"
            ? "We have received your enquiry and will be in touch."
            : "Online enquiries are not connected yet, so this message has not been sent. Submission will be enabled before launch."}
        </p>
        <button type="button" onClick={() => setResult(null)} className={`${buttonClass("secondary")} mt-5`}>
          Back to the form
        </button>
      </div>
    );
  }

  const describedBy = (key: keyof EnquiryInput) => (errors[key] ? `${key}-error` : undefined);
  const errorCount = Object.keys(errors).length;

  // method=post keeps personal data out of the URL if submitted before hydration.
  return (
    <form ref={formRef} method="post" noValidate onSubmit={onSubmit} aria-label="Enquiry form" className="space-y-6">
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

      <fieldset aria-describedby={describedBy("type")}>
        <legend className="text-sm font-medium">What would you like to discuss?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {enquiryTypes.map((t) => (
            <label
              key={t.value}
              className="flex cursor-pointer items-center gap-3 rounded-sm border border-line-strong px-3 py-2.5 text-[0.9375rem] transition-colors has-[:checked]:border-ink has-[:checked]:bg-mist has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink"
            >
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={values.type === t.value}
                onChange={() => update("type", t.value)}
                className="size-4 accent-ink focus:outline-none"
              />
              {t.label}
            </label>
          ))}
        </div>
        <FieldError id="type-error" message={errors.type} />
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            maxLength={limits.name}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={`${inputClass} border-line-strong`}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={limits.email}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={`${inputClass} border-line-strong`}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="text-sm font-medium">
          Company
        </label>
        <input
          id="company"
          name="company"
          autoComplete="organization"
          maxLength={limits.company}
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
          aria-invalid={!!errors.company}
          aria-describedby={describedBy("company")}
          className={`${inputClass} border-line-strong`}
        />
        <FieldError id="company-error" message={errors.company} />
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          What outcome are you looking for?
        </label>
        <p id="message-hint" className="mt-0.5 text-sm text-muted-strong">
          The challenge, the systems involved and your timeline.
        </p>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={limits.message}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={["message-hint", describedBy("message")].filter(Boolean).join(" ")}
          className={`${inputClass} border-line-strong resize-y`}
        />
        <FieldError id="message-error" message={errors.message} />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-strong">
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={(e) => update("consent", e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("consent")}
            className="mt-0.5 size-4 shrink-0 accent-ink"
          />
          <span>
            I agree to Kiaratech Solutions using these details to respond to my enquiry, as described in the{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent} />
      </div>

      <button type="submit" disabled={submitting} className={`${buttonClass("primary")} w-full disabled:opacity-60 sm:w-auto`}>
        {submitting ? "Checking…" : "Send enquiry"}
      </button>
    </form>
  );
}
