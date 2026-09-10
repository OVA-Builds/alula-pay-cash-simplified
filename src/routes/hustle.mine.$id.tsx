import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, BadgeCheck, Trash2, Boxes, Package, Thermometer } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/BottomSheet";
import { useApp, formatZAR, type BusinessExpense } from "@/lib/app-state";

export const Route = createFileRoute("/hustle/mine/$id")({ component: HustleDashboard });

const PIE_COLORS = ["var(--color-destructive)", "var(--color-gold)", "var(--color-primary)"];

function HustleDashboard() {
  const router = useRouter();
  const { id } = Route.useParams();
  const { sideHustles, addBusinessEntry } = useApp();
  const hustle = sideHustles.find((h) => h.id === id);

  const [open, setOpen] = useState(false);
  const [costType, setCostType] = useState<"ingredients" | "supplies">("ingredients");
  const [costOfGoods, setCostOfGoods] = useState("");
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [expLabel, setExpLabel] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [profit, setProfit] = useState("");
  const [savePct, setSavePct] = useState("10");

  const entries = hustle?.entries ?? [];
  const chronological = useMemo(() => [...entries].reverse(), [entries]);

  const totals = useMemo(() => {
    const cost = entries.reduce((s, e) => s + e.costOfGoods, 0);
    const other = entries.reduce((s, e) => s + e.otherExpenses.reduce((a, x) => a + x.amount, 0), 0);
    const profitSum = entries.reduce((s, e) => s + e.profit, 0);
    return { cost, other, profit: profitSum, revenue: cost + other + profitSum };
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
    { name: "Cost of goods", value: totals.cost },
    { name: "Other expenses", value: totals.other },
    { name: "Profit", value: totals.profit },
  ].filter((d) => d.value > 0);

  const addExpenseLine = () => {
    const amt = Number(expAmount) || 0;
    if (!expLabel.trim() || amt <= 0) return;
    setExpenses((prev) => [...prev, { label: expLabel.trim(), amount: amt }]);
    setExpLabel("");
    setExpAmount("");
  };
  const removeExpenseLine = (i: number) => setExpenses((prev) => prev.filter((_, idx) => idx !== i));

  const costNum = Number(costOfGoods) || 0;
  const profitNum = Number(profit) || 0;
  const savePctNum = Math.max(0, Math.min(100, Number(savePct) || 0));
  const canSubmit = costNum >= 0 && profitNum !== 0;

  const reset = () => {
    setCostType("ingredients"); setCostOfGoods(""); setExpenses([]);
    setExpLabel(""); setExpAmount(""); setProfit(""); setSavePct("10");
  };

  const submit = () => {
    if (!hustle || !canSubmit) return;
    addBusinessEntry(hustle.id, {
      costType, costOfGoods: costNum, otherExpenses: expenses, profit: profitNum, savePct: savePctNum,
    });
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
      <div className="min-h-screen bg-neutral-950 pb-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pb-8 pt-8">
          <div className="relative flex items-center justify-between px-6">
            <button
              onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/hustle/mine" }))}
              aria-label="Back"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground shadow-gold active:scale-95 transition-transform"
              aria-label="Log a day"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
          <div className="relative mt-5 px-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">{hustle.name}</h1>
              {hustle.registered && <BadgeCheck className="h-5 w-5 text-primary" />}
            </div>
            <p className="mt-1 text-sm text-white/60">{hustle.description}</p>
          </div>
        </div>

        <div className="-mt-4 space-y-4 rounded-t-[2rem] bg-background p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
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
          {chronological.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Profit per day logged</p>
              <div style={{ width: "100%", height: 160 }} className="mt-2">
                <ResponsiveContainer>
                  <BarChart data={chronological.map((e, i) => ({ i: i + 1, profit: e.profit }))} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Logged days</p>
            {entries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">Tap + to log your first day.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {entries.map((e) => {
                  const otherTotal = e.otherExpenses.reduce((s, x) => s + x.amount, 0);
                  return (
                    <div key={e.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {e.costType === "ingredients" ? <Package className="h-4 w-4 text-muted-foreground" /> : <Boxes className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-xs font-semibold capitalize text-muted-foreground">{e.costType}</span>
                        </div>
                        <span className="text-sm font-bold text-success">+{formatZAR(e.profit)}</span>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>Cost: {formatZAR(e.costOfGoods)}{otherTotal > 0 ? ` + ${formatZAR(otherTotal)} other` : ""}</span>
                        <span>Saving {e.savePct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomSheet open={open} onClose={() => { setOpen(false); reset(); }}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        <div className="max-h-[80vh] overflow-y-auto px-6 pt-5">
          <h2 className="text-xl font-bold">Log today</h2>
          <p className="mt-1 text-sm text-muted-foreground">A quick honest snapshot builds a real picture over time.</p>

          <div className="mt-5">
            <Label>Ingredients or supplies?</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => setCostType("ingredients")}
                className={`flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-colors ${
                  costType === "ingredients" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <Package className="h-4 w-4" /> Ingredients
              </button>
              <button
                onClick={() => setCostType("supplies")}
                className={`flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-colors ${
                  costType === "supplies" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <Boxes className="h-4 w-4" /> Supplies
              </button>
            </div>
          </div>

          <div className="mt-4">
            <Label>{costType === "ingredients" ? "Ingredients" : "Supplies"} cost (ZAR)</Label>
            <Input value={costOfGoods} inputMode="decimal" placeholder="0.00"
              onChange={(e) => setCostOfGoods(e.target.value.replace(/[^\d.]/g, ""))}
              className="mt-2 h-12 rounded-2xl" autoFocus />
          </div>

          <div className="mt-4">
            <Label>Other expenses</Label>
            {expenses.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {expenses.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                    <span className="text-xs font-medium">{ex.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{formatZAR(ex.amount)}</span>
                      <button onClick={() => removeExpenseLine(i)} aria-label="Remove expense">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <Input value={expLabel} onChange={(e) => setExpLabel(e.target.value)} placeholder="e.g. Transport"
                className="h-11 flex-1 rounded-2xl" />
              <Input value={expAmount} inputMode="decimal" placeholder="R0"
                onChange={(e) => setExpAmount(e.target.value.replace(/[^\d.]/g, ""))}
                className="h-11 w-24 rounded-2xl" />
              <Button variant="secondary" onClick={addExpenseLine} className="h-11 rounded-2xl px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Label>Profit made today (ZAR)</Label>
            <Input value={profit} inputMode="decimal" placeholder="0.00"
              onChange={(e) => setProfit(e.target.value.replace(/[^\d.]/g, ""))}
              className="mt-2 h-12 rounded-2xl" />
          </div>

          <div className="mt-4">
            <Label>Save what % of today's profit?</Label>
            <Input value={savePct} inputMode="numeric" placeholder="10"
              onChange={(e) => setSavePct(e.target.value.replace(/\D/g, ""))}
              className="mt-2 h-12 rounded-2xl" />
            {profitNum > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">That's {formatZAR((profitNum * savePctNum) / 100)} to put aside.</p>
            )}
          </div>

          <Button size="lg" disabled={!canSubmit} onClick={submit} className="mb-8 mt-6 h-14 w-full rounded-2xl shadow-button">
            Save today's entry
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
