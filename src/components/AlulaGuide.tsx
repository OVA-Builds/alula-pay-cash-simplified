import { useState } from "react";
import { Sparkles, X, ArrowDown, ArrowDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

type Mode = "menu" | "deposit" | "withdraw";

/**
 * Alula in-app guide. When enabled, pops up to ask Deposit or Withdraw
 * and overlays arrow hints on the right home cards. Pure presentation.
 */
export function AlulaGuide() {
  const { alulaOn } = useApp();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");

  if (!alulaOn) return null;

  return (
    <>
      <button
        onClick={() => { setMode("menu"); setOpen(true); }}
        className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-gradient-gold shadow-gold flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Alula assistant"
      >
        <Sparkles className="h-6 w-6 text-gold-foreground" strokeWidth={2.4} />
      </button>

      <Dialog open={open && mode === "menu"} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-gold flex items-center justify-center mb-2">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
            </div>
            <DialogTitle className="text-center">Hi, I'm Alula</DialogTitle>
            <DialogDescription className="text-center">What would you like to do today?</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="secondary" onClick={() => setMode("deposit")} className="h-20 rounded-2xl flex flex-col gap-1">
              <ArrowDownLeft className="h-5 w-5 text-success" />
              <span>Deposit</span>
            </Button>
            <Button variant="secondary" onClick={() => setMode("withdraw")} className="h-20 rounded-2xl flex flex-col gap-1">
              <ArrowDown className="h-5 w-5 text-primary" />
              <span>Send / Withdraw</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {open && mode !== "menu" && (
        <GuideOverlay mode={mode} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function GuideOverlay({ mode, onClose }: { mode: "deposit" | "withdraw"; onClose: () => void }) {
  const steps = mode === "deposit"
    ? [
        { title: "Step 1 — Tap Redeem Voucher", body: "Use it to load cash from any Alula voucher: OTT, Blu, or 1Voucher." },
        { title: "Step 2 — Choose voucher type", body: "Pick your voucher, type or scan the code, then tap Redeem." },
        { title: "Step 3 — Done!", body: "Your balance updates instantly. You can now send to any SA bank." },
      ]
    : [
        { title: "Step 1 — Tap Send to Bank", body: "Pick a saved beneficiary or do a once-off payment to any SA bank." },
        { title: "Step 2 — Enter amount", body: "We'll show the fee and your new balance as soon as you type." },
        { title: "Step 3 — Approve with your PIN", body: "Enter your 5-digit approval PIN and we'll send it instantly." },
      ];
  const [i, setI] = useState(0);
  const last = i === steps.length - 1;

  // Try to point at a real card on the page.
  const targetId = mode === "deposit" ? "guide-redeem" : "guide-send";
  const target = typeof document !== "undefined" ? document.getElementById(targetId) : null;
  const rect = target?.getBoundingClientRect();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col">
      {rect && (
        <div
          className="absolute pointer-events-none border-2 border-gold rounded-2xl shadow-gold animate-pulse-arrow"
          style={{ left: rect.left - 4, top: rect.top - 4, width: rect.width + 8, height: rect.height + 8 }}
        />
      )}
      <div className="mt-auto bg-card text-card-foreground rounded-t-3xl p-6 shadow-card">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-gold-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{steps[i].title}</p>
            <p className="text-sm text-muted-foreground mt-1">{steps[i].body}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1 mb-4">
          {steps.map((_, idx) => (
            <span key={idx} className={`h-1 flex-1 rounded-full ${idx <= i ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <Button onClick={() => last ? onClose() : setI(i + 1)} className="h-12 w-full rounded-2xl">
          {last ? "Got it" : "Next"}
        </Button>
      </div>
    </div>
  );
}
