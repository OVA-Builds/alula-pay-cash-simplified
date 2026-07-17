import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/AppShell";
import { ApprovalPinDialog } from "@/components/ApprovalPinDialog";
import { useApp, formatZAR, calcTransferFee, railLabel, railSettleCopy, MIN_SEND } from "@/lib/app-state";

export const Route = createFileRoute("/pay-beneficiary/$id")({ component: PayBeneficiary });

function PayBeneficiary() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const { beneficiaries, balance, plan, addTransaction, adjustBalance } = useApp();
  const bene = beneficiaries.find((b) => b.id === id);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState(bene?.reference ?? "");
  const [pinOpen, setPinOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (!bene) {
    return (
      <AppShell hideNav>
        <div className="p-6">
          <p>Beneficiary not found.</p>
          <Button onClick={() => navigate({ to: "/beneficiaries" })} className="mt-4">Back</Button>
        </div>
      </AppShell>
    );
  }

  const amt = Number(amount) || 0;
  const fee = amt > 0 ? calcTransferFee(amt, plan) : null;
  const total = amt + (fee?.fee ?? 0);
  const newBalance = balance - total;
  const canPay = amt >= MIN_SEND && total <= balance;

  const confirm = () => {
    adjustBalance(-total);
    addTransaction({
      id: crypto.randomUUID(), type: "transfer", amount: -total,
      label: `Sent to ${bene.name}`,
      status: fee?.rail === "RTC" ? "Completed" : "Pending",
      date: "Just now",
    });
    setDone(true);
  };

  if (done) {
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
          <p className="mt-2 text-muted-foreground">{formatZAR(amt)} sent to {bene.name}.</p>
          <div className="mt-6 w-full rounded-2xl bg-card border border-border p-4 flex items-center gap-3 text-left">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{fee ? railSettleCopy(fee.rail) : ""}</p>
              <p className="text-xs text-muted-foreground">{fee ? railLabel(fee.rail) : ""} · {bene.bank}</p>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate({ to: "/home" })} className="mt-8 h-14 w-full rounded-2xl shadow-button">
            Back to home
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6">
        <button onClick={() => navigate({ to: "/beneficiaries" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-brand text-white font-semibold flex items-center justify-center text-lg">
            {bene.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{bene.name}</h1>
            <p className="text-xs text-muted-foreground">Saved beneficiary</p>
          </div>
        </div>

        <div className="mt-6 bg-muted/50 rounded-2xl p-4 space-y-2 border border-border">
          <Greyed label="Bank" value={bene.bank} />
          <Greyed label="Branch" value={bene.branch} />
          <Greyed label="Account" value={bene.account} />
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="amt">Amount (ZAR)</Label>
            <Input id="amt" inputMode="decimal" placeholder="0.00" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="mt-2 h-14 rounded-2xl text-xl font-semibold" autoFocus />
          </div>
          <div>
            <Label htmlFor="ref">Reference</Label>
            <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)}
              className="mt-2 h-12 rounded-2xl" maxLength={20} />
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

        {amt > 0 && amt < MIN_SEND && (
          <p className="mt-3 text-xs text-destructive text-center">Minimum send amount is {formatZAR(MIN_SEND)}.</p>
        )}
        {amt >= MIN_SEND && total > balance && (
          <p className="mt-3 text-xs text-destructive text-center">Insufficient balance for this transfer.</p>
        )}

        <Button size="lg" disabled={!canPay} onClick={() => setPinOpen(true)}
          className="mt-8 h-14 w-full rounded-2xl text-base shadow-button">
          Pay {amt > 0 ? formatZAR(amt) : ""}
        </Button>
      </div>

      <ApprovalPinDialog open={pinOpen} onOpenChange={setPinOpen} onApprove={confirm} />
    </AppShell>
  );
}

function Greyed({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-muted-foreground/80">{value}</span>
    </div>
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
