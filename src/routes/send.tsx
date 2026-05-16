import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Users, Zap, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/send")({ component: SendChoose });

function SendChoose() {
  const navigate = useNavigate();
  const { balance, beneficiaries } = useApp();

  return (
    <AppShell>
      <div className="p-6">
        <button onClick={() => navigate({ to: "/home" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Send money</h1>
        <p className="mt-2 text-muted-foreground text-sm">Available: <span className="font-medium text-foreground">{formatZAR(balance)}</span></p>

        <div className="mt-8 space-y-3">
          <Link
            to="/beneficiaries"
            className="block bg-card rounded-2xl border border-border p-5 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Send to beneficiary</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {beneficiaries.length} saved · faster, no re-entry
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>

          <Link
            to="/send-once-off"
            className="block bg-card rounded-2xl border border-border p-5 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gold/30 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-gold-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Once-off payment</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pay any SA bank account</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        </div>

        <div className="mt-8 p-4 rounded-2xl bg-muted/50 text-xs text-muted-foreground leading-relaxed">
          Fees are calculated on the amount you enter. We'll show you the exact fee and your new balance before you confirm.
        </div>
      </div>
    </AppShell>
  );
}
