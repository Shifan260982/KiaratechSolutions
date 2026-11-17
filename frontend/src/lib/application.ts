// Job application: field definitions, sanitising and client-side validation (UX only; the backend re-validates).
import { postToApi, type SubmitResult } from "./api.ts";
import { emailError, nameError, sanitiseText } from "./validation.ts";

type NumberField = { kind: "number"; label: string; hint?: string; min: number; max: number; integer: boolean };
type TextField = { kind: "text"; label: string; hint?: string; maxLength: number };
type SelectField = { kind: "select"; label: string; hint?: string; options: readonly string[] };

/** Role-specific questions. Each job lists the ones its advert asks candidates to mention. */
export const applicationFields = {
  totalExperience: { kind: "number", label: "Total experience (years)", min: 0, max: 50, integer: false },
  relevantExperience: { kind: "number", label: "Relevant experience (years)", min: 0, max: 50, integer: false },
  currentCtc: { kind: "text", label: "Current CTC", hint: "Annual, for example 12 LPA. Enter 0 if not currently employed.", maxLength: 40 },
  expectedCtc: { kind: "text", label: "Expected CTC", hint: "Annual, for example 15 LPA.", maxLength: 40 },
  noticePeriod: { kind: "number", label: "Notice period (days)", hint: "Enter 0 if you can join immediately.", min: 0, max: 365, integer: true },
  teamSize: { kind: "number", label: "Team size managed", hint: "The largest team you have led directly.", min: 0, max: 1000, integer: true },
  primaryTechnology: { kind: "text", label: "Primary technology", hint: "For example C#/.NET, Java or SQL.", maxLength: 60 },
  itilCertification: { kind: "select", label: "ITIL certification", options: ["ITIL 4", "Another ITIL version", "Not certified"] },
} as const satisfies Record<string, NumberField | TextField | SelectField>;

export type ApplicationFieldKey = keyof typeof applicationFields;

export const cvRules = { maxBytes: 5 * 1024 * 1024, extensions: ["pdf", "doc", "docx"] } as const;
export const applicationLimits = { location: 100, linkedIn: 200, coverNote: 2000 } as const;

export type CvFile = { name: string; size: number };

export type ApplicationInput = {
  roleId: string;
  roleTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  coverNote: string;
  details: Partial<Record<ApplicationFieldKey, string>>;
  cv: CvFile | null;
};

/** Error keys match the form's field names, so the form can focus the first invalid one. */
export type ApplicationErrors = Partial<Record<string, string>>;

const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;
const HTTPS_URL = /^https:\/\/[^\s"'<>]+$/i;

export function sanitiseApplication(input: ApplicationInput): ApplicationInput {
  const details: ApplicationInput["details"] = {};
  for (const [key, value] of Object.entries(input.details)) details[key as ApplicationFieldKey] = sanitiseText(value ?? "");
  return {
    ...input,
    roleId: sanitiseText(input.roleId),
    roleTitle: sanitiseText(input.roleTitle),
    firstName: sanitiseText(input.firstName),
    lastName: sanitiseText(input.lastName),
    email: sanitiseText(input.email).toLowerCase(),
    phone: sanitiseText(input.phone),
    location: sanitiseText(input.location),
    linkedIn: sanitiseText(input.linkedIn),
    coverNote: sanitiseText(input.coverNote),
    details,
  };
}

function detailError(key: ApplicationFieldKey, value: string): string | undefined {
  const field = applicationFields[key];
  const base = field.label.replace(/ \(.*\)$/, "");
  const label = /^[A-Z][a-z]/.test(base) ? base[0].toLowerCase() + base.slice(1) : base; // keeps CTC and ITIL in capitals
  if (!value) return field.kind === "select" ? `Choose your ${label}.` : `Enter your ${label}.`;
  if (field.kind === "text") return value.length > field.maxLength ? `Keep this to ${field.maxLength} characters or fewer.` : undefined;
  if (field.kind === "select") return (field.options as readonly string[]).includes(value) ? undefined : `Choose your ${label}.`;
  const n = Number(value);
  if (!Number.isFinite(n) || n < field.min || n > field.max) return `Enter a number between ${field.min} and ${field.max}.`;
  if (field.integer && !Number.isInteger(n)) return "Enter a whole number.";
}

export function cvError(cv: CvFile | null): string | undefined {
  if (!cv) return "Attach your CV.";
  const ext = cv.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(cvRules.extensions as readonly string[]).includes(ext)) return "Attach your CV as a PDF or Word document.";
  if (cv.size === 0) return "The file you chose is empty.";
  if (cv.size > cvRules.maxBytes) return "Your CV must be 5 MB or smaller.";
}

export function validateApplication(raw: ApplicationInput, asked: readonly ApplicationFieldKey[]): ApplicationErrors {
  const input = sanitiseApplication(raw);
  const errors: ApplicationErrors = {};
  const set = (key: string, message: string | undefined) => {
    if (message) errors[key] = message;
  };

  if (!input.roleId || !input.roleTitle) errors.roleId = "This application is missing its role. Reload the page and try again.";
  set("firstName", nameError(input.firstName, "first name"));
  set("lastName", nameError(input.lastName, "last name"));
  set("email", emailError(input.email));
  if (!input.phone) errors.phone = "Enter your phone number.";
  else if (!PHONE_PATTERN.test(input.phone) || input.phone.replace(/\D/g, "").length < 7)
    errors.phone = "Enter a phone number with its country code, for example +91 98765 43210.";
  if (!input.location) errors.location = "Enter your current location.";
  else if (input.location.length > applicationLimits.location) errors.location = `Keep this to ${applicationLimits.location} characters or fewer.`;
  if (input.linkedIn && (input.linkedIn.length > applicationLimits.linkedIn || !HTTPS_URL.test(input.linkedIn)))
    errors.linkedIn = "Enter the full profile address, starting with https://";
  for (const key of asked) set(key, detailError(key, input.details[key] ?? ""));
  set("cv", cvError(input.cv));
  if (input.coverNote.length > applicationLimits.coverNote) errors.coverNote = `Keep this to ${applicationLimits.coverNote} characters or fewer.`;

  return errors;
}

/**
 * Sends the application and CV as multipart form data. The API re-validates every field, checks the file's real
 * type and scans it for malware. Only the role's own detail fields are sent; `website` is the hidden honeypot.
 */
export async function submitApplication(
  raw: ApplicationInput,
  cv: File,
  asked: readonly ApplicationFieldKey[],
  extra: { captchaToken: string; website: string },
): Promise<SubmitResult> {
  const input = sanitiseApplication(raw);
  const form = new FormData();
  const basic = ["roleId", "roleTitle", "firstName", "lastName", "email", "phone", "location", "linkedIn", "coverNote"] as const;
  for (const key of basic) form.append(key, input[key]);
  for (const key of asked) form.append(key, input.details[key] ?? "");
  form.append("captchaToken", extra.captchaToken);
  form.append("website", extra.website);
  form.append("cv", cv, cv.name);
  // No Content-Type header: the browser sets multipart/form-data with its boundary.
  return postToApi("/api/v1/applications", form);
}
