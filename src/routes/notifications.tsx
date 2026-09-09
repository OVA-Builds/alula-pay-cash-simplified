import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, formatTxDate, threeMonthsAgo } from "@/lib/app-state";
import { MESSAGES } from "@/lib/messages";

type Tab = "transactions" | "messages";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => ({
    tab: search.tab === "messages" ? "messages" : undefined,
  }),
});

function Notifications() {
  const router = useRouter();
  const { tab = "transactions" } = Route.useSearch();
  const { transactions, deletedMessageIds, readMessageIds, deleteMessage } = useApp();
  // The active tab lives in the URL (not local state) so that pressing back
  // after opening a message returns to whichever tab you were actually on,
  // instead of resetting to the default every time this route remounts.
  const setTab = (t: Tab) => router.navigate({ to: "/notifications", search: { tab: t }, replace: true });

  const messages = MESSAGES.filter((m) => !deletedMessageIds.includes(m.id));

  const cutoff = threeMonthsAgo();
  const recentTransactions = transactions.filter((t) => (t.createdAt ?? Date.now()) >= cutoff);

  return (
    <AppShell hideNav>
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/home" }))}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your activity, and tips from us.</p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
          {([
            { k: "transactions", label: "Transactions" },
            { k: "messages", label: "Messages" },
          ] as const).map((opt) => (
            <button
              key={opt.k}
              onClick={() => setTab(opt.k)}
              className={`h-9 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] ${
                tab === opt.k ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {tab === "transactions" && (
          <div className="mt-4">
            <p className="mb-2 px-1 text-xs text-muted-foreground">Past 3 months</p>
            {recentTransactions.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
                <p className="text-xs text-muted-foreground">Nothing to show yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTransactions.map((t) => {
                  const positive = t.amount > 0;
                  return (
                    <Link
                      key={t.id}
                      to="/history"
                      search={{ highlight: t.id }}
                      className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.99]"
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${positive ? "bg-success/10" : "bg-muted"}`}>
                        {positive ? (
                          <ArrowDownLeft className="h-4.5 w-4.5 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4.5 w-4.5 text-muted-foreground" />
                        )}
                      </span>
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
                      <p className={`text-sm font-semibold ${positive ? "text-success" : "text-foreground"}`}>
                        {positive ? "+" : "-"}{formatZAR(Math.abs(t.amount))}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div className="mt-4">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
                <p className="text-xs text-muted-foreground">No messages.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {messages.map((m) => {
                  const unread = !readMessageIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.navigate({ to: "/message/$id", params: { id: m.id } })}
                      onKeyDown={(e) => { if (e.key === "Enter") router.navigate({ to: "/message/$id", params: { id: m.id } }); }}
                      className="flex cursor-pointer items-start gap-3 rounded-3xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.99]"
                    >
                      {m.photo ? (
                        <img src={m.photo} alt="" className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-soft" />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-soft">
                          <m.icon className="h-4.5 w-4.5" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold ${unread ? "text-foreground" : "text-primary"}`}>{m.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{m.body}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{m.date}</p>
                      </div>
                      <button
                        aria-label="Delete message"
                        onClick={(e) => { e.stopPropagation(); deleteMessage(m.id); }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
