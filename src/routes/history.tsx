import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/history")({ component: History });

function History() {
  const { transactions } = useApp();

  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Transaction history</h1>
        <p className="text-sm text-muted-foreground mt-1">Everything that has moved in and out.</p>

        <div className="mt-6 bg-card rounded-2xl border border-border divide-y divide-border">
          {transactions.map((t) => {
            const positive = t.amount > 0;
            return (
              <div key={t.id} className="flex items-center gap-3 p-4">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center ${positive ? "bg-success/10" : "bg-muted"}`}>
                  {positive ? (
                    <ArrowDownLeft className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{t.date}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs capitalize text-muted-foreground">{t.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${positive ? "text-success" : "text-foreground"}`}>
                    {positive ? "+" : ""}{formatZAR(t.amount)}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${t.status === "Completed" ? "text-success" : "text-gold-foreground"}`}>
                    {t.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
