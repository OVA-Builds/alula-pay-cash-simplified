import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/send")({ component: Send });

const FEE = 17.5;

function Send() {
  const navigate = useNavigate();
  const { balance, addTransaction, adjustBalance } = useApp();
  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [acct, setAcct] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const amt = Number(amount) || 0;
  const total = amt + FEE;
  const canSubmit = acct.length >= 6 && name.length >= 2 && amt > 0 && total <= balance;

  const confirm = () => {
    adjustBalance(-total);
    addTransaction({
      id: crypto.randomUUID(),
      type: "transfer",
      amount: -total,
      label: `Sent to ${name}`,
      status: "Pending",
      date: "Just now",
    });
    setStep("done");
  };

  if (step === "done") {
    return (
      <AppShell hideNav>
        <div className="flex flex-col items-center justify-center min-h-screen sm:min-h-[860px] p-8 text-center">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-success/30 animate-ripple" />
            <div className="relative h-24 w-24 rounded-full bg-success flex items-center justify-center animate-tick-pop">
              <Check className="h-12 w-12 text-success-foreground" strokeWidth={3} />
            </div>
          </div>
          <h1 className="mt-8 text-2xl font-bold">Transfer sent</h1>
          <p className="mt-2 text-muted-foreground">{formatZAR(amt)} on its way to {name}.</p>
          <div className="mt-6 w-full rounded-2xl bg-card border border-border p-4 flex items-center gap-3 text-left">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Estimated settlement</p>
              <p className="text-xs text-muted-foreground">Within 60 seconds (PayShap-enabled banks)</p>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate({ to: "/home" })} className="mt-8 h-14 w-full rounded-2xl shadow-button">
            Back to home
          </Button>
        </div>
      </AppShell>
    );
  }

  if (step === "review") {
    return (
      <AppShell hideNav>
        <div className="p-6">
          <button onClick={() => setStep("form")} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Review transfer</h1>

          <div className="mt-6 bg-card rounded-2xl border border-border divide-y divide-border">
            <Row label="To" value={name} />
            <Row label="Account" value={acct} />
            <Row label="Amount" value={formatZAR(amt)} />
            <Row label="Fee" value={formatZAR(FEE)} muted />
            <Row label="Total" value={formatZAR(total)} bold />
          </div>

          <Button size="lg" onClick={confirm} className="mt-10 h-14 w-full rounded-2xl text-base shadow-button">
            Confirm Transfer
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
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Send to bank</h1>
        <p className="mt-2 text-muted-foreground text-sm">Available: {formatZAR(balance)}</p>

        <div className="mt-8 space-y-5">
          <Field id="acct" label="Bank account number" value={acct} onChange={(v) => setAcct(v.replace(/\D/g, ""))} placeholder="10-digit account" inputMode="numeric" />
          <Field id="name" label="Account holder name" value={name} onChange={setName} placeholder="e.g. Thandi Nkosi" />
          <Field id="amt" label="Amount (ZAR)" value={amount} onChange={(v) => setAmount(v.replace(/[^\d.]/g, ""))} placeholder="0.00" inputMode="decimal" />
        </div>

        <div className="mt-6 rounded-2xl bg-accent px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-accent-foreground">Transfer fee</span>
          <span className="text-sm font-semibold">{formatZAR(FEE)}</span>
        </div>

        <Button
          size="lg"
          disabled={!canSubmit}
          onClick={() => setStep("review")}
          className="mt-8 h-14 w-full rounded-2xl text-base shadow-button"
        >
          Continue
        </Button>
        {amt > 0 && total > balance && (
          <p className="mt-3 text-xs text-destructive text-center">Insufficient balance for this transfer.</p>
        )}
      </div>
    </AppShell>
  );
}

function Field({ id, label, value, onChange, placeholder, inputMode }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; inputMode?: "numeric" | "decimal" | "tel";
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 rounded-2xl text-base"
      />
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center p-4">
      <span className={`text-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold text-lg" : "font-medium"}`}>{value}</span>
    </div>
  );
}
