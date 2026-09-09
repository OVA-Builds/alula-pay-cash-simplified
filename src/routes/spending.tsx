import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, TIER_LIMITS } from "@/lib/app-state";

export const Route = createFileRoute("/spending")({ component: Spending });

type Point = { day: number; label: string; total: number };

function Spending() {
  const router = useRouter();
  const { transactions, plan } = useApp();

  const isPro = plan === "pro";
  const step = isPro ? 5000 : 500;
  const axisMax = isPro ? 50000 : 5000;
  const ticks = useMemo(
    () => Array.from({ length: axisMax / step + 1 }, (_, i) => i * step),
    [axisMax, step]
  );

  const data = useMemo<Point[]>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
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
  }, [transactions]);

  const daysWithSends = data.filter((d) => d.total > 0).length;
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

        <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-card">
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
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {isPro ? "Pro" : "Basic"} monthly limit: {formatZAR(axisMax)}
          {daysWithSends > 0 && ` · Sent on ${daysWithSends} ${daysWithSends === 1 ? "day" : "days"} this month`}
        </p>
      </div>
    </AppShell>
  );
}
