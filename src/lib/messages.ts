import { ShieldCheck, Landmark, Megaphone } from "lucide-react";

export type Message = {
  id: string;
  icon: typeof ShieldCheck;
  title: string;
  body: string;
  date: string;
  // Full write-up shown when the client opens the message, as paragraphs.
  newsletter: string[];
};

export const MESSAGES: Message[] = [
  {
    id: "m1",
    icon: ShieldCheck,
    title: "Pro sends land in minutes",
    body: "Upgrade to Pro for instant payments, a R49,999.99 monthly limit, and downloadable 3-month statements.",
    date: "This week",
    newsletter: [
      "Basic gets your money there — Pro gets it there fast. Once you're on Pro, every send you make goes out over instant RTC rails instead of the standard 1–2 working day EFT, so the person you're paying can see it land in minutes.",
      "Pro also raises your monthly sending limit from R5,000 to R49,999.99, so bigger payments — rent, supplier invoices, a big grocery run for the family — don't need to be split into smaller sends across the month.",
      "You'll also unlock a 3-month deposit statement you can download, email, or send on WhatsApp whenever you need scannable proof of your Alula Pay activity — for rentals, credit applications, or opening other accounts.",
      "Switching over takes a once-off selfie for identity verification, done securely through the Department of Home Affairs, and then you choose how you'd like to pay the subscription. Head to Settings whenever you're ready.",
    ],
  },
  {
    id: "m2",
    icon: Landmark,
    title: "Save a beneficiary to pay faster",
    body: "Turn on \"Save as beneficiary\" next time you send — their details will be one tap away after that.",
    date: "This week",
    newsletter: [
      "If you find yourself sending to the same people every month — family, a landlord, a regular supplier — you don't need to retype their bank details each time.",
      "Next time you do a once-off send, flip on \"Save as beneficiary\" before you confirm. Their name, bank, branch, account number and reference are stored for next time.",
      "After that, sending to them again is just a couple of taps from your Beneficiaries list — no more hunting for a scrap of paper with an account number on it.",
      "You can review or remove saved beneficiaries at any time from the Beneficiaries screen.",
    ],
  },
  {
    id: "m3",
    icon: Megaphone,
    title: "Know your fees upfront",
    body: "Every send shows its fee separately before you approve — 5% per send, R20 minimum, no surprises.",
    date: "Last week",
    newsletter: [
      "We know nothing is more frustrating than a fee you didn't see coming. That's why every send in Alula Pay shows you the fee as its own line, separate from the amount you're sending, before you ever approve a payment.",
      "The fee is a flat 5% of the amount you send, with a R20 minimum per transaction — the same rate whether you're on Basic or Pro. What changes between plans is how fast the money arrives, not what you're charged to send it.",
      "Once a send goes through, you can always look back at exactly what you sent and what you paid in fees: open Notifications or Transaction history and every send lists the recipient, their bank details, your reference, the amount sent, and the fee, kept as separate lines rather than one lump total.",
      "If a number ever looks off, that itemized breakdown is the first place to check.",
    ],
  },
];
