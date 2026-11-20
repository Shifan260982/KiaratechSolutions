// Phase 2 backend connection. Both values are public and inlined at build time.
// Until both are set, forms show the "not connected" message instead of sending anything.

const env = (value: string | undefined) => value?.trim() || undefined;
// https only, except a local API during development. Trailing slashes are dropped, so "https://api.example.com/" works too.
export const apiOrigin = (value: string | undefined) => {
  const origin = value?.replace(/\/+$/, "");
  return origin && /^(https:\/\/[^\s/"'<>]+|http:\/\/localhost(:\d+)?)$/i.test(origin) ? origin : undefined;
};

export const api = {
  url: apiOrigin(env(process.env.NEXT_PUBLIC_API_URL)),
  turnstileSiteKey: env(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
};

export const apiConnected = Boolean(api.url && api.turnstileSiteKey);

export type SubmitResult =
  | { status: "sent" }
  | { status: "not-connected" }
  | { status: "error"; message: string }
  /** The server rejected fields; keys match the form's field names (plus `captchaToken`). */
  | { status: "invalid"; errors: Record<string, string> };

const UNREACHABLE = "We could not reach our server. Check your connection and try again.";
const UNEXPECTED = "Something went wrong. Please try again.";

/** POSTs to the API and turns every outcome into a SubmitResult. Never throws. */
export async function postToApi(path: string, body: BodyInit, headers?: HeadersInit): Promise<SubmitResult> {
  if (!apiConnected) return { status: "not-connected" };
  let response: Response;
  try {
    response = await fetch(`${api.url}${path}`, { method: "POST", body, headers, credentials: "omit", mode: "cors" });
  } catch {
    return { status: "error", message: UNREACHABLE };
  }
  if (response.status === 202) return { status: "sent" };

  const data: unknown = await response.json().catch(() => null);
  const title = typeof data === "object" && data && "title" in data && typeof data.title === "string" ? data.title : undefined;
  const errors = typeof data === "object" && data && "errors" in data ? textEntries(data.errors) : {};
  if (response.status === 400 && Object.keys(errors).length > 0) return { status: "invalid", errors };
  // 413, 429 and 503 carry a visitor-friendly title from the API.
  return { status: "error", message: title ?? UNEXPECTED };
}

function textEntries(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}
