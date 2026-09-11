// Knowledge base for the in-app "Chat with Alula" assistant (support.tsx).
// Everything here is static/local — there's no backend, so this is a
// rule-based menu + keyword matcher, not a live LLM. Alula only ever talks
// about Alula Pay itself; free-text input that doesn't match a known topic
// gets a boundary message instead of a guess.

export type VoucherProviderId = "blu" | "1voucher" | "ott";

export type VoucherProviderContact = {
  id: VoucherProviderId;
  name: string;
  landline: string;
  email: string;
  procedure: string[];
};

export const VOUCHER_PROVIDER_CONTACTS: VoucherProviderContact[] = [
  {
    id: "blu",
    name: "Blu Voucher",
    landline: "0800 014 942",
    email: "info@bluelabeltelecoms.co.za",
    procedure: [
      "Re-check every digit against the till slip — no spaces, and 0/O or 1/I are the easiest to mix up.",
      "Look for a scratch-panel that isn't fully removed — a hidden digit is the most common reason a voucher won't load.",
      "Still stuck? Call or email Blu Voucher directly with the till slip in hand — they can confirm whether it's already been used or genuinely invalid.",
    ],
  },
  {
    id: "1voucher",
    name: "1Voucher",
    landline: "086 169 3333",
    email: "hello@1voucher.co.za",
    procedure: [
      "Confirm the 16-digit pin was entered exactly as printed — 1Voucher pins don't include letters, only digits.",
      "Check the receipt date — vouchers not activated at the till within a few minutes of purchase can occasionally take a short while to go live.",
      "Still failing? Contact 1Voucher directly with your purchase receipt — they can look up the voucher's status on their side.",
    ],
  },
  {
    id: "ott",
    name: "OTT Voucher",
    landline: "087 805 0688",
    email: "support@ott-mobile.com",
    procedure: [
      "Double-check the 12-digit pin — OTT vouchers are shorter than Blu or 1Voucher, so an extra or missing digit is the usual culprit.",
      "Make sure you're loading it as an OTT Voucher in the app, not one of the other brands — the pin length won't match otherwise.",
      "No luck? Reach OTT Voucher support with your slip on hand — they can verify the voucher was issued correctly.",
    ],
  },
];

export type SupportTopic = {
  id: string;
  menuLabel: string;
  // Extra words (besides ones in menuLabel) that should also match this
  // topic when a client types free text instead of tapping the menu.
  keywords: string[];
  // Empty when `special` is set — the chat screen supplies the real
  // content itself (it needs live app data or a follow-up sub-menu).
  answer: string[];
  special?: "voucher-invalid" | "transactions";
};

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: "transactions",
    menuLabel: "Check my recent transactions",
    keywords: ["transaction", "transactions", "recent send", "my payments", "payment history", "check my"],
    answer: [],
    special: "transactions",
  },
  {
    id: "voucher-invalid",
    menuLabel: "My voucher isn't working",
    keywords: ["voucher not working", "invalid voucher", "voucher failed", "wrong pin", "code not working", "voucher pin", "voucher issue"],
    answer: [],
    special: "voucher-invalid",
  },
  {
    id: "eft-timing",
    menuLabel: "How long will my money take to arrive?",
    keywords: ["eft", "how long", "arrive", "land", "take", "days", "instant", "time", "slow", "fast"],
    answer: [
      "On Basic, sends go out via EFT and land in 1–2 working days.",
      "On Pro, sends go out via instant payment and land within 10 minutes, any time, any day.",
    ],
  },
  {
    id: "min-send",
    menuLabel: "What's the minimum I can send?",
    keywords: ["minimum", "min send", "smallest", "r20", "20 rand", "too small"],
    answer: [
      "R20 is the minimum send across both plans. It applies to every send — if a voucher or leftover balance is under that, the app holds it for you instead of letting you send it.",
    ],
  },
  {
    id: "voucher-overpay",
    menuLabel: "My subscription voucher was worth more than my plan",
    keywords: ["overpay", "extra", "leftover", "more than", "forced", "send remaining", "worth more"],
    answer: [
      "That extra never just sits in your wallet. If it clears the R20 minimum send on its own, you'll see a mandatory popup on Home asking you to send it straight to a bank account or beneficiary — it'll keep reappearing until it's sent.",
    ],
  },
  {
    id: "voucher-small-leftover",
    menuLabel: "My subscription voucher left a small amount over",
    keywords: ["small amount", "held", "hold", "too small to send", "90 days", "expire"],
    answer: [
      "If the leftover is too small to send alone (under R20), we hold it for you. You'll see it on Home with a countdown — it expires 90 days after the original transaction if never topped up, and you're reminded every 2 days until then.",
      "Add any voucher through Add Voucher any time — once the held amount plus your top-up clears R20, you'll be prompted to send the full amount out.",
    ],
  },
  {
    id: "fees",
    menuLabel: "What fees do I pay?",
    keywords: ["fee", "cost", "charge", "5%", "percent"],
    answer: [
      "A flat 5% of the amount you send, shown as its own line before you approve — never bundled into one number. Both Basic and Pro charge the same rate.",
    ],
  },
  {
    id: "pay-bills",
    menuLabel: "How do I pay bills?",
    keywords: ["pay bills", "supplier", "municipality", "funeral", "account number", "reference"],
    answer: [
      "Tap Pay Bills on Home, search for the supplier by name, then load a voucher and confirm — just like paying a beneficiary. You'll type your own reference (account number, your name, or initials) at the payment step.",
    ],
  },
  {
    id: "pin-reset",
    menuLabel: "I forgot my approval PIN",
    keywords: ["pin", "forgot", "locked", "reset pin", "approval pin"],
    answer: [
      "Tap \"Forgot approval PIN?\" on the PIN entry screen, or go to Profile → Change approval PIN. After 3 incorrect attempts your PIN locks automatically and you'll be guided straight to the reset flow.",
    ],
  },
];

// Free-text matcher: scores each topic by how many of its keywords (plus
// its own menu label words) appear in the client's message, and returns the
// best match — or null if nothing scores, so the caller can show the
// boundary message instead of guessing.
export function matchSupportTopic(input: string): SupportTopic | null {
  const text = input.toLowerCase();
  let best: SupportTopic | null = null;
  let bestScore = 0;
  for (const topic of SUPPORT_TOPICS) {
    const haystack = [topic.menuLabel.toLowerCase(), ...topic.keywords.map((k) => k.toLowerCase())];
    const score = haystack.reduce((s, phrase) => (text.includes(phrase) ? s + 1 : s), 0);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }
  return best;
}
