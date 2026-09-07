import { useEffect, useMemo, useState } from "react";
import { ChevronRight, X, Ticket, Search, Check, Clock } from "lucide-react";
import logo from "@/assets/alula-logo.png";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApprovalPinDialog } from "@/components/ApprovalPinDialog";
import { RailToggle } from "@/components/RailToggle";
import { SA_BANKS, type Bank } from "@/lib/banks";
import {
  useApp,
  formatZAR,
  calcTransferFee,
  railLabel,
  railSettleCopy,
  type Beneficiary,
} from "@/lib/app-state";

const VOUCHERS = [
  { id: "1voucher", name: "1Voucher", hint: "16-digit pin", length: 16 },
  { id: "blu", name: "Blu Voucher", hint: "16-digit pin", length: 16 },
  { id: "ott", name: "OTT Voucher", hint: "12-digit pin", length: 12 },
] as const;

type Voucher = (typeof VOUCHERS)[number];

// Voucher value is "auto-detected" on verification (demo: derived from the pin).
const AMOUNTS = [50, 100, 150, 200, 250, 300, 500, 750, 1000, 1500];
const detectAmount = (code: string) => {
  const digits = code.replace(/\D/g, "");
  const last = Number(digits.slice(-1) || "0");
  return AMOUNTS[last % AMOUNTS.length];
};

export function AlulaLoader() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-40 w-40 rounded-full bg-gold/25 animate-ripple" />
        <span className="absolute h-40 w-40 rounded-full bg-gold/20 animate-ripple" style={{ animationDelay: "0.6s" }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-gold/90 animate-orbit"
            style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${5 + i * 0.6}s` }}
          />
        ))}
        <div className="animate-logo-glow relative">
          <img src={logo} alt="Alula Pay" className="relative z-10 h-28 w-28 drop-shadow-xl" />
        </div>
      </div>
    </div>
  );
}

function Sheet({
  children,
  onCancel,
  cancelLabel = "Cancel",
  stepKey,
}: {
  children: React.ReactNode;
  onCancel: () => void;
  cancelLabel?: string;
  stepKey: string;
}) {
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={onCancel} />
      <div className="relative w-full sm:max-w-[420px] px-6 pb-24 max-h-full overflow-y-auto">
        <div key={stepKey} className="bg-card rounded-[1.75rem] border border-border p-5 shadow-3d animate-float-up">
          {children}
        </div>
        <button
          onClick={onCancel}
          className="mt-3 mb-2 w-full h-12 rounded-2xl bg-card border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2 shadow-soft"
        >
          <X className="h-4 w-4" />
          {cancelLabel}
        </button>
      </div>
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

type Step =
  | "recipient"
  | "manual"
  | "voucher"
  | "code"
  | "loading"
  | "review"
  | "done";

export function VoucherFlow({
  mode,
  onCancel,
  onComplete,
}: {
  mode: "beneficiary" | "once-off";
  onCancel: () => void;
  onComplete: () => void;
}) {
  const { plan, beneficiaries, addTransaction, addBeneficiary } = useApp();
  const [step, setStep] = useState<Step>("recipient");
  const [q, setQ] = useState("");

  // recipient details
  const [bene, setBene] = useState<Beneficiary | null>(null);
  const [bank, setBank] = useState<Bank | null>(null);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [reference, setReference] = useState("");

  // voucher
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState(0);

  const [rail, setRail] = useState<"EFT" | "RTC">(plan === "pro" ? "RTC" : "EFT");
  const activeRail: "EFT" | "RTC" = plan === "pro" ? rail : "EFT";
  const fee = amount > 0 ? calcTransferFee(amount, plan, activeRail) : null;
  const receives = Math.max(0, +(amount - (fee?.fee ?? 0)).toFixed(2));
  const [pinOpen, setPinOpen] = useState(false);

  const recipient = mode === "beneficiary" ? bene : bank ? { name, bank: bank.name, branch: bank.branch, account } : null;

  const filteredBenes = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return beneficiaries;
    return beneficiaries.filter(
      (b) => b.name.toLowerCase().includes(s) || b.bank.toLowerCase().includes(s) || b.account.includes(s),
    );
  }, [q, beneficiaries]);

  const filteredBanks = useMemo(
    () => SA_BANKS.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q],
  );

  useEffect(() => {
    if (step !== "loading") return;
    const t = window.setTimeout(() => {
      setAmount(detectAmount(code));
      setStep("review");
    }, 2200);
    return () => window.clearTimeout(t);
  }, [step, code]);

  const pickVoucher = (v: Voucher) => {
    setVoucher(v);
    window.setTimeout(() => setStep("code"), 260);
  };

  const pay = () => {
    if (!recipient) return;
    if (mode === "once-off" && bank) {
      addBeneficiary({ name, bank: bank.name, branch: bank.branch, account, reference });
    }
    addTransaction({
      id: crypto.randomUUID(),
      type: "redeem",
      amount,
      label: `${voucher?.name ?? "Voucher"} redeemed`,
      status: "Completed",
    });
    addTransaction({
      id: crypto.randomUUID(),
      type: "transfer",
      amount: -amount,
      label: `Sent to ${recipient.name}`,
      status: activeRail === "RTC" ? "Completed" : "Pending",
    });
    setStep("done");
  };

  if (step === "loading") return <AlulaLoader />;

  if (step === "recipient") {
    return (
      <Sheet stepKey="recipient" onCancel={onCancel}>
        <p className="font-semibold">{mode === "beneficiary" ? "Choose beneficiary" : "Choose bank"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {mode === "beneficiary" ? "Pick who you're paying" : "All South African banks supported"}
        </p>
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={mode === "beneficiary" ? "Search name, bank or account" : "Search bank"}
            className="h-12 rounded-2xl pl-11"
          />
        </div>
        <div className="mt-3 space-y-2.5 max-h-[46vh] overflow-y-auto pr-0.5">
          {mode === "beneficiary"
            ? filteredBenes.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBene(b);
                    setReference(b.reference ?? "");
                    setQ("");
                    window.setTimeout(() => setStep("voucher"), 240);
                  }}
                  className="w-full rounded-2xl border border-border bg-card p-4 flex items-center gap-3 shadow-soft active:scale-[0.98] transition-transform"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-brand text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0">
                    {b.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {b.bank} · •••{b.account.slice(-4)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            : filteredBanks.map((b) => (
                <button
                  key={b.name}
                  onClick={() => {
                    setBank(b);
                    setQ("");
                    window.setTimeout(() => setStep("manual"), 240);
                  }}
                  className="w-full rounded-2xl border border-border bg-card p-4 flex items-center gap-3 shadow-soft active:scale-[0.98] transition-transform"
                >
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">Branch {b.branch}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
          {(mode === "beneficiary" ? filteredBenes.length : filteredBanks.length) === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No matches.</p>
          )}
        </div>
      </Sheet>
    );
  }

  if (step === "manual") {
    const ok = name.trim().length >= 2 && account.length >= 6;
    return (
      <Sheet stepKey="manual" onCancel={onCancel}>
        <p className="font-semibold">Banking details</p>
        <p className="text-xs text-muted-foreground mt-0.5">{bank?.name}</p>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Account holder name & surname</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Thandi Nkosi" className="mt-2 h-12 rounded-2xl" />
          </div>
          <div>
            <Label>Account number</Label>
            <Input
              value={account}
              inputMode="numeric"
              maxLength={14}
              onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit account"
              className="mt-2 h-12 rounded-2xl"
            />
          </div>
          <div>
            <Label>Branch code</Label>
            <Input value={bank?.branch ?? ""} readOnly disabled className="mt-2 h-12 rounded-2xl bg-muted text-muted-foreground" />
          </div>
        </div>
        <button
          disabled={!ok}
          onClick={() => setStep("voucher")}
          className="mt-5 w-full h-13 rounded-2xl bg-gradient-brand py-3.5 text-sm font-semibold text-primary-foreground shadow-button active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          Continue
        </button>
      </Sheet>
    );
  }

  if (step === "voucher") {
    return (
      <Sheet stepKey="voucher" onCancel={onCancel}>
        <p className="font-semibold">Select your voucher</p>
        <p className="text-xs text-muted-foreground mt-0.5">Paying {recipient?.name}</p>
        <div className="mt-4 space-y-2.5">
          {VOUCHERS.map((v) => (
            <button
              key={v.id}
              onClick={() => pickVoucher(v)}
              className="w-full rounded-2xl border border-border bg-card p-4 flex items-center gap-3 shadow-soft active:scale-[0.98] transition-transform"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
                <Ticket className="h-4 w-4 text-gold-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.hint}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  if (step === "code") {
    const valid = voucher && code.replace(/\D/g, "").length === voucher.length;
    return (
      <Sheet stepKey="code" onCancel={onCancel}>
        <p className="font-semibold">{voucher?.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Enter your {voucher?.length}-digit voucher pin</p>
        <input
          autoFocus
          inputMode="numeric"
          maxLength={voucher?.length}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder={"•".repeat(voucher?.length ?? 16)}
          className="mt-4 h-14 w-full rounded-2xl border border-border bg-card px-4 text-center font-mono text-lg tracking-[0.2em] shadow-inner outline-none focus:border-primary"
        />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {code.length}/{voucher?.length} digits
        </p>
        <button
          disabled={!valid}
          onClick={() => setStep("loading")}
          className="mt-4 h-13 w-full rounded-2xl bg-gradient-brand py-3.5 text-sm font-semibold text-primary-foreground shadow-button active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          Proceed
        </button>
      </Sheet>
    );
  }

  if (step === "done") {
    return (
      <Sheet stepKey="done" onCancel={onComplete} cancelLabel="Done">
        <div className="flex flex-col items-center text-center py-2">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-success/30 animate-ripple" />
            <div className="relative h-20 w-20 rounded-full bg-success flex items-center justify-center animate-tick-pop">
              <Check className="h-10 w-10 text-success-foreground" strokeWidth={3} />
            </div>
          </div>
          <p className="mt-5 text-xl font-bold">Paid</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatZAR(receives)} on its way to {recipient?.name}.
          </p>
          <div className="mt-4 w-full rounded-2xl bg-card border border-border p-4 flex items-center gap-3 text-left shadow-soft">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">{railSettleCopy(activeRail)}</p>
              <p className="text-xs text-muted-foreground">
                {railLabel(activeRail)} · {recipient?.bank}
              </p>
            </div>
          </div>
        </div>
      </Sheet>
    );
  }

  // review
  return (
    <>
      <Sheet stepKey="review" onCancel={onCancel}>
        <p className="font-semibold">Confirm payment</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {voucher?.name} verified · {formatZAR(amount)} detected
        </p>

        <div className="mt-4 rounded-2xl bg-muted/50 border border-border p-4 space-y-2">
          <Row label="Name" value={recipient?.name ?? ""} muted />
          <Row label="Bank" value={recipient?.bank ?? ""} muted />
          <Row label="Account" value={recipient?.account ?? ""} muted />
          <Row label="Branch code" value={recipient?.branch ?? ""} muted />
        </div>

        <div className="mt-4">
          <Label>Reference (shown on their statement)</Label>
          <Input
            value={reference}
            maxLength={20}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. Rent"
            className="mt-2 h-12 rounded-2xl"
          />
        </div>

        <div className="mt-4">
          <Label>Amount from voucher</Label>
          <Input value={formatZAR(amount)} readOnly disabled className="mt-2 h-14 rounded-2xl bg-muted text-muted-foreground text-xl font-semibold" />
        </div>

        <div className="mt-5">
          <RailToggle amount={amount} plan={plan} value={activeRail} onChange={setRail} />
        </div>

        {fee && (
          <div className="mt-4 rounded-2xl bg-card border border-border p-4 space-y-2 shadow-soft">
            <Row label="Voucher amount" value={formatZAR(amount)} muted />
            <Row label={`Fee (${railLabel(fee.rail)})`} value={formatZAR(fee.fee)} muted />
            <Row label="They receive" value={formatZAR(receives)} bold />
          </div>
        )}

        <button
          onClick={() => setPinOpen(true)}
          className="mt-5 h-13 w-full rounded-2xl bg-gradient-brand py-3.5 text-sm font-semibold text-primary-foreground shadow-button active:scale-[0.98] transition-transform"
        >
          Pay
        </button>
      </Sheet>

      <ApprovalPinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onApprove={pay}
        summary={{ recipient: recipient?.name ?? "Recipient", amount, fee: fee?.fee ?? 0, total: amount }}
      />
    </>
  );
}
