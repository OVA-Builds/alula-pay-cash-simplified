import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Landmark, Settings, ShieldCheck, ArrowUpRight, ArrowDownLeft, ChevronRight, Lightbulb } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, formatTxDate, TIER_LIMITS } from "@/lib/app-state";
import { MESSAGES } from "@/lib/messages";
import promoBanner from "@/assets/home-promo-banner.jpg";

export const Route = createFileRoute("/home")({ component: Home });

function Home() {
  const {
    transactions, verified, plan, firstName, subscriptionActive, paywallActive, freeTransactionsLeft,
    deletedMessageIds, readMessageIds,
  } = useApp();
  const recent = transactions.slice(0, 3);
  const displayName = firstName?.trim() ? firstName.trim().split(/\s+/)[0] : "there";
  const hasUnreadMessages = MESSAGES.some((m) => !deletedMessageIds.includes(m.id) && !readMessageIds.includes(m.id));

  // Scoped to the current calendar month, matching what /spending charts —
  // the monthly limit resets each month, so it shouldn't count sends from
  // a previous month.
  const now = new Date();
  const moneyOut = transactions
    .filter((t) => {
      if (t.amount >= 0 || !t.createdAt) return false;
      const d = new Date(t.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((s, t) => s + Math.abs(t.amount), 0);
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
          <Link to="/notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Bell className="h-4.5 w-4.5 text-primary-foreground" />
            {hasUnreadMessages && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold" />}
          </Link>
        </div>
      </div>

      <div className="relative -mt-8 px-6">
        {subscriptionActive ? (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Monthly limit</p>
            <Link to="/spending" className="mt-1 block active:opacity-70">
              <p className="text-2xl font-bold tracking-tight">
                {formatZAR(moneyOut)} <span className="text-base font-normal text-muted-foreground">of {formatZAR(limitTotal)}</span>
              </p>
            </Link>

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${usedPct}%` }} />
            </div>

            <div className="mt-4 grid grid-cols-[0.85fr_auto_1.5fr] items-center gap-2.5">
              <Link to="/spending" className="flex items-center gap-2 active:opacity-70">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">{formatZAR(remaining)}</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </Link>

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
                <Link to="/subscribe" className="flex items-center gap-2">
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
        ) : (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Free transactions</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {freeTransactionsLeft} <span className="text-base font-normal text-muted-foreground">of 2 left this month</span>
            </p>

            <div className="mt-3 flex gap-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`h-2.5 flex-1 rounded-full transition-colors duration-500 ${i < freeTransactionsLeft ? "bg-gold" : "bg-muted"}`}
                />
              ))}
            </div>

            {paywallActive ? (
              <Link to="/subscribe" className="mt-4 flex items-center gap-2.5 rounded-2xl border border-gold/40 bg-gold/15 p-3 active:scale-[0.99]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/30 text-gold-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">Choose a plan to keep sending</p>
                  <p className="text-xs text-muted-foreground">Your 2 free Basic transactions are used up.</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ) : (
              <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-muted/50 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">No plan chosen yet</p>
                  <p className="text-xs text-muted-foreground">
                    Your limit will show here once you pick Basic or Pro.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-[1.55fr_1fr] gap-2.5 px-6">
        {paywallActive ? (
          <div
            aria-disabled="true"
            className="flex items-center gap-3 rounded-3xl bg-muted p-4 text-muted-foreground opacity-60"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
              <Landmark className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="whitespace-nowrap text-[15px] font-semibold">Send to Bank</p>
              <p className="text-xs leading-snug">Choose a plan to unlock sending</p>
            </div>
          </div>
        ) : (
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
        )}

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
        <img
          src={promoBanner}
          alt="Real People. Real Possibilities. More freedom. More control. A brighter tomorrow."
          className="w-full rounded-3xl object-cover shadow-card"
        />
      </div>

      <div className={`mt-6 px-6 pb-6 ${paywallActive ? "pointer-events-none opacity-50" : ""}`}>
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
              <Link
                key={t.id}
                to="/history"
                search={{ highlight: t.id }}
                className={`flex items-center gap-3 p-4 active:bg-muted/50 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.amount > 0 ? "bg-success/10" : "bg-muted"}`}>
                  {t.amount > 0 ? (
                    <ArrowDownLeft className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.label}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{formatTxDate(t)}</span>
                    {t.rail && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className={`text-[11px] font-semibold ${t.rail === "RTC" ? "text-primary" : "text-muted-foreground"}`}>
                          {t.rail === "RTC" ? "Instant" : "EFT"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p className={`text-sm font-semibold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                  {t.amount > 0 ? "+" : "-"}{formatZAR(Math.abs(t.amount))}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        {paywallActive ? (
          <div className="flex items-center gap-3 rounded-3xl bg-muted p-4 text-muted-foreground opacity-60">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
              <Lightbulb className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Did you know?</p>
              <p className="text-xs leading-snug">Choose a plan to start sending again.</p>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </AppShell>
  );
}
