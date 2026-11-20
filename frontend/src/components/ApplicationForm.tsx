"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  applicationFields,
  applicationLimits,
  cvError,
  cvRules,
  submitApplication,
  validateApplication,
  type ApplicationErrors,
  type ApplicationFieldKey,
  type ApplicationInput,
} from "@/lib/application";
import { apiConnected, type SubmitResult } from "@/lib/api";
import { limits } from "@/lib/validation";
import { CopyButton, FieldError, FormAlerts, Honeypot, honeypotValue, inputClass, NotConnected } from "./FormParts";
import { Turnstile, type TurnstileHandle } from "./Turnstile";
import { buttonClass } from "./ui";

const CAPTCHA_PENDING = "Wait for the security check to finish, then submit again.";

const sectionTitle = "mb-4 text-base font-semibold text-navy";

type BasicKey = "firstName" | "lastName" | "email" | "phone" | "location" | "linkedIn";

export function ApplicationForm({
  roleId,
  roleTitle,
  ask,
  applyEmail,
}: {
  roleId: string;
  roleTitle: string;
  ask: readonly ApplicationFieldKey[];
  applyEmail: string;
}) {
  const blank: ApplicationInput = {
    roleId,
    roleTitle,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    coverNote: "",
    details: {},
    cv: null,
  };
  const [values, setValues] = useState<ApplicationInput>(blank);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ApplicationErrors>({});
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

  const apply = (next: ApplicationInput) => {
    setValues(next);
    if (attempted) setErrors(validateApplication(next, ask));
  };
  const update = (key: BasicKey | "coverNote", value: string) => apply({ ...values, [key]: value });
  const updateDetail = (key: ApplicationFieldKey, value: string) => apply({ ...values, details: { ...values.details, [key]: value } });

  function onCvChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCvFile(file);
    const next = { ...values, cv: file && { name: file.name, size: file.size } };
    setValues(next);
    // Report a wrong file straight away rather than waiting for submit.
    setErrors((prev) => {
      const all = attempted ? validateApplication(next, ask) : { ...prev };
      if (file) all.cv = cvError(next.cv);
      return all;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAttempted(true);
    const found = validateApplication(values, ask);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    if (!cvFile) return; // unreachable: validation requires a CV
    if (apiConnected && !captchaToken) {
      setCaptchaError(CAPTCHA_PENDING);
      return;
    }
    setSubmitting(true);
    // cvFile is the upload itself; values.cv carries only its name and size for validation.
    const outcome = await submitApplication(values, cvFile, ask, { captchaToken, website: honeypotValue(formRef.current) });
    setSubmitting(false);
    if (apiConnected) captchaRef.current?.reset(); // the token is spent once the server has seen it

    if (outcome.status === "invalid") {
      const { captchaToken: captchaProblem, ...fieldErrors } = outcome.errors;
      setErrors(fieldErrors);
      setCaptchaError(captchaProblem ?? "");
      setResult(null);
      const firstInvalid = Object.keys(fieldErrors)[0];
      if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    setResult(outcome);
  }

  if (result?.status === "not-connected" || result?.status === "sent") {
    return (
      <NotConnected
        title={result.status === "sent" ? "Thank you, your application has been sent" : "Sorry, your application could not be sent"}
        text={
          result.status === "sent"
            ? `We have received your application for ${roleTitle} and will be in touch.`
            : "Our online application form is temporarily unavailable, so this application has not been sent. Please email us your CV and the details you entered here instead."
        }
        onBack={() => {
          if (result.status === "sent") {
            setValues(blank);
            setCvFile(null);
            setErrors({});
            setAttempted(false);
          }
          setResult(null);
        }}
      >
        {result.status === "not-connected" && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-ink">
              Reach out to <span className="font-medium">{applyEmail}</span>
            </p>
            <CopyButton text={applyEmail} label="Copy address" />
          </div>
        )}
      </NotConnected>
    );
  }

  const err = (key: string) => errors[key];
  const describedBy = (key: string, hint?: boolean) => [hint && `${key}-hint`, err(key) && `${key}-error`].filter(Boolean).join(" ") || undefined;

  const basic = (key: BasicKey, label: string, props: { autoComplete?: string; type?: string; inputMode?: "email" | "tel" | "url"; maxLength: number; optional?: boolean }) => (
    <div>
      <label htmlFor={key} className="text-sm font-medium">
        {label}
        {props.optional && <span className="font-normal text-muted-strong"> (optional)</span>}
      </label>
      <input
        id={key}
        name={key}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
        maxLength={props.maxLength}
        value={values[key]}
        onChange={(e) => update(key, e.target.value)}
        aria-invalid={!!err(key)}
        aria-describedby={describedBy(key)}
        className={inputClass}
      />
      <FieldError id={`${key}-error`} message={err(key)} />
    </div>
  );

  const detail = (key: ApplicationFieldKey) => {
    const field = applicationFields[key];
    const hint = "hint" in field ? field.hint : undefined;
    const common = {
      id: key,
      name: key,
      value: values.details[key] ?? "",
      "aria-invalid": !!err(key),
      "aria-describedby": describedBy(key, !!hint),
      className: inputClass,
    };
    return (
      <div key={key}>
        <label htmlFor={key} className="text-sm font-medium">
          {field.label}
        </label>
        {field.kind === "select" ? (
          <select {...common} onChange={(e) => updateDetail(key, e.target.value)}>
            <option value="">Choose…</option>
            {field.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : field.kind === "number" ? (
          <input
            {...common}
            type="number"
            inputMode={field.integer ? "numeric" : "decimal"}
            min={field.min}
            max={field.max}
            step={field.integer ? 1 : 0.5}
            onChange={(e) => updateDetail(key, e.target.value)}
          />
        ) : (
          <input {...common} type="text" maxLength={field.maxLength} onChange={(e) => updateDetail(key, e.target.value)} />
        )}
        {hint && (
          <p id={`${key}-hint`} className="mt-1.5 text-sm text-muted-strong">
            {hint}
          </p>
        )}
        <FieldError id={`${key}-error`} message={err(key)} />
      </div>
    );
  };

  // method=post keeps personal data out of the URL if submitted before hydration.
  return (
    <form ref={formRef} method="post" noValidate onSubmit={onSubmit} aria-label={`Application for ${roleTitle}`} className="space-y-6">
      <input type="hidden" name="roleId" value={roleId} />
      <FormAlerts attempted={attempted} errorCount={Object.keys(errors).filter((k) => errors[k]).length} result={result} />

      <fieldset>
        <legend className={sectionTitle}>Your details</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          {basic("firstName", "First name", { autoComplete: "given-name", maxLength: limits.name })}
          {basic("lastName", "Last name", { autoComplete: "family-name", maxLength: limits.name })}
          {basic("email", "Email", { autoComplete: "email", type: "email", inputMode: "email", maxLength: limits.email })}
          {basic("phone", "Phone", { autoComplete: "tel", type: "tel", inputMode: "tel", maxLength: 20 })}
          {basic("location", "Current location", { autoComplete: "address-level2", maxLength: applicationLimits.location })}
          {basic("linkedIn", "LinkedIn profile", { type: "url", inputMode: "url", maxLength: applicationLimits.linkedIn, optional: true })}
        </div>
      </fieldset>

      {ask.length > 0 && (
        <div className="border-t border-line pt-6">
          <fieldset>
            <legend className={sectionTitle}>Experience and availability</legend>
            <div className="grid gap-6 sm:grid-cols-2">{ask.map(detail)}</div>
          </fieldset>
        </div>
      )}

      <div className="space-y-6 border-t border-line pt-6">
        <div>
          <label htmlFor="cv" className="text-base font-semibold text-navy">
            Your CV
          </label>
          <input
            id="cv"
            name="cv"
            type="file"
            accept={cvRules.extensions.map((e) => `.${e}`).join(",")}
            onChange={onCvChange}
            aria-invalid={!!err("cv")}
            aria-describedby={describedBy("cv", true)}
            className={`${inputClass} file:mr-4 file:rounded-sm file:border-0 file:bg-sky file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy`}
          />
          <p id="cv-hint" className="mt-1.5 text-sm text-muted-strong">
            PDF or Word document, up to 5 MB.
          </p>
          <FieldError id="cv-error" message={err("cv")} />
        </div>

        <div>
          <label htmlFor="coverNote" className="text-sm font-medium">
            Anything else we should know? <span className="font-normal text-muted-strong">(optional)</span>
          </label>
          <textarea
            id="coverNote"
            name="coverNote"
            rows={4}
            maxLength={applicationLimits.coverNote}
            value={values.coverNote}
            onChange={(e) => update("coverNote", e.target.value)}
            aria-invalid={!!err("coverNote")}
            aria-describedby={describedBy("coverNote")}
            className={`${inputClass} resize-y`}
          />
          <FieldError id="coverNote-error" message={err("coverNote")} />
        </div>
      </div>

      <Honeypot />
      {apiConnected && <Turnstile ref={captchaRef} action="application" onToken={onCaptchaToken} error={captchaError} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <button type="submit" disabled={submitting} className={`${buttonClass("primary")} w-full shrink-0 disabled:opacity-60 sm:w-auto`}>
          {submitting ? (apiConnected ? "Sending…" : "Checking…") : "Submit application"}
        </button>
        <p className="text-sm leading-relaxed text-muted-strong">
          We use these details only to assess your application. See our{" "}
          <Link href="/privacy" className="font-medium text-blue-deep underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
