// Alula Pay Terms and Conditions — shown in full inside TermsDialog at
// signup. Long enough on purpose: the dialog gates Agree/Decline behind
// scrolling to the end, so this needs real length to exercise that gate.
export const TERMS_EFFECTIVE_DATE = "1 September 2026";

export type TermsSection = { heading: string; body: string[] };

export const TERMS_SECTIONS: TermsSection[] = [
  {
    heading: "Acceptance of these Terms",
    body: [
      "By creating an Alula Pay account, you agree to be bound by these Terms and Conditions (\"Terms\"), our Privacy Policy, and any additional terms that apply to specific features you use. If you do not agree, you must not create an account or use the app.",
      "These Terms apply to every person who registers for Alula Pay, whether on the Basic plan or the Pro plan.",
    ],
  },
  {
    heading: "Eligibility",
    body: [
      "You must be at least 18 years old and a resident of South Africa to open an Alula Pay account. You must provide a valid South African mobile number and, where required for your plan, complete our identity verification steps.",
      "You confirm that all information you give us during sign-up — your name, mobile number, source of income, and any other detail we ask for — is accurate and kept up to date.",
    ],
  },
  {
    heading: "Account Tiers: Basic and Pro",
    body: [
      "Alula Pay offers two subscription tiers. Basic (R10/month) lets you send money by EFT, which typically lands in 1–2 working days, with a monthly limit of R5,000. Pro (R20/month) unlocks instant payments (usually within 10 minutes), a higher monthly limit of R50,000, and biometric (selfie) verification.",
      "Upgrading to Pro requires a one-time selfie verification step. We use this only to confirm it's really you opening the account — no ID document is required to start on Basic, though we may request further verification at any time if we reasonably suspect fraud.",
    ],
  },
  {
    heading: "Loading Money: Vouchers",
    body: [
      "You load money into your Alula Pay wallet using vouchers purchased from supported third-party providers, including Blu Voucher, 1Voucher, and OTT Voucher. Each provider issues its own voucher pin and is solely responsible for the validity of vouchers it sells.",
      "If a voucher fails to load, check that the pin was entered exactly as printed and that no digit was missed. If it still won't load, contact the voucher provider directly using the details available in the app's Support section — Alula Pay does not issue, replace, or refund third-party vouchers.",
    ],
  },
  {
    heading: "Sending Money and Fees",
    body: [
      "Alula Pay charges a flat 5% fee on every send, calculated on the amount you send and shown to you before you approve any transaction. There are no hidden fees beyond this and your monthly subscription.",
      "The minimum amount you can send in a single transaction is R20. If a voucher or leftover balance comes to less than R20, we hold it in your account until a top-up brings the total to R20 or more, at which point you'll be prompted to send it.",
    ],
  },
  {
    heading: "Transaction Limits",
    body: [
      "Basic plan users may send up to R5,000 per month. Pro plan users may send up to R50,000 per month, with a daily limit of R10,000. These limits may be adjusted from time to time; if they change in a way that affects you, we'll notify you in the app.",
    ],
  },
  {
    heading: "Your Approval PIN",
    body: [
      "In addition to your app sign-in PIN, you'll set a separate 5-digit approval PIN that's required to authorise every send. Keep both PINs confidential. If you enter the wrong approval PIN three times in a row, your account is automatically locked and you'll need to verify your identity with a selfie to reset it.",
      "You are responsible for all transactions authorised with your correct PIN, whether or not you personally approved them, unless you notify us promptly that your PIN has been compromised.",
    ],
  },
  {
    heading: "Prohibited Use",
    body: [
      "You may not use Alula Pay for any unlawful purpose, including money laundering, financing of terrorism, fraud, or evasion of exchange control regulations. You may not attempt to circumvent transaction limits by splitting payments, use another person's account without permission, or interfere with the app's security features.",
      "We reserve the right to suspend or close any account where we reasonably suspect a violation of this section, and to report suspicious activity to the relevant South African authorities as required by law.",
    ],
  },
  {
    heading: "Source of Income",
    body: [
      "As part of our regulatory obligations, we ask you to declare your primary source of income (for example, employed, self-employed, unemployed, grants, or pensioner). This helps us assess risk appropriately and is used only for compliance purposes — it does not affect your eligibility to open a Basic account.",
    ],
  },
  {
    heading: "Data and Privacy",
    body: [
      "We collect and process your personal information in line with the Protection of Personal Information Act (POPIA). This includes your name, mobile number, transaction history, and verification data. We use this information to provide the service, prevent fraud, and meet our legal obligations.",
      "We do not sell your personal information to third parties. Where we share information with voucher providers or banking partners, it is limited to what's necessary to complete your transaction.",
    ],
  },
  {
    heading: "Liability and Disclaimers",
    body: [
      "Alula Pay is provided on an \"as is\" basis. While we take reasonable steps to keep the service available and accurate, we do not guarantee uninterrupted access and are not liable for delays caused by third parties, including voucher providers, banks, and payment rails outside our control.",
      "To the fullest extent permitted by law, our liability to you is limited to the amount held in your Alula Pay wallet at the time any claim arises.",
    ],
  },
  {
    heading: "Suspension and Termination",
    body: [
      "You may close your account at any time by contacting Support. We may suspend or close your account if we reasonably believe these Terms have been breached, if required by law, or to protect the security of our systems and other users.",
      "On closure, any remaining wallet balance will be paid out to a bank account you nominate, subject to standard verification checks.",
    ],
  },
  {
    heading: "Changes to These Terms",
    body: [
      "We may update these Terms from time to time to reflect changes in our services, fees, or legal requirements. Where a change is material, we'll notify you in the app before it takes effect. Continuing to use Alula Pay after a change takes effect means you accept the updated Terms.",
    ],
  },
  {
    heading: "Governing Law",
    body: [
      "These Terms are governed by the laws of the Republic of South Africa. Any dispute arising from your use of Alula Pay will be subject to the jurisdiction of the South African courts.",
    ],
  },
  {
    heading: "Contact Us",
    body: [
      "If you have any questions about these Terms, you can reach us any time through the Chat with Alula assistant in the app, or via the Help section under your Profile.",
    ],
  },
];
