import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Flame, Check, PartyPopper, Bell, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useApp, CHALLENGE_LENGTHS, type ChallengeLength } from "@/lib/app-state";

export const Route = createFileRoute("/hustle/challenge")({ component: ChallengePage });

const DAY_MS = 24 * 60 * 60 * 1000;

function ChallengePage() {
  const router = useRouter();
  const { challenge, startChallenge, endChallenge } = useApp();

  const back = () => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/hustle" }));

  if (!challenge) {
    return (
      <AppShell hideNav>
        <div className="min-h-screen bg-neutral-950 pb-10">
          <Header onBack={back} />
          <div className="-mt-4 rounded-t-[2rem] bg-background p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
            <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
                <Flame className="h-6 w-6 text-gold-foreground" />
              </span>
              <p className="mt-4 font-bold">Set your own challenge</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a streak length. Every time you send money, that day gets struck automatically.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {CHALLENGE_LENGTHS.map((d) => (
                <button
                  key={d}
                  onClick={() => startChallenge(d as ChallengeLength)}
                  className="rounded-3xl border border-border bg-card p-5 text-center shadow-card transition-transform active:scale-[0.97]"
                >
                  <p className="text-2xl font-bold text-gold-foreground">{d}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const { days, startedAt, struck } = challenge;
  const todayIndex = Math.floor((Date.now() - startedAt) / DAY_MS);
  const completedCount = struck.filter(Boolean).length;
  const allDone = completedCount === days;
  const hour = new Date().getHours();
  const withinReminderWindow = hour >= 9 && hour < 19;
  const todayUnstruck = todayIndex >= 0 && todayIndex < days && !struck[todayIndex];
  const showReminder = !allDone && todayUnstruck && withinReminderWindow;

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-neutral-950 pb-10">
        <Header onBack={back} />
        <div className="-mt-4 rounded-t-[2rem] bg-background p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
          {allDone ? (
            <div className="rounded-3xl border border-success/30 bg-success/10 p-6 text-center shadow-card">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/20">
                <PartyPopper className="h-6 w-6 text-success" />
              </span>
              <p className="mt-4 font-bold text-success">Challenge complete!</p>
              <p className="mt-1 text-sm text-muted-foreground">All {days} days struck. That's real consistency.</p>
              <Button onClick={endChallenge} className="mt-5 h-12 rounded-2xl px-6 shadow-button">
                Start a new challenge
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{days}-Day Challenge</p>
                    <p className="mt-1 text-xl font-bold">{completedCount} of {days} days</p>
                  </div>
                  <button
                    onClick={endChallenge}
                    aria-label="Reset challenge"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gold transition-[width] duration-700"
                    style={{ width: `${(completedCount / days) * 100}%` }}
                  />
                </div>
              </div>

              {showReminder && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/15 p-3.5">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-gold-foreground" />
                  <p className="text-xs leading-relaxed text-foreground">
                    <b>Don't lose the streak.</b> You haven't made a deposit for today yet — send anything on Alula
                    Pay and today's day strikes automatically.
                  </p>
                </div>
              )}

              <div className="mt-5 grid grid-cols-5 gap-2.5">
                {Array.from({ length: days }, (_, i) => {
                  const done = struck[i];
                  const isToday = i === todayIndex;
                  return (
                    <div
                      key={i}
                      className={`flex aspect-square flex-col items-center justify-center rounded-2xl border text-xs font-bold ${
                        done
                          ? "border-success bg-success/15 text-success"
                          : isToday
                            ? "border-gold bg-gold/10 text-gold-foreground ring-2 ring-gold/40"
                            : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <span>{i + 1}</span>}
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 px-1 text-center text-[11px] text-muted-foreground">
                Days count from when you started the challenge. Reminders only show between 9am and 7pm.
              </p>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pb-8 pt-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gold/10" />
      <div className="relative flex items-center gap-3 px-6">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="relative mt-5 px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
          <Flame className="h-3 w-3" /> Challenge
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Build the streak.</h1>
        <p className="mt-2 text-sm text-white/60">Send money, strike the day. Simple as that.</p>
      </div>
    </div>
  );
}
