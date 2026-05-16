import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ScanLine, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/redeem")({ component: Redeem });

function Redeem() {
  const navigate = useNavigate();
  const { addTransaction, adjustBalance } = useApp();
  const [code, setCode] = useState("");
  const [done, setDone] = useState<number | null>(null);

  const submit = () => {
    if (code.length < 6) return;
    const amount = 200;
    adjustBalance(amount);
    addTransaction({
      id: crypto.randomUUID(),
      type: "redeem",
      amount,
      label: "Voucher redeemed",
      status: "Completed",
      date: "Just now",
    });
    setDone(amount);
  };

  if (done !== null) {
    return (
      <AppShell hideNav>
        <div className="flex flex-col items-center justify-center min-h-screen sm:min-h-[860px] p-8 text-center">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-success/30 animate-ripple" />
            <div className="relative h-24 w-24 rounded-full bg-success flex items-center justify-center animate-tick-pop">
              <Check className="h-12 w-12 text-success-foreground" strokeWidth={3} />
            </div>
          </div>
          <h1 className="mt-8 text-2xl font-bold">Voucher redeemed</h1>
          <p className="mt-2 text-muted-foreground">{formatZAR(done)} added to your wallet.</p>
          <Button size="lg" onClick={() => navigate({ to: "/home" })} className="mt-10 h-14 w-full rounded-2xl shadow-button">
            Done
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6">
        <button onClick={() => navigate({ to: "/home" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Redeem a voucher</h1>
        <p className="mt-2 text-muted-foreground text-sm">Enter the code printed on your Alula voucher slip.</p>

        <div className="mt-8 relative">
          <Input
            placeholder="Voucher code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="h-16 rounded-2xl text-lg tracking-[0.25em] pr-14 text-center font-mono"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-primary" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">Or tap the icon to scan a QR / barcode.</p>

        <Button
          size="lg"
          disabled={code.length < 6}
          onClick={submit}
          className="mt-10 h-14 w-full rounded-2xl text-base shadow-button"
        >
          Redeem
        </Button>
      </div>
    </AppShell>
  );
}
