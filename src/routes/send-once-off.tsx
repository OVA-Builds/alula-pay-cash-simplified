import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Search, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppShell } from "@/components/AppShell";
import { ApprovalPinDialog } from "@/components/ApprovalPinDialog";
import { useApp, formatZAR, calcTransferFee, railLabel, railSettleCopy, MIN_SEND } from "@/lib/app-state";
import { SA_BANKS, type Bank } from "@/lib/banks";

export const Route = createFileRoute("/send-once-off")({ component: OnceOff });

type Step = "bank" | "details" | "done";

function OnceOff() {
  const navigate = useNavigate();
  const { balance, plan, addBeneficiary, addTransaction, adjustBalance } = useApp();
  const [step, setStep] = useState<Step>("bank");
  const [bankQuery, setBankQuery] = useState("");
  const [bank, setBank] = useState<Bank | null>(null);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [save, setSave] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const amt = Number(amount) || 0;
  const fee = amt > 0 ? calcTransferFee(amt, plan) : null;
  const total = amt + (fee?.fee ?? 0);
  const newBalance = balance - total;
  const canPay = !!bank && name.trim().length >= 2 && account.length >= 6 && amt > 0 && total <= balance;

  const banks = SA_BANKS.filter((b) => b.name.toLowerCase().includes(bankQuery.trim().toLowerCase()));

  const confirm = () => {
    if (!bank) return;
    if (save) addBeneficiary({ name, bank: bank.name, branch: bank.branch, account, reference });
    adjustBalance(-total);
    addTransaction({
      id: crypto.randomUUID(), type: "transfer", amount: -total,
      label: `Sent to ${name}`,
      status: fee?.rail === "RTC" ? "Completed" : "Pending",
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
          <h1 className="mt-8 text-2xl font-bold">Paid</h1>
          <p className="mt-2 text-muted-foreground">{formatZAR(amt)} sent to {name}.</p>
          <div className="mt-6 w-full rounded-2xl bg-card border border-border p-4 flex items-center gap-3 text-left">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{fee ? railSettleCopy(fee.rail) : ""}</p>
              <p className="text-xs text-muted-foreground">{fee ? railLabel(fee.rail) : ""} · {bank?.name}</p>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate({ to: "/home" })} className="mt-8 h-14 w-full rounded-2xl shadow-button">
            Back to home
          </Button>
        </div>
      </AppShell>
    );
  }

  if (step === "bank") {
    return (
      <AppShell>
        <div className="p-6">
          <button onClick={() => navigate({ to: "/send" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Choose bank</h1>
          <p className="mt-2 text-muted-foreground text-sm">South African banks supported.</p>

          <div className="mt-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={bankQuery} onChange={(e) => setBankQuery(e.target.value)} placeholder="Search bank" className="h-12 rounded-2xl pl-11" />
          </div>

          <ul className="mt-4 bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {banks.map((b) => (
              <li key={b.name}>
                <button
                  onClick={() => { setBank(b); setStep("details"); }}
                  className="w-full flex items-center justify-between p-4 active:bg-muted"
                >
                  <div className="text-left">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">Branch {b.branch}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6">
        <button onClick={() => setStep("bank")} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Payment details</h1>
        <p className="mt-2 text-muted-foreground text-sm">{bank?.name}</p>

        <div className="mt-6 space-y-4">
          <div>
            <Label>Account holder name & surname</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Thandi Nkosi"
              className="mt-2 h-12 rounded-2xl" />
          </div>
          <div>
            <Label>Account number</Label>
            <Input value={account} inputMode="numeric" maxLength={14}
              onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit account" className="mt-2 h-12 rounded-2xl" />
          </div>
          <div>
            <Label>Branch number</Label>
            <Input value={bank?.branch ?? ""} readOnly disabled className="mt-2 h-12 rounded-2xl bg-muted text-muted-foreground" />
          </div>
          <div>
            <Label>Reference (shown on their statement)</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={20}
              placeholder="e.g. Rent" className="mt-2 h-12 rounded-2xl" />
          </div>
          <div>
            <Label>Amount (ZAR)</Label>
            <Input value={amount} inputMode="decimal" placeholder="0.00"
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="mt-2 h-14 rounded-2xl text-xl font-semibold" />
          </div>
        </div>

        {amt > 0 && fee && (
          <div className="mt-5 rounded-2xl bg-card border border-border p-4 space-y-2 animate-float-up">
            <Row label={`Fee (${railLabel(fee.rail)})`} value={formatZAR(fee.fee)} muted />
            <Row label="Total" value={formatZAR(total)} bold />
            <div className="border-t border-border pt-2 mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">New balance after payment</span>
              <span className={`font-bold ${newBalance < 0 ? "text-destructive" : "text-foreground"}`}>{formatZAR(Math.max(0, newBalance))}</span>
            </div>
          </div>
        )}

        <label className="mt-5 flex items-center justify-between bg-card border border-border rounded-2xl p-4">
          <div>
            <p className="text-sm font-medium">Save as beneficiary</p>
            <p className="text-xs text-muted-foreground">Pay faster next time</p>
          </div>
          <Switch checked={save} onCheckedChange={setSave} />
        </label>

        {amt > 0 && total > balance && (
          <p className="mt-3 text-xs text-destructive text-center">Insufficient balance for this transfer.</p>
        )}

        <Button size="lg" disabled={!canPay} onClick={() => setPinOpen(true)}
          className="mt-6 h-14 w-full rounded-2xl text-base shadow-button">
          Pay {amt > 0 ? formatZAR(amt) : ""}
        </Button>
      </div>

      <ApprovalPinDialog open={pinOpen} onOpenChange={setPinOpen} onApprove={confirm} />
    </AppShell>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={bold ? "font-bold text-base" : "font-medium"}>{value}</span>
    </div>
  );
}
