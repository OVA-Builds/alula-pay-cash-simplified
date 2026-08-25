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
        className="flex flex-col min-h-full h-full relative overflow-y-auto overscroll-contain"
        style={{ backgroundColor: "#F5EFE4", color: "#0B1F4D" }}
      >
        {/* Header */}
        <div className="relative flex justify-between items-center px-6 pt-7 z-10">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-9 drop-shadow-sm" />
            <span className="text-lg font-bold tracking-tight" style={{ color: "#0B1F4D" }}>Alula Pay</span>
          </div>
          <button onClick={() => setShowFees(true)} className="text-base font-semibold" style={{ color: "#3B6FE0" }}>Skip</button>
        </div>

        {/* Hero image — clean rounded card, no crop weirdness */}
        <div className="relative px-6 mt-5 z-10">
          <div
            className="relative w-full h-[280px] overflow-hidden rounded-[28px]"
            style={{ boxShadow: "0 20px 40px -20px rgba(11,31,77,0.25)" }}
          >
            <img key={i} src={step.image} alt="" className="w-full h-full object-cover animate-float-up" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(180deg, transparent 55%, rgba(11,31,77,0.35) 100%)" }}
            />
          </div>
        </div>

        {/* Hero text */}
        <div key={`t-${i}`} className="relative px-6 pt-6 animate-float-up z-10">
          <h1 className="text-[30px] leading-[1.1] font-bold tracking-tight" style={{ color: "#0B1F4D" }}>
            <span>{step.headline}</span>{" "}
            <span style={{ color: "#3B6FE0" }}>{step.accent}</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "#4A5878" }}>
            {step.body}
          </p>
        </div>

        <div className="flex-1" />

        {/* White R5 pill card */}
        <div className="relative px-6 mt-4 z-10">
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 8px 24px -10px rgba(11,31,77,0.18)" }}
          >
            <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF0FF" }}>
              <Sparkles className="h-5 w-5" style={{ color: "#3B6FE0" }} />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold" style={{ color: "#0B1F4D" }}>
                From just <span style={{ color: "#3B6FE0" }} className="font-bold">R5</span> a month
              </p>
              <p className="text-xs" style={{ color: "#6B7790" }}>No hidden fees, ever.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="relative px-6 mt-4 z-10">
          <Button
            size="lg"
            onClick={next}
            className="h-14 w-full rounded-full text-base font-semibold flex items-center justify-center gap-2 border-0"
            style={{ backgroundColor: "#3B6FE0", color: "#FFFFFF", boxShadow: "0 10px 24px -8px rgba(59,111,224,0.5)" }}
          >
            {last ? "See our pricing" : "Next"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Features row */}
        <div className="relative px-6 mt-5 grid grid-cols-3 gap-2 z-10">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-start gap-1 px-1">
              <f.icon className="h-5 w-5" style={{ color: "#3B6FE0" }} strokeWidth={2.2} />
              <p className="text-[13px] font-bold leading-tight" style={{ color: "#3B6FE0" }}>{f.title}</p>
              <p className="text-[11px] leading-snug" style={{ color: "#4A5878" }}>{f.body}</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="relative flex justify-center py-5 z-10">
          <div className="flex gap-2 rounded-full px-4 py-2" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 6px 18px -10px rgba(11,31,77,0.2)" }}>
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: idx === i ? 24 : 8,
                  backgroundColor: idx === i ? "#3B6FE0" : "#D6DCE8",
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <p className="relative text-center text-xs pb-5 z-10" style={{ color: "#6B7790" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#3B6FE0" }}>Sign in</Link>
        </p>
      </div>
    </PhoneFrame>
  );
}

function FeePreview({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-full h-full overflow-y-auto overscroll-contain p-7">
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
              "5% per send · minimum send R20",
              "Monthly limit R2,000",
            ]}
          />
          <PlanCard
            name="Pro"
            price={MONTHLY_FEE.pro}
            tag="Verified users"
            highlight
            features={[
              "Instant payments — money arrives within 10 minutes",
              "5% per send · minimum send R20",
              "Daily limit R10,000 · Monthly limit R49,999.99",
              "3-month deposit statement you can share",
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
