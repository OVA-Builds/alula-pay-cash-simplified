import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, IdCard, Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/verify")({ component: Verify });

const benefits = [
  "Daily limit increases to R 25,000",
  "Lower fees on every transfer",
  "Faster settlement to your bank",
];

function Verify() {
  const navigate = useNavigate();
  const { setVerified } = useApp();

  return (
    <AppShell hideNav>
      <div className="p-6">
        <button onClick={() => navigate({ to: "/home" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="mt-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-button">
            <ShieldCheck className="h-10 w-10 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Verify my account</h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xs mx-auto">
            Upgrade to Tier 2 in a couple of minutes to unlock the full Alula Pay experience.
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4">
              <div className="h-8 w-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4 text-success" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium pt-1">{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/40 p-5 flex flex-col items-center text-center">
            <IdCard className="h-7 w-7 text-muted-foreground" />
            <p className="mt-2 text-xs font-medium">Upload ID</p>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/40 p-5 flex flex-col items-center text-center">
            <Camera className="h-7 w-7 text-muted-foreground" />
            <p className="mt-2 text-xs font-medium">Take selfie</p>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => { setVerified(true); navigate({ to: "/home" }); }}
          className="mt-8 h-14 w-full rounded-2xl text-base shadow-button"
        >
          Start Verification
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">Your details are encrypted and never shared.</p>
      </div>
    </AppShell>
  );
}
