import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket, Send, Bell, ShieldCheck, ArrowUpRight, ArrowDownLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/home")({ component: Home });

function Home() {
  const { balance, transactions, verified, phone } = useApp();
  const recent = transactions.slice(0, 3);

  return (
    <AppShell>
      <div className="px-6 pt-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Hello</p>
            <p className="font-semibold text-lg">{phone ? `+27 ${phone.slice(-9)}` : "Welcome back"}</p>
          </div>
          <button className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-gradient-wallet rounded-3xl p-7 text-white shadow-card relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -right-20 bottom-0 h-32 w-32 rounded-full bg-gold/20" />
          <p className="text-white/70 text-sm">Your balance</p>
          <p className="text-4xl font-bold mt-2 tracking-tight">{formatZAR(balance)}</p>
          <p className="text-white/60 text-xs mt-3">Tier 1 — daily limit R 3,000</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6 mt-5">
        <Link
          to="/redeem"
          className="bg-card rounded-2xl p-5 shadow-soft border border-border flex flex-col gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Redeem Voucher</p>
            <p className="text-xs text-muted-foreground mt-0.5">Load your wallet</p>
          </div>
        </Link>
        <Link
          to="/send"
          className="bg-card rounded-2xl p-5 shadow-soft border border-border flex flex-col gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="h-11 w-11 rounded-xl bg-gold/15 flex items-center justify-center">
            <Send className="h-5 w-5 text-gold-foreground" />
          </div>
          <div>
            <p className="font-semibold">Send to Bank</p>
            <p className="text-xs text-muted-foreground mt-0.5">Any SA bank</p>
          </div>
        </Link>
      </div>

      {!verified && (
        <div className="px-6 mt-5">
          <Link
            to="/verify"
            className="block rounded-2xl border border-primary/20 bg-primary/5 p-4 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Verify your account</p>
                <p className="text-xs text-muted-foreground">Unlock higher limits and lower fees.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-primary" />
            </div>
          </Link>
        </div>
      )}

      <div className="px-6 mt-7 pb-6">
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
              <p className={`text-sm font-semibold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                {t.amount > 0 ? "+" : ""}{formatZAR(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
