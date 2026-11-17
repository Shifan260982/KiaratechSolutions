import { postToApi, type SubmitResult } from "./api.ts";
import { sanitiseEnquiry, type EnquiryInput } from "./validation.ts";

export type { SubmitResult } from "./api.ts";

/** Sends the enquiry to the API, which re-validates every field. `website` is the hidden honeypot. */
export async function submitEnquiry(input: EnquiryInput, extra: { captchaToken: string; website: string }): Promise<SubmitResult> {
  return postToApi("/api/v1/enquiries", JSON.stringify({ ...sanitiseEnquiry(input), ...extra }), { "Content-Type": "application/json" });
}
