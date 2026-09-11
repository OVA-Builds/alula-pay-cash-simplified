import { mockCall } from "./mockBackend";
import type { ApiResult } from "./types";

// Every selfie check in the app — Pro upgrade, and re-verifying to change
// or reset the approval PIN — is a liveness + face-match check against a
// government-held photo. In production this goes through an accredited
// KYC vendor that calls DHA's biometric/NPR verification service (DHA
// itself isn't called directly by a client app) to confirm the selfie
// matches the ID number on file. The selfie image itself never needs to
// leave the device except for this one call.
export type SelfieVerifyResult = { verified: true; matchScore: number };

export async function verifySelfieWithDHA(): Promise<ApiResult<SelfieVerifyResult>> {
  return mockCall(
    () => ({ verified: true, matchScore: 0.97 }),
    { code: "DHA_VERIFY_FAILED", message: "We couldn't verify your identity with the Department of Home Affairs." },
  );
}
