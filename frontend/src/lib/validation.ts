// Client-side validation for UX only. The Phase 2 backend must re-validate every field;
// never trust these checks as a security boundary.

export const enquiryTypes = [
  { value: "discovery", label: "AI & software discovery call" },
  { value: "proposal", label: "Proposal request" },
  { value: "talent", label: "Specialist talent" },
  { value: "general", label: "General enquiry" },
] as const;

export type EnquiryType = (typeof enquiryTypes)[number]["value"];

export type EnquiryInput = {
  name: string;
  email: string;
  company: string;
  type: string;
  message: string;
  consent: boolean;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

export const limits = { name: 100, email: 254, company: 120, message: 2000 } as const;
const MIN_MESSAGE = 20;

// Strips control characters (keeps tab/newline) and trims surrounding whitespace.
export const sanitiseText = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

// Pragmatic check: one @, no spaces, a dot in the domain. Deliverability is confirmed server-side.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEnquiryType = (value: string): value is EnquiryType => enquiryTypes.some((t) => t.value === value);

export function sanitiseEnquiry(input: EnquiryInput): EnquiryInput {
  return {
    name: sanitiseText(input.name),
    email: sanitiseText(input.email).toLowerCase(),
    company: sanitiseText(input.company),
    type: sanitiseText(input.type),
    message: sanitiseText(input.message),
    consent: input.consent === true,
  };
}

export function validateEnquiry(raw: EnquiryInput): EnquiryErrors {
  const input = sanitiseEnquiry(raw);
  const errors: EnquiryErrors = {};

  if (input.name.length < 2) errors.name = "Enter your full name.";
  else if (input.name.length > limits.name) errors.name = `Name must be ${limits.name} characters or fewer.`;

  if (!input.email) errors.email = "Enter your work email address.";
  else if (input.email.length > limits.email || !EMAIL_PATTERN.test(input.email))
    errors.email = "Enter an email address in the format name@company.com.";

  if (!input.company) errors.company = "Enter your company or organisation.";
  else if (input.company.length > limits.company) errors.company = `Company must be ${limits.company} characters or fewer.`;

  if (!isEnquiryType(input.type)) errors.type = "Choose what you would like to discuss.";

  if (input.message.length < MIN_MESSAGE)
    errors.message = `Describe your goal or challenge in at least ${MIN_MESSAGE} characters.`;
  else if (input.message.length > limits.message) errors.message = `Message must be ${limits.message} characters or fewer.`;

  if (!input.consent) errors.consent = "Confirm you agree to us using these details to respond.";

  return errors;
}
