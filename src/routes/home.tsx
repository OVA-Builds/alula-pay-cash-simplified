import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket, Send, Bell, ShieldCheck, ArrowUpRight, ArrowDownLeft, ChevronRight, Users, TrendingUp, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, TIER_LIMITS } from "@/lib/app-state";
import logo from "@/assets/alula-logo.png";

export const Route = createFileRoute("/home")({ component: Home });

function Home() {
  const { balance, transactions, verified, plan, firstName } = useApp();
  const recent = transactions.slice(0, 3);
  const displayName = firstName?.trim() ? firstName.trim().split(/\s+/)[0] : "there";

  // Monthly tracker — sum of money in (positive) and money out (negative).
  // Basic monthly cap R2,000 · Pro monthly cap R25,000 (per Alula Pay business plan).
  const moneyIn = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const moneyOut = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const limitTotal = TIER_LIMITS[plan].monthly;

  const usedPct = Math.min(100, Math.round((moneyOut / limitTotal) * 100));
  const remaining = Math.max(0, limitTotal - moneyOut);
  const warn = usedPct >= 75;
  const periodLabel = "this month";


  return (
    <AppShell>
      <div className="px-6 pt-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Hello,</p>
            <p className="font-semibold text-lg">{displayName}</p>
          </div>
          <button className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-gradient-wallet rounded-3xl p-7 text-white shadow-card relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -right-20 bottom-0 h-32 w-32 rounded-full bg-gold/25" />
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-6 w-6" />
              <p className="text-white/80 text-sm font-medium">Alula Pay</p>
            </div>
            <span className="text-[10px] font-bold tracking-wider bg-gold text-gold-foreground px-2 py-0.5 rounded-full uppercase">
              {plan === "pro" ? "Pro" : "Basic"}
            </span>
          </div>
          <p className="text-white/60 text-xs mt-5">Your balance</p>
          <p className="text-4xl font-bold mt-1 tracking-tight">{formatZAR(balance)}</p>
          <p className="text-white/60 text-xs mt-3">
            Monthly limit {formatZAR(limitTotal)}
          </p>

        </div>
      </div>

      {/* Monthly / daily spend tracker */}
      <div className="px-6 mt-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Monthly limit
              </p>

              <p className="text-base font-semibold mt-0.5">
                {formatZAR(moneyOut)} <span className="text-muted-foreground font-normal">of {formatZAR(limitTotal)}</span>
              </p>
            </div>
            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${warn ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
              {warn ? "Almost there" : "On track"}
            </span>
          </div>

          <div className="mt-3 h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${warn ? "bg-destructive" : "bg-gradient-brand"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-success/10 p-3">
              <div className="flex items-center gap-1.5 text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">In {periodLabel}</span>
              </div>
              <p className="text-sm font-bold mt-1 text-foreground">{formatZAR(moneyIn)}</p>
            </div>
            <div className="rounded-xl bg-destructive/10 p-3">
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



      <div className="grid grid-cols-2 gap-3 px-6 mt-5">
        <Link
          id="guide-redeem"
          to="/redeem"
          className="bg-card rounded-2xl p-5 shadow-soft border border-border flex flex-col gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Redeem Voucher</p>
            <p className="text-xs text-muted-foreground mt-0.5">OTT · Blu · 1Voucher</p>
          </div>
        </Link>
        <Link
          id="guide-send"
          to="/send"
          className="bg-card rounded-2xl p-5 shadow-soft border border-border flex flex-col gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="h-11 w-11 rounded-xl bg-gold/30 flex items-center justify-center">
            <Send className="h-5 w-5 text-gold-foreground" />
          </div>
          <div>
            <p className="font-semibold">Send to Bank</p>
            <p className="text-xs text-muted-foreground mt-0.5">Any SA bank</p>
          </div>
        </Link>
      </div>

      <div className="px-6 mt-3">
        <Link
          to="/beneficiaries"
          className="bg-card rounded-2xl p-4 shadow-soft border border-border flex items-center gap-3 active:scale-[0.99]"
        >
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
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
        <div className="px-6 mt-3">
          <Link
            to="/verify"
            className="block rounded-2xl border border-gold/40 bg-gold/10 p-4 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-gold-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground">One selfie. Higher limits, lower fees.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gold-foreground" />
            </div>
          </Link>
        </div>
      )}

      <div className="px-6 mt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent activity</h2>
          <Link to="/history" className="text-xs text-primary font-medium">See all</Link>
        </div>
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {recent.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.amount > 0 ? "bg-success/10" : "bg-muted"}`}>
                {t.amount > 0 ? (
                  <ArrowDownLeft className="h-4 w-4 text-success" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
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
