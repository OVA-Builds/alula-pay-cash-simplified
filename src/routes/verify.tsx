import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Camera, ShieldCheck, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/verify")({ component: Verify });

function Verify() {
  const navigate = useNavigate();
  const { setVerified, balance, adjustBalance } = useApp();
  const [stage, setStage] = useState<"intro" | "capturing" | "checking">("intro");
  const PRO_FEE = 10;
  const canUpgrade = balance >= PRO_FEE;

  const start = () => {
    if (!canUpgrade) return;
    setStage("capturing");
    setTimeout(() => setStage("checking"), 1400);
    setTimeout(() => {
      // Charge first month's Pro subscription on upgrade.
      adjustBalance(-PRO_FEE);
      setVerified(true);
      navigate({ to: "/home" });
    }, 2800);
  };


  return (
    <AppShell hideNav>
      <div className="p-6 min-h-screen sm:min-h-[860px] flex flex-col">
        <button onClick={() => navigate({ to: "/home" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="mt-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-brand flex items-center justify-center shadow-button">
            <ShieldCheck className="h-10 w-10 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Become a Pro member</h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xs mx-auto">
            Take one quick selfie and we'll unlock more for you. It takes seconds — no paperwork.
          </p>
        </div>

        <ul className="mt-7 space-y-2.5">
          {[
            "Instant payments — money lands within 10 minutes, not days",
            "Daily limit R10,000 · Monthly limit R49,999.99",
            "5% per send · minimum send R20 (same as Basic)",
            "3-month deposit statement — download, email or WhatsApp",
          ].map((b) => (
            <li key={b} className="flex items-start gap-3 bg-card border border-border rounded-2xl p-3.5">
              <div className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium pt-0.5">{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <div className="relative mx-auto h-48 w-48 rounded-full overflow-hidden border-4 border-dashed border-primary/40 bg-muted/40 flex items-center justify-center">
            {stage === "intro" && <Camera className="h-12 w-12 text-muted-foreground" />}
            {stage === "capturing" && (
              <>
                <span className="absolute inset-0 rounded-full bg-primary/10 animate-ripple" />
                <Camera className="h-12 w-12 text-primary" />
              </>
            )}
            {stage === "checking" && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
          </div>
          <p className="text-center text-sm font-medium mt-4">
            {stage === "intro" && "Tap below to take a selfie"}
            {stage === "capturing" && "Hold still…"}
            {stage === "checking" && "Just checking it's really you…"}
          </p>
          <p className="text-center text-xs text-muted-foreground mt-1.5">
            🔒 Your photo is safe with us · No ID document needed
          </p>
        </div>

        <div className="flex-1" />

        {stage === "intro" && (
          <>
            {!canUpgrade && (
              <div className="mb-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-center">
                <p className="text-sm font-semibold text-destructive">You need at least R10.00 to upgrade</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pro costs R10 a month. Redeem a voucher to top up, then come back.
                </p>
              </div>
            )}
            <Button size="lg" onClick={start} disabled={!canUpgrade} className="h-14 w-full rounded-2xl text-base shadow-button">
              {canUpgrade ? "Take selfie" : "Top up to continue"}
            </Button>
          </>
        )}
      </div>
    </AppShell>
  );
}
