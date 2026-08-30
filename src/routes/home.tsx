import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket, Send, Bell, ShieldCheck, ArrowUpRight, ArrowDownLeft, ChevronRight, Users, TrendingUp, TrendingDown, Zap, X, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, formatTxDate, TIER_LIMITS } from "@/lib/app-state";

export const Route = createFileRoute("/home")({ component: Home });

function Home() {
  const { transactions, verified, plan, firstName } = useApp();
  const navigate = useNavigate();
  const recent = transactions.slice(0, 3);
  const displayName = firstName?.trim() ? firstName.trim().split(/\s+/)[0] : "there";
  const [launchOpen, setLaunchOpen] = useState(false);

  const moneyIn = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const moneyOut = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const limitTotal = TIER_LIMITS[plan].monthly;

  const usedPct = Math.min(100, Math.round((moneyOut / limitTotal) * 100));
  const remaining = Math.max(0, limitTotal - moneyOut);
  const warn = usedPct >= 75;
  const periodLabel = "this month";

  const goOnceOff = () => { setLaunchOpen(false); navigate({ to: "/send-once-off" }); };
  const goBeneficiary = () => { setLaunchOpen(false); navigate({ to: "/beneficiaries" }); };

  return (
    <AppShell>
      <div className="relative">
        {/* Header */}
        <div className="relative px-6 pt-9 pb-2 flex items-start justify-between animate-rise-in">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hello</p>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">{displayName}</h1>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 shadow-soft">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{plan === "pro" ? "Pro member" : "Basic member"}</span>
            </span>
          </div>
          <button className="h-11 w-11 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lift active:scale-95 transition-transform">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Launch stage */}
        <div className="relative px-6 pt-5">
          <div className="relative rounded-[2rem] p-7 pb-8 bg-card border border-border shadow-3d card-3d overflow-hidden">
            <span className="pointer-events-none absolute -top-10 left-0 h-40 w-24 bg-background/50 blur-xl animate-sheen" />
            <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full border border-primary/10 animate-spin-slow" />

            <p className="text-center text-2xl font-bold tracking-tight">
              Move money in <span className="text-gradient-brand">seconds</span>
            </p>

            {/* 3D launch orb */}
            <div className="mt-7 flex justify-center">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-primary/25 animate-halo" />
                <span className="absolute inset-0 rounded-full bg-gold/25 animate-halo" style={{ animationDelay: "1.3s" }} />
                <button
                  id="guide-send"
                  onClick={() => setLaunchOpen(true)}
                  className="relative h-32 w-32 rounded-full bg-gradient-orb shadow-3d animate-breathe flex flex-col items-center justify-center text-primary-foreground active:scale-95 transition-transform"
                >
                  <span className="absolute top-3 left-6 h-6 w-14 rounded-full bg-background/30 blur-md" />
                  <Rocket className="h-8 w-8 drop-shadow" />
                  <span className="mt-1 text-sm font-bold tracking-wide">Launch</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Launch options overlay */}
      {launchOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setLaunchOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" />
          <div className="relative w-full sm:max-w-[420px] px-6 pb-24 space-y-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={goOnceOff}
              className="w-full bg-card rounded-[1.75rem] border border-border p-5 shadow-3d flex items-center gap-4 animate-float-up active:scale-[0.98] transition-transform"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-gold flex items-center justify-center shrink-0 shadow-gold">
                <Zap className="h-5 w-5 text-gold-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Once-off payment</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pay any SA bank account</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={goBeneficiary}
              className="w-full bg-card rounded-[1.75rem] border border-border p-5 shadow-3d flex items-center gap-4 animate-float-up active:scale-[0.98] transition-transform"
              style={{ animationDelay: "60ms" }}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-brand flex items-center justify-center shrink-0 shadow-button">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Beneficiary</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pay a saved recipient</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setLaunchOpen(false)}
              className="w-full h-12 rounded-2xl bg-card border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2 shadow-soft"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>
      )}

      {/* Monthly tracker */}
      <div className="px-6 mt-5 animate-rise-in" style={{ animationDelay: "80ms" }}>
        <div className="rounded-[1.75rem] bg-card border border-border p-5 shadow-lift card-3d">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">Monthly limit</p>
              <p className="text-base font-semibold mt-1">
                {formatZAR(moneyOut)} <span className="text-muted-foreground font-normal">of {formatZAR(limitTotal)}</span>
              </p>
            </div>
            <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${warn ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
              {warn ? "Almost there" : "On track"}
            </span>
          </div>

          <div className="mt-3 h-3 w-full rounded-full bg-muted overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${warn ? "bg-destructive" : "bg-gradient-brand"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-success/10 p-3 border border-success/15">
              <div className="flex items-center gap-1.5 text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">In {periodLabel}</span>
              </div>
              <p className="text-sm font-bold mt-1 text-foreground">{formatZAR(moneyIn)}</p>
            </div>
            <div className="rounded-2xl bg-destructive/10 p-3 border border-destructive/15">
              <div className="flex items-center gap-1.5 text-destructive">
                <TrendingDown className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Out {periodLabel}</span>
              </div>
              <p className="text-sm font-bold mt-1 text-foreground">{formatZAR(moneyOut)}</p>
            </div>
          </div>

          <p className={`text-xs mt-3 ${warn ? "text-destructive font-medium" : "text-muted-foreground"}`}>
            {remaining > 0
              ? `${formatZAR(remaining)} left to send ${periodLabel}.`
              : `You've reached your monthly limit.`}
          </p>
        </div>
      </div>

      <div className="px-6 mt-3 animate-rise-in" style={{ animationDelay: "140ms" }}>
        <Link
          to="/beneficiaries"
          className="rounded-[1.5rem] bg-card border border-border p-4 shadow-lift card-3d flex items-center gap-3"
        >
          <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center">
            <Users className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Beneficiaries</p>
            <p className="text-xs text-muted-foreground">Manage saved recipients</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {!verified && (
        <div className="px-6 mt-3 animate-rise-in" style={{ animationDelay: "200ms" }}>
          <Link
            to="/verify"
            className="block rounded-[1.5rem] border border-gold/40 bg-gold/10 p-4 shadow-gold card-3d overflow-hidden relative"
          >
            <span className="pointer-events-none absolute -top-8 left-0 h-32 w-16 bg-background/40 blur-lg animate-sheen" />
            <div className="flex items-center gap-3 relative">
              <div className="h-11 w-11 rounded-2xl bg-gradient-gold flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-gold-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground">One selfie. Higher limits, instant payments.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gold-foreground" />
            </div>
          </Link>
        </div>
      )}

      <div className="px-6 mt-6 pb-8 animate-rise-in" style={{ animationDelay: "260ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent activity</h2>
          <Link to="/history" className="text-xs text-primary font-medium">See all</Link>
        </div>
        <div className="rounded-[1.5rem] bg-card border border-border shadow-lift divide-y divide-border overflow-hidden">
          {recent.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Send className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold mt-3">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Launch a payment to get started.</p>
            </div>
          ) : recent.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-4">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${t.amount > 0 ? "bg-success/10" : "bg-muted"}`}>
                {t.amount > 0 ? (
                  <ArrowDownLeft className="h-4 w-4 text-success" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.label}</p>
                <p className="text-xs text-muted-foreground">{formatTxDate(t)}</p>
              </div>
              <p className={`text-sm font-semibold ${t.amount > 0 ? "text-success" : "text-destructive"}`}>
                {t.amount > 0 ? "+" : ""}{formatZAR(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
