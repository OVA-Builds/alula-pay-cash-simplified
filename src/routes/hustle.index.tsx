import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Store, GraduationCap, Briefcase, Calculator, Flame, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { HustleHeader } from "@/components/HustleHeader";

export const Route = createFileRoute("/hustle/")({ component: Hustle });

const CARDS = [
  { to: "/hustle/goals" as const, icon: Target, title: "Goals", desc: "Set a goal, a cost, and a timeline to hit it." },
  { to: "/hustle/tips" as const, icon: Store, title: "Side Hustle Tips", desc: "Real township business ideas, with the numbers." },
  { to: "/hustle/coach" as const, icon: GraduationCap, title: "Coach", desc: "Step-by-step help to start and run your hustle." },
  { to: "/hustle/mine" as const, icon: Briefcase, title: "My Side Hustles", desc: "Track up to 5 hustles and their health." },
  { to: "/hustle/calculator" as const, icon: Calculator, title: "Fee Calculator", desc: "See exactly what lands in the bank." },
  { to: "/hustle/challenge" as const, icon: Flame, title: "Challenge", desc: "A savings streak — 7 to 30 days." },
];

function Hustle() {
  return (
    <AppShell hideNav>
      <div className="flex min-h-full flex-col bg-neutral-950">
        <HustleHeader fallbackTo="/home" title="Elevate your hustle." subtitle="Tools built for people building their own income." />

        <div className="-mt-4 flex-1 space-y-2 rounded-t-[2rem] bg-background p-5 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
          {CARDS.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 shadow-card transition-transform active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-gold shadow-gold">
                <Icon className="h-5 w-5 text-gold-foreground" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
