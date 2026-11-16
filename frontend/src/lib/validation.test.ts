// Run with `npm test` (Node's built-in test runner with native TypeScript type stripping).
import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitiseText, validateEnquiry, type EnquiryInput } from "./validation.ts";

const valid: EnquiryInput = {
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex@example.com",
  company: "Example Ltd",
  topic: "Invoice automation",
  message: "We want to automate invoice processing across three sites.",
};

test("accepts a complete enquiry", () => {
  assert.deepEqual(validateEnquiry(valid), {});
});

test("reports every missing field", () => {
  const errors = validateEnquiry({ firstName: "", lastName: "", email: "", company: "", topic: "", message: "" });
  assert.deepEqual(Object.keys(errors).sort(), ["company", "email", "firstName", "lastName", "message", "topic"]);
});

test("rejects malformed emails", () => {
  for (const email of ["alex", "alex@", "alex@example", "a b@example.com", "alex@@example.com"]) {
    assert.ok(validateEnquiry({ ...valid, email }).email, email);
  }
});

test("treats whitespace-only fields as empty", () => {
  const errors = validateEnquiry({ ...valid, firstName: "   ", message: " \n\t " });
  assert.ok(errors.firstName);
  assert.ok(errors.message);
});

test("enforces maximum lengths", () => {
  assert.ok(validateEnquiry({ ...valid, message: "x".repeat(2001) }).message);
  assert.ok(validateEnquiry({ ...valid, company: "x".repeat(121) }).company);
  assert.ok(validateEnquiry({ ...valid, topic: "x".repeat(121) }).topic);
});

test("strips control characters but keeps line breaks", () => {
  assert.equal(sanitiseText("  hello\u0000\u0007 world\nnext  "), "hello world\nnext");
});
