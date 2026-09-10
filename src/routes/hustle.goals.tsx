import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Target, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/BottomSheet";
import { useApp, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/hustle/goals")({ component: Goals });

function Goals() {
  const router = useRouter();
  const { goals, addGoal, deleteGoal } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [duration, setDuration] = useState("");

  const costNum = Number(cost) || 0;
  const durationNum = Number(duration) || 0;
  const canAdd = name.trim().length >= 2 && costNum > 0 && durationNum > 0;

  const reset = () => { setName(""); setCost(""); setDuration(""); };

  const submit = () => {
    if (!canAdd) return;
    addGoal({ name: name.trim(), cost: costNum, durationMonths: durationNum });
    reset();
    setOpen(false);
  };

  return (
    <AppShell hideNav>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/hustle" }))}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground shadow-gold active:scale-95 transition-transform"
            aria-label="Add goal"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">Goals</h1>
        <p className="mt-1 text-sm text-muted-foreground">What are you saving for? Add it yourself — nothing here is preset.</p>

        {goals.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
              <Target className="h-6 w-6 text-gold-foreground" />
            </span>
            <p className="mt-4 font-semibold">No goals yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Buy a car, a PlayStation, whatever it is — tap + to add it.</p>
            <Button onClick={() => setOpen(true)} className="mt-5 h-11 rounded-2xl px-6 shadow-button">
              Add a goal
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {goals.map((g) => {
              const perMonth = g.cost / g.durationMonths;
              return (
                <div key={g.id} className="rounded-3xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15">
                      <Target className="h-5 w-5 text-gold-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{g.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatZAR(g.cost)} in {g.durationMonths} {g.durationMonths === 1 ? "month" : "months"}
                      </p>
                    </div>
                    <button
                      aria-label="Delete goal"
                      onClick={() => deleteGoal(g.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 rounded-2xl bg-gold/10 px-3 py-2.5">
                    <p className="text-xs font-semibold text-gold-foreground">
                      Save {formatZAR(perMonth)} a month to hit it on time.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomSheet open={open} onClose={() => { setOpen(false); reset(); }}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        <div className="px-6 pt-5">
          <h2 className="text-xl font-bold">Add a goal</h2>
          <p className="mt-1 text-sm text-muted-foreground">Name it, price it, and give yourself a timeline.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label>Goal name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Buy a car"
                className="mt-2 h-12 rounded-2xl" autoFocus />
            </div>
            <div>
              <Label>Cost (ZAR)</Label>
              <Input value={cost} inputMode="decimal" placeholder="0.00"
                onChange={(e) => setCost(e.target.value.replace(/[^\d.]/g, ""))}
                className="mt-2 h-12 rounded-2xl" />
            </div>
            <div>
              <Label>Duration (months)</Label>
              <Input value={duration} inputMode="numeric" placeholder="e.g. 6"
                onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
                className="mt-2 h-12 rounded-2xl" />
            </div>
          </div>

          {costNum > 0 && durationNum > 0 && (
            <div className="mt-4 rounded-2xl bg-gold/10 px-4 py-3">
              <p className="text-xs font-semibold text-gold-foreground">
                That's {formatZAR(costNum / durationNum)} a month.
              </p>
            </div>
          )}

          <Button size="lg" disabled={!canAdd} onClick={submit} className="mt-6 h-14 w-full rounded-2xl shadow-button">
            Add goal
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
