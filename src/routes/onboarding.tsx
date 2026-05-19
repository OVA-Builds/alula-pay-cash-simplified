import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp, formatZAR, MONTHLY_FEE } from "@/lib/app-state";
import { Check, Sparkles, ShieldCheck, Zap, Landmark, ArrowRight } from "lucide-react";
import logo from "@/assets/alula-logo.png";
import onb1 from "@/assets/onb-1.jpg";
import onb2 from "@/assets/onb-2.jpg";
import onb3 from "@/assets/onb-3.jpg";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const steps = [
  {
    image: onb1,
    headline: "Buy an Alula voucher",
    accent: "with cash",
    body: "Pick up an OTT, Blu or 1Voucher at any participating retailer near you.",
  },
  {
    image: onb2,
    headline: "Load your wallet",
    accent: "in seconds",
    body: "Scan or type the code from your voucher slip — your balance updates instantly.",
  },
  {
    image: onb3,
    headline: "Send money to any SA bank",
    accent: "in seconds",
    body: "Move your money to any South African bank account — no queues, no waiting.",
  },
];

const features = [
  { icon: ShieldCheck, title: "Secure", body: "Bank-level protection" },
  { icon: Zap, title: "Fast", body: "Money moves in seconds" },
  { icon: Landmark, title: "Any SA Bank", body: "Send to over 100 local banks" },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const [showFees, setShowFees] = useState(false);
  const navigate = useNavigate();
  const { setOnboarded } = useApp();
  const step = steps[i];
  const last = i === steps.length - 1;

  const finish = () => { setOnboarded(true); navigate({ to: "/signup" }); };
  const next = () => (last ? setShowFees(true) : setI(i + 1));

  if (showFees) return <FeePreview onContinue={finish} onBack={() => setShowFees(false)} />;

  return (
    <PhoneFrame>
      <div
        className="flex flex-col min-h-screen sm:min-h-[860px] relative overflow-hidden text-[oklch(0.18_0.08_265)]"
        style={{ backgroundColor: "oklch(0.96 0.018 85)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-7">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-9 drop-shadow-sm" />
            <span className="text-lg font-bold tracking-tight">Alula Pay</span>
          </div>
          <button onClick={() => setShowFees(true)} className="text-base text-primary font-semibold">Skip</button>
        </div>

        {/* Hero text */}
        <div key={i} className="px-6 pt-6 animate-float-up">
          <h1 className="text-[34px] leading-[1.05] font-bold tracking-tight">
            <span>{step.headline}</span>{" "}
            <span className="text-primary">{step.accent}</span>
          </h1>
          <p className="mt-4 text-[15px] text-[oklch(0.35_0.04_265)] leading-relaxed max-w-[60%]">
            {step.body}
          </p>
        </div>

        {/* Blob image */}
        <div className="relative flex-1 mt-2">
          <div
            className="absolute right-0 top-0 bottom-2 w-[88%] overflow-hidden shadow-card"
            style={{ borderRadius: "55% 45% 38% 62% / 48% 55% 45% 52%" }}
          >
            <img src={step.image} alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* R5 pill card */}
        <div className="px-6 mt-4">
          <div className="bg-card rounded-2xl shadow-soft px-4 py-3 flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold">
                From just <span className="text-primary font-bold">R5</span> a month
              </p>
              <p className="text-xs text-muted-foreground">No hidden fees, ever.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 mt-4">
          <Button
            size="lg"
            onClick={next}
            className="h-14 w-full rounded-full text-base font-semibold shadow-button bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
          >
            {last ? "See our pricing" : "Next"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Features row */}
        <div className="px-6 mt-5 grid grid-cols-3 gap-2">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-start gap-1 px-1">
              <f.icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
              <p className="text-[13px] font-bold text-primary leading-tight">{f.title}</p>
              <p className="text-[11px] text-[oklch(0.4_0.04_265)] leading-snug">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center py-5">
          <div className="flex gap-2 bg-card rounded-full px-4 py-2 shadow-soft">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-2 bg-muted"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-5">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">Sign in</Link>
        </p>
      </div>
    </PhoneFrame>
  );
}

function FeePreview({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen sm:min-h-[860px] p-7">
        <button onClick={onBack} className="text-sm text-muted-foreground self-start">← Back</button>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Honest pricing</h1>
        <p className="mt-2 text-muted-foreground">No hidden fees. You always see the cost before you confirm.</p>

        <div className="mt-6 space-y-3">
          <PlanCard
            name="Basic"
            price={MONTHLY_FEE.basic}
            tag="Start here"
            highlight={false}
            features={[
              "No ID needed — sign up in minutes",
              "Money lands in 1–2 working days",
              "Small fee: 1.5% per send (minimum R5)",
              "Monthly limit R5,000",
            ]}
          />
          <PlanCard
            name="Pro"
            price={MONTHLY_FEE.pro}
            tag="Verified users"
            highlight
            features={[
              "Instant payments — money arrives in seconds",
              "Lower fees: 1% per send (minimum R5)",
              "Daily limit R5,000",
              "Priority help when you need it",
            ]}
          />
        </div>

        <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
          Alula Pay is a non-deposit-taking payment facilitator. We never earn interest on your money — only the fees you see above.
        </p>

        <div className="flex-1" />
        <Button size="lg" onClick={onContinue} className="h-14 rounded-2xl text-base shadow-button">Get Started</Button>
      </div>
    </PhoneFrame>
  );
}

function PlanCard({ name, price, tag, features, highlight }: {
  name: string; price: number; tag: string; features: string[]; highlight: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-5 border ${highlight ? "border-primary bg-gradient-to-br from-primary/15 to-transparent" : "border-border bg-card"}`}>
      {highlight && <span className="absolute -top-2 right-4 text-[10px] font-bold tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase">Best value</span>}
      <div className="flex justify-between items-baseline">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{tag}</p>
          <p className="text-xl font-bold mt-0.5">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatZAR(price)}</p>
          <p className="text-xs text-muted-foreground">/ month</p>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" strokeWidth={3} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
