// Run with `npm test` (Node's built-in test runner with native TypeScript type stripping).
import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitiseText, validateEnquiry, type EnquiryInput } from "./validation.ts";

const valid: EnquiryInput = {
  name: "Alex Morgan",
  email: "alex@example.com",
  company: "Example Ltd",
  type: "discovery",
  message: "We want to automate invoice processing across three sites.",
  consent: true,
};

test("accepts a complete enquiry", () => {
  assert.deepEqual(validateEnquiry(valid), {});
});

test("reports every missing field", () => {
  const errors = validateEnquiry({ name: "", email: "", company: "", type: "", message: "", consent: false });
  assert.deepEqual(Object.keys(errors).sort(), ["company", "consent", "email", "message", "name", "type"]);
});

test("rejects malformed emails", () => {
  for (const email of ["alex", "alex@", "alex@example", "a b@example.com", "alex@@example.com"]) {
    assert.ok(validateEnquiry({ ...valid, email }).email, email);
  }
});

test("rejects unknown enquiry types", () => {
  assert.ok(validateEnquiry({ ...valid, type: "<script>" }).type);
});

test("treats whitespace-only fields as empty", () => {
  const errors = validateEnquiry({ ...valid, name: "   ", message: " \n\t " });
  assert.ok(errors.name);
  assert.ok(errors.message);
});

test("enforces maximum lengths", () => {
  assert.ok(validateEnquiry({ ...valid, message: "x".repeat(2001) }).message);
  assert.ok(validateEnquiry({ ...valid, company: "x".repeat(121) }).company);
});

test("strips control characters but keeps line breaks", () => {
  assert.equal(sanitiseText("  hello\u0000\u0007 world\nnext  "), "hello world\nnext");
});
