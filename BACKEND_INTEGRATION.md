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
| `src/lib/api/vouchers.ts` (`redeemVoucher`) | Each voucher brand's own redeem/validate API (Blu Voucher, 1Voucher, OTT Voucher) | send-once-off, pay-bills, pay-beneficiary, subscribe (voucher payment) |

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

### Vouchers (redeemed inline in `send-once-off.tsx`, `pay-bills.$id.tsx`,
`pay-beneficiary.$id.tsx`, `subscribe.tsx`)
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

## Before any of this: the regulatory gate

Worth saying plainly, because it's the part that's easy to underestimate
and the actual bottleneck for most SA fintech builds — none of steps 1-6
below are just an engineering task:

- Moving other people's money (even via vouchers) generally requires
  either your own **National Payment System (NPS)** participation or,
  far more commonly for a startup, operating **under a sponsoring bank
  or licensed payment institution** that takes on the compliance
  relationship. You don't get to just call Ozow's API and go live.
- **FICA** (Financial Intelligence Centre Act) requires a documented
  KYC/CDD program, an appointed Compliance Officer, and transaction
  monitoring/reporting for suspicious activity — this is an operational
  program, not a checkbox in code.
- **POPIA** governs everything you store about a user (ID numbers,
  biometric data, transaction history) — you need a data protection
  policy, breach process, and (per §57) may need to register certain
  processing with the Information Regulator before you start.
- The DHA biometric check specifically is never called directly — you
  contract with an **accredited KYC/RegTech vendor** who already holds
  that integration (see Step 2), and their onboarding will itself ask
  for proof of your FICA program before they'll sell you access.

None of this blocks writing the code below in parallel, but "go live with
real money" is gated on the legal/compliance track running alongside it,
not after it.

---

## Step-by-step build plan

Each section assumes the previous ones are done — they build on each
other in this order because almost everything needs a real logged-in
user first.

### 1. Auth + accounts

1. **Pick a stack.** Any typical setup works — e.g. Node/Express or
   NestJS + Postgres, or a BaaS like Supabase if you want to move fast.
   The only hard requirement: PINs and sessions must never be handled
   client-side only, which is the current state.
2. **Schema.** A `users` table: `id`, `phone` (unique), `first_name`,
   `last_name`, `email` (nullable), `source_of_income`,
   `terms_accepted_at`, `pin_hash`, `pin_attempts`, `pin_locked_at`,
   `plan`, `dha_verified_at`, `created_at`. Create it in a `pending`
   state on signup — not "active" until OTP passes.
3. **Phone OTP** (doesn't exist anywhere in the app today):
   - `POST /auth/otp/send` — generate a 6-digit code, store it hashed
     with a 5-minute expiry in an `otp_codes` table keyed by phone, send
     via an SMS gateway (Clickatell, BulkSMS, Infobip, and Twilio's SA
     numbers are the usual choices). Rate-limit sends (e.g. 3 per 10
     minutes per number) — SMS costs money and this is the classic abuse
     vector.
   - `POST /auth/otp/verify` — compare the hash, check expiry, mark the
     phone verified, issue a short-lived signup token so the client can
     continue to PIN setup without re-entering the phone number.
4. **Set PIN / finish signup.** `POST /auth/pin` — hash the PIN
   server-side with argon2 or bcrypt (never store or log it plain),
   attach it to the user row, flip the account to `active`, issue a
   session.
5. **Sessions.** For a wallet app, prefer **opaque server-side sessions**
   (a random token stored in Redis/DB, mapped to a user id) over long-
   lived JWTs — you can revoke one instantly (e.g. on a suspected
   compromise), which a self-contained JWT can't do without an extra
   denylist anyway.
6. **Login.** `POST /auth/login` — phone + PIN, compare the hash,
   increment `pin_attempts` on failure, lock after 3 (server-side —
   today's `pinAttemptsLeft` in `app-state.tsx` is trivially bypassed by
   editing `localStorage`), issue a session on success.
7. **Auth middleware** on every other endpoint below: validate the
   session, attach `req.user`, reject with 401 otherwise.
8. **Logout / revoke.** `POST /auth/logout` deletes the session
   server-side, not just a client-side `signOut()`.

### 2. Identity verification (DHA)

1. **Choose a KYC vendor** that already holds the DHA integration — you
   don't call Home Affairs directly. Common choices in SA: Thumbzup,
   iiDenifii, ID3 Technologies, Ideco, Smile ID, or LexisNexis Risk.
   Evaluate on: liveness detection quality, turnaround time, and whether
   they support the "selfie + ID number, no document photo" flow this
   app promises Basic users (no ID doc needed to start).
2. **Commercial + compliance onboarding** with the vendor — they'll want
   your FICA program docs before issuing production keys (see the
   regulatory note above). Get sandbox keys first.
3. **Backend endpoint**, never a direct client call:
   `POST /identity/verify-selfie` — receives the selfie (multipart or
   base64) and the user's ID number, forwards to the vendor's API
   server-side with your vendor credentials in a secrets manager (never
   shipped to the client).
4. **Handle the vendor's response**: a match score, a liveness pass/fail,
   and their own reference id. Apply a threshold (e.g. match score
   ≥ 0.9 **and** liveness passed) to decide `verified`.
5. **Persist the outcome**, not the photo: an `identity_checks` table
   (`user_id`, `vendor_ref`, `result`, `score`, `checked_at`) for audit —
   let the vendor's own compliant storage hold the biometric image
   itself; don't duplicate it in your DB unless your data retention
   policy explicitly requires it.
6. **Wire it in**: replace the mock body of
   `verifySelfieWithDHA()` in `src/lib/api/identity.ts` with a call to
   `POST /identity/verify-selfie`, sending the actual captured selfie
   frame (today's UI never captures a real image — that's a client-side
   `<video>`/`getUserMedia` addition that also needs to happen).
7. **Differentiate failure reasons** if useful: no face detected,
   liveness failed (spoof/photo-of-photo), no match, vendor timeout —
   the UI currently shows one generic "Verification failed" message,
   which is fine to keep, but the backend should still log which case it
   was for support/fraud review.

### 3. Payments (Ozow / payouts)

Worth flagging up front: **Ozow's core product is collecting money in**
(Instant EFT checkout). Sending money **out** to an arbitrary third-party
bank account — what "Send to Bank", Pay Bills, and Pay Beneficiary all
do — is a *payout/disbursement* product, which may mean a different
Ozow product tier, or a different provider entirely (Stitch, Peach
Payments' payouts, or a sponsor bank's bulk-payment API). Confirm this
with whichever provider you approach before assuming one integration
covers both directions.

1. **Merchant/payout onboarding** with the provider — business
   registration, banking details, and (per the regulatory note) likely a
   sponsor-bank relationship for payouts specifically.
2. **Backend endpoint**: `POST /payments/payout` — receives amount,
   destination bank/branch/account, reference, and rail (EFT/RTC).
   Re-validates everything server-side (see step 6) before calling the
   provider's payout API with your server-side credentials.
3. **Immediate response** from the provider is usually just "accepted,
   here's a reference" — record the transaction as `status: pending` in
   your ledger (see Step 5) at this point, not `Completed`.
4. **Webhook endpoint**: `POST /webhooks/payments` — the provider calls
   this asynchronously when the payment actually settles or fails.
   Verify the webhook's signature (HMAC, provider-specific) before
   trusting it, then update the transaction's real status and push a
   notification to the user. This replaces today's client-side guess
   (`status: fee?.rail === "RTC" ? "Completed" : "Pending"`).
5. **Idempotency**: webhooks can be retried/duplicated by the provider —
   dedupe on their transaction reference before applying a status update
   twice.
6. **Re-derive, don't trust, the numbers.** The 5% fee (`calcTransferFee`)
   and R20 minimum (`MIN_SEND`) are client-computed today. Recompute both
   server-side from the actual wallet balance and business rules before
   authorizing any payout — a modified client must not be able to alter
   either.
7. **Account validation**: before offering to send, validate the
   destination account via the provider's account-verification service
   (most payout providers offer one) rather than accepting any digit
   string of the right length, as `src/lib/banks.ts`'s `accountLength`
   check does today.
8. **Reconciliation job**: a nightly (or hourly) job comparing your
   ledger against the provider's settlement report, to catch anything a
   missed/failed webhook didn't update.
9. **Wire it in**: replace the mock body of `sendPayout()` in
   `src/lib/api/payments.ts` with a call to `POST /payments/payout`.

### 4. Vouchers

1. **Get redemption-partner status** with each brand (Blu Voucher,
   1Voucher, OTT Voucher) — each requires its own commercial agreement
   and API credentials; there's no single unified "SA vouchers" API.
2. **Backend endpoint**: `POST /vouchers/redeem` — receives `brand` +
   `pin`, dispatches to a brand-specific adapter based on `brand`.
3. **One adapter per brand**, each calling that brand's own redeem API
   server-side (credentials never touch the client). Each brand's API
   marks the pin used atomically on their side and returns its face
   value, or an error for: already redeemed, invalid/malformed, expired,
   or a network timeout to the brand.
4. **Credit the ledger atomically with the redemption** — the wallet
   credit (Step 5) must happen in the same DB transaction as recording
   that this pin was redeemed, so a retried request can't double-credit
   even if the brand's own single-use check is somehow bypassed.
5. **Idempotency key** from the client per redemption attempt (a UUID
   generated once per voucher-entry screen load) so a double-tap or a
   flaky connection retry doesn't redeem the same pin twice against your
   own backend logic.
6. **Wire it in**: replace the mock body of `redeemVoucher()` in
   `src/lib/api/vouchers.ts` with a call to `POST /vouchers/redeem`.

### 5. Wallet ledger

This is what steps 3 and 4 write into, and what today's `balance` and
`transactions` in `app-state.tsx` need to stop being the source of truth
for.

1. **Ledger table**: `transactions` — append-only,
   `id, user_id, type (load/transfer/fee), amount, balance_after, status,
   provider_ref, created_at`. Never let a client request set `balance`
   directly.
2. **Balance is derived**, not stored freely — either compute it by
   summing the ledger on read, or maintain a `wallets` table whose
   balance is updated **only** inside the same DB transaction as the
   ledger insert that caused the change (voucher credit, payout debit,
   fee debit) — so the two can never drift apart.
3. **Move held-balance logic server-side.** A `held_balances` table per
   user; the combine-and-force-send logic that's currently client JS
   (`topUpHeldBalance` in `app-state.tsx`) becomes a server-side
   function, run inside the same transaction as the voucher credit that
   triggered it.
4. **Concurrency control.** Use row-level locking (`SELECT ... FOR
   UPDATE`) or your DB's transaction isolation to serialize balance
   changes per user — without this, two near-simultaneous sends can each
   read the same starting balance and together drain more than the
   wallet actually holds. This is the single most important correctness
   property in a wallet backend.
5. **Client becomes read-only** for these: `GET /wallet`,
   `GET /transactions` replace direct `localStorage` reads; `addTransaction`
   /`adjustBalance` in `app-state.tsx` go away entirely once every mutating
   action goes through Steps 3/4's endpoints instead.
6. **Corrections are new rows.** Never edit or delete a ledger entry after
   the fact — a correction is an offsetting transaction, so the audit
   trail always explains itself.

### 6. Everything else

These don't block real money moving, but each is currently either faked
or entirely absent:

- **Statements** (`history.tsx`) — today's "Statement ready" confirms
  instantly with nothing generated. Needs: a PDF-generation step (a
  server-side renderer, or a service like PDFMonkey/DocRaptor) reading
  from the real ledger, an email provider (SendGrid/SES/Mailgun) for the
  email option, and a WhatsApp Business API integration (via Twilio or
  Meta's Cloud API directly — requires WhatsApp Business verification)
  for the WhatsApp option.
- **Push notifications** (`notifications.tsx`, `message.$id.tsx`) —
  `src/lib/messages.ts` is derived from local transactions only, so
  nothing reaches a user whose app isn't open. Needs device token
  registration (FCM for Android, APNs for iOS, or Web Push if this stays
  a web app) and a backend trigger on ledger/settlement events (webhook
  from Step 3 lands → push notification goes out).
- **Cross-device sync** for Beneficiaries, Profile, and the Side Hustle
  tools — each is local-only today. Once Step 1's auth exists, this is
  close to free: swap their local `useState`/app-state reads and writes
  for `GET`/`POST` calls against simple per-user CRUD endpoints (a
  `beneficiaries` table, a `user_profile` table, `hustles`/`goals`
  tables) — no new architecture needed, just the same pattern repeated.
- **Support chat** (`support.tsx`) is fine to leave exactly as it is —
  it's rule-based by design and never claimed to need a backend. Only
  revisit this if the product ever wants live-agent escalation or an
  LLM behind it, neither of which exists today.

## Suggested order to actually build in

1. **Auth + accounts** (Step 1) — nothing else has a real user without it.
2. **Wallet ledger** (Step 5) — stand this up early even before Payments/
   Vouchers are real, so Steps 3 and 4 have somewhere correct to write
   into from day one instead of bolting it on after.
3. **Identity (DHA)** (Step 2) — unblocks Pro upgrade and PIN reset/change.
4. **Vouchers** (Step 4) — needed before the wallet balance can be trusted
   for anything.
5. **Payments/Ozow** (Step 3) — the highest-stakes integration; do it last
   among the money-moving pieces, once the ledger under it is solid.
6. **Everything else** (Step 6) — notifications, statements, cross-device
   sync — once the above five are real.
