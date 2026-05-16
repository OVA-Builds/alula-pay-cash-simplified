import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, UserPlus, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/beneficiaries")({ component: Beneficiaries });

function Beneficiaries() {
  const navigate = useNavigate();
  const { beneficiaries } = useApp();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return beneficiaries;
    return beneficiaries.filter((b) =>
      b.name.toLowerCase().includes(s) || b.bank.toLowerCase().includes(s) || b.account.includes(s)
    );
  }, [q, beneficiaries]);

  return (
    <AppShell>
      <div className="p-6">
        <button onClick={() => navigate({ to: "/send" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Beneficiaries</h1>
            <p className="text-xs text-muted-foreground mt-1">{beneficiaries.length} saved</p>
          </div>
          <Link to="/send-once-off" className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-button" aria-label="Add beneficiary">
            <UserPlus className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, bank or account"
            className="h-12 rounded-2xl pl-11" />
        </div>

        <ul className="mt-5 space-y-2">
          {filtered.map((b) => (
            <li key={b.id}>
              <Link
                to="/pay-beneficiary/$id" params={{ id: b.id }}
                className="block bg-card rounded-2xl border border-border p-4 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-brand text-white font-semibold flex items-center justify-center">
                    {b.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.bank} · •••{b.account.slice(-4)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-center text-sm text-muted-foreground py-10">No matches.</li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}
