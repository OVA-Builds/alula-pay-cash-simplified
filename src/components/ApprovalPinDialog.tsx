import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Delete, ShieldAlert } from "lucide-react";
import { useApp, formatZAR } from "@/lib/app-state";

export type PaymentSummary = {
  recipient: string;
  amount: number;
  fee: number;
  total: number;
};

export function ApprovalPinDialog({
  open, onOpenChange, onApprove, summary,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApprove: () => void;
  summary?: PaymentSummary;
}) {
  const navigate = useNavigate();
  const { approvalPin, pinAttemptsLeft, pinLocked, registerPinAttempt } = useApp();
  const [stage, setStage] = useState<"review" | "pin">(summary ? "review" : "pin");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset dialog when opened/closed
  useEffect(() => {
    if (!open) { setPin(""); setError(null); }
    else { setStage(summary ? "review" : "pin"); setPin(""); setError(null); }
  }, [open, summary]);

  // If PIN is already locked when dialog opens, redirect to reset flow.
  useEffect(() => {
    if (open && pinLocked) {
      onOpenChange(false);
      navigate({ to: "/reset-pin" });
    }
  }, [open, pinLocked, navigate, onOpenChange]);

  useEffect(() => {
    if (stage !== "pin" || pin.length !== 5) return;
    // Demo fallback: if no PIN was ever set, accept any 5 digits.
    const isCorrect = approvalPin ? pin === approvalPin : true;
    const t = setTimeout(() => {
      const res = registerPinAttempt(isCorrect);
      if (isCorrect) {
        onApprove();
        onOpenChange(false);
      } else if (res.locked) {
        setError("PIN entered incorrectly 3 times. Approval PIN is now blocked.");
        setTimeout(() => { onOpenChange(false); navigate({ to: "/reset-pin" }); }, 900);
      } else {
        setError(`Incorrect PIN. ${res.left} ${res.left === 1 ? "try" : "tries"} left.`);
        setPin("");
      }
    }, 220);
    return () => clearTimeout(t);
  }, [pin, stage, approvalPin, registerPinAttempt, onApprove, onOpenChange, navigate]);

  const press = (d: string) => { setError(null); setPin((p) => (p.length < 5 ? p + d : p)); };
  const back = () => setPin((p) => p.slice(0, -1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-sm">
        {stage === "review" && summary ? (
          <>
            <DialogHeader>
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-center">Confirm payment</DialogTitle>
              <DialogDescription className="text-center">
                Please review before you approve.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 rounded-2xl bg-muted/50 border border-border p-4 space-y-2 text-sm">
              <Row label="Paying" value={summary.recipient} />
              <Row label="Amount" value={formatZAR(summary.amount)} />
              <Row label="Fee" value={formatZAR(summary.fee)} muted />
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-base">{formatZAR(summary.total)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" className="h-12 rounded-2xl" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="h-12 rounded-2xl shadow-button" onClick={() => setStage("pin")}>
                Proceed to pay
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-center">Enter approval PIN</DialogTitle>
              <DialogDescription className="text-center">
                Your 5-digit approval PIN authorises this payment.
                {!approvalPin && <span className="block mt-1 text-xs text-muted-foreground">(Demo: any 5 digits)</span>}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center gap-2 my-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-3 w-3 rounded-full transition-all ${pin.length > i ? "bg-primary scale-110" : "bg-muted"}`} />
              ))}
            </div>

            {error ? (
              <p className="text-center text-xs text-destructive mb-2 min-h-4">{error}</p>
            ) : (
              <p className="text-center text-xs text-muted-foreground mb-2 min-h-4">
                {pinAttemptsLeft < 3 ? `${pinAttemptsLeft} ${pinAttemptsLeft === 1 ? "try" : "tries"} left` : ""}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <Button key={d} variant="secondary" onClick={() => press(d)} className="h-14 text-xl rounded-2xl">{d}</Button>
              ))}
              <div />
              <Button variant="secondary" onClick={() => press("0")} className="h-14 text-xl rounded-2xl">0</Button>
              <Button variant="ghost" onClick={back} className="h-14 rounded-2xl"><Delete className="h-5 w-5" /></Button>
            </div>

            <button
              type="button"
              onClick={() => { onOpenChange(false); navigate({ to: "/reset-pin" }); }}
              className="mt-4 text-xs font-semibold text-primary underline underline-offset-4 mx-auto block"
            >
              Forgot approval PIN?
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-muted-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={`font-medium ${muted ? "text-muted-foreground" : ""}`}>{value}</span>
    </div>
  );
}
