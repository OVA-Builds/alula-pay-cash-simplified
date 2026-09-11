import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, ListPlus, PiggyBank, PieChart, CalendarCheck, Thermometer, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { HustleHeader } from "@/components/HustleHeader";

export const Route = createFileRoute("/hustle/coach")({ component: Coach });

const STEPS = [
  {
    letter: "a",
    icon: Boxes,
    title: "Ingredients, Supplies, and Profit",
    body: "Each time you log, one sheet covers all three — ingredients (food businesses only), supplies, and profit. Add whatever applies; you don't need every section, and you can log as many times as you like.",
  },
  {
    letter: "b",
    icon: ListPlus,
    title: "Build your list",
    body: "Add each cost or sale as its own line — \"Meat R400\", \"Spices R100\" — with the + button. As many lines as you need, so nothing hides inside one lump number.",
  },
  {
    letter: "c",
    icon: PiggyBank,
    title: "Choose how much to save",
    body: "On a profit log, pick a percentage to put aside — even 10% adds up. This is what turns a good day into long-term progress instead of just cash that comes and goes.",
  },
  {
    letter: "d",
    icon: PieChart,
    title: "Read your pie chart",
    body: "Every log builds your chart — see exactly how much of your money goes to operational costs versus what you keep as profit. If costs are too big a slice, that's where to focus next.",
  },
  {
    letter: "e",
    icon: CalendarCheck,
    title: "Check any day's detail",
    body: "Tap a day under Logged Days to see everything you added that day, all in one place — every line item, grouped by what it was.",
  },
  {
    letter: "f",
    icon: Thermometer,
    title: "Check your Business Health",
    body: "The thermometer gives you a straight read on how the business is doing — thriving, average, or struggling — with an honest comment underneath explaining why, so you always know where you stand.",
  },
];

function Coach() {
  return (
    <AppShell hideNav>
      <div className="flex min-h-full flex-col bg-neutral-950">
        <HustleHeader
          fallbackTo="/hustle"
          title="Running your Business Health Dashboard."
          subtitle="Every side hustle you add gets its own dashboard. Here's exactly how to use it."
        />

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
