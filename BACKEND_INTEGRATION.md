# Backend Integration Audit

Alula Pay has **no backend today** — every balance, transaction, voucher, and
identity check is mocked and stored only in the browser's `localStorage`
(`src/lib/app-state.tsx`, key `alula-pay-state-v2`). This document is a
page-by-page audit of every feature that needs a real backend/third-party API
before this app can move real money, plus what's already been done in the
codebase to make wiring one in a drop-in change rather than a rewrite.

## What's already in place

`src/lib/api/` is the seam between the UI and a real backend. Every
mocked "network call" in the app goes through one of these modules, each
returning `Promise<ApiResult<T>>` (`{ ok: true, data }` or
`{ ok: false, error }` — see `src/lib/api/types.ts`). A real integration
means replacing the body of each function with a real request; **no call
site needs to change**, since every caller already awaits the result and
branches on `.ok`.

| Module | Stands in for | Used by |
|---|---|---|
| `src/lib/api/payments.ts` (`sendPayout`) | **Ozow** (or equivalent SA payment gateway/PSP) for outbound EFT/Instant EFT payouts | send-once-off, pay-bills/$id, pay-beneficiary/$id |
| `src/lib/api/identity.ts` (`verifySelfieWithDHA`) | A DHA-integrated KYC vendor for biometric liveness + face-match verification | verify (Pro upgrade), setup-pin, reset-pin, subscribe (biometric step) |
| `src/lib/api/vouchers.ts` (`redeemVoucher`) | Each voucher brand's own redeem/validate API (Blu Voucher, 1Voucher, OTT Voucher) | add-voucher, subscribe (voucher payment) |

`src/lib/api/mockBackend.ts` is the one place that fakes latency (`BUFFER_MS`,
currently a flat 4s — see `src/lib/buffer.ts`) and a realistic chance of
failure (10% by default). Every buffered action in the app shows
`BufferScreen` while awaiting the result and `StatusScreen`
(`variant="success"` or `variant="error"`) once it resolves — that UI
doesn't change when the mock is replaced with a real call, since it's
already driven by the same `ApiResult`.

**Not yet covered by the api layer** (called out per-page below): account
creation/auth, phone OTP verification, wallet balance/ledger persistence,
statement generation and delivery, push notifications, and the support
chat bot's knowledge base.

---

## Page-by-page

### Onboarding & account (`onboarding.tsx`, `signup.tsx`, `login.tsx`)
- **Google / Apple sign-in** (`onboarding.tsx`) — UI only, no real OAuth.
  Needs: a real OAuth flow (Google Identity Services, Sign in with Apple)
  and a backend session/token exchange.
- **Account creation** (`signup.tsx`) — writes directly to local app
  state (`signUp()`). Needs: a user-creation API (phone, name, source of
  income, T&Cs acceptance timestamp), and — notably — **no phone number
  verification exists today** (no OTP is sent or checked). A real signup
  needs an SMS OTP step (e.g. via an SA SMS gateway) before the account is
  considered verified.
- **Sign in** (`login.tsx`) — checks the PIN against local state only.
  Needs: a real auth API (PIN/password hashed server-side, rate-limited,
  returning a session token).

### PIN & identity (`setup-pin.tsx`, `reset-pin.tsx`, `verify.tsx`)
- **Set/change approval PIN** — already routed through
  `identity.verifySelfieWithDHA()` for the required selfie step when
  changing an existing PIN. The PIN itself (`setApprovalPin`) is stored
  locally; needs a backend PIN-storage/verification endpoint (hashed,
  never stored or transmitted in plain text) plus the lockout counter
  (`pinAttemptsLeft`) enforced server-side, not just client-side.
- **Reset a locked PIN** (`reset-pin.tsx`) — same DHA selfie call, then
  signs the user out locally. Needs a backend endpoint to actually clear
  the lock and issue a fresh session after verification succeeds.
- **Pro upgrade selfie** (`verify.tsx`) — same DHA call; on success charges
  `MONTHLY_FEE.pro` from the local balance. Needs the DHA verification
  result to come from a real KYC vendor, and the charge to go through the
  payments API (see Subscribe below) rather than a local balance mutation.

### Money movement (`send-once-off.tsx`, `pay-bills.$id.tsx`, `pay-beneficiary.$id.tsx`)
All three already call `payments.sendPayout()` (the Ozow seam) before
recording anything, and only write the transaction locally on success.
Still needed for real money:
- **Bank account validation** before submission — right now any digit
  string of the right length is accepted (see `accountLength` per bank in
  `src/lib/banks.ts`). A real integration should validate via the
  gateway's account-verification service (e.g. Ozow's account
  verification, or a AVS/EFT-account-validation product) before offering
  to send.
- **Rail selection** (EFT vs RTC/Instant) is hardcoded by plan
  (`plan === "pro" ? "RTC" : "EFT"`) rather than actually asking the
  gateway which rails are available for the destination bank.
- **Settlement status** — `status: fee?.rail === "RTC" ? "Completed" :
  "Pending"` is guessed client-side. A real integration needs a webhook
  (or polling) from Ozow to update the transaction's real status
  (`Completed`/`Failed`/`Pending`) after it settles, not just on
  submission.
- **The 5% fee and R20 minimum** (`calcTransferFee`, `MIN_SEND` in
  `src/lib/app-state.tsx`) are computed client-side. These should be
  confirmed/re-computed server-side before authorizing a payout so a
  tampered client can't alter them.

### Vouchers (`add-voucher.tsx`)
Routed through `vouchers.redeemVoucher()`. Still needed: a real adapter
per brand behind that same function — Blu Voucher, 1Voucher and OTT
Voucher each have their own redemption API and their own failure modes
(already used, expired, never issued); the mock currently treats all
three identically. The **held-balance** logic (amounts under `MIN_SEND`
held until topped up, `heldBalance`/`topUpHeldBalance` in app-state) is
pure client logic today and needs to live server-side so a balance can't
be forged by editing `localStorage`.

### Pay Bills (`pay-bills.index.tsx`, `pay-bills.$id.tsx`)
The supplier directory (`src/lib/billers.ts`) is a hardcoded list of ~200
billers with fake bank details. Needs: a real biller directory API (or a
biller-payment aggregator that already maintains one), and the same
`payments.sendPayout()` seam already wired in `pay-bills.$id.tsx`.

### Subscriptions (`subscribe.tsx`)
Plan payment goes through `vouchers.redeemVoucher()`; the Pro biometric
step goes through `identity.verifySelfieWithDHA()`. Still needed: the
billing-period logic (`getBillingPeriod`, `lastPaidPeriod`,
`subscriptionActive` in app-state) is entirely client-computed from the
device clock — a real subscription needs a server-side billing period
and a way to auto-charge (debit order, recurring EFT, or a stored
payment method with the gateway) rather than requiring a fresh voucher
every month.

### Home, Alerts, History (`home.tsx`, `notifications.tsx`, `message.$id.tsx`, `history.tsx`)
- **Balance & transaction feed** — entirely local (`balance`,
  `transactions` in app-state). Needs: a real wallet/ledger backend that
  is the source of truth, with the client reading from it rather than
  mutating a local copy.
- **Alerts/notifications** (`notifications.tsx`, `message.$id.tsx`) — the
  message list (`src/lib/messages.ts`) is static/derived from local
  transactions. Needs: a real push-notification backend (APNs/FCM) plus
  a notifications API, since none of this currently reaches a user whose
  app isn't open.
- **Statement download/email/WhatsApp** (`history.tsx`) — the "Statement
  ready" confirmation fires immediately with no PDF actually generated or
  sent. Needs: a PDF-generation service, an email provider (e.g.
  SendGrid/SES), and a WhatsApp Business API integration (e.g. via Twilio
  or Meta directly) to actually deliver anything.

### Beneficiaries (`beneficiaries.tsx`)
Saved beneficiaries live only in local app state (`addBeneficiary`).
Needs: a backend CRUD API so beneficiaries persist across devices/
reinstalls, plus the same account-validation concern as the money-movement
pages above.

### Profile (`profile.tsx`)
Reads/writes local state directly (name, theme, chat-bubble preference).
Needs: a user-profile API for anything to survive a reinstall or work
across devices; today all of it — including the approval PIN itself —
disappears if `localStorage` is cleared.

### Support chat (`support.tsx`, `src/lib/support-bot.ts`)
Fully rule-based (keyword matching against a fixed topic list); "Chat
with Alula" never leaves the device. This one is arguably fine to keep
client-side/rule-based per the original spec ("no human customer service
needed"), but if it's ever meant to escalate to a real agent or use an
LLM, it needs a real backend endpoint — currently there is none.

### Side Hustle tools (`hustle.*`)
Entirely local (goals, logged entries, the savings challenge). This is a
personal tracking tool with no inherent need for a backend unless the
product wants cross-device sync — in which case it needs the same
generic user-data API as Profile/Beneficiaries above.

### Help (`help.tsx`)
Static FAQ content, no backend needed.

---

## Suggested build order

1. **Auth + accounts** — real signup/login/session backend, since almost
   everything else depends on a real logged-in user.
2. **Identity (DHA)** — replace `identity.verifySelfieWithDHA()`'s mock
   body with a real KYC vendor call. Unblocks Pro upgrade and PIN
   reset/change for real.
3. **Payments (Ozow)** — replace `payments.sendPayout()`'s mock body.
   Needs a webhook endpoint for settlement status, not just the
   synchronous response.
4. **Vouchers** — replace `vouchers.redeemVoucher()` with real per-brand
   adapters. Needed before the wallet balance can be trusted at all.
5. **Wallet/ledger backend** — move `balance`/`transactions` off the
   client entirely; everything above should write through this, not to
   `localStorage`.
6. Notifications, statements, and cross-device sync (Beneficiaries,
   Profile, Hustle) can follow once the above four are real.
