import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Briefcase, Plus, ChevronRight, BadgeCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BottomSheet } from "@/components/BottomSheet";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/hustle/mine/")({ component: MyHustles });

function MyHustles() {
  const router = useRouter();
  const navigate = useNavigate();
  const { sideHustles, addSideHustle } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [registered, setRegistered] = useState(false);

  const atLimit = sideHustles.length >= 5;
  const canAdd = name.trim().length >= 2 && description.trim().length >= 2 && !atLimit;

  const reset = () => { setName(""); setDescription(""); setRegistered(false); };

  const submit = () => {
    if (!canAdd) return;
    const created = addSideHustle({ name: name.trim(), description: description.trim(), registered });
    reset();
    setOpen(false);
    if (created) navigate({ to: "/hustle/mine/$id", params: { id: created.id } });
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
          {!atLimit && (
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground shadow-gold active:scale-95 transition-transform"
              aria-label="Add side hustle"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">My Side Hustles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sideHustles.length} of 5 added
          {atLimit ? " — that's the max for now." : ""}
        </p>

        {sideHustles.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
              <Briefcase className="h-6 w-6 text-gold-foreground" />
            </span>
            <p className="mt-4 font-semibold">No side hustles yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add one to start tracking its health.</p>
            <Button onClick={() => setOpen(true)} className="mt-5 h-11 rounded-2xl px-6 shadow-button">
              Add a side hustle
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {sideHustles.map((h) => (
              <button
                key={h.id}
                onClick={() => navigate({ to: "/hustle/mine/$id", params: { id: h.id } })}
                className="flex w-full items-center gap-3 rounded-3xl border border-border bg-card p-4 text-left shadow-card transition-transform active:scale-[0.98]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15">
                  <Briefcase className="h-5 w-5 text-gold-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-bold">{h.name}</p>
                    {h.registered && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{h.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={open} onClose={() => { setOpen(false); reset(); }}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        <div className="px-6 pt-5">
          <h2 className="text-xl font-bold">Add a side hustle</h2>
          <p className="mt-1 text-sm text-muted-foreground">Just the basics — you'll track the rest inside.</p>

          <div className="mt-5 space-y-4">
            <div>
              <Label>Side hustle name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cow head stand"
                className="mt-2 h-12 rounded-2xl" autoFocus />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Weekend stand near the taxi rank"
                className="mt-2 h-12 rounded-2xl" />
            </div>
            <label className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
              <div>
                <p className="text-sm font-medium">Registered company</p>
                <p className="text-xs text-muted-foreground">Is this a registered business?</p>
              </div>
              <Switch checked={registered} onCheckedChange={setRegistered} />
            </label>
          </div>

          <Button size="lg" disabled={!canAdd} onClick={submit} className="mt-6 h-14 w-full rounded-2xl shadow-button">
            Add side hustle
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
