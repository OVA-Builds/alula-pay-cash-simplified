import { Zap, Clock, Lock } from "lucide-react";
import { formatZAR, calcTransferFee, type Plan } from "@/lib/app-state";

export function RailToggle({
  amount,
  plan,
  value,
  onChange,
}: {
  amount: number;
  plan: Plan;
  value: "EFT" | "RTC";
  onChange: (r: "EFT" | "RTC") => void;
}) {
  const instantLocked = plan !== "pro";
  const cost = (rail: "EFT" | "RTC") => (amount > 0 ? calcTransferFee(amount, plan, rail).fee : 0);

  const options = [
    {
      rail: "RTC" as const,
      icon: Zap,
      title: "Immediate payment",
      sub: "Lands within 10 minutes",
      locked: instantLocked,
    },
    {
      rail: "EFT" as const,
      icon: Clock,
      title: "Basic EFT",
      sub: "Lands in 1–2 working days",
      locked: false,
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        How should it be sent?
      </p>
      {options.map(({ rail, icon: Icon, title, sub, locked }) => {
        const active = value === rail && !locked;
        return (
          <button
            key={rail}
            type="button"
            disabled={locked}
            onClick={() => onChange(rail)}
            className={`w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition-all ${
              active
                ? "border-primary bg-primary/5 shadow-soft"
                : "border-border bg-card"
            } ${locked ? "opacity-50 cursor-not-allowed" : "active:scale-[0.99]"}`}
          >
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                active ? "bg-primary/15" : "bg-muted"
              }`}
            >
              {locked ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold flex items-center gap-2">
                {title}
                {locked && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/25 text-gold-foreground px-1.5 py-0.5 rounded-full">
                    Pro only
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locked ? "Upgrade to Pro to send immediately" : sub}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fee</p>
              <p className="text-sm font-bold">{formatZAR(cost(rail))}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
