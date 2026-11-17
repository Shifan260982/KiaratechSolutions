"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { site } from "@/content/site";
import { apiConnected } from "@/lib/api";
import { submitEnquiry, type SubmitResult } from "@/lib/enquiry";
import { limits, validateEnquiry, type EnquiryErrors, type EnquiryInput } from "@/lib/validation";
import { FieldError, FormAlerts, Honeypot, honeypotValue, inputClass, NotConnected } from "./FormParts";
import { Turnstile, type TurnstileHandle } from "./Turnstile";
import { buttonClass } from "./ui";

const CAPTCHA_PENDING = "Wait for the security check to finish, then send again.";

const fieldOrder: (keyof EnquiryInput)[] = ["firstName", "lastName", "email", "company", "topic", "message"];

const empty: EnquiryInput = { firstName: "", lastName: "", email: "", company: "", topic: "", message: "" };

export function EnquiryForm() {
  const [values, setValues] = useState<EnquiryInput>(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

  const onCaptchaToken = (token: string) => {
    setCaptchaToken(token);
    if (token) setCaptchaError("");
  };

  const update = (key: keyof EnquiryInput, value: string) => {
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
    if (apiConnected && !captchaToken) {
      setCaptchaError(CAPTCHA_PENDING);
      return;
    }
    setSubmitting(true);
    const outcome = await submitEnquiry(values, { captchaToken, website: honeypotValue(formRef.current) });
    setSubmitting(false);
    if (apiConnected) captchaRef.current?.reset(); // the token is spent once the server has seen it

    if (outcome.status === "invalid") {
      const { captchaToken: captchaProblem, ...fieldErrors } = outcome.errors;
      setErrors(fieldErrors);
      setCaptchaError(captchaProblem ?? "");
      setResult(null);
      const firstInvalid = fieldOrder.find((k) => fieldErrors[k]);
      if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setResult(outcome);
  }

  if (result?.status === "not-connected" || result?.status === "sent") {
    return (
      <NotConnected
        title={result.status === "sent" ? "Thank you, your enquiry has been sent" : "Thank you, your details are complete"}
        text={
          result.status === "sent"
            ? "We have received your enquiry and will be in touch."
            : "Online enquiries are not connected yet, so this message has not been sent. Until they are, please email us your enquiry."
        }
        onBack={() => setResult(null)}
      >
        {result.status === "not-connected" && (
          <a
            href={`mailto:${site.businessEmail}?subject=${encodeURIComponent("Enquiry")}`}
            className="mt-4 inline-block font-medium text-blue-deep underline underline-offset-4"
          >
            Email {site.businessEmail}
          </a>
        )}
      </NotConnected>
    );
  }

  const describedBy = (key: keyof EnquiryInput) => (errors[key] ? `${key}-error` : undefined);

  const field = (key: keyof EnquiryInput, label: string, props: { autoComplete?: string; type?: string; maxLength: number }) => (
    <div>
      <label htmlFor={key} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={key}
        name={key}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        inputMode={props.type === "email" ? "email" : undefined}
        maxLength={props.maxLength}
        value={values[key]}
        onChange={(e) => update(key, e.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={describedBy(key)}
        className={inputClass}
      />
      <FieldError id={`${key}-error`} message={errors[key]} />
    </div>
  );

  // method=post keeps personal data out of the URL if submitted before hydration.
  return (
    <form ref={formRef} method="post" noValidate onSubmit={onSubmit} aria-label="Enquiry form" className="space-y-6">
      <FormAlerts attempted={attempted} errorCount={Object.keys(errors).length} result={result} />

      <div className="grid gap-6 sm:grid-cols-2">
        {field("firstName", "First name", { autoComplete: "given-name", maxLength: limits.name })}
        {field("lastName", "Last name", { autoComplete: "family-name", maxLength: limits.name })}
        {field("email", "Email", { autoComplete: "email", type: "email", maxLength: limits.email })}
        {field("company", "Company", { autoComplete: "organization", maxLength: limits.company })}
      </div>

      {field("topic", "Topic", { maxLength: limits.topic })}

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
          className={`${inputClass} resize-y`}
        />
        <FieldError id="message-error" message={errors.message} />
      </div>

      <Honeypot />
      {apiConnected && <Turnstile ref={captchaRef} action="enquiry" onToken={onCaptchaToken} error={captchaError} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <button type="submit" disabled={submitting} className={`${buttonClass("primary")} w-full shrink-0 disabled:opacity-60 sm:w-auto`}>
          {submitting ? (apiConnected ? "Sending…" : "Checking…") : "Send enquiry"}
        </button>
        <p className="text-sm leading-relaxed text-muted-strong">
          We use these details only to respond to your enquiry. See our{" "}
          <Link href="/privacy" className="text-ink underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
