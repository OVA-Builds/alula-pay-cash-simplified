import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, BadgeCheck, Trash2, Boxes, Package, TrendingUp, Thermometer } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { AppShell } from "@/components/AppShell";
import { HustleHeader } from "@/components/HustleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/BottomSheet";
import { useApp, formatZAR, type BusinessLineItem, type BusinessEntry, type BusinessLogType } from "@/lib/app-state";

export const Route = createFileRoute("/hustle/mine/$id")({ component: HustleDashboard });

const PIE_COLORS = ["var(--color-destructive)", "var(--color-primary)"];

const TYPE_META: Record<BusinessLogType, { icon: typeof Package; label: string; placeholder: string }> = {
  ingredients: { icon: Package, label: "Ingredients", placeholder: "e.g. Meat" },
  supplies: { icon: Boxes, label: "Supplies", placeholder: "e.g. Packaging" },
  profit: { icon: TrendingUp, label: "Profit", placeholder: "e.g. Morning sales" },
};

function entryTotal(e: BusinessEntry) {
  return e.items.reduce((s, i) => s + i.amount, 0);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDay(d: Date) {
  const now = new Date();
  if (isSameDay(d, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

function HustleDashboard() {
  const router = useRouter();
  const { id } = Route.useParams();
  const { sideHustles, addBusinessEntry } = useApp();
  const hustle = sideHustles.find((h) => h.id === id);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<BusinessLogType>("ingredients");
  const [items, setItems] = useState<BusinessLineItem[]>([]);
  const [itemLabel, setItemLabel] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [savePct, setSavePct] = useState("10");
  const [limitHit, setLimitHit] = useState(false);
  const [dayDetail, setDayDetail] = useState<{ date: Date; entries: BusinessEntry[] } | null>(null);

  const entries = hustle?.entries ?? [];

  const loggedTodayCount = useMemo(() => {
    const now = new Date();
    return entries.filter((e) => isSameDay(new Date(e.createdAt), now)).length;
  }, [entries]);
  const dayLimitReached = loggedTodayCount >= 2;

  const totals = useMemo(() => {
    const cost = entries.filter((e) => e.type !== "profit").reduce((s, e) => s + entryTotal(e), 0);
    const profit = entries.filter((e) => e.type === "profit").reduce((s, e) => s + entryTotal(e), 0);
    return { cost, profit, revenue: cost + profit };
  }, [entries]);

  const avgMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : null;

  const health = useMemo(() => {
    if (entries.length === 0 || avgMargin === null) {
      return { score: 0, label: "No data yet", color: "text-muted-foreground", bar: "bg-muted", comment: "Log your first day to see how this business is really doing." };
    }
    const score = Math.max(0, Math.min(100, avgMargin));
    if (score >= 40) {
      return {
        score, label: "Thriving", color: "text-success", bar: "bg-success",
        comment: `Strong margins — you're keeping about ${Math.round(score)} in every R100 you bring in. Keep the routine going, and this is a good business to grow your save percentage on.`,
      };
    }
    if (score >= 20) {
      return {
        score, label: "Average", color: "text-gold-foreground", bar: "bg-gold",
        comment: `You're holding your own — about ${Math.round(score)} in every R100 stays with you. A small trim on your biggest expense, or a small price nudge, would move this from average to thriving.`,
      };
    }
    return {
      score, label: "Struggling", color: "text-destructive", bar: "bg-destructive",
      comment: `Costs are eating most of what comes in right now — only about ${Math.max(0, Math.round(score))} in every R100 is actually profit. Look hard at your biggest expense line before your next few days and see what can be cut or negotiated.`,
    };
  }, [entries.length, avgMargin]);

  const pieData = [
    { name: "Operational costs", value: totals.cost },
    { name: "Profit", value: totals.profit },
  ].filter((d) => d.value > 0);

  const profitBars = useMemo(
    () => [...entries].filter((e) => e.type === "profit").reverse().map((e, i) => ({ i: i + 1, profit: entryTotal(e) })),
    [entries]
  );

  const dayGroups = useMemo(() => {
    const map = new Map<string, BusinessEntry[]>();
    for (const e of entries) {
      const d = new Date(e.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.values()).map((list) => ({ key: String(list[0].createdAt), date: new Date(list[0].createdAt), entries: list }));
  }, [entries]);

  const addItem = () => {
    const amt = Number(itemAmount) || 0;
    if (!itemLabel.trim() || amt <= 0) return;
    setItems((prev) => [...prev, { label: itemLabel.trim(), amount: amt }]);
    setItemLabel("");
    setItemAmount("");
  };
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const itemsTotal = items.reduce((s, i) => s + i.amount, 0);
  const savePctNum = Math.max(0, Math.min(100, Number(savePct) || 0));
  const canSubmit = !dayLimitReached && items.length > 0;

  const reset = () => {
    setType("ingredients"); setItems([]); setItemLabel(""); setItemAmount(""); setSavePct("10"); setLimitHit(false);
  };

  const submit = () => {
    if (!hustle || !canSubmit) return;
    const created = addBusinessEntry(hustle.id, {
      type, items,
      savePct: type === "profit" ? savePctNum : 0,
    });
    if (!created) { setLimitHit(true); return; }
    reset();
    setOpen(false);
  };

  if (!hustle) {
    return (
      <AppShell hideNav>
        <div className="p-6">
          <p>Side hustle not found.</p>
          <Button onClick={() => router.navigate({ to: "/hustle/mine" })} className="mt-4">Back</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      <div className="flex min-h-full flex-col bg-neutral-950">
        <HustleHeader
          fallbackTo="/hustle/mine"
          title={
            <span className="flex items-center gap-1.5">
              <span className="truncate">{hustle.name}</span>
              {hustle.registered && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
            </span>
          }
          subtitle={hustle.description}
          right={
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground shadow-gold active:scale-95 transition-transform"
              aria-label="Log a day"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          }
        />

        <div className="-mt-4 flex-1 space-y-4 rounded-t-[2rem] bg-background p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
          {/* Health thermometer */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Business Health</p>
            </div>
            <div className="mt-4 flex items-center gap-5">
              <div className="h-32 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                <div
                  className={`w-full rounded-full transition-[height] duration-700 ${health.bar}`}
                  style={{ height: `${Math.max(6, health.score)}%`, marginTop: `${100 - Math.max(6, health.score)}%` }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xl font-bold ${health.color}`}>{health.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{health.comment}</p>
              </div>
            </div>
          </div>

          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Where the money goes</p>
              <div style={{ width: "100%", height: 180 }} className="mt-2">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatZAR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[11px] text-muted-foreground">{d.name}: {formatZAR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profit over time */}
          {profitBars.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Profit per day logged</p>
              <div style={{ width: "100%", height: 160 }} className="mt-2">
                <ResponsiveContainer>
                  <BarChart data={profitBars} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="i" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--color-border)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} width={44}
                      tickFormatter={(v: number) => `R${v}`} />
                    <Tooltip formatter={(v: number) => formatZAR(v)} labelFormatter={(l) => `Entry ${l}`} />
                    <Bar dataKey="profit" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Entry log */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Logged days</p>
              <p className="text-[11px] text-muted-foreground">Up to 2 logs a day</p>
            </div>
            {entries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">Tap + to log your first day.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dayGroups.map((g) => {
                  const dayCost = g.entries.filter((e) => e.type !== "profit").reduce((s, e) => s + entryTotal(e), 0);
                  const dayProfit = g.entries.filter((e) => e.type === "profit").reduce((s, e) => s + entryTotal(e), 0);
                  return (
                    <button
                      key={g.key}
                      onClick={() => setDayDetail(g)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-transform active:scale-[0.98]"
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{formatDay(g.date)}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{g.entries.length} {g.entries.length === 1 ? "log" : "logs"} — tap to see details</p>
                      </div>
                      <div className="text-right">
                        {dayCost > 0 && <p className="text-xs font-semibold text-foreground">-{formatZAR(dayCost)}</p>}
                        {dayProfit > 0 && <p className="text-sm font-bold text-success">+{formatZAR(dayProfit)}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day detail popup */}
      <BottomSheet open={!!dayDetail} onClose={() => setDayDetail(null)}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        <div className="max-h-[80vh] overflow-y-auto px-6 pb-8 pt-5">
          <h2 className="text-xl font-bold">{dayDetail ? formatDay(dayDetail.date) : ""}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Everything logged that day, all in one place.</p>

          <div className="mt-5 space-y-4">
            {(["ingredients", "supplies", "profit"] as BusinessLogType[]).map((t) => {
              const lines = (dayDetail?.entries ?? []).filter((e) => e.type === t).flatMap((e) => e.items);
              if (lines.length === 0) return null;
              const meta = TYPE_META[t];
              const Icon = meta.icon;
              const subtotal = lines.reduce((s, l) => s + l.amount, 0);
              return (
                <div key={t}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{meta.label}</p>
                    <p className="ml-auto text-xs font-bold text-foreground">{formatZAR(subtotal)}</p>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {lines.map((l, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                        <span className="text-xs font-medium">{l.label}</span>
                        <span className="text-xs font-semibold">{formatZAR(l.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BottomSheet>

      {/* Log form */}
      <BottomSheet open={open} onClose={() => { setOpen(false); reset(); }}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        <div className="max-h-[80vh] overflow-y-auto px-6 pt-5">
          <h2 className="text-xl font-bold">Log today</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add each cost or sale to the list — up to two logs a day.</p>

          {(dayLimitReached || limitHit) && (
            <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-xs font-semibold text-destructive">
                You've already logged twice today — come back tomorrow for your next entry.
              </p>
            </div>
          )}

          <div className="mt-5">
            <Label>What are you logging?</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["ingredients", "supplies", "profit"] as BusinessLogType[]).map((t) => {
                const meta = TYPE_META[t];
                const Icon = meta.icon;
                return (
                  <button
                    key={t}
                    onClick={() => { setType(t); setItems([]); }}
                    className={`flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-semibold transition-colors ${
                      type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <Label>{TYPE_META[type].label}</Label>
            {items.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                    <span className="text-xs font-medium">{it.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{formatZAR(it.amount)}</span>
                      <button onClick={() => removeItem(i)} aria-label="Remove item">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <span className="text-[11px] font-semibold text-muted-foreground">Total</span>
                  <span className="text-xs font-bold">{formatZAR(itemsTotal)}</span>
                </div>
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <Input value={itemLabel} onChange={(e) => setItemLabel(e.target.value)} placeholder={TYPE_META[type].placeholder}
                className="h-11 flex-1 rounded-2xl" autoFocus />
              <Input value={itemAmount} inputMode="decimal" placeholder="R0"
                onChange={(e) => setItemAmount(e.target.value.replace(/[^\d.]/g, ""))}
                className="h-11 w-24 rounded-2xl" />
              <Button variant="secondary" onClick={addItem} className="h-11 rounded-2xl px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {type === "profit" && (
            <div className="mt-4">
              <Label>Save what % of today's profit?</Label>
              <Input value={savePct} inputMode="numeric" placeholder="10"
                onChange={(e) => setSavePct(e.target.value.replace(/\D/g, ""))}
                className="mt-2 h-12 rounded-2xl" />
              {itemsTotal > 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">That's {formatZAR((itemsTotal * savePctNum) / 100)} to put aside.</p>
              )}
            </div>
          )}

          <Button size="lg" disabled={!canSubmit} onClick={submit} className="mb-8 mt-6 h-14 w-full rounded-2xl shadow-button">
            Save today's entry
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
