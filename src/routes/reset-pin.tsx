import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ScanFace, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/PhoneFrame";
import { StatusScreen } from "@/components/StatusScreen";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/reset-pin")({ component: ResetPin });

type Stage = "intro" | "scanning" | "success";

function ResetPin() {
  const navigate = useNavigate();
  const { resetPinLock, signOut, pinLocked } = useApp();
  const [stage, setStage] = useState<Stage>("intro");

  const startScan = () => {
    setStage("scanning");
    setTimeout(() => setStage("success"), 2200);
  };

  const finishReset = () => { signOut(); navigate({ to: "/login" }); };

  useEffect(() => {
    if (stage !== "success") return;
    // Clear the block immediately; the redirect itself can also happen
    // early if the user taps Continue instead of waiting out the timer.
    resetPinLock();
    const t = setTimeout(finishReset, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, resetPinLock]);

  if (stage === "success") {
    return (
      <PhoneFrame>
        <StatusScreen
          variant="success"
          title="It's really you"
          description="Taking you to the sign-in page. You can log in with your mobile number and app PIN."
          buttonLabel="Continue"
          onButtonClick={finishReset}
        />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="flex flex-col h-full overflow-y-auto p-8">
        <button onClick={() => navigate({ to: "/home" })} className="h-10 w-10 shrink-0 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
          <ArrowLeft className="h-4 w-4" />
        </button>

        {stage === "intro" && (
          <div className="flex-1 flex flex-col">
            <div className="mx-auto mt-6 h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-center">
              {pinLocked ? "Approval PIN blocked" : "Reset approval PIN"}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm text-center max-w-xs mx-auto">
              {pinLocked
                ? "For your safety we've blocked your PIN after 3 wrong tries. Verify it's you with a quick selfie."
                : "We'll verify it's you with a quick selfie, then send you back to sign in."}
            </p>

            <div className="mt-10 mx-auto h-56 w-56 rounded-[2rem] border-4 border-dashed border-primary/40 flex items-center justify-center">
              <ScanFace className="h-24 w-24 text-primary/70" strokeWidth={1.4} />
            </div>

            <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs mx-auto">
              Look straight at the camera in good light. Nothing is uploaded in this demo.
            </p>

            <div className="mt-auto pt-8">
              <Button size="lg" onClick={startScan} className="h-14 w-full rounded-2xl shadow-button">
                Start selfie verification
              </Button>
            </div>
          </div>
        )}

        {stage === "scanning" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ripple" />
              <div className="relative h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                <ScanFace className="h-16 w-16 text-primary" strokeWidth={1.6} />
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying your face…
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
