import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, Sparkles, PartyPopper, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/demo-vouchers")({ component: DemoVouchers });

type Voucher = {
  id: "ott" | "blu" | "1v";
  supplier: string;
  code: string;
  gradient: string;   // tailwind classes for card background
  accent: string;     // tailwind text color for supplier label
  emoji: string;
};

const VOUCHERS: Voucher[] = [
  {
    id: "ott",
    supplier: "OTT Voucher",
    code: "123456789012",
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
    accent: "text-blue-100",
    emoji: "🎫",
  },
  {
    id: "blu",
    supplier: "Blu Voucher",
    code: "1234567890123456",
    gradient: "from-cyan-400 via-sky-500 to-blue-600",
    accent: "text-cyan-50",
    emoji: "💎",
  },
  {
    id: "1v",
    supplier: "1Voucher",
    code: "1234567890123456",
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    accent: "text-pink-50",
    emoji: "🎁",
  },
];

function DemoVouchers() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const copy = async (v: Voucher) => {
    try {
      await navigator.clipboard.writeText(v.code);
    } catch {
      // Fallback for browsers without clipboard permission
      const ta = document.createElement("textarea");
      ta.value = v.code;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
    setCopiedId(v.id);
    // Nice, simplified transition to home after copy.
    setTimeout(() => setLeaving(true), 900);
    setTimeout(() => navigate({ to: "/home" }), 1500);
  };

  return (
    <PhoneFrame>
      <div
        className={`relative flex flex-col min-h-screen sm:min-h-[860px] p-6 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background transition-opacity duration-500 ${
          leaving ? "opacity-0 scale-[0.98]" : "opacity-100"
        }`}
      >
        {/* Floating confetti-ish blobs for fun */}
        <span className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <span className="pointer-events-none absolute top-40 -right-16 h-52 w-52 rounded-full bg-gold/25 blur-3xl" />

        <div className="relative flex items-center gap-2 mt-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <PartyPopper className="h-5 w-5 text-gold-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Welcome gift</p>
            <p className="text-sm text-muted-foreground">You're all set up!</p>
          </div>
        </div>

        <h1 className="relative mt-5 text-[26px] leading-tight font-bold tracking-tight">
          Try Alula Pay <span className="text-primary">for free</span> 🎉
        </h1>
        <p className="relative mt-2 text-sm text-muted-foreground max-w-xs">
          Here are three demo voucher pins. Copy one, then tap Redeem on your home screen to load your wallet.
        </p>

        <div className="relative mt-6 space-y-3">
          {VOUCHERS.map((v) => {
            const copied = copiedId === v.id;
            return (
              <div
                key={v.id}
                className={`relative rounded-2xl p-[2px] bg-gradient-to-br ${v.gradient} shadow-card transition-transform ${
                  copied ? "scale-[1.02]" : ""
                }`}
              >
                <div className={`rounded-[14px] p-4 bg-gradient-to-br ${v.gradient} text-white relative overflow-hidden`}>
                  <span className="absolute -right-6 -bottom-6 text-6xl opacity-15 select-none">{v.emoji}</span>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      <p className={`text-[11px] font-bold uppercase tracking-wider ${v.accent}`}>
                        {v.supplier}
                      </p>
                    </div>
                    <span className="text-lg">{v.emoji}</span>
                  </div>

                  <p className="mt-2 font-mono text-[17px] font-bold tracking-[0.15em] break-all">
                    {v.code}
                  </p>

                  <button
                    onClick={() => copy(v)}
                    disabled={copied}
                    className={`mt-3 w-full h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.98] ${
                      copied
                        ? "bg-white text-emerald-600"
                        : "bg-white/95 hover:bg-white text-slate-900"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={3} />
                        Copied — opening your wallet…
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy voucher pin
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mt-5 flex items-start gap-2 rounded-2xl bg-gold/15 border border-gold/40 p-3">
          <Sparkles className="h-4 w-4 text-gold-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-foreground/80 leading-relaxed">
            Copy any pin above, then on the home screen tap <b>Redeem Voucher</b> and paste it.
            Alula will show you how — just tap the yellow <b>Help</b> button.
          </p>
        </div>

        <div className="flex-1" />

        <p className="relative mt-4 text-center text-xs text-muted-foreground">
          Tap <b>Copy voucher pin</b> above to continue to your wallet.
        </p>

      </div>
    </PhoneFrame>
  );
}
