// Every transaction and selfie-verification flow runs through a buffer
// (BufferScreen) before landing on success or failure. There's no real
// backend yet, so the buffer is a fixed delay — once a real API/transaction
// exists behind these flows, this should resolve when that network call
// actually settles instead of after a fixed timer.
export const BUFFER_MS = 4000;

// A small, realistic chance of failure so the error state isn't purely
// theoretical in this demo — every buffered action rolls this once after
// the buffer completes.
export function simulateOutcome(failureRate = 0.1): "success" | "error" {
  return Math.random() < failureRate ? "error" : "success";
}
