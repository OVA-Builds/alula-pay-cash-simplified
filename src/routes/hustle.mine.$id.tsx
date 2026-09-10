import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, BadgeCheck, Trash2, Boxes, Package, TrendingUp, Thermometer, Pencil } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AppShell } from "@/components/AppShell";
import { HustleHeader } from "@/components/HustleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/BottomSheet";
import { useApp, formatZAR, type BusinessLineItem, type BusinessEntry, type BusinessLogType } from "@/lib/app-state";

export const Route = createFileRoute("/hustle/mine/$id")({ component: HustleDashboard });

// Ingredients and supplies are both "cost" categories and share our blue;
// profit is our deep gold — consistent everywhere this shows up: the pie
// chart, the costs-vs-profit bar, and every icon/amount below.
const TYPE_META: Record<BusinessLogType, { icon: typeof Package; label: string; placeholder: string; color: string }> = {
  ingredients: { icon: Package, label: "Ingredients", placeholder: "e.g. Meat", color: "text-primary" },
  supplies: { icon: Boxes, label: "Supplies", placeholder: "e.g. Packaging", color: "text-primary" },
  profit: { icon: TrendingUp, label: "Profit", placeholder: "e.g. Cash sales", color: "text-gold" },
};

function sum(items: BusinessLineItem[]) {
  return items.reduce((s, i) => s + i.amount, 0);
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

// One "add a line" row shared by the Ingredients/Supplies/Profit sections of the log form.
function LineItemSection({
  type, items, onAdd, onRemove, autoFocus,
}: {
  type: BusinessLogType;
  items: BusinessLineItem[];
  onAdd: (item: BusinessLineItem) => void;
  onRemove: (i: number) => void;
  autoFocus?: boolean;
}) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  const add = () => {
    const amt = Number(amount) || 0;
    if (!label.trim() || amt <= 0) return;
    onAdd({ label: label.trim(), amount: amt });
    setLabel("");
    setAmount("");
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${meta.color}`} />
        <Label>{meta.label}</Label>
      </div>
      {items.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {items.map((it, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
              <span className="text-xs font-medium">{it.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{formatZAR(it.amount)}</span>
                <button onClick={() => onRemove(i)} aria-label={`Remove ${meta.label} item`}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-1 pt-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Total</span>
            <span className={`text-xs font-bold ${meta.color}`}>{formatZAR(sum(items))}</span>
          </div>
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={meta.placeholder}
          className="h-11 flex-1 rounded-2xl" autoFocus={autoFocus} />
        <Input value={amount} inputMode="decimal" placeholder="R0"
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          className="h-11 w-24 rounded-2xl" />
        <Button variant="secondary" onClick={add} className="h-11 rounded-2xl px-3" aria-label={`Add ${meta.label} item`}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function HustleDashboard() {
  const router = useRouter();
  const { id } = Route.useParams();
  const { sideHustles, addBusinessEntry, updateBusinessEntry } = useApp();
  const hustle = sideHustles.find((h) => h.id === id);
  const isFoodBusiness = hustle?.industry === "Food & Beverage";

  const [open, setOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<BusinessLineItem[]>([]);
  const [supplies, setSupplies] = useState<BusinessLineItem[]>([]);
  const [profit, setProfit] = useState<BusinessLineItem[]>([]);
  const [savePct, setSavePct] = useState("10");
  const [dayDetail, setDayDetail] = useState<{ date: Date; entries: BusinessEntry[] } | null>(null);

  const entries = hustle?.entries ?? [];

  const totals = useMemo(() => {
    const cost = entries.reduce((s, e) => s + sum(e.ingredients) + sum(e.supplies), 0);
    const profitTotal = entries.reduce((s, e) => s + sum(e.profit), 0);
    return { cost, profit: profitTotal, revenue: cost + profitTotal };
  }, [entries]);

  const avgMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : null;
  const costPct = totals.revenue > 0 ? Math.round((totals.cost / totals.revenue) * 100) : 0;
  const profitPct = totals.revenue > 0 ? 100 - costPct : 0;

  const health = useMemo(() => {
    if (entries.length === 0 || avgMargin === null) {
      return { score: 0, label: "No data yet", color: "text-muted-foreground", bar: "bg-muted", comment: "Log your first day to see how this business is really doing." };
    }
    const score = Math.max(0, Math.min(100, avgMargin));
    if (score >= 40) {
      return {
        score, label: "Thriving", color: "text-success", bar: "bg-success",
        comment: `Strong margins — you're keeping about ${Math.round(score)} in every R100 you bring in. Since the business can afford it, try saving a bigger slice of your profit next time you log it.`,
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
    { name: "Operational costs", value: totals.cost, color: "var(--color-primary)" },
    { name: "Profit", value: totals.profit, color: "var(--color-gold)" },
  ].filter((d) => d.value > 0);

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

  const itemCount = ingredients.length + supplies.length + profit.length;
  const canSubmit = itemCount > 0;
  const profitTotal = sum(profit);
  const savePctNum = Math.max(0, Math.min(100, Number(savePct) || 0));

  const reset = () => {
    setIngredients([]); setSupplies([]); setProfit([]); setSavePct("10"); setEditingEntryId(null);
  };

  const startNewLog = () => {
    reset();
    setOpen(true);
  };

  const startEdit = (entry: BusinessEntry) => {
    setEditingEntryId(entry.id);
    setIngredients(entry.ingredients);
    setSupplies(entry.supplies);
    setProfit(entry.profit);
    setSavePct(String(entry.savePct || 10));
    setDayDetail(null);
    setOpen(true);
  };

  const submit = () => {
    if (!hustle || !canSubmit) return;
    if (editingEntryId) {
      updateBusinessEntry(hustle.id, editingEntryId, { ingredients, supplies, profit, savePct: savePctNum });
    } else {
      addBusinessEntry(hustle.id, { ingredients, supplies, profit, savePct: savePctNum });
    }
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
              onClick={startNewLog}
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
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatZAR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[11px] text-muted-foreground">{d.name}: {formatZAR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Costs vs profit, as a percentage split */}
          {totals.revenue > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Costs vs profit</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Of every rand this business brings in, here's the split.</p>
              <div className="mt-3 flex h-8 w-full overflow-hidden rounded-full bg-muted">
                {costPct > 0 && (
                  <div className="flex items-center justify-center bg-primary text-[11px] font-bold text-primary-foreground" style={{ width: `${costPct}%` }}>
                    {costPct >= 15 && `${costPct}%`}
                  </div>
                )}
                {profitPct > 0 && (
                  <div className="flex items-center justify-center bg-gold text-[11px] font-bold text-gold-foreground" style={{ width: `${profitPct}%` }}>
                    {profitPct >= 15 && `${profitPct}%`}
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" /> {costPct}% operational costs</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-gold" /> {profitPct}% profit</span>
              </div>
            </div>
          )}

          {/* Entry log */}
          <div>
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Logged days</p>
            {entries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">Tap + to log your first day.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dayGroups.map((g) => {
                  const dayCost = g.entries.reduce((s, e) => s + sum(e.ingredients) + sum(e.supplies), 0);
                  const dayProfit = g.entries.reduce((s, e) => s + sum(e.profit), 0);
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
                        {dayCost > 0 && <p className="text-xs font-semibold text-primary">-{formatZAR(dayCost)}</p>}
                        {dayProfit > 0 && <p className="text-sm font-bold text-gold">+{formatZAR(dayProfit)}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day detail popup — one card per log, each editable once */}
      <BottomSheet open={!!dayDetail} onClose={() => setDayDetail(null)}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        <div className="max-h-[80vh] overflow-y-auto px-6 pb-8 pt-5">
          <h2 className="text-xl font-bold">{dayDetail ? formatDay(dayDetail.date) : ""}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Everything logged that day, all in one place.</p>

          <div className="mt-5 space-y-4">
            {dayDetail?.entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{formatTime(new Date(entry.createdAt))}</p>
                  {entry.edited ? (
                    <span className="text-[11px] font-semibold text-muted-foreground">Edited</span>
                  ) : (
                    <button onClick={() => startEdit(entry)} className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-3">
                  {(["ingredients", "supplies", "profit"] as BusinessLogType[]).map((t) => {
                    const lines = entry[t];
                    if (lines.length === 0) return null;
                    const meta = TYPE_META[t];
                    const Icon = meta.icon;
                    return (
                      <div key={t}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{meta.label}</p>
                          <p className={`ml-auto text-xs font-bold ${meta.color}`}>{formatZAR(sum(lines))}</p>
                        </div>
                        <div className="mt-1.5 space-y-1">
                          {lines.map((l, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-1.5">
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
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Log form: Ingredients (food businesses only) -> Supplies -> Profit + save % -> Save */}
      <BottomSheet open={open} onClose={() => { setOpen(false); reset(); }}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        <div className="max-h-[80vh] overflow-y-auto px-6 pt-5">
          <h2 className="text-xl font-bold">{editingEntryId ? "Edit log" : "Log today"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {editingEntryId ? "You can only edit this log once, so double-check before saving." : "Add whatever applies — you don't need every section."}
          </p>

          {isFoodBusiness && (
            <LineItemSection
              type="ingredients"
              items={ingredients}
              onAdd={(item) => setIngredients((prev) => [...prev, item])}
              onRemove={(i) => setIngredients((prev) => prev.filter((_, idx) => idx !== i))}
              autoFocus
            />
          )}

          <LineItemSection
            type="supplies"
            items={supplies}
            onAdd={(item) => setSupplies((prev) => [...prev, item])}
            onRemove={(i) => setSupplies((prev) => prev.filter((_, idx) => idx !== i))}
            autoFocus={!isFoodBusiness}
          />

          <LineItemSection
            type="profit"
            items={profit}
            onAdd={(item) => setProfit((prev) => [...prev, item])}
            onRemove={(i) => setProfit((prev) => prev.filter((_, idx) => idx !== i))}
          />

          {profit.length > 0 && (
            <div className="mt-4">
              <Label>Save what % of today's profit?</Label>
              <Input value={savePct} inputMode="numeric" placeholder="10"
                onChange={(e) => setSavePct(e.target.value.replace(/\D/g, ""))}
                className="mt-2 h-12 rounded-2xl" />
              <p className="mt-1.5 text-xs text-muted-foreground">That's {formatZAR((profitTotal * savePctNum) / 100)} to put aside.</p>
            </div>
          )}

          <Button size="lg" disabled={!canSubmit} onClick={submit} className="mb-8 mt-6 h-14 w-full rounded-2xl shadow-button">
            {editingEntryId ? "Save changes" : "Save entry"}
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
