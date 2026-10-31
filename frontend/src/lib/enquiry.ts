import type { EnquiryInput } from "./validation";

export type SubmitResult = { status: "sent" } | { status: "not-connected" } | { status: "error"; message: string };

// Phase 1: no submission destination is approved (requirements 8.6 is TBD), so nothing is sent.
// Phase 2: replace the body with a POST of `sanitiseEnquiry(input)` to the backend API, which must re-validate it.
export async function submitEnquiry(input: EnquiryInput): Promise<SubmitResult> {
  void input;
  return { status: "not-connected" };
}
