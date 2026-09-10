import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, Boxes, Banknote, ListPlus, TrendingUp, PiggyBank, PieChart, Thermometer, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/hustle/coach")({ component: Coach });

const STEPS = [
  {
    letter: "a",
    icon: Boxes,
    title: "Ingredients, Supplies, or Profit?",
    body: "Every time you log, choose just one: ingredients cost, supplies cost, or profit. You can log up to two of these a day — say a cost in the morning, your profit in the evening.",
  },
  {
    letter: "b",
    icon: Banknote,
    title: "What did it cost you?",
    body: "Logging ingredients or supplies? Enter what you actually spent for that day. Be honest here — this is the number everything else gets measured against.",
  },
  {
    letter: "c",
    icon: ListPlus,
    title: "List your other expenses",
    body: "Transport, a helper's wage, packaging, airtime for orders — anything else that came out of the business that day. Add each one with its own cost so nothing hides inside one lump number.",
  },
  {
    letter: "d",
    icon: TrendingUp,
    title: "Log your profit",
    body: "Logging profit instead? Enter what you actually walked away with. This is the number that builds your business's track record over time.",
  },
  {
    letter: "e",
    icon: PiggyBank,
    title: "Choose how much to save",
    body: "On a profit log, pick a percentage to put aside — even 10% adds up. This is what turns a good day into long-term progress instead of just cash that comes and goes.",
  },
  {
    letter: "f",
    icon: PieChart,
    title: "Read your pie chart",
    body: "Every entry builds your chart — see exactly how much of your money goes to cost of goods, other expenses, and what you keep. If one slice is too big, that's where to focus next.",
  },
  {
    letter: "g",
    icon: Thermometer,
    title: "Check your Business Health",
    body: "The thermometer gives you a straight read on how the business is doing — thriving, average, or struggling — with an honest comment underneath explaining why, so you always know where you stand.",
  },
];

function Coach() {
  const router = useRouter();

  return (
    <AppShell hideNav>
      <div className="flex min-h-full flex-col bg-neutral-950">
        <div className="sticky top-0 z-10 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pb-8 pt-8 shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gold/10" />
          <div className="relative flex items-center gap-3 px-6">
            <button
              onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/hustle" }))}
              aria-label="Back"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              <GraduationCap className="h-3 w-3" /> Coach
            </span>
          </div>
          <div className="relative mt-5 px-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Running your Business Health Dashboard.</h1>
            <p className="mt-2 text-sm text-white/60">
              Every side hustle you add gets its own dashboard. Here's exactly how to use it, step by step.
            </p>
          </div>
        </div>

        <div className="-mt-4 flex-1 space-y-3 rounded-t-[2rem] bg-background p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.letter} className="flex gap-4 rounded-3xl border border-border bg-card p-4 shadow-card">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground shadow-gold">
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Step {s.letter}</span>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="font-bold">{s.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </div>
            );
          })}

          <Link
            to="/hustle/mine"
            className="mt-2 flex items-center gap-3 rounded-3xl bg-gold p-4 text-gold-foreground shadow-gold"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold">Ready? Add your first side hustle</p>
              <p className="mt-0.5 text-xs opacity-80">Takes less than a minute to set up.</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
