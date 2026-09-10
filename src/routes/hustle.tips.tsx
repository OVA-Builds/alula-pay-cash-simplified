import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronDown, Flame, Scissors, Drumstick, UtensilsCrossed, Car, Wrench, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/hustle/tips")({ component: Tips });

type Stat = { label: string; value: string };
type Tip = {
  id: string;
  icon: typeof Flame;
  accent: string;
  title: string;
  subtitle: string;
  hook: string;
  stats: Stat[];
  body: string[];
  operatingCost: string;
};

const TIPS: Tip[] = [
  {
    id: "cowhead",
    icon: Flame,
    accent: "bg-orange-500",
    title: "Cow Head Fast Food Stand",
    subtitle: "Nyama ye ntloko",
    hook: "Served with pap or uphuthu — a township classic that never goes out of style.",
    stats: [
      { label: "Profit per head", value: formatZAR(500) },
      { label: "Worker's daily wage", value: `From ${formatZAR(200)}` },
      { label: "Operating cost", value: `From ${formatZAR(800)}` },
    ],
    body: [
      "One cow head, properly cooked and sold, brings a clean profit of around R500 — after ingredients and after paying your worker's daily wage of around R200, if you've got someone running the stand for you.",
      "Location is everything. Find a busy spot with no competitor camped nearby — near work offices, taxi ranks, or construction sites. Rule of thumb: anywhere you see a crane, you've struck gold. Builders eat well and eat often.",
      "On turf: this game rewards respect. Scope the area first, don't set up shoulder-to-shoulder with someone already established, and you'll build steady regulars instead of friction. A good spot, held well, outlasts a fight over someone else's.",
      "Run it yourself, or hire someone and make it passive income: your worker deducts the cost of supplies and their day's wage, then buys a voucher for what's left and sends it to you. You redeem it on Alula Pay and it lands straight in your bank — no cash changing hands, no risk of it walking off.",
    ],
    operatingCost: "From R800 to get a stand going.",
  },
  {
    id: "barber",
    icon: Scissors,
    accent: "bg-blue-600",
    title: "Barber Shop",
    subtitle: "Passive income, chair by chair",
    hook: "A haircut is never optional — this business never really slows down.",
    stats: [
      { label: "Cut", value: formatZAR(25) },
      { label: "Clean shave", value: formatZAR(20) },
      { label: "Cut + beard", value: formatZAR(30) },
      { label: "Shave + beard", value: formatZAR(25) },
    ],
    body: [
      "Find a busy spot with no barber shop already nearby, buy two clipper machines, and hire one or two guys who know what they're doing.",
      "Rough estimate: 20 clients a day, spread across cuts and shaves, brings in around R500 in a day. Pay your barber a fair daily wage — say R200 — and the rest, roughly R300, is your voucher to redeem and send to your bank.",
      "Two chairs running instead of one roughly doubles that, if the foot traffic is there to support it.",
    ],
    operatingCost: "R600 for a decent clipper and a second-hand barber stool.",
  },
  {
    id: "chickendust",
    icon: Drumstick,
    accent: "bg-red-600",
    title: "Chicken Dust",
    subtitle: "Flame-grilled, no shortcuts",
    hook: "Served with pap, salsa, and coleslaw — the smoke alone brings customers in.",
    stats: [
      { label: "Plate price", value: `${formatZAR(90)} – ${formatZAR(110)}` },
      { label: "Starting ingredients", value: `From ${formatZAR(1000)}` },
    ],
    body: [
      "Ingredients can start from around R1,000, depending on the scale you want to run at — a small grill for the weekend crowd, or a full setup for daily trade.",
      "A plate sells for R90 to R110. Find a busy spot — outside a taxi rank, near a stadium on a weekend, wherever people are hungry and in a hurry — and let the fire do the marketing.",
    ],
    operatingCost: "From R1,000 in ingredients to start, scalable from there.",
  },
  {
    id: "chips",
    icon: UtensilsCrossed,
    accent: "bg-amber-500",
    title: "Fried Chips",
    subtitle: "Low cost in, steady cash out",
    hook: "Everyone wants chips with their meal — this pairs with almost any other stand.",
    stats: [
      { label: "Small (3 potatoes)", value: formatZAR(15) },
      { label: "Medium (5 potatoes)", value: formatZAR(20) },
      { label: "Large (7 potatoes)", value: formatZAR(25) },
    ],
    body: [
      "A 10kg bag of potatoes costs about R60 and holds roughly 80 medium potatoes (about 125g each — smaller or bigger potatoes will shift this a bit).",
      "Working with two bags (160 potatoes, R120), plus a 5L bottle of cooking oil (R150) and salt, spices and sauces (about R200), your ingredient cost for the day lands around R470. Foam packaging adds roughly 90c a plate on top.",
      "Selling 10 plates of each size a day — 10 small, 10 medium, 10 large — uses about 150 potatoes and brings in R600 in sales. After ingredients and packaging (about R497 all in), that's roughly R100 clear profit for the day, and it only grows as you sell more.",
      "Pairs perfectly with a chicken dust or cow head stand — chips are the side nobody says no to.",
    ],
    operatingCost: "About R470 in ingredients to run a full day at this scale.",
  },
  {
    id: "carwash",
    icon: Car,
    accent: "bg-cyan-600",
    title: "Car Wash",
    subtitle: "Simple service, real volume",
    hook: "No fancy equipment needed to start — just water, soap, and a good arm.",
    stats: [
      { label: "Basic wash", value: `${formatZAR(80)} – ${formatZAR(100)}` },
      { label: "Avg. cars a day", value: "15" },
      { label: "Operating supplies", value: `From ${formatZAR(300)}` },
    ],
    body: [
      "A basic wash goes for R80 to R100. At an average of 15 cars a day, that's R1,200 to R1,500 in sales before supplies — and supplies (soap, cloths, a bucket, a hose) cost from about R300 to keep stocked.",
      "Find a busy spot, or take it further with house calls at a premium price for the convenience.",
      "See yourself buying vouchers of up to R1,000 and sending them straight to your bank account on Alula Pay — no leaving your kasi, no queuing at the ATM, and no risk of keeping that much cash lying around at home.",
    ],
    operatingCost: "From R300 to keep supplies stocked.",
  },
];

function Tips() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(TIPS[0].id);

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-neutral-950 pb-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pb-8 pt-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gold/10" />
          <div className="relative flex items-center gap-3 px-6">
            <button
              onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/hustle" }))}
              aria-label="Back"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-5 px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              <TrendingUp className="h-3 w-3" /> Side Hustle Tips
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Real business ideas, real numbers.</h1>
            <p className="mt-2 text-sm text-white/60">
              Township-tested hustles — the setup, the cost, and roughly what you can expect to make.
            </p>
          </div>
        </div>

        <div className="-mt-4 space-y-4 rounded-t-[2rem] bg-background p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
          {TIPS.map((tip) => {
            const open = openId === tip.id;
            const Icon = tip.icon;
            return (
              <div key={tip.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
                <button
                  onClick={() => setOpenId(open ? null : tip.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tip.accent} text-white shadow-soft`}>
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.subtitle}</p>
                  </div>
                  <ChevronDown className={`h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="animate-float-up border-t border-border p-4 pt-4">
                    <p className="text-sm font-medium text-foreground">{tip.hook}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {tip.stats.map((s) => (
                        <div key={s.label} className="rounded-2xl bg-gold/10 px-3 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                          <p className="mt-0.5 text-sm font-bold text-gold-foreground">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {tip.body.map((p, i) => (
                        <p key={i} className="text-xs leading-relaxed text-muted-foreground">{p}</p>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl bg-muted/60 px-3.5 py-3">
                      <p className="text-[11px] font-semibold text-muted-foreground">Operating cost: {tip.operatingCost}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* General skills tip */}
          <div className="rounded-3xl border border-gold/30 bg-gold/10 p-5 shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground shadow-gold">
              <Wrench className="h-5.5 w-5.5" />
            </span>
            <p className="mt-3 font-bold">Got a skill? That's a hustle too.</p>
            <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-foreground/80">
              <p>
                You don't need a stand or a stall to start earning. Hairdressing, phone and electronics repair,
                sewing and alterations, welding, plumbing, painting, tutoring, makeup artistry, photography, car
                detailing, gardening — if people already pay for it, you can offer it.
              </p>
              <p>
                <b>The advantage:</b> little to no stock to buy, low starting cost, and you set your own price based
                on your skill level. Word of mouth in your area does most of the marketing for you.
              </p>
              <p>
                <b>Tips for starting:</b> start with people you know so your first few jobs come with trust already
                built in, keep your pricing consistent so clients know what to expect, and reinvest your first
                earnings into better tools before you scale up.
              </p>
              <p>
                Whatever you charge, however you get paid in cash — save your profit the same day. Load it as a
                voucher on Alula Pay and send it straight to your bank, so the money is working for you instead of
                sitting in a pocket.
              </p>
            </div>
          </div>

          <p className="px-1 pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
            Figures above are illustrative estimates to help you plan — actual costs, prices and demand vary by
            area, so treat them as a starting point, not a guarantee.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
