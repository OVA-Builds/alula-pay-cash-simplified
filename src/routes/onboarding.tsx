import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp, formatZAR, MONTHLY_FEE } from "@/lib/app-state";
import { Check, Sparkles } from "lucide-react";
import logo from "@/assets/alula-logo.png";
import onb1 from "@/assets/onb-1.jpg";
import onb2 from "@/assets/onb-2.jpg";
import onb3 from "@/assets/onb-3.jpg";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const steps = [
  { image: onb1, eyebrow: "Cash in", title: "Buy an Alula voucher", body: "Pick up an OTT, Blu or 1Voucher with cash at any participating retailer near you." },
  { image: onb2, eyebrow: "Redeem", title: "Load your wallet in seconds", body: "Scan or type the code from your voucher slip — your balance updates instantly." },
  { image: onb3, eyebrow: "Cash out", title: "Send straight to any SA bank", body: "Move your money to any South African bank account — no queues, no waiting." },
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
      <div className="flex flex-col min-h-screen sm:min-h-[860px] bg-primary-deep text-primary-foreground relative overflow-hidden">
        {/* Decorative gold accents */}
        <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gold/25 blur-2xl" />
        <span className="pointer-events-none absolute top-1/2 -left-20 h-40 w-40 rounded-full bg-primary/40 blur-3xl" />

        <div className="relative h-[52%] sm:h-[460px] overflow-hidden">
          <img src={step.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary-deep to-transparent" />

          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-8 w-8 drop-shadow" />
              <span className="text-sm font-bold tracking-tight">Alula Pay</span>
            </div>
            <button onClick={() => setShowFees(true)} className="text-sm text-primary-foreground/90 font-medium">Skip</button>
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-5 left-6 flex gap-1.5">
            {steps.map((_, idx) => (
              <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-gold" : "w-1.5 bg-primary-foreground/45"}`} />
            ))}
          </div>
        </div>

        <div key={i} className="flex-1 px-7 pt-6 pb-8 flex flex-col animate-float-up relative">
          <span className="text-xs font-semibold tracking-widest text-gold-foreground bg-gold self-start px-2.5 py-1 rounded-full uppercase shadow-gold">
            {step.eyebrow}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary-foreground">{step.title}</h1>
          <p className="mt-3 text-primary-foreground/80 leading-relaxed">{step.body}</p>

          {last && (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-gold/15 border border-gold/30 px-3 py-2.5">
              <Sparkles className="h-4 w-4 text-gold shrink-0" />
              <p className="text-xs text-primary-foreground/90">
                Just <span className="font-bold text-gold">R5 a month</span> — no hidden fees, ever.
              </p>
            </div>
          )}

          <div className="flex-1" />

          <Button
            size="lg"
            onClick={next}
            className="h-14 rounded-2xl text-base shadow-button bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
          >
            {last ? "See our pricing" : "Next"}
          </Button>

          <p className="mt-4 text-center text-xs text-primary-foreground/70">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-gold underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
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
