import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Clock, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppShell } from "@/components/AppShell";
import { ApprovalPinDialog } from "@/components/ApprovalPinDialog";
import { SendCelebration, type CelebrationInfo } from "@/components/SendCelebration";
import { StatusScreen } from "@/components/StatusScreen";
import { BufferScreen } from "@/components/BufferScreen";
import { payments, vouchers } from "@/lib/api";
import { useApp, formatZAR, calcTransferFee, railLabel, railSettleCopy, MIN_SEND } from "@/lib/app-state";
import { SA_BANKS, type Bank } from "@/lib/banks";
import { fixShoutyCase } from "@/lib/utils";
import { useRequireSubscription } from "@/hooks/use-require-subscription";
import voucherBlu from "@/assets/voucher-blu.jpg";
import voucherOtt from "@/assets/voucher-ott.png";
import voucher1Voucher from "@/assets/voucher-1voucher.png";

export const Route = createFileRoute("/send-once-off")({
  component: OnceOff,
  // A preset amount arrives when this flow is opened to clear a mandatory
  // forced send (see home.tsx) — the client never loads a voucher for it,
  // so the voucher/code steps are skipped entirely.
  validateSearch: (search: Record<string, unknown>): { presetAmount?: number } => ({
    presetAmount: typeof search.presetAmount === "number" && search.presetAmount > 0 ? search.presetAmount : undefined,
  }),
});

type Step = "bank" | "details" | "voucher" | "code" | "confirm" | "processing" | "done" | "failed";

type VoucherBrand = { id: "blu" | "1voucher" | "ott"; name: string; length: number; logo: string; amount: number };

// Mock: the value loaded from each voucher brand, matching the amounts used
// everywhere else vouchers are redeemed in the demo.
const VOUCHER_BRANDS: VoucherBrand[] = [
  { id: "blu", name: "Blu Voucher", length: 16, logo: voucherBlu, amount: 10 },
  { id: "1voucher", name: "1Voucher", length: 16, logo: voucher1Voucher, amount: 50 },
  { id: "ott", name: "OTT Voucher", length: 12, logo: voucherOtt, amount: 200 },
];

const initials = (name: string) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function OnceOff() {
  const navigate = useNavigate();
  const router = useRouter();
  const { presetAmount } = Route.useSearch();
  const { plan, addBeneficiary, addTransaction, transactions, challenge, clearPendingForcedSend, topUpHeldBalance } = useApp();
  const [step, setStep] = useState<Step>("bank");
  useRequireSubscription({ enabled: step !== "done" && step !== "processing" && step !== "failed" });
  const [celebration, setCelebration] = useState<CelebrationInfo>({ firstSend: false, struckDay: null, challengeDays: null });

  const [bank, setBank] = useState<Bank | null>(null);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [reference, setReference] = useState("");
  const [refError, setRefError] = useState(false);
  const [save, setSave] = useState(false);
  const [brand, setBrand] = useState<VoucherBrand | null>(null);
  const [code, setCode] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  // Set only when a voucher used here was too small to send on its own (see
  // topUpHeldBalance) and got held instead — a voucher below MIN_SEND never
  // funds a send directly. Drives the "held" wording on the done screen.
  const [heldOutcome, setHeldOutcome] = useState<{ forced: boolean; combined: number } | null>(null);
  // Where "Try again" on the failed screen sends the user back to, and what
  // the buffer's copy should say — voucher redemption and the bank payout
  // are two different steps that can each independently be in flight/fail.
  const [retryStep, setRetryStep] = useState<Step>("code");
  const [processingKind, setProcessingKind] = useState<"voucher" | "payout">("voucher");

  // Pro always sends instantly, Basic always via EFT — this flow never asks
  // the client to choose (see the confirm step below).
  const activeRail: "EFT" | "RTC" = plan === "pro" ? "RTC" : "EFT";

  const voucherAmount = presetAmount ?? brand?.amount ?? 0;
  const fee = voucherAmount > 0 ? calcTransferFee(voucherAmount, plan, activeRail) : null;
  const netToBank = Math.max(0, +(voucherAmount - (fee?.fee ?? 0)).toFixed(2));

  const digits = code.replace(/\D/g, "");
  const validCode = !!brand && digits.length === brand.length;
  const detailsValid = name.trim().length >= 2 && account.length === (bank?.accountLength ?? 0);

  const back = () => (router.history.canGoBack() ? router.history.back() : navigate({ to: "/home" }));

  const pickBank = (b: Bank) => { setBank(b); setStep("details"); };

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
    // A voucher below the R20 minimum can never fund a send on its own —
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
    if (!bank || (!brand && !presetAmount)) return;
    setProcessingKind("payout");
    setStep("processing");
    const cleanName = fixShoutyCase(name);
    const result = await payments.sendPayout({
      amountRand: netToBank,
      bankName: bank.name,
      branchCode: bank.branch,
      accountNumber: account,
      recipientName: cleanName,
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
    if (save) addBeneficiary({ name: cleanName, bank: bank.name, branch: bank.branch, account, reference });
    addTransaction({
      id: crypto.randomUUID(), type: "transfer", amount: -voucherAmount,
      label: `Sent to ${cleanName}`,
      status: fee?.rail === "RTC" ? "Completed" : "Pending",
      date: "Just now",
      recipientName: cleanName,
      bankName: bank.name,
      accountNumber: account,
      reference,
      sendAmount: netToBank,
      fee: fee?.fee ?? 0,
      rail: fee?.rail,
    });
    if (presetAmount) clearPendingForcedSend();
    setCelebration({ firstSend, struckDay, challengeDays: challenge?.days ?? null });
    setStep("done");
  };

  if (step === "processing") {
    return (
      <AppShell hideNav>
        <BufferScreen
          title={processingKind === "voucher" ? "Loading your voucher…" : "Sending your money…"}
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
          title={retryStep === "code" ? "Voucher didn't load" : "Send didn't go through"}
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
          title={heldOutcome ? heldTitle : "Sent"}
          description={heldOutcome ? heldDescription : `${formatZAR(netToBank)} sent to ${name}.`}
          buttonLabel="Back to home"
          onButtonClick={() => navigate({ to: "/home" })}
        >
          {!heldOutcome && (
            <div className="mt-4 w-full rounded-2xl bg-muted p-4 flex items-center gap-3 text-left">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{fee ? railSettleCopy(fee.rail) : ""}</p>
                <p className="text-xs text-muted-foreground">{fee ? railLabel(fee.rail) : ""} · {bank?.name}</p>
              </div>
            </div>
          )}
          {!heldOutcome && <SendCelebration info={celebration} />}
        </StatusScreen>
      </AppShell>
    );
  }

  if (step === "bank") {
    return (
      <AppShell>
        <div className="flex min-h-[calc(100dvh-80px)] flex-col p-6 sm:min-h-[780px]">
          <button onClick={back} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-1 flex-col items-center justify-center">
            <h1 className="text-2xl font-bold tracking-tight">Choose bank</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">Slide to find your bank, then tap it.</p>
            <BankCarousel banks={SA_BANKS} onPick={pickBank} />
          </div>
        </div>
      </AppShell>
    );
  }

  if (step === "details") {
    return (
      <AppShell>
        <div className="p-6">
          <button onClick={() => setStep("bank")} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white p-2 shadow-card">
              {bank?.logo ? (
                <img src={bank.logo} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className={`flex h-full w-full items-center justify-center rounded-xl text-xs font-bold text-white ${bank?.color}`}>
                  {bank ? initials(bank.name) : ""}
                </span>
              )}
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Recipient details</h1>
              <p className="text-xs text-muted-foreground">{bank?.name}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label>Name and surname</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setName(fixShoutyCase(name))}
                className="mt-2 h-12 rounded-2xl" autoFocus />
            </div>
            <div>
              <Label>Account number</Label>
              <Input value={account} inputMode="numeric" maxLength={20}
                onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, bank?.accountLength ?? 11))}
                className="mt-2 h-12 rounded-2xl" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {account.length}/{bank?.accountLength ?? 11} digits
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bank name</Label>
                <Input value={bank?.name ?? ""} readOnly disabled className="mt-2 h-12 rounded-2xl bg-muted text-muted-foreground" />
              </div>
              <div>
                <Label>Branch code</Label>
                <Input value={bank?.branch ?? ""} readOnly disabled className="mt-2 h-12 rounded-2xl bg-muted text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label>Reference (shown on their statement)</Label>
              <Input
                value={reference}
                onChange={(e) => { setReference(e.target.value); if (e.target.value.trim()) setRefError(false); }}
                maxLength={20}
                className={`mt-2 h-12 rounded-2xl ${refError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {refError && <p className="mt-1.5 text-xs text-destructive">Reference is required.</p>}
            </div>
          </div>

          <label className="mt-5 flex items-center justify-between bg-card border border-border rounded-2xl p-4">
            <div>
              <p className="text-sm font-medium">Save as beneficiary</p>
              <p className="text-xs text-muted-foreground">Pay faster next time</p>
            </div>
            <Switch checked={save} onCheckedChange={setSave} />
          </label>

          <Button
            size="lg"
            disabled={!detailsValid}
            onClick={() => { if (!reference.trim()) { setRefError(true); return; } setStep(presetAmount ? "confirm" : "voucher"); }}
            className="mt-6 h-14 w-full rounded-2xl text-base shadow-button"
          >
            Continue
          </Button>
        </div>
      </AppShell>
    );
  }

  if (step === "voucher") {
    return (
      <AppShell>
        <div className="p-6">
          <button onClick={() => setStep("details")} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Pay with a voucher</h1>
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
        <button onClick={() => setStep(presetAmount ? "details" : "code")} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Confirm payment</h1>

        <div className="mt-5 rounded-2xl bg-card border border-border p-4 space-y-2">
          <Row label="Name" value={name} muted />
          <Row label="Bank" value={bank?.name ?? ""} muted />
          <Row label="Branch code" value={bank?.branch ?? ""} muted />
          <Row label="Account" value={account} muted />
          {reference && <Row label="Reference" value={reference} muted />}
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
            <Row label={presetAmount ? "Amount" : "Voucher value"} value={formatZAR(voucherAmount)} muted />
            <Row label={`Fee (${railLabel(fee.rail)})`} value={`-${formatZAR(fee.fee)}`} muted />
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Sent to their bank account</span>
              <span className="text-base font-bold">{formatZAR(netToBank)}</span>
            </div>
          </div>
        )}

        <Button size="lg" onClick={() => setPinOpen(true)}
          className="mt-6 h-14 w-full rounded-2xl text-base shadow-button">
          Pay {formatZAR(netToBank)}
        </Button>
      </div>

      <ApprovalPinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onApprove={confirm}
        summary={{ recipient: name, amount: voucherAmount, fee: fee?.fee ?? 0, total: netToBank }}
      />
    </AppShell>
  );
}

const CARD = 152;
const GAP = 20;
const STRIDE = CARD + GAP;

function BankCarousel({ banks, onPick }: { banks: Bank[]; onPick: (b: Bank) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(0);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / STRIDE);
    setCenterIndex(Math.max(0, Math.min(banks.length - 1, idx)));
  };

  const centered = banks[centerIndex];

  return (
    <div className="w-full">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4"
        style={{ paddingLeft: `calc(50% - ${CARD / 2}px)`, paddingRight: `calc(50% - ${CARD / 2}px)` }}
      >
        {banks.map((b, i) => {
          const active = i === centerIndex;
          return (
            <button
              key={b.name}
              onClick={() => onPick(b)}
              style={{ width: CARD, height: CARD }}
              className={`flex shrink-0 snap-center items-center justify-center rounded-3xl border bg-white p-4 shadow-card transition-all duration-300 ${
                active ? "scale-100 opacity-100 border-primary" : "scale-[0.8] opacity-45 border-border"
              }`}
            >
              {b.logo ? (
                <img src={b.logo} alt={b.name} className="h-full w-full object-contain" />
              ) : (
                <span className={`flex h-full w-full items-center justify-center rounded-2xl text-2xl font-bold text-white ${b.color}`}>
                  {initials(b.name)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 text-center">
        <p className="text-lg font-bold tracking-tight">{centered?.name}</p>
        <p className="text-xs text-muted-foreground">Branch {centered?.branch}</p>
      </div>

      <Button
        size="lg"
        onClick={() => centered && onPick(centered)}
        className="mt-6 h-14 w-full rounded-2xl text-base shadow-button"
      >
        Choose this bank
      </Button>
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
