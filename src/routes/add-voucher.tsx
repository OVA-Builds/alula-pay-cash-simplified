import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ScanLine, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/AppShell";
import { StatusScreen } from "@/components/StatusScreen";
import { BufferScreen } from "@/components/BufferScreen";
import { BUFFER_MS, simulateOutcome } from "@/lib/buffer";
import { useApp, formatZAR, MIN_SEND } from "@/lib/app-state";

export const Route = createFileRoute("/add-voucher")({ component: AddVoucher });

type VoucherType = { id: "ott" | "blu" | "1voucher"; name: string; length: number; example: string; color: string };

const TYPES: VoucherType[] = [
  { id: "ott",      name: "OTT Voucher",  length: 12, example: "12-digit pin",  color: "bg-blue-500" },
  { id: "blu",      name: "Blu Voucher",  length: 16, example: "16-digit pin",  color: "bg-cyan-500" },
  { id: "1voucher", name: "1Voucher",     length: 16, example: "16-digit pin",  color: "bg-pink-500" },
];

function AddVoucher() {
  const navigate = useNavigate();
  const { addTransaction, adjustBalance, heldBalance, topUpHeldBalance } = useApp();
  const [type, setType] = useState<VoucherType | null>(null);
  const [code, setCode] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [stage, setStage] = useState<"processing" | "failed" | null>(null);
  // Set only when this voucher was applied against a held balance (see
  // topUpHeldBalance in app-state.tsx) rather than the spendable wallet —
  // drives the success screen's copy below.
  const [heldOutcome, setHeldOutcome] = useState<{ forced: boolean; combined: number } | null>(null);

  const digits = code.replace(/\D/g, "");
  const valid = type && digits.length === type.length;

  const submit = () => {
    if (!valid || !type) return;
    setStage("processing");
    setTimeout(() => {
      if (simulateOutcome() === "error") {
        setStage("failed");
        return;
      }
      // Mock: derive amount from voucher type for demo. Blu R10, OTT R200, 1Voucher R50.
      const amount = type.id === "ott" ? 200 : type.id === "blu" ? 10 : 50;
      // A held balance is money Alula Pay already set aside because it was too
      // small to send alone — a fresh voucher tops that up first, rather than
      // ever landing in the spendable wallet alongside it.
      if (heldBalance) {
        const result = topUpHeldBalance(amount);
        addTransaction({
          id: crypto.randomUUID(), type: "load", amount,
          label: `${type.name} added — held balance top-up`, status: "Completed", date: "Just now",
        });
        setHeldOutcome(result);
      } else {
        adjustBalance(amount);
        addTransaction({
          id: crypto.randomUUID(), type: "load", amount,
          label: `${type.name} added`, status: "Completed", date: "Just now",
        });
      }
      setStage(null);
      setDone(amount);
    }, BUFFER_MS);
  };

  if (stage === "processing") {
    return (
      <AppShell hideNav>
        <BufferScreen title="Loading your voucher…" description="This takes a few seconds." />
      </AppShell>
    );
  }

  if (stage === "failed") {
    return (
      <AppShell hideNav>
        <StatusScreen
          variant="error"
          title="Voucher didn't load"
          description="Something went wrong on our end. Double-check the pin and try again."
          buttonLabel="Try again"
          onButtonClick={() => setStage(null)}
        />
      </AppShell>
    );
  }

  if (done !== null) {
    const { title, description } = heldOutcome
      ? heldOutcome.forced
        ? {
            title: "Ready to send",
            description: `Your held balance now totals ${formatZAR(heldOutcome.combined)} — we'll take you straight to sending it out.`,
          }
        : {
            title: "Balance topped up",
            description: `${formatZAR(heldOutcome.combined)} held so far — still below our ${formatZAR(MIN_SEND)} minimum send. Add another voucher to send it out.`,
          }
      : { title: "Voucher added", description: `${formatZAR(done)} added to your wallet.` };
    return (
      <AppShell hideNav>
        <StatusScreen
          variant="success"
          title={title}
          description={description}
          buttonLabel="Done"
          onButtonClick={() => navigate({ to: "/home" })}
        />
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

          <div className="mt-6 space-y-3">
            {TYPES.map((t) => (
              <button
                key={t.id} onClick={() => setType(t)}
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
            autoFocus
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
          Add to wallet
        </Button>
      </div>
    </AppShell>
  );
}
