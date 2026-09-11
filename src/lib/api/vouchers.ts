import { mockCall } from "./mockBackend";
import type { ApiResult } from "./types";

// Every voucher load — topping up the wallet, or loading toward a Pro/
// Basic subscription — checks the pin with the brand's own redemption
// API before crediting anything. Each brand (Blu Voucher, 1Voucher, OTT
// Voucher) publishes its own validate/redeem endpoint; a real integration
// needs one adapter per brand behind this same signature, since a pin
// that's already been redeemed, expired, or never existed must fail here
// rather than crediting the wallet on a corrupt/reused voucher.
export type VoucherBrandId = "blu" | "1voucher" | "ott";

export type VoucherRedeemResult = { amountRand: number };

export async function redeemVoucher(
  _brand: VoucherBrandId,
  _pin: string,
  faceValueRand: number,
): Promise<ApiResult<VoucherRedeemResult>> {
  return mockCall(
    () => ({ amountRand: faceValueRand }),
    { code: "VOUCHER_INVALID", message: "This voucher couldn't be validated — it may already be used or incorrect." },
  );
}
