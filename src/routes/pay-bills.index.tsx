import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, ChevronRight, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/AppShell";
import { BILLERS } from "@/lib/billers";

export const Route = createFileRoute("/pay-bills/")({ component: PayBills });

function PayBills() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return BILLERS;
    return BILLERS.filter((b) => b.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <AppShell>
      <div className="p-6">
        <button onClick={() => navigate({ to: "/home" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight">Pay Bills</h1>
          <p className="text-xs text-muted-foreground mt-1">{BILLERS.length} suppliers</p>
        </div>

        <div className="mt-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-12 rounded-2xl pl-11"
          />
        </div>

        <ul className="mt-5 space-y-2">
          {filtered.slice(0, 100).map((b) => (
            <li key={b.id}>
              <Link
                to="/pay-bills/$id" params={{ id: b.id }}
                className="block bg-card rounded-2xl border border-border p-4 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-wallet text-white flex items-center justify-center">
                    <Building2 className="h-4.5 w-4.5" />
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
          {filtered.length > 100 && (
            <li className="text-center text-xs text-muted-foreground py-3">
              Showing first 100 of {filtered.length} — keep typing to narrow it down.
            </li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}
