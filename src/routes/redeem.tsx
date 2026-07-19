import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ScanLine, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/redeem")({ component: Redeem });

type VoucherType = { id: "ott" | "blu" | "1voucher"; name: string; length: number; example: string; color: string };

const TYPES: VoucherType[] = [
  { id: "ott",      name: "OTT Voucher",  length: 12, example: "12-digit pin",  color: "bg-blue-500" },
  { id: "blu",      name: "Blu Voucher",  length: 16, example: "16-digit pin",  color: "bg-cyan-500" },
  { id: "1voucher", name: "1Voucher",     length: 16, example: "16-digit pin",  color: "bg-pink-500" },
];

function Redeem() {
  const navigate = useNavigate();
  const { addTransaction, adjustBalance, stopGuide } = useApp();
  const [type, setType] = useState<VoucherType | null>(null);
  const [code, setCode] = useState("");
  const [done, setDone] = useState<number | null>(null);

  const digits = code.replace(/\D/g, "");
  const valid = type && digits.length === type.length;

  const submit = () => {
    if (!valid || !type) return;
    // Mock: derive amount from voucher type for demo. Blu R10, OTT R200, 1Voucher R50.
    const amount = type.id === "ott" ? 200 : type.id === "blu" ? 10 : 50;
    adjustBalance(amount);
    addTransaction({
      id: crypto.randomUUID(), type: "redeem", amount,
      label: `${type.name} redeemed`, status: "Completed", date: "Just now",
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

  if (!type) {
    return (
      <AppShell>
        <div className="p-6">
          <button onClick={() => navigate({ to: "/home" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Choose voucher type</h1>
          <p className="mt-2 text-muted-foreground text-sm">Pick the brand printed on your voucher slip.</p>

          <div id="guide-voucher-types" className="mt-6 space-y-3">
            {TYPES.map((t) => (
              <button
                key={t.id} onClick={() => { stopGuide(); setType(t); }}
                className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 active:scale-[0.99] transition-transform"
              >
                <div className={`h-12 w-12 rounded-xl ${t.color} flex items-center justify-center text-white font-bold`}>
                  {t.name[0]}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.example}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
              </button>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6">
        <button onClick={() => setType(null)} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="mt-6 flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${type.color} flex items-center justify-center text-white font-bold`}>{type.name[0]}</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{type.name}</h1>
            <p className="text-xs text-muted-foreground">Enter your {type.length}-digit voucher pin</p>
          </div>
        </div>

        <div className="mt-8 relative">
          <Input
            placeholder={"•".repeat(type.length)}
            value={code} inputMode="numeric" maxLength={type.length}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="h-16 rounded-2xl text-lg tracking-[0.25em] pr-14 text-center font-mono"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-primary" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          {digits.length}/{type.length} digits · or tap the icon to scan
        </p>

        <Button
          size="lg" disabled={!valid} onClick={submit}
          className="mt-10 h-14 w-full rounded-2xl text-base shadow-button"
        >
          Redeem
        </Button>
      </div>
    </AppShell>
  );
}
