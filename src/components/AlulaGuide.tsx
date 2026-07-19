import { useEffect, useState, useLayoutEffect } from "react";
import { Sparkles, X, ArrowDown, ArrowDownLeft } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

type Step = {
  path: string;         // pathname where this hint should appear
  targetId: string;     // id of the element to spotlight
  title: string;
  body: string;
  cta?: string;         // optional call-to-action line under body
};

const depositSteps: Step[] = [
  {
    path: "/home",
    targetId: "guide-redeem",
    title: "Step 1 — Tap Redeem Voucher",
    body: "This card opens the voucher redemption screen.",
    cta: "Tap the highlighted card to continue →",
  },
  {
    path: "/redeem",
    targetId: "guide-voucher-types",
    title: "Step 2 — Choose your voucher type",
    body: "Pick the brand printed on your voucher slip: OTT, Blu or 1Voucher.",
    cta: "Tap a voucher to continue →",
  },
];

const withdrawSteps: Step[] = [
  {
    path: "/home",
    targetId: "guide-send",
    title: "Step 1 — Tap Send to Bank",
    body: "This card starts a payment to any South African bank account.",
    cta: "Tap the highlighted card to continue →",
  },
  {
    path: "/send",
    targetId: "guide-send-options",
    title: "Step 2 — Pick a recipient",
    body: "Send to someone new (once-off) or choose from your saved beneficiaries.",
    cta: "Tap an option to continue →",
  },
];

/**
 * Alula in-app guide. Renders app-wide (via AppShell) so it can follow the
 * user across routes. Steps are keyed by pathname — advancing simply happens
 * by the user navigating naturally, and the guide auto-closes when they land
 * on a page not in the flow.
 */
export function AlulaGuide() {
  const { alulaOn, guideMode, startGuide, stopGuide } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Auto-close the guide when the user reaches a page beyond the tour
  // (e.g. redeem success or send-once-off input form).
  const steps = guideMode === "deposit" ? depositSteps : guideMode === "withdraw" ? withdrawSteps : [];
  const currentStep = steps.find((s) => s.path === pathname);
  useEffect(() => {
    if (guideMode && steps.length > 0 && !currentStep) {
      // On any unrelated page, close silently. This is what makes the guide
      // "disappear once it's time to enter details manually".
      stopGuide();
    }
  }, [guideMode, pathname, currentStep, steps.length, stopGuide]);

  if (!alulaOn) return null;

  return (
    <>
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed bottom-24 right-5 z-40 h-14 pl-3 pr-4 rounded-full bg-gradient-gold shadow-gold flex items-center gap-2 active:scale-95 transition-transform"
        aria-label="Alula assistant — Help"
      >
        <Sparkles className="h-5 w-5 text-gold-foreground" strokeWidth={2.4} />
        <span className="text-sm font-bold text-gold-foreground">Help</span>
      </button>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-gold flex items-center justify-center mb-2">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
            </div>
            <DialogTitle className="text-center">Hi, I'm Alula</DialogTitle>
            <DialogDescription className="text-center">What would you like to do today?</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              variant="secondary"
              onClick={() => { setMenuOpen(false); startGuide("deposit"); }}
              className="h-20 rounded-2xl flex flex-col gap-1"
            >
              <ArrowDownLeft className="h-5 w-5 text-success" />
              <span>Deposit</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setMenuOpen(false); startGuide("withdraw"); }}
              className="h-20 rounded-2xl flex flex-col gap-1"
            >
              <ArrowDown className="h-5 w-5 text-primary" />
              <span>Send / Withdraw</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {currentStep && (
        <GuideStep step={currentStep} index={steps.indexOf(currentStep)} total={steps.length} />
      )}
    </>
  );
}

function GuideStep({ step, index, total }: { step: Step; index: number; total: number }) {
  const { stopGuide } = useApp();
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Track the target element's position, updating on scroll/resize so the
  // spotlight stays glued to it while the page is still interactive.
  useLayoutEffect(() => {
    const measure = () => {
      const el = document.getElementById(step.targetId);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    const id = window.setInterval(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step.targetId]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Spotlight: pointer-events-none lets the user tap the highlighted card underneath */}
      {rect && (
        <div
          className="absolute rounded-2xl pointer-events-none animate-pulse-ring"
          style={{
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            outline: "3px solid var(--gold)",
            outlineOffset: 0,
          }}
        />
      )}
      {!rect && <div className="absolute inset-0 bg-black/55" />}

      {/* Coaching card at the bottom — interactive */}
      <div className="absolute left-0 right-0 bottom-0 bg-card text-card-foreground rounded-t-3xl p-5 shadow-card pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-gold-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{step.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.body}</p>
            {step.cta && (
              <p className="text-xs font-semibold mt-2 text-primary">{step.cta}</p>
            )}
          </div>
          <button
            onClick={stopGuide}
            aria-label="Close guide"
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1 mt-3">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
