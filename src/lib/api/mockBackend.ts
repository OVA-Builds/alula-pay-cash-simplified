import { BUFFER_MS, simulateOutcome } from "@/lib/buffer";
import type { ApiError, ApiResult } from "./types";

// Every function in src/lib/api/* is a stand-in for a real network call —
// this is the ONE place that fakes the round-trip (latency + a realistic
// chance of failure). Replace the body with a real fetch()/SDK call per
// provider when that backend exists; every call site already awaits a
// Promise<ApiResult<T>>, so nothing outside this file needs to change.
export async function mockCall<T>(
  makeSuccess: () => T,
  onFailure: ApiError,
  failureRate = 0.1,
): Promise<ApiResult<T>> {
  await new Promise((resolve) => setTimeout(resolve, BUFFER_MS));
  if (simulateOutcome(failureRate) === "error") return { ok: false, error: onFailure };
  return { ok: true, data: makeSuccess() };
}
