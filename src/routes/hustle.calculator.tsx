import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calculator as CalculatorIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { useApp, formatZAR, calcTransferFee } from "@/lib/app-state";

export const Route = createFileRoute("/hustle/calculator")({ component: FeeCalculator });

function FeeCalculator() {
  const router = useRouter();
  const { plan } = useApp();
  const [amount, setAmount] = useState("");

  const amt = Number(amount) || 0;
  const fee = amt > 0 ? calcTransferFee(amt, plan).fee : 0;
  const net = Math.max(0, amt - fee);

  return (
    <AppShell hideNav>
      <div className="flex min-h-full flex-col bg-neutral-950">
        <div className="sticky top-0 z-10 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pb-8 pt-8 shadow-lg">
          <div className="relative flex items-center gap-3 px-6">
            <button
              onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/hustle" }))}
              aria-label="Back"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              <CalculatorIcon className="h-3 w-3" /> Fee Calculator
            </span>
          </div>
          <div className="relative mt-5 px-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">What lands in your bank?</h1>
            <p className="mt-2 text-sm text-white/60">Type an amount and see the fee and the payout, instantly.</p>
          </div>
        </div>

        <div className="-mt-4 flex-1 rounded-t-[2rem] bg-background p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <label>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Amount to send</p>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-4">
                <span className="text-2xl font-bold text-muted-foreground">R</span>
                <Input
                  value={amount}
                  inputMode="decimal"
                  placeholder="0.00"
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  className="h-16 border-none bg-transparent px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                  autoFocus
                />
              </div>
            </label>

            <div className="mt-5 space-y-2 rounded-2xl bg-muted/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fee (5%)</span>
                <span className="font-semibold text-destructive">-{formatZAR(fee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm font-medium">Lands in their bank</span>
                <span className="text-lg font-bold text-success">{formatZAR(net)}</span>
              </div>
            </div>
          </div>

          <p className="mt-4 px-1 text-center text-[11px] text-muted-foreground">
            Same 5% fee whether you're on Basic or Pro — Pro just gets it there instantly instead of in 1–2 days.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
