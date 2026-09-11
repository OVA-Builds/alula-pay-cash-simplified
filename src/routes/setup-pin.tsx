import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, ScanFace, Delete, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/setup-pin")({ component: SetupPin });

type Stage = "selfie" | "scanning" | "create" | "confirm";

function SetupPin() {
  const navigate = useNavigate();
  const { approvalPin, setApprovalPin } = useApp();
  // A PIN already on file means this is a change, reached from Profile —
  // require a selfie first. Fresh signup has no PIN yet, so skip straight in.
  const [isChange] = useState(() => approvalPin !== null);
  const [stage, setStage] = useState<Stage>(isChange ? "selfie" : "create");
  const [first, setFirst] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const startScan = () => {
    setStage("scanning");
    setTimeout(() => setStage("create"), 2200);
  };

  const press = (d: string) => {
    setError("");
    setPin((p) => {
      if (p.length >= 5) return p;
      const next = p + d;
      if (next.length === 5) {
        if (stage === "create") {
          setTimeout(() => { setFirst(next); setPin(""); setStage("confirm"); }, 150);
        } else {
          setTimeout(() => {
            if (next === first) {
              setApprovalPin(next);
              navigate({ to: isChange ? "/profile" : "/demo-vouchers" });
            } else {
              setError("PINs don't match. Try again.");
              setPin("");
              setStage("create");
              setFirst("");
            }
          }, 150);
        }
      }
      return next;
    });
  };
  const back = () => setPin((p) => p.slice(0, -1));

  if (stage === "selfie" || stage === "scanning") {
    return (
      <PhoneFrame>
        <div className="flex flex-col h-full overflow-y-auto p-8">
          <button onClick={() => navigate({ to: "/profile" })} className="h-10 w-10 shrink-0 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>

          {stage === "selfie" && (
            <div className="flex-1 flex flex-col">
              <div className="mx-auto mt-5 h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ScanFace className="h-6 w-6 text-primary" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-center">
                Verify it's you
              </h1>
              <p className="mt-2 text-muted-foreground text-sm text-center max-w-xs mx-auto">
                Changing your approval PIN needs a quick selfie first, to keep your account safe.
              </p>

              <div className="mt-6 mx-auto h-40 w-40 shrink-0 rounded-[2rem] border-4 border-dashed border-primary/40 flex items-center justify-center">
                <ScanFace className="h-16 w-16 text-primary/70" strokeWidth={1.4} />
              </div>

              <p className="mt-6 text-xs text-muted-foreground text-center max-w-xs mx-auto">
                Look straight at the camera in good light. Nothing is uploaded in this demo.
              </p>

              <div className="mt-8 pb-2">
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

  return (
    <PhoneFrame>
      <div className="flex flex-col h-full overflow-y-auto p-8">
        {isChange && (
          <button onClick={() => navigate({ to: "/profile" })} className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className={`mx-auto h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-button ${isChange ? "mt-6" : "mt-2"}`}>
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-center">
          {stage === "create"
            ? isChange ? "Set your new approval PIN" : "Set your approval PIN"
            : isChange ? "Confirm your new PIN" : "Confirm your PIN"}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm text-center max-w-xs mx-auto">
          5 digits. This is different from your sign-in PIN. You'll enter it every time you send money.
        </p>

        <div className="flex justify-center gap-3 my-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-4 w-4 rounded-full transition-all ${pin.length > i ? "bg-primary scale-110" : "bg-muted"}`} />
          ))}
        </div>

        {error && <p className="text-center text-sm text-destructive mb-4">{error}</p>}

        <div className="grid grid-cols-3 gap-3 px-2">
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <Button key={d} variant="secondary" onClick={() => press(d)} className="h-16 text-2xl rounded-2xl">{d}</Button>
          ))}
          <div />
          <Button variant="secondary" onClick={() => press("0")} className="h-16 text-2xl rounded-2xl">0</Button>
          <Button variant="ghost" onClick={back} className="h-16 rounded-2xl"><Delete className="h-6 w-6" /></Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <Check className="h-3 w-3 text-success" /> Encrypted and stored on your device.
        </p>
      </div>
    </PhoneFrame>
  );
}
