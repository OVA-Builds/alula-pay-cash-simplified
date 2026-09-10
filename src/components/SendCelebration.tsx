import { PartyPopper, Flame } from "lucide-react";

export type CelebrationInfo = { firstSend: boolean; struckDay: number | null; challengeDays: number | null };

// Shown on a payment's success screen — a one-off congratulations for the
// very first send ever, and/or a note when that send struck today's day on
// an active savings challenge.
export function SendCelebration({ info }: { info: CelebrationInfo }) {
  if (!info.firstSend && info.struckDay === null) return null;

  return (
    <div className="mt-4 w-full space-y-3">
      {info.firstSend && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/15 p-4 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/30">
            <PartyPopper className="h-5 w-5 text-gold-foreground" />
          </span>
          <div>
            <p className="text-sm font-bold">Congratulations on your first send!</p>
            <p className="text-xs text-muted-foreground">Welcome to Alula Pay — here's to many more.</p>
          </div>
        </div>
      )}
      {info.struckDay !== null && info.challengeDays !== null && (
        <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20">
            <Flame className="h-5 w-5 text-success" />
          </span>
          <div>
            <p className="text-sm font-bold text-success">Day {info.struckDay} of {info.challengeDays} — done!</p>
            <p className="text-xs text-muted-foreground">Your challenge streak just got stronger.</p>
          </div>
        </div>
      )}
    </div>
  );
}
