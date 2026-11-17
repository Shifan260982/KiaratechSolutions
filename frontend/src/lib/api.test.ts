import assert from "node:assert/strict";
import { test } from "node:test";

process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
const { postToApi } = await import("./api.ts");

function reply(status: number, body?: unknown): typeof fetch {
  return async () => new Response(body === undefined ? null : JSON.stringify(body), { status });
}

test("202 means sent", async () => {
  globalThis.fetch = reply(202);
  assert.deepEqual(await postToApi("/x", "{}"), { status: "sent" });
});

test("400 with field errors maps to invalid, keeping only text messages", async () => {
  globalThis.fetch = reply(400, { title: "Check", errors: { email: "Enter an email.", captchaToken: "Again.", odd: 5 } });
  assert.deepEqual(await postToApi("/x", "{}"), { status: "invalid", errors: { email: "Enter an email.", captchaToken: "Again." } });
});

test("rate limit and outages show the API's own message", async () => {
  globalThis.fetch = reply(429, { title: "Too many attempts." });
  assert.deepEqual(await postToApi("/x", "{}"), { status: "error", message: "Too many attempts." });
  globalThis.fetch = reply(503, { title: "Try again later." });
  assert.deepEqual(await postToApi("/x", "{}"), { status: "error", message: "Try again later." });
});

test("unexpected replies and network failures never throw", async () => {
  globalThis.fetch = reply(500);
  assert.equal((await postToApi("/x", "{}")).status, "error");
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  const result = await postToApi("/x", "{}");
  assert.equal(result.status, "error");
  assert.match(result.status === "error" ? result.message : "", /could not reach/);
});

test("sends without cookies to the configured API", async () => {
  let seen: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = async (url, init) => {
    seen = { url: String(url), init };
    return new Response(null, { status: 202 });
  };
  await postToApi("/api/v1/enquiries", "{}");
  assert.equal(seen?.url, "https://api.example.com/api/v1/enquiries");
  assert.equal(seen?.init?.credentials, "omit");
});
