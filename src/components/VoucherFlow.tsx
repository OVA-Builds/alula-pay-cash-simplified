import { useEffect, useState } from "react";
import { ChevronRight, X, Ticket } from "lucide-react";
import logo from "@/assets/alula-logo.png";

const VOUCHERS = [
  { id: "1voucher", name: "1Voucher", hint: "16-digit pin", length: 16 },
  { id: "blu", name: "Blu Voucher", hint: "16-digit pin", length: 16 },
  { id: "ott", name: "OTT Voucher", hint: "12-digit pin", length: 12 },
] as const;

type Voucher = (typeof VOUCHERS)[number];

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

export function VoucherFlow({ onCancel, onComplete }: { onCancel: () => void; onComplete: () => void }) {
  const [step, setStep] = useState<"select" | "input" | "loading">("select");
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [code, setCode] = useState("");

  const pick = (v: Voucher) => {
    setVoucher(v);
    window.setTimeout(() => setStep("input"), 260);
  };

  useEffect(() => {
    if (step !== "loading") return;
    const t = window.setTimeout(onComplete, 2200);
    return () => window.clearTimeout(t);
  }, [step, onComplete]);

  if (step === "loading") return <AlulaLoader />;

  const valid = voucher && code.replace(/\D/g, "").length === voucher.length;

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={onCancel} />
      <div className="relative w-full sm:max-w-[420px] px-6 pb-24">
        <div
          key={step}
          className={`bg-card rounded-[1.75rem] border border-border p-5 shadow-3d ${
            step === "input" ? "animate-fade-in" : voucher ? "animate-fade-out" : "animate-float-up"
          }`}
        >
          {step === "select" ? (
            <>
              <p className="font-semibold">Select your voucher</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pick the brand on your voucher slip</p>
              <div className="mt-4 space-y-2.5">
                {VOUCHERS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => pick(v)}
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
        <button
          onClick={onCancel}
          className="mt-3 w-full h-12 rounded-2xl bg-card border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2 shadow-soft"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
