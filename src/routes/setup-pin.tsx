import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Delete, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/setup-pin")({ component: SetupPin });

function SetupPin() {
  const navigate = useNavigate();
  const { setApprovalPin } = useApp();
  const [stage, setStage] = useState<"create" | "confirm">("create");
  const [first, setFirst] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

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
            if (next === first) { setApprovalPin(next); navigate({ to: "/home" }); }
            else { setError("PINs don't match. Try again."); setPin(""); setStage("create"); setFirst(""); }
          }, 150);
        }
      }
      return next;
    });
  };
  const back = () => setPin((p) => p.slice(0, -1));

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen sm:min-h-[860px] p-8">
        <div className="mx-auto mt-2 h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-button">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-center">
          {stage === "create" ? "Set your approval PIN" : "Confirm your PIN"}
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
