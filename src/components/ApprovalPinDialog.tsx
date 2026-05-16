import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Delete } from "lucide-react";
import { useApp } from "@/lib/app-state";

export function ApprovalPinDialog({
  open, onOpenChange, onApprove,
}: { open: boolean; onOpenChange: (v: boolean) => void; onApprove: () => void }) {
  const { approvalPin } = useApp();
  const [pin, setPin] = useState("");

  useEffect(() => { if (!open) setPin(""); }, [open]);
  useEffect(() => {
    if (pin.length === 5) {
      // Prototype: any 5-digit PIN approves (per spec).
      const t = setTimeout(() => { onApprove(); onOpenChange(false); }, 250);
      return () => clearTimeout(t);
    }
  }, [pin, onApprove, onOpenChange]);

  const press = (d: string) => setPin((p) => (p.length < 5 ? p + d : p));
  const back = () => setPin((p) => p.slice(0, -1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-sm">
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

        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <Button key={d} variant="secondary" onClick={() => press(d)} className="h-14 text-xl rounded-2xl">{d}</Button>
          ))}
          <div />
          <Button variant="secondary" onClick={() => press("0")} className="h-14 text-xl rounded-2xl">0</Button>
          <Button variant="ghost" onClick={back} className="h-14 rounded-2xl"><Delete className="h-5 w-5" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
