import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, ChevronRight, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, formatTxDate } from "@/lib/app-state";
import { MESSAGES } from "@/lib/messages";

export const Route = createFileRoute("/notifications")({ component: Notifications });

type Tab = "transactions" | "messages";

function Notifications() {
  const router = useRouter();
  const { transactions, deletedMessageIds, readMessageIds, deleteMessage } = useApp();
  const [tab, setTab] = useState<Tab>("transactions");

  const messages = MESSAGES.filter((m) => !deletedMessageIds.includes(m.id));

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
            <p className="mb-2 px-1 text-xs text-muted-foreground">Past 30 days</p>
            {recentTransactions.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
                <p className="text-xs text-muted-foreground">Nothing to show yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTransactions.map((t) => {
                  const positive = t.amount > 0;
                  return (
                    <div key={t.id} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-card">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${positive ? "bg-success/10" : "bg-muted"}`}>
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
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-soft">
                        <m.icon className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${unread ? "font-bold" : "font-normal"}`}>{m.title}</p>
                        <p className={`mt-0.5 text-xs leading-relaxed text-muted-foreground ${unread ? "font-semibold" : "font-normal"}`}>{m.body}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{m.date}</p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
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
