import { mockCall } from "./mockBackend";
import type { ApiResult } from "./types";

// Outbound money movement — every "Send", "Pay", and subscription-payment
// screen in the app funnels through here. In production this is Ozow (or
// an equivalent South African payment gateway/PSP): create a payout
// request, get back a provider reference, then the gateway settles it via
// EFT (1-2 working days) or Instant EFT / RTC (minutes) depending on rail.
// A real integration would also need a webhook endpoint to receive the
// final settlement status rather than trusting the client-side response.
export type PayoutRequest = {
  amountRand: number;
  bankName: string;
  branchCode: string;
  accountNumber: string;
  recipientName: string;
  reference: string;
  rail: "EFT" | "RTC";
};

export type PayoutResult = { providerRef: string };

export async function sendPayout(_req: PayoutRequest): Promise<ApiResult<PayoutResult>> {
  return mockCall(
    () => ({ providerRef: `OZOW-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }),
    { code: "PAYOUT_FAILED", message: "The payment gateway couldn't process this payout." },
  );
}
