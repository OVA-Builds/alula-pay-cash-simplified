import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AppShell } from "@/components/AppShell";
import { StatusBody, StatusScreen } from "@/components/StatusScreen";
import { BufferScreen } from "@/components/BufferScreen";
import { BUFFER_MS, simulateOutcome } from "@/lib/buffer";
import { useApp, formatZAR, MONTHLY_FEE, type Plan } from "@/lib/app-state";
import voucherBlu from "@/assets/voucher-blu.jpg";
import voucherOtt from "@/assets/voucher-ott.png";
import voucher1Voucher from "@/assets/voucher-1voucher.png";

export const Route = createFileRoute("/subscribe")({ component: Subscribe });

type VoucherBrand = { id: "ott" | "blu" | "1voucher"; name: string; length: number; logo: string };

// A subscription voucher is always loaded for exactly what's owed — brand
// only decides pin length here, not value (see remaining below).
const VOUCHER_BRANDS: VoucherBrand[] = [
  { id: "blu", name: "Blu Voucher", length: 16, logo: voucherBlu },
  { id: "1voucher", name: "1Voucher", length: 16, logo: voucher1Voucher },
  { id: "ott", name: "OTT Voucher", length: 12, logo: voucherOtt },
];

const PLAN_FEATURES: Record<Plan, string[]> = {
  basic: [
    "Send to any South African bank account",
    "R5,000 monthly sending limit",
    "5% per send, R20 minimum",
  ],
  pro: [
    "Instant payments — money lands within 10 minutes",
    "R49,999.99 monthly sending limit",
    "5% per send, R20 minimum",
    "3-month deposit statement, on demand",
  ],
};

type Step = "choose" | "features" | "biometric" | "brand" | "code" | "processing" | "success" | "failed";

function Subscribe() {
  const navigate = useNavigate();
  const {
    subscriptionActive, verified, verifyIdentity,
    pendingPlan, pendingAmountPaid, choosePendingPlan, applyVoucherTowardSubscription,
  } = useApp();

  const [step, setStep] = useState<Step>("choose");
  const [reviewPlan, setReviewPlan] = useState<Plan>("basic");
  const [confirmBrand, setConfirmBrand] = useState<VoucherBrand | null>(null);
  const [brand, setBrand] = useState<VoucherBrand | null>(null);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [bioStage, setBioStage] = useState<"intro" | "capturing" | "checking" | "failed">("intro");
  const [paidPlan, setPaidPlan] = useState<Plan>("basic");
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Reaching this step closes the brand-confirm Dialog, which restores focus
  // to its own trigger button right as this input mounts — a plain autoFocus
  // prop loses that race. Focusing on the next tick wins it instead.
  useEffect(() => {
    if (step !== "code") return;
    const t = setTimeout(() => codeInputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [step]);

  // Already subscribed for this billing period — nothing to do on this page.
  // Skip this while showing the just-paid success screen: subscriptionActive
  // flips true the instant payment completes, in the same render as
  // step becoming "success" — without the step check this would yank the
  // user straight to home before they ever see the confirmation.
  useEffect(() => {
    if (subscriptionActive && step !== "success") navigate({ to: "/home" });
  }, [subscriptionActive, step, navigate]);

  // Resume mid-flow after a reload. App-state's own localStorage hydration
  // runs in an effect after this component's first render, so pendingPlan
  // isn't known yet on that very first render — once it lands, jump to
  // wherever the user left off instead of restarting at plan choice.
  useEffect(() => {
    if (!pendingPlan) return;
    setReviewPlan(pendingPlan);
    setStep((s) => (s === "choose" ? (pendingPlan === "pro" && !verified ? "biometric" : "brand") : s));
  }, [pendingPlan, verified]);

  const target = MONTHLY_FEE[reviewPlan];
  const remaining = +(target - pendingAmountPaid).toFixed(2);

  const digits = code.replace(/\D/g, "");
  const validCode = !!brand && digits.length === brand.length;

  const openFeatures = (p: Plan) => { setReviewPlan(p); setStep("features"); };

  const continueFromFeatures = () => {
    choosePendingPlan(reviewPlan);
    setStep(reviewPlan === "pro" && !verified ? "biometric" : "brand");
  };

  const startSelfie = () => {
    setBioStage("capturing");
    setTimeout(() => setBioStage("checking"), 1400);
    setTimeout(() => {
      if (simulateOutcome() === "success") {
        verifyIdentity();
        setStep("brand");
        setBioStage("intro");
      } else {
        setBioStage("failed");
      }
    }, 1400 + BUFFER_MS);
  };

  const submitVoucher = () => {
    if (!brand || !validCode) return;
    const usedBrand = brand;
    setStep("processing");
    setTimeout(() => {
      if (simulateOutcome() === "error") {
        setStep("failed");
        return;
      }
      const paidFor = reviewPlan;
      const result = applyVoucherTowardSubscription(remaining, usedBrand.name);
      setCode("");
      setBrand(null);
      if (result.fullyPaid) {
        setPaidPlan(paidFor);
        setNotice(null);
        setStep("success");
      } else {
        setNotice(
          `${formatZAR(remaining)} applied. ${formatZAR(result.outstanding)} still needed to activate your ` +
          `${reviewPlan === "pro" ? "Pro" : "Basic"} subscription.`
        );
        setStep("brand");
      }
    }, BUFFER_MS);
  };

  const goBack = () => {
    if (step === "code") setStep("brand");
    else if (step === "brand" && reviewPlan === "pro" && !verified) setStep("biometric");
    else if (step === "brand" || step === "biometric") setStep("features");
    else if (step === "features") setStep("choose");
    else navigate({ to: "/home" });
  };

  if (step === "biometric" && bioStage === "checking") {
    return (
      <AppShell hideNav>
        <BufferScreen title="Verifying with DHA…" description="This takes a few seconds." />
      </AppShell>
    );
  }

  if (step === "biometric" && bioStage === "failed") {
    return (
      <AppShell hideNav>
        <StatusScreen
          variant="error"
          title="Verification failed"
          description="We couldn't verify your identity with DHA. Make sure you're in good light and try again."
          buttonLabel="Try again"
          onButtonClick={() => setBioStage("intro")}
        />
      </AppShell>
    );
  }

  if (step === "processing") {
    return (
      <AppShell hideNav>
        <BufferScreen title="Confirming your payment…" description="This takes a few seconds." />
      </AppShell>
    );
  }

  if (step === "failed") {
    return (
      <AppShell hideNav>
        <StatusScreen
          variant="error"
          title="Payment didn't go through"
          description="We couldn't confirm your voucher payment. Your voucher hasn't been used — please try again."
          buttonLabel="Try again"
          onButtonClick={() => setStep("code")}
        />
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      {step !== "success" && (
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background px-5 py-4">
          <button
            aria-label="Back"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <p className="text-sm font-bold">Subscribe to Alula Pay</p>
            <p className="text-xs text-muted-foreground">Choose a plan to keep sending money</p>
          </div>
        </div>
      )}

      <div className="p-6">
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

            {reviewPlan === "pro" && !verified && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-3.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-foreground">
                  <b>One more step.</b> Pro needs a quick once-off selfie to verify your identity before payment.
                </p>
              </div>
            )}

            <Button size="lg" onClick={continueFromFeatures} className="mt-6 h-14 w-full rounded-2xl text-base shadow-button">
              {reviewPlan === "pro" && !verified ? "Continue to verification" : "Continue to payment"}
            </Button>
          </>
        )}

        {step === "biometric" && (
          <div className="flex flex-col items-center text-center">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-button">
              <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.8} />
            </div>
            <h1 className="mt-6 text-xl font-bold tracking-tight">Verify your identity</h1>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Pro needs a quick, once-off selfie. We verify it securely through the Department of Home Affairs
              (DHA) — it takes seconds, and you won't need to do this again.
            </p>

            <div className="relative mx-auto mt-8 flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-primary/40 bg-muted/40">
              {bioStage === "intro" && <Camera className="h-11 w-11 text-muted-foreground" />}
              {bioStage === "capturing" && (
                <>
                  <span className="absolute inset-0 rounded-full bg-primary/10 animate-ripple" />
                  <Camera className="h-11 w-11 text-primary" />
                </>
              )}
            </div>
            <p className="mt-4 text-sm font-medium">
              {bioStage === "intro" && "Tap below to take a selfie"}
              {bioStage === "capturing" && "Hold still…"}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">🔒 Secure · No documents needed</p>

            {bioStage === "intro" && (
              <Button size="lg" onClick={startSelfie} className="mt-8 h-14 w-full rounded-2xl text-base shadow-button">
                Take selfie
              </Button>
            )}
          </div>
        )}

        {step === "brand" && (
          <>
            <h1 className="text-xl font-bold tracking-tight">Pay with a voucher</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {pendingAmountPaid > 0
                ? `${formatZAR(pendingAmountPaid)} paid so far — ${formatZAR(remaining)} still needed for your ${reviewPlan === "pro" ? "Pro" : "Basic"} subscription.`
                : `Load a voucher worth exactly ${formatZAR(remaining)} to activate your ${reviewPlan === "pro" ? "Pro" : "Basic"} subscription.`}
            </p>

            {notice && (
              <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/15 p-3.5 text-xs leading-relaxed text-foreground">
                {notice}
              </div>
            )}

            <div className="mt-5 grid grid-cols-3 gap-3">
              {VOUCHER_BRANDS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setConfirmBrand(v)}
                  className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card p-3 shadow-card active:scale-[0.97]"
                >
                  <span className="flex h-14 w-full items-center justify-center rounded-2xl bg-white p-2">
                    <img src={v.logo} alt={v.name} className="h-full w-full object-contain" />
                  </span>
                  <span className="text-center text-[11px] font-semibold leading-tight">{formatZAR(remaining)}</span>
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
              ref={codeInputRef}
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
              Pay {formatZAR(remaining)}
            </Button>
          </>
        )}

        {step === "success" && (
          <div className="py-10">
            <StatusBody
              variant="success"
              title="You're subscribed!"
              description={`Your ${paidPlan === "pro" ? "Pro" : "Basic"} plan is now active. ${
                paidPlan === "basic"
                  ? "Remember, Basic transfers land in 1–2 working days."
                  : "Enjoy instant payments and higher limits."
              }`}
              buttonLabel="Go to home"
              onButtonClick={() => navigate({ to: "/home" })}
            />
          </div>
        )}
      </div>

      <Dialog open={!!confirmBrand} onOpenChange={(o) => { if (!o) setConfirmBrand(null); }}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Confirm {confirmBrand?.name}</DialogTitle>
            <DialogDescription>
              Load the exact amount you owe (<b>{formatZAR(remaining)}</b>). A voucher worth less than that
              leaves a balance still outstanding — you'll pick up right where you left off, never from scratch.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" className="h-11 rounded-xl" onClick={() => setConfirmBrand(null)}>
              Cancel
            </Button>
            <Button
              className="h-11 rounded-xl"
              onClick={() => { setBrand(confirmBrand); setConfirmBrand(null); setStep("code"); }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
