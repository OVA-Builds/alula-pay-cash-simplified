import { useState, useEffect } from "react";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp, formatZAR, MONTHLY_FEE, type Plan } from "@/lib/app-state";
import voucherBlu from "@/assets/voucher-blu.jpg";
import voucherOtt from "@/assets/voucher-ott.png";
import voucher1Voucher from "@/assets/voucher-1voucher.png";

type VoucherBrand = { id: "ott" | "blu" | "1voucher"; name: string; length: number; logo: string; amount: number };

const VOUCHER_BRANDS: VoucherBrand[] = [
  { id: "blu", name: "Blu Voucher", length: 16, logo: voucherBlu, amount: 10 },
  { id: "1voucher", name: "1Voucher", length: 16, logo: voucher1Voucher, amount: 50 },
  { id: "ott", name: "OTT Voucher", length: 12, logo: voucherOtt, amount: 200 },
];

const PLAN_FEATURES: Record<Plan, string[]> = {
  basic: [
    "Send to any South African bank account",
    "R2,000 monthly sending limit",
    "5% per send, R20 minimum",
  ],
  pro: [
    "Instant payments — money lands within 10 minutes",
    "R49,999.99 monthly sending limit",
    "5% per send, R20 minimum",
    "3-month deposit statement, on demand",
  ],
};

type Step = "choose" | "features" | "brand" | "code";

export function SubscriptionPaywall() {
  const { signedIn, paywallActive, pendingPlan, pendingAmountPaid, choosePendingPlan, redeemTowardSubscription } = useApp();
  const [step, setStep] = useState<Step>(() => (pendingPlan ? "brand" : "choose"));
  const [reviewPlan, setReviewPlan] = useState<Plan>(pendingPlan ?? "basic");
  const [brand, setBrand] = useState<VoucherBrand | null>(null);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // On a fresh page load, app-state's own localStorage hydration happens in an
  // effect after this component's first render, so a persisted pendingPlan is
  // not yet visible to the useState initializers above. Once it lands, jump
  // straight to the brand step so the user resumes where they left off
  // instead of restarting from "choose".
  useEffect(() => {
    if (pendingPlan) {
      setReviewPlan(pendingPlan);
      setStep((s) => (s === "choose" ? "brand" : s));
    }
  }, [pendingPlan]);

  if (!signedIn || !paywallActive) return null;

  const activePlan: Plan = pendingPlan ?? reviewPlan;
  const target = MONTHLY_FEE[activePlan];
  const remaining = +(target - pendingAmountPaid).toFixed(2);

  const digits = code.replace(/\D/g, "");
  const validCode = !!brand && digits.length === brand.length;

  const openFeatures = (p: Plan) => {
    setReviewPlan(p);
    setStep("features");
  };

  const confirmPlan = () => {
    choosePendingPlan(reviewPlan);
    setNotice(null);
    setStep("brand");
  };

  const submitVoucher = () => {
    if (!brand || !validCode) return;
    const result = redeemTowardSubscription(brand.amount, brand.name);
    setCode("");
    setBrand(null);
    if (!result.fullyPaid) {
      setNotice(
        `${formatZAR(brand.amount)} redeemed. ` +
        `${formatZAR(result.outstanding)} still needed to activate your ${activePlan === "pro" ? "Pro" : "Basic"} subscription.`
      );
      setStep("brand");
    }
    // If fully paid, paywallActive flips false on the next render and this
    // component unmounts on its own — nothing else to do here.
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        {(step === "features" || step === "code") && (
          <button
            aria-label="Back"
            onClick={() => setStep(step === "code" ? "brand" : "choose")}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
        )}
        <div>
          <p className="text-sm font-bold">Subscribe to continue</p>
          <p className="text-xs text-muted-foreground">Your 2 free transactions are used up</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {step === "choose" && (
          <>
            <h1 className="text-xl font-bold tracking-tight">Choose your plan</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pick a plan to keep sending money with Alula Pay.</p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => openFeatures("basic")}
                className="w-full rounded-3xl border border-border bg-card p-5 text-left shadow-card active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">Basic</p>
                  <p className="text-lg font-bold text-primary">{formatZAR(MONTHLY_FEE.basic)}<span className="text-xs font-normal text-muted-foreground"> /mo</span></p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Everyday sending, no ID needed.</p>
              </button>

              <button
                onClick={() => openFeatures("pro")}
                className="w-full rounded-3xl bg-primary p-5 text-left text-primary-foreground shadow-button active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">Pro</p>
                  <p className="text-lg font-bold">{formatZAR(MONTHLY_FEE.pro)}<span className="text-xs font-normal opacity-80"> /mo</span></p>
                </div>
                <p className="mt-1 text-xs opacity-80">Instant payments, higher limits.</p>
              </button>
            </div>
          </>
        )}

        {step === "features" && (
          <>
            <h1 className="text-xl font-bold tracking-tight">{reviewPlan === "pro" ? "Pro" : "Basic"} plan</h1>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatZAR(MONTHLY_FEE[reviewPlan])}<span className="text-sm font-normal text-muted-foreground"> /month</span>
            </p>

            <ul className="mt-5 space-y-2.5">
              {PLAN_FEATURES[reviewPlan].map((f) => (
                <li key={f} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15">
                    <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} />
                  </span>
                  <span className="pt-0.5 text-sm font-medium">{f}</span>
                </li>
              ))}
            </ul>

            {reviewPlan === "basic" && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/15 p-3.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-foreground" />
                <p className="text-xs leading-relaxed text-foreground">
                  <b>Basic is not instant.</b> Transfers land in 1–2 working days. If you need money to arrive
                  within minutes, choose Pro instead.
                </p>
              </div>
            )}

            <Button size="lg" onClick={confirmPlan} className="mt-6 h-14 w-full rounded-2xl text-base shadow-button">
              Continue to payment
            </Button>
          </>
        )}

        {step === "brand" && (
          <>
            <h1 className="text-xl font-bold tracking-tight">Pay with a voucher</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {pendingAmountPaid > 0
                ? `${formatZAR(pendingAmountPaid)} paid so far — ${formatZAR(remaining)} still needed for your ${activePlan === "pro" ? "Pro" : "Basic"} subscription.`
                : `Redeem a voucher worth exactly ${formatZAR(target)} for your ${activePlan === "pro" ? "Pro" : "Basic"} subscription.`}
            </p>

            {notice && (
              <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/15 p-3.5 text-xs leading-relaxed text-foreground">
                {notice}
              </div>
            )}

            <div className="mt-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs leading-relaxed text-foreground">
              Redeem the exact amount you owe (<b>{formatZAR(remaining)}</b>). A voucher worth less than that
              leaves a balance still outstanding — you'll pick up right where you left off, never from scratch.
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {VOUCHER_BRANDS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { setBrand(v); setNotice(null); setStep("code"); }}
                  className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card p-3 shadow-card active:scale-[0.97]"
                >
                  <span className="flex h-14 w-full items-center justify-center rounded-2xl bg-white p-2">
                    <img src={v.logo} alt={v.name} className="h-full w-full object-contain" />
                  </span>
                  <span className="text-center text-[11px] font-semibold leading-tight">{formatZAR(v.amount)}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "code" && brand && (
          <>
            <div className="flex items-center gap-3">
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
              Redeem {formatZAR(brand.amount)}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
