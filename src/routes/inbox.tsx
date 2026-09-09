import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Landmark, Megaphone, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, formatTxDate } from "@/lib/app-state";

export const Route = createFileRoute("/inbox")({ component: Inbox });

type Tip = { id: string; icon: typeof Megaphone; title: string; body: string; date: string };

const TIPS: Tip[] = [
  {
    id: "m1",
    icon: ShieldCheck,
    title: "Pro sends land in minutes",
    body: "Upgrade to Pro for instant payments, a R49,999.99 monthly limit, and downloadable 3-month statements.",
    date: "This week",
  },
  {
    id: "m2",
    icon: Landmark,
    title: "Save a beneficiary to pay faster",
    body: "Turn on \"Save as beneficiary\" next time you send — their details will be one tap away after that.",
    date: "This week",
  },
  {
    id: "m3",
    icon: Megaphone,
    title: "Know your fees upfront",
    body: "Every send shows its fee separately before you approve — 5% per send, R20 minimum, no surprises.",
    date: "Last week",
  },
];

function Inbox() {
  const router = useRouter();
  const { transactions } = useApp();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  const recentTransactions = transactions.filter((t) => (t.createdAt ?? Date.now()) >= cutoff);

  return (
    <AppShell hideNav>
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/home" }))}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tips from us, and a log of your own activity.</p>

        <h2 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Messages</h2>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {TIPS.map((tip) => (
            <div key={tip.id} className="flex items-start gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <tip.icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{tip.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{tip.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{tip.date}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your activity (past 30 days)
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {recentTransactions.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">Nothing to show yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map((t) => {
                const positive = t.amount > 0;
                return (
                  <div key={t.id} className="flex items-center gap-3 p-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${positive ? "bg-success/10" : "bg-muted"}`}>
                      {positive ? (
                        <ArrowDownLeft className="h-4.5 w-4.5 text-success" />
                      ) : (
                        <ArrowUpRight className="h-4.5 w-4.5 text-muted-foreground" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{formatTxDate(t)}</p>
                    </div>
                    <p className={`text-sm font-semibold ${positive ? "text-success" : "text-foreground"}`}>
                      {positive ? "+" : "-"}{formatZAR(Math.abs(t.amount))}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
