import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Clock, Zap, Lock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/AppShell";
import { ApprovalPinDialog } from "@/components/ApprovalPinDialog";
import { SendCelebration, type CelebrationInfo } from "@/components/SendCelebration";
import { StatusScreen } from "@/components/StatusScreen";
import { BufferScreen } from "@/components/BufferScreen";
import { payments, vouchers } from "@/lib/api";
import { useApp, formatZAR, calcTransferFee, railLabel, railSettleCopy, MIN_SEND } from "@/lib/app-state";
import { useRequireSubscription } from "@/hooks/use-require-subscription";
import { BILLERS } from "@/lib/billers";
import voucherBlu from "@/assets/voucher-blu.jpg";
import voucherOtt from "@/assets/voucher-ott.png";
import voucher1Voucher from "@/assets/voucher-1voucher.png";

export const Route = createFileRoute("/pay-bills/$id")({ component: PayBill });

type Step = "voucher" | "code" | "confirm" | "processing" | "done" | "failed";

type VoucherBrand = { id: "blu" | "1voucher" | "ott"; name: string; length: number; logo: string; amount: number };

// Mock: the value loaded from each voucher brand, matching the amounts used
// everywhere else vouchers are redeemed in the demo.
const VOUCHER_BRANDS: VoucherBrand[] = [
  { id: "blu", name: "Blu Voucher", length: 16, logo: voucherBlu, amount: 10 },
  { id: "1voucher", name: "1Voucher", length: 16, logo: voucher1Voucher, amount: 50 },
  { id: "ott", name: "OTT Voucher", length: 12, logo: voucherOtt, amount: 200 },
];

function PayBill() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const { plan, addTransaction, transactions, challenge, topUpHeldBalance } = useApp();
  const biller = BILLERS.find((b) => b.id === id);

  const [step, setStep] = useState<Step>("voucher");
  useRequireSubscription({ enabled: step !== "done" && step !== "processing" && step !== "failed" });
  const [celebration, setCelebration] = useState<CelebrationInfo>({ firstSend: false, struckDay: null, challengeDays: null });

  // Suppliers have no saved reference — the client always types their own
  // (account number, full name, initials) fresh at payment time.
  const [reference, setReference] = useState("");
  const [refError, setRefError] = useState(false);
  const [brand, setBrand] = useState<VoucherBrand | null>(null);
  const [code, setCode] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  // Set only when a voucher used here was too small to pay on its own (see
  // topUpHeldBalance) and got held instead — a voucher below MIN_SEND never
  // funds a payment directly. Drives the "held" wording on the done screen.
  const [heldOutcome, setHeldOutcome] = useState<{ forced: boolean; combined: number } | null>(null);
  // Where "Try again" on the failed screen sends the user back to, and what
  // the buffer's copy should say — voucher redemption and the bank payout
  // are two different steps that can each independently be in flight/fail.
  const [retryStep, setRetryStep] = useState<Step>("code");
  const [processingKind, setProcessingKind] = useState<"voucher" | "payout">("voucher");

  // Pro always sends instantly, Basic always via EFT — this flow never asks
  // the client to choose (see the confirm step below).
  const activeRail: "EFT" | "RTC" = plan === "pro" ? "RTC" : "EFT";

  const voucherAmount = brand?.amount ?? 0;
  const fee = voucherAmount > 0 ? calcTransferFee(voucherAmount, plan, activeRail) : null;
  const netToBank = Math.max(0, +(voucherAmount - (fee?.fee ?? 0)).toFixed(2));

  const digits = code.replace(/\D/g, "");
  const validCode = !!brand && digits.length === brand.length;

  if (!biller) {
    return (
      <AppShell hideNav>
        <div className="p-6">
          <p>Supplier not found.</p>
          <Button onClick={() => navigate({ to: "/pay-bills" })} className="mt-4">Back</Button>
        </div>
      </AppShell>
    );
  }

  const submitVoucher = async () => {
    if (!brand || !validCode) return;
    const usedBrand = brand;
    setProcessingKind("voucher");
    setStep("processing");
    const result = await vouchers.redeemVoucher(usedBrand.id, code, usedBrand.amount);
    if (!result.ok) {
      setRetryStep("code");
      setStep("failed");
      return;
    }
    // A voucher below the R20 minimum can never fund a payment on its own —
    // hold it instead of letting a sub-minimum amount through to a payout.
    if (result.data.amountRand < MIN_SEND) {
      const held = topUpHeldBalance(result.data.amountRand);
      addTransaction({
        id: crypto.randomUUID(), type: "load", amount: result.data.amountRand,
        label: `${usedBrand.name} added — held balance top-up`, status: "Completed", date: "Just now",
      });
      setHeldOutcome(held);
      setBrand(null);
      setCode("");
      setStep("done");
      return;
    }
    setStep("confirm");
  };

  const confirm = async () => {
    if (!brand) return;
    setProcessingKind("payout");
    setStep("processing");
    const result = await payments.sendPayout({
      amountRand: netToBank,
      bankName: biller.bank,
      branchCode: biller.branch,
      accountNumber: biller.account,
      recipientName: biller.name,
      reference,
      rail: fee?.rail ?? "EFT",
    });
    if (!result.ok) {
      setRetryStep("confirm");
      setStep("failed");
      return;
    }
    const firstSend = !transactions.some((t) => t.type === "transfer");
    let struckDay: number | null = null;
    if (challenge) {
      const dayIndex = Math.floor((Date.now() - challenge.startedAt) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < challenge.days && !challenge.struck[dayIndex]) struckDay = dayIndex + 1;
    }
    addTransaction({
      id: crypto.randomUUID(), type: "transfer", amount: -voucherAmount,
      label: `Paid ${biller.name}`,
      status: fee?.rail === "RTC" ? "Completed" : "Pending",
      date: "Just now",
      recipientName: biller.name,
      bankName: biller.bank,
      accountNumber: biller.account,
      reference,
      sendAmount: netToBank,
      fee: fee?.fee ?? 0,
      rail: fee?.rail,
    });
    setCelebration({ firstSend, struckDay, challengeDays: challenge?.days ?? null });
    setStep("done");
  };

  if (step === "processing") {
    return (
      <AppShell hideNav>
        <BufferScreen
          title={processingKind === "voucher" ? "Loading your voucher…" : "Sending your payment…"}
          description="This takes a few seconds."
        />
      </AppShell>
    );
  }

  if (step === "failed") {
    return (
      <AppShell hideNav>
        <StatusScreen
          variant="error"
          title={retryStep === "code" ? "Voucher didn't load" : "Payment didn't go through"}
          description={
            retryStep === "code"
              ? "This voucher couldn't be validated. Double-check the pin and try again."
              : "Something went wrong on our end. Your voucher hasn't been used — please try again."
          }
          buttonLabel="Try again"
          onButtonClick={() => setStep(retryStep)}
        />
      </AppShell>
    );
  }

  if (step === "done") {
    const heldTitle = heldOutcome?.forced ? "Ready to send" : "Balance topped up";
    const heldDescription = heldOutcome?.forced
      ? `Your held balance now totals ${formatZAR(heldOutcome.combined)} — we'll take you straight to sending it out.`
      : `${formatZAR(heldOutcome?.combined ?? 0)} held so far — still below our ${formatZAR(MIN_SEND)} minimum send. Add another voucher to send it out.`;
    return (
      <AppShell hideNav>
        <StatusScreen
          variant="success"
          title={heldOutcome ? heldTitle : "Paid"}
          description={heldOutcome ? heldDescription : `${formatZAR(netToBank)} paid to ${biller.name}.`}
          buttonLabel="Back to home"
          onButtonClick={() => navigate({ to: "/home" })}
        >
          {!heldOutcome && (
            <div className="mt-4 w-full rounded-2xl bg-muted p-4 flex items-center gap-3 text-left">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{fee ? railSettleCopy(fee.rail) : ""}</p>
                <p className="text-xs text-muted-foreground">{fee ? railLabel(fee.rail) : ""} · {biller.bank}</p>
              </div>
            </div>
          )}
          {!heldOutcome && <SendCelebration info={celebration} />}
        </StatusScreen>
      </AppShell>
    );
  }

  if (step === "voucher") {
    return (
      <AppShell>
        <div className="p-6">
          <button onClick={() => navigate({ to: "/pay-bills" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-wallet text-white flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight truncate">{biller.name}</h1>
              <p className="text-xs text-muted-foreground">{biller.bank} · •••{biller.account.slice(-4)}</p>
            </div>
          </div>

          <h2 className="mt-8 text-xl font-bold tracking-tight">Pay with a voucher</h2>
          <p className="mt-2 text-muted-foreground text-sm">Choose the brand printed on your voucher slip.</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {VOUCHER_BRANDS.map((v) => (
              <button
                key={v.id}
                onClick={() => { setBrand(v); setStep("code"); }}
                className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card p-3 shadow-card active:scale-[0.97]"
              >
                <span className="flex h-14 w-full items-center justify-center rounded-2xl bg-white p-2">
                  <img src={v.logo} alt={v.name} className="h-full w-full object-contain" />
                </span>
                <span className="text-center text-[11px] font-semibold leading-tight">{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (step === "code" && brand) {
    return (
      <AppShell>
        <div className="p-6">
          <button onClick={() => setStep("voucher")} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-card">
              <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{brand.name}</h1>
              <p className="text-xs text-muted-foreground">Enter your {brand.length}-digit voucher pin</p>
            </div>
          </div>

          <Input
            placeholder={"•".repeat(brand.length)}
            value={code}
            inputMode="numeric"
            maxLength={brand.length}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="mt-6 h-16 rounded-2xl text-center font-mono text-lg tracking-[0.25em]"
            autoFocus
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">{digits.length}/{brand.length} digits</p>

          <Button
            size="lg" disabled={!validCode} onClick={submitVoucher}
            className="mt-6 h-14 w-full rounded-2xl text-base shadow-button"
          >
            Confirm voucher
          </Button>
        </div>
      </AppShell>
    );
  }

  // confirm
  return (
    <AppShell>
      <div className="p-6">
        <button onClick={() => setStep("code")} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Confirm payment</h1>

        <div className="mt-5 rounded-2xl bg-card border border-border p-4 space-y-2">
          <Row label="Supplier" value={biller.name} muted />
          <Row label="Bank" value={biller.bank} muted />
          <Row label="Branch code" value={biller.branch} muted />
          <Row label="Account" value={biller.account} muted />
        </div>

        <div className="mt-4">
          <Label>Reference (shown on your statement)</Label>
          <Input
            value={reference}
            onChange={(e) => { setReference(e.target.value); if (e.target.value.trim()) setRefError(false); }}
            maxLength={20}
            autoFocus
            className={`mt-2 h-12 rounded-2xl ${refError ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {refError && <p className="mt-1.5 text-xs text-destructive">Reference is required.</p>}
        </div>

        <div className="mt-5">
          {plan === "pro" ? (
            <div className="rounded-2xl border border-primary bg-primary/5 p-4 flex items-center gap-3 shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold flex items-center gap-2">
                  Immediate payment
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">Pro</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Lands within 10 minutes</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">How should it be sent?</p>
              <div className="rounded-2xl border border-primary bg-primary/5 p-4 flex items-center gap-3 shadow-soft">
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Basic EFT</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Lands in 1–2 working days</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 opacity-50">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    Immediate payment
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gold text-gold-foreground px-1.5 py-0.5 rounded-full">Pro only</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Pro to send immediately</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {fee && (
          <div className="mt-5 rounded-2xl bg-card border border-border p-4 space-y-2 animate-float-up">
            <Row label="Voucher value" value={formatZAR(voucherAmount)} muted />
            <Row label={`Fee (${railLabel(fee.rail)})`} value={`-${formatZAR(fee.fee)}`} muted />
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Sent to their bank account</span>
              <span className="text-base font-bold">{formatZAR(netToBank)}</span>
            </div>
          </div>
        )}

        <Button
          size="lg"
          onClick={() => { if (!reference.trim()) { setRefError(true); return; } setPinOpen(true); }}
          className="mt-6 h-14 w-full rounded-2xl text-base shadow-button"
        >
          Pay {formatZAR(netToBank)}
        </Button>
      </div>

      <ApprovalPinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onApprove={confirm}
        summary={{ recipient: biller.name, amount: voucherAmount, fee: fee?.fee ?? 0, total: netToBank }}
      />
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
