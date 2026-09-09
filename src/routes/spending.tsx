import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, TIER_LIMITS } from "@/lib/app-state";

export const Route = createFileRoute("/spending")({ component: Spending });

type Point = { day: number; label: string; total: number };

const MONTH_OFFSETS = [2, 1, 0] as const; // oldest to newest, 0 = current month

function monthStart(offset: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - offset, 1);
}

function Spending() {
  const router = useRouter();
  const { transactions, plan } = useApp();
  const [offset, setOffset] = useState<number>(0);

  const isPro = plan === "pro";
  const step = isPro ? 5000 : 500;
  const axisMax = isPro ? 50000 : 5000;
  const ticks = useMemo(
    () => Array.from({ length: axisMax / step + 1 }, (_, i) => i * step),
    [axisMax, step]
  );

  const selected = monthStart(offset);
  const monthLabel = selected.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

  const data = useMemo<Point[]>(() => {
    const year = selected.getFullYear();
    const month = selected.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const dayStart = new Date(year, month, day, 0, 0, 0, 0).getTime();
      const dayEnd = new Date(year, month, day, 23, 59, 59, 999).getTime();
      const total = transactions
        .filter((t) => t.type === "transfer" && t.amount < 0 && !!t.createdAt && t.createdAt >= dayStart && t.createdAt <= dayEnd)
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      return {
        day,
        label: `${String(day).padStart(2, "0")}-${String(month + 1).padStart(2, "0")}`,
        total: +total.toFixed(2),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, offset]);

  // Only show every few day-labels on the x-axis so a 28-31 day month
  // doesn't overlap on a narrow phone screen.
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  return (
    <AppShell hideNav>
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/home" }))}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Monthly spending</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tap a point on the line to see what you sent that day.</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted p-1">
          {MONTH_OFFSETS.map((o) => (
            <button
              key={o}
              onClick={() => setOffset(o)}
              className={`h-9 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] ${
                offset === o ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}
            >
              {monthStart(o).toLocaleDateString("en-ZA", { month: "short" })}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-card p-4 shadow-card">
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                  interval={labelEvery - 1}
                />
                <YAxis
                  domain={[0, axisMax]}
                  ticks={ticks}
                  tickFormatter={(v: number) => `R${v.toLocaleString("en-ZA")}`}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip
                  cursor={{ stroke: "var(--color-primary)", strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as Point;
                    return (
                      <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-card">
                        <p className="text-[11px] text-muted-foreground">{p.label}</p>
                        <p className="text-sm font-bold text-primary">{formatZAR(p.total)}</p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-center text-xs font-semibold text-muted-foreground">{monthLabel}</p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {isPro ? "Pro" : "Basic"} monthly limit: {formatZAR(axisMax)}
        </p>
      </div>
    </AppShell>
  );
}
