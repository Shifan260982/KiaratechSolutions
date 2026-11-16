// Client-side validation for UX only. The Phase 2 backend must re-validate every field;
// never trust these checks as a security boundary.

export type EnquiryInput = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  topic: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

export const limits = { name: 60, email: 254, company: 120, topic: 120, message: 2000 } as const;
const MIN_MESSAGE = 20;

// Strips control characters (keeps tab/newline) and trims surrounding whitespace.
export const sanitiseText = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

// Pragmatic check: one @, no spaces, a dot in the domain. Deliverability is confirmed server-side.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared email rule, also used by the job application form. Returns an error message or undefined. */
export function emailError(email: string): string | undefined {
  if (!email) return "Enter your email address.";
  if (email.length > limits.email || !EMAIL_PATTERN.test(email)) return "Enter an email address in the format name@company.com.";
}

/** Shared name rule. Returns an error message or undefined. */
export function nameError(value: string, label: "first name" | "last name"): string | undefined {
  if (!value) return `Enter your ${label}.`;
  if (value.length > limits.name) return `Your ${label} must be ${limits.name} characters or fewer.`;
}

export function sanitiseEnquiry(input: EnquiryInput): EnquiryInput {
  return {
    firstName: sanitiseText(input.firstName),
    lastName: sanitiseText(input.lastName),
    email: sanitiseText(input.email).toLowerCase(),
    company: sanitiseText(input.company),
    topic: sanitiseText(input.topic),
    message: sanitiseText(input.message),
  };
}

export function validateEnquiry(raw: EnquiryInput): EnquiryErrors {
  const input = sanitiseEnquiry(raw);
  const errors: EnquiryErrors = {};

  const first = nameError(input.firstName, "first name");
  if (first) errors.firstName = first;
  const last = nameError(input.lastName, "last name");
  if (last) errors.lastName = last;

  const email = emailError(input.email);
  if (email) errors.email = email;

  if (!input.company) errors.company = "Enter your company or organisation.";
  else if (input.company.length > limits.company) errors.company = `Company must be ${limits.company} characters or fewer.`;

  if (!input.topic) errors.topic = "Enter a topic, for example: AI automation for invoice processing.";
  else if (input.topic.length > limits.topic) errors.topic = `Topic must be ${limits.topic} characters or fewer.`;

  if (input.message.length < MIN_MESSAGE)
    errors.message = `Describe the outcome you are looking for in at least ${MIN_MESSAGE} characters.`;
  else if (input.message.length > limits.message) errors.message = `Message must be ${limits.message} characters or fewer.`;

  return errors;
}
