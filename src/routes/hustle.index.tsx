import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Target, Store, GraduationCap, Briefcase, Calculator, Flame, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

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
  const router = useRouter();

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-neutral-950">
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pb-10 pt-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-gold/10" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-gold/5" />

          <div className="relative flex items-center gap-3 px-6">
            <button
              onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/home" }))}
              aria-label="Back"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-5 px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              <Flame className="h-3 w-3" /> Hustle Hub
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Elevate your hustle.</h1>
            <p className="mt-2 max-w-xs text-sm text-white/60">
              Tools built for people building their own income — set goals, learn a trade, track your money.
            </p>
          </div>
        </div>

        <div className="-mt-4 space-y-3 rounded-t-[2rem] bg-background p-6 pb-10 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
          {CARDS.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.98]"
            >
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-gold shadow-gold">
                <Icon className="h-5.5 w-5.5 text-gold-foreground" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{title}</p>
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
