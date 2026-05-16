import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Ticket, ArrowRightLeft, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const steps = [
  { icon: Ticket, title: "Buy a voucher", body: "Pick up an Alula voucher at any participating retailer with cash." },
  { icon: ArrowRightLeft, title: "Redeem it here", body: "Enter the voucher code in the app to load your wallet instantly." },
  { icon: Landmark, title: "Send to your bank", body: "Move the money straight to any South African bank account." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const { setOnboarded } = useApp();
  const step = steps[i];
  const Icon = step.icon;
  const last = i === steps.length - 1;

  const next = () => {
    if (last) {
      setOnboarded(true);
      navigate({ to: "/signup" });
    } else setI(i + 1);
  };

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen sm:min-h-[860px] p-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-1.5 bg-muted"}`}
              />
            ))}
          </div>
          <button onClick={() => { setOnboarded(true); navigate({ to: "/signup" }); }} className="text-sm text-muted-foreground">
            Skip
          </button>
        </div>

        <div key={i} className="flex-1 flex flex-col items-center justify-center text-center animate-float-up">
          <div className="w-28 h-28 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-button mb-10">
            <Icon className="h-12 w-12 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{step.title}</h1>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-xs">{step.body}</p>
        </div>

        <Button size="lg" onClick={next} className="h-14 rounded-2xl text-base shadow-button">
          {last ? "Get Started" : "Next"}
        </Button>
      </div>
    </PhoneFrame>
  );
}
