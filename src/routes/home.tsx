import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Landmark, Settings, ShieldCheck, ArrowUpRight, ArrowDownLeft, ChevronRight, Lightbulb } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, formatTxDate, TIER_LIMITS } from "@/lib/app-state";
import promoPhoto from "@/assets/onb-1.jpg";

export const Route = createFileRoute("/home")({ component: Home });

function Home() {
  const { transactions, verified, plan, firstName, balance } = useApp();
  const recent = transactions.slice(0, 3);
  const displayName = firstName?.trim() ? firstName.trim().split(/\s+/)[0] : "there";

  const moneyOut = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const limitTotal = TIER_LIMITS[plan].monthly;
  const usedPct = Math.min(100, Math.round((moneyOut / limitTotal) * 100));
  const remaining = Math.max(0, limitTotal - moneyOut);

  return (
    <AppShell>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-deep pb-14 pt-9">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-24 w-36 rounded-tl-[3rem] bg-gold/90" />

        <div className="relative flex items-start justify-between px-6">
          <div>
            <p className="text-sm text-primary-foreground/80">Hello</p>
            <h1 className="text-3xl font-bold tracking-tight text-primary-foreground">{displayName}</h1>
            <p className="mt-1 text-sm text-primary-foreground/80">Good to see you again!</p>
          </div>
          <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Bell className="h-4.5 w-4.5 text-primary-foreground" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold" />
          </button>
        </div>
      </div>

      <div className="relative -mt-8 px-6">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Monthly limit</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {formatZAR(moneyOut)} <span className="text-base font-normal text-muted-foreground">of {formatZAR(limitTotal)}</span>
          </p>

          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${usedPct}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-[0.85fr_auto_1.5fr] items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">{formatZAR(remaining)}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>

            <span className="h-9 w-px bg-border" />

            {verified ? (
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">Pro plan</p>
                  <p className="text-xs text-muted-foreground">Instant payments</p>
                </div>
              </div>
            ) : (
              <Link to="/verify" className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-nowrap text-[13px] font-bold leading-tight">Upgrade to Pro</p>
                  <p className="text-xs leading-snug text-muted-foreground">Higher limits, instant payments.</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1.55fr_1fr] gap-2.5 px-6">
        <Link
          id="guide-send"
          to="/send-once-off"
          className="relative flex items-center gap-3 overflow-hidden rounded-3xl bg-primary p-4 text-primary-foreground shadow-button"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary">
            <Landmark className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="whitespace-nowrap text-[15px] font-semibold">Send to Bank</p>
            <p className="text-xs leading-snug text-primary-foreground/80">Transfer to any South African bank account</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>

        <Link
          to="/profile"
          className="flex flex-col items-start justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-card"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
            <Settings className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-semibold">Settings</p>
            <p className="text-xs text-muted-foreground">Manage your account</p>
          </div>
        </Link>
      </div>

      <div className="mt-4 px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-background p-5 shadow-card">
          <img
            src={promoPhoto}
            alt=""
            className="pointer-events-none absolute -right-4 bottom-0 h-full w-[46%] rounded-2xl object-cover object-top opacity-95"
          />
          <div className="relative max-w-[58%]">
            <p className="text-xl font-bold leading-tight tracking-tight">
              Real People.<br /><span className="text-primary">Real Possibilities.</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Your money, your way. Fast. Safe. Simple.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-gold px-4 py-2 text-xs font-bold text-gold-foreground shadow-gold">
              Learn more
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 px-6 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent transactions</h2>
          <Link to="/history" className="text-xs font-medium text-primary">See all</Link>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          {recent.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Landmark className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-semibold">No transactions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Send money to get started.</p>
            </div>
          ) : (
            recent.map((t, i) => (
              <div key={t.id} className={`flex items-center gap-3 p-4 ${i > 0 ? "border-t border-border" : ""}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.amount > 0 ? "bg-success/10" : "bg-muted"}`}>
                  {t.amount > 0 ? (
                    <ArrowDownLeft className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{formatTxDate(t)}</p>
                </div>
                <p className={`text-sm font-semibold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                  {t.amount > 0 ? "+" : "-"}{formatZAR(Math.abs(t.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        <Link
          to="/send-once-off"
          className="flex items-center gap-3 rounded-3xl bg-gold p-4 text-gold-foreground shadow-gold"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/40">
            <Lightbulb className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Did you know?</p>
            <p className="text-xs leading-snug">
              You can send money to any South African bank account in just a few seconds.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>

      <p className="pb-2 text-center text-[11px] font-medium text-muted-foreground">
        Balance: {formatZAR(balance)}
      </p>
    </AppShell>
  );
}
