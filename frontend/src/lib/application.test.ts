import assert from "node:assert/strict";
import { test } from "node:test";
import { validateApplication, type ApplicationFieldKey, type ApplicationInput } from "./application.ts";

const ask: ApplicationFieldKey[] = ["totalExperience", "currentCtc", "expectedCtc", "noticePeriod", "teamSize", "itilCertification"];

const valid: ApplicationInput = {
  roleId: "support-manager",
  roleTitle: "Senior Support Manager",
  firstName: "Priya",
  lastName: "Shah",
  email: "priya@example.com",
  phone: "+91 98765 43210",
  location: "Pune",
  linkedIn: "",
  coverNote: "",
  details: { totalExperience: "15.5", currentCtc: "30 LPA", expectedCtc: "36 LPA", noticePeriod: "60", teamSize: "12", itilCertification: "ITIL 4" },
  cv: { name: "Priya Shah CV.PDF", size: 200_000 },
};

test("accepts a complete application", () => {
  assert.deepEqual(validateApplication(valid, ask), {});
});

test("requires every role-specific detail the advert asks for", () => {
  const errors = validateApplication({ ...valid, details: {} }, ask);
  assert.deepEqual(Object.keys(errors).sort(), [...ask].sort());
});

test("ignores details the role does not ask for", () => {
  assert.deepEqual(validateApplication({ ...valid, details: {} }, []), {});
});

test("checks number ranges and whole numbers", () => {
  assert.ok(validateApplication({ ...valid, details: { ...valid.details, noticePeriod: "30.5" } }, ask).noticePeriod);
  assert.ok(validateApplication({ ...valid, details: { ...valid.details, totalExperience: "-1" } }, ask).totalExperience);
  assert.ok(validateApplication({ ...valid, details: { ...valid.details, teamSize: "abc" } }, ask).teamSize);
});

test("rejects unknown select options", () => {
  assert.ok(validateApplication({ ...valid, details: { ...valid.details, itilCertification: "<b>x</b>" } }, ask).itilCertification);
});

test("validates the CV type and size", () => {
  assert.ok(validateApplication({ ...valid, cv: null }, ask).cv);
  assert.ok(validateApplication({ ...valid, cv: { name: "cv.exe", size: 100 } }, ask).cv);
  assert.ok(validateApplication({ ...valid, cv: { name: "cv.pdf", size: 6 * 1024 * 1024 } }, ask).cv);
  assert.ok(validateApplication({ ...valid, cv: { name: "cv.docx", size: 0 } }, ask).cv);
});

test("validates phone and LinkedIn formats", () => {
  assert.ok(validateApplication({ ...valid, phone: "12ab" }, ask).phone);
  assert.ok(validateApplication({ ...valid, linkedIn: "javascript:alert(1)" }, ask).linkedIn);
  assert.equal(validateApplication({ ...valid, linkedIn: "https://www.linkedin.com/in/example" }, ask).linkedIn, undefined);
});

test("counts cover note line breaks the way the server receives them", () => {
  const atLimit = "a".repeat(995) + "\n".repeat(5) + "a".repeat(995); // 1995 typed characters, 2000 as sent
  assert.equal(validateApplication({ ...valid, coverNote: atLimit }, ask).coverNote, undefined);
  assert.ok(validateApplication({ ...valid, coverNote: atLimit + "\nb" }, ask).coverNote);
});

test("keeps the role it was opened for", () => {
  assert.ok(validateApplication({ ...valid, roleId: "" }, ask).roleId);
});
