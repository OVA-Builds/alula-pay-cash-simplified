import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Search, Clock, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppShell } from "@/components/AppShell";
import { ApprovalPinDialog } from "@/components/ApprovalPinDialog";
import { useApp, formatZAR, calcTransferFee, railLabel, railSettleCopy } from "@/lib/app-state";
import { SA_BANKS, type Bank } from "@/lib/banks";
import { useRequireSubscription } from "@/hooks/use-require-subscription";
import voucherBlu from "@/assets/voucher-blu.jpg";
import voucherOtt from "@/assets/voucher-ott.png";
import voucher1Voucher from "@/assets/voucher-1voucher.png";

export const Route = createFileRoute("/send-once-off")({ component: OnceOff });

type Step = "bank" | "details" | "voucher" | "code" | "confirm" | "done";

type VoucherBrand = { id: "blu" | "1voucher" | "ott"; name: string; length: number; logo: string; amount: number };

// Mock: the value loaded from each voucher brand, matching the amounts used
// elsewhere in the demo (see redeem.tsx).
const VOUCHER_BRANDS: VoucherBrand[] = [
  { id: "blu", name: "Blu Voucher", length: 16, logo: voucherBlu, amount: 10 },
  { id: "1voucher", name: "1Voucher", length: 16, logo: voucher1Voucher, amount: 50 },
  { id: "ott", name: "OTT Voucher", length: 12, logo: voucherOtt, amount: 200 },
];

const initials = (name: string) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function OnceOff() {
  const navigate = useNavigate();
  const router = useRouter();
  const { plan, addBeneficiary, addTransaction } = useApp();
  const [step, setStep] = useState<Step>("bank");
  useRequireSubscription({ enabled: step !== "done" });

  const [bankQuery, setBankQuery] = useState("");
  const [bank, setBank] = useState<Bank | null>(null);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [reference, setReference] = useState("");
  const [save, setSave] = useState(false);
  const [brand, setBrand] = useState<VoucherBrand | null>(null);
  const [code, setCode] = useState("");
  const [pinOpen, setPinOpen] = useState(false);

  // Pro always sends instantly, Basic always via EFT — this flow never asks
  // the client to choose (see the confirm step below).
  const activeRail: "EFT" | "RTC" = plan === "pro" ? "RTC" : "EFT";

  const voucherAmount = brand?.amount ?? 0;
  const fee = voucherAmount > 0 ? calcTransferFee(voucherAmount, plan, activeRail) : null;
  const netToBank = Math.max(0, +(voucherAmount - (fee?.fee ?? 0)).toFixed(2));

  const banks = SA_BANKS.filter((b) => b.name.toLowerCase().includes(bankQuery.trim().toLowerCase()));
  const digits = code.replace(/\D/g, "");
  const validCode = !!brand && digits.length === brand.length;
  const detailsValid = name.trim().length >= 2 && account.length >= 6;

  const back = () => (router.history.canGoBack() ? router.history.back() : navigate({ to: "/home" }));

  const pickBank = (b: Bank) => { setBank(b); setStep("details"); };

  const submitVoucher = () => {
    if (!brand || !validCode) return;
    setStep("confirm");
  };

  const confirm = () => {
    if (!bank || !brand) return;
    if (save) addBeneficiary({ name, bank: bank.name, branch: bank.branch, account, reference });
    addTransaction({
      id: crypto.randomUUID(), type: "transfer", amount: -voucherAmount,
      label: `Sent to ${name}`,
      status: fee?.rail === "RTC" ? "Completed" : "Pending",
      date: "Just now",
      recipientName: name,
      bankName: bank.name,
      accountNumber: account,
      reference,
      sendAmount: netToBank,
      fee: fee?.fee ?? 0,
      rail: fee?.rail,
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
          <h1 className="mt-8 text-2xl font-bold">Sent</h1>
          <p className="mt-2 text-muted-foreground">{formatZAR(netToBank)} sent to {name}.</p>
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
          <button onClick={back} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Choose bank</h1>
          <p className="mt-2 text-muted-foreground text-sm">Swipe to browse, or search below.</p>

          <div className="mt-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={bankQuery} onChange={(e) => setBankQuery(e.target.value)} placeholder="Search bank" className="h-12 rounded-2xl pl-11" />
          </div>

          <div className="mt-6 -mx-6 flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2 pt-1 snap-x snap-mandatory">
            {banks.map((b) => (
              <button
                key={b.name}
                onClick={() => pickBank(b)}
                className="flex w-24 shrink-0 snap-center flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <span className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-white p-4 shadow-card">
                  {b.logo ? (
                    <img src={b.logo} alt={b.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className={`flex h-full w-full items-center justify-center rounded-2xl text-lg font-bold text-white ${b.color}`}>
                      {initials(b.name)}
                    </span>
                  )}
                </span>
                <span className="text-center text-[11px] font-semibold leading-tight">{b.name}</span>
              </button>
            ))}
            {banks.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No matches.</p>
            )}
          </div>

          <ul className="mt-4 bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {banks.map((b) => (
              <li key={b.name}>
                <button
                  onClick={() => pickBank(b)}
                  className="w-full flex items-center gap-3 p-4 active:bg-muted"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-1.5">
                    {b.logo ? (
                      <img src={b.logo} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className={`flex h-full w-full items-center justify-center rounded-lg text-[10px] font-bold text-white ${b.color}`}>
                        {initials(b.name)}
                      </span>
                    )}
                  </span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">Branch {b.branch}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
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
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Thandi Nkosi"
                className="mt-2 h-12 rounded-2xl" />
            </div>
            <div>
              <Label>Account number</Label>
              <Input value={account} inputMode="numeric" maxLength={14}
                onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit account" className="mt-2 h-12 rounded-2xl" />
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
              <Input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={20}
                placeholder="e.g. Rent" className="mt-2 h-12 rounded-2xl" />
            </div>
          </div>

          <label className="mt-5 flex items-center justify-between bg-card border border-border rounded-2xl p-4">
            <div>
              <p className="text-sm font-medium">Save as beneficiary</p>
              <p className="text-xs text-muted-foreground">Pay faster next time</p>
            </div>
            <Switch checked={save} onCheckedChange={setSave} />
          </label>

          <Button size="lg" disabled={!detailsValid} onClick={() => setStep("voucher")}
            className="mt-6 h-14 w-full rounded-2xl text-base shadow-button">
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
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/25 text-gold-foreground px-1.5 py-0.5 rounded-full">Pro only</span>
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

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={bold ? "font-bold text-base" : "font-medium"}>{value}</span>
    </div>
  );
}
