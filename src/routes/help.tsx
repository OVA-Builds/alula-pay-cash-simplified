import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronDown, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MIN_SEND, MONTHLY_FEE, HELD_BALANCE_EXPIRY_DAYS, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/help")({ component: Help });

type Faq = { id: string; q: string; a: string[] };
type Section = { title: string; items: Faq[] };

const SECTIONS: Section[] = [
  {
    title: "Getting started",
    items: [
      {
        id: "how-it-works",
        q: "How does Alula Pay actually work?",
        a: [
          "Three steps: buy a voucher for cash at any till near you (Blu, 1Voucher or OTT), load the voucher's pin into the app, then send it straight to any South African bank account.",
          "Alula Pay isn't a bank — we're the bridge between the cash in your hand and a bank account. Your money never sits with us longer than it has to.",
        ],
      },
      {
        id: "is-a-bank",
        q: "Is Alula Pay a bank? Do you hold my money?",
        a: [
          "No. We don't save, we send — so you can. Every voucher you load is moved on to a bank account; we don't offer savings, interest, or a place to park money long-term.",
          "The only exception is a small leftover from a subscription voucher that's too small to send on its own — see \"What happens if my subscription voucher leaves money over?\" below.",
        ],
      },
      {
        id: "basic-vs-pro",
        q: "What's the difference between Basic and Pro?",
        a: [
          `Basic is ${formatZAR(MONTHLY_FEE.basic)}/month: sends land via EFT in 1–2 working days, with a R5,000 monthly sending limit.`,
          `Pro is ${formatZAR(MONTHLY_FEE.pro)}/month: sends are instant (within 10 minutes), with a R10,000 daily and R49,999.99 monthly limit, plus a downloadable 3-month statement. Pro needs a quick once-off selfie to verify your identity.`,
          "Both tiers charge the same 5% per send.",
        ],
      },
      {
        id: "free-transactions",
        q: "What are my 2 free transactions?",
        a: [
          "Every billing period (resetting on the 2nd of the month), your first 2 sends are free of a subscription — you don't need Basic or Pro active to use them.",
          "Once both are used, you'll need an active plan to keep sending until the next period rolls over.",
        ],
      },
    ],
  },
  {
    title: "Sending & fees",
    items: [
      {
        id: "min-send",
        q: `Why can't I send less than ${formatZAR(MIN_SEND)}?`,
        a: [
          `${formatZAR(MIN_SEND)} is our minimum send amount — it applies to every send, no matter the plan. It exists because a smaller send can end up costing more in fees than it's worth.`,
          "If a voucher or leftover balance is under this amount, the app will hold it for you rather than let you send it — see the held balance question below.",
        ],
      },
      {
        id: "fees",
        q: "What fees do you charge?",
        a: [
          `A flat 5% of the amount you send, shown as its own line before you approve — never bundled into one number. The minimum single send is ${formatZAR(MIN_SEND)}.`,
          "You can always see exactly what you sent and what you paid in fees under Notifications → Transactions, or in History.",
        ],
      },
      {
        id: "eft-vs-instant",
        q: "How long does my money take to arrive?",
        a: [
          "On Basic, sends go out via EFT and land in 1–2 working days.",
          "On Pro, sends go out via instant payment (RTC) and land within 10 minutes — any time, any day.",
        ],
      },
    ],
  },
  {
    title: "Subscriptions & vouchers",
    items: [
      {
        id: "voucher-overpay",
        q: "What happens if my subscription voucher is worth more than my plan?",
        a: [
          `Say your plan costs ${formatZAR(MONTHLY_FEE.pro)} and you load a voucher worth more — the extra never just sits in your wallet.`,
          `If the leftover clears our ${formatZAR(MIN_SEND)} minimum send on its own, you'll see a mandatory popup on Home asking you to send it straight to a bank account or beneficiary. It reappears every time you open the app until it's sent.`,
        ],
      },
      {
        id: "voucher-leftover-small",
        q: "What happens if my subscription voucher leaves a small amount over?",
        a: [
          `If the leftover is too small to send on its own (under ${formatZAR(MIN_SEND)}), we hold it for you rather than force a send or let it sit spendable in your wallet.`,
          `You'll see the held amount on Home with a countdown — it expires ${HELD_BALANCE_EXPIRY_DAYS} days after the original transaction if never topped up. You're reminded every 2 days until then.`,
          "Tap Top up on Home at any time to add another voucher — once the held amount plus your top-up clears the minimum send, you'll be prompted to send the full amount out.",
        ],
      },
      {
        id: "voucher-invalid",
        q: "My voucher pin isn't working — what do I do?",
        a: [
          "Double-check you've entered every digit exactly as printed, with no spaces. A voucher can only be used once, so if it's already been loaded elsewhere it won't work again.",
          "Still stuck? Open Chat with Alula from Profile → Help & Support — it can log a call with your voucher's provider and give you their direct contact details.",
        ],
      },
      {
        id: "which-vouchers",
        q: "Which vouchers can I use?",
        a: ["Blu Voucher, 1Voucher, and OTT Voucher — all available for cash at most major retailers and till points."],
      },
    ],
  },
  {
    title: "Account & security",
    items: [
      {
        id: "approval-pin",
        q: "I forgot my approval PIN — now what?",
        a: [
          "Tap \"Forgot approval PIN?\" on the PIN entry screen, or go to Profile → Change approval PIN. You'll need to verify it's you before setting a new one.",
          "After 3 incorrect attempts, your PIN locks automatically and you'll be guided straight to the reset flow.",
        ],
      },
      {
        id: "pay-bills-who",
        q: "Who can I pay through Pay Bills?",
        a: [
          "Municipalities, funeral cover and burial societies, insurers, traffic fines, utilities, retailers, and more — search by name from the Pay Bills list on Home.",
          "Each payment works the same way as sending to a beneficiary: pick the supplier, load a voucher, add your own reference (account number, your name, or initials), and confirm.",
        ],
      },
      {
        id: "save-beneficiary",
        q: "How do I save someone as a beneficiary?",
        a: [
          "When sending a once-off payment, switch on \"Save as beneficiary\" before you confirm. They'll then appear in your Beneficiaries list for faster sends next time — no retyping their details.",
        ],
      },
    ],
  },
];

function Help() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <AppShell hideNav>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/profile" }))}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-transform active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">Help</h1>
        <p className="mt-1 text-sm text-muted-foreground">Answers to the questions we hear most.</p>

        <div className="mt-6 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h2>
              <div className="space-y-2.5">
                {section.items.map((item) => {
                  const open = openId === item.id;
                  return (
                    <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                      <button
                        onClick={() => setOpenId(open ? null : item.id)}
                        className="flex w-full items-center gap-3 p-4 text-left"
                      >
                        <span className="flex-1 text-sm font-semibold">{item.q}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open && (
                        <div className="animate-float-up space-y-2 border-t border-border p-4 pt-3">
                          {item.a.map((p, i) => (
                            <p key={i} className="text-xs leading-relaxed text-muted-foreground">{p}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.navigate({ to: "/support" })}
          className="mt-6 flex w-full items-center gap-3 rounded-3xl bg-primary p-4 text-left text-primary-foreground shadow-button active:scale-[0.99] transition-transform"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Still stuck? Chat with Alula</p>
            <p className="text-xs text-primary-foreground/80">Get a straight answer in seconds</p>
          </div>
        </button>
      </div>
    </AppShell>
  );
}
