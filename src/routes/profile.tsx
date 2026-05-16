import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ChevronRight, HelpCircle, LogOut, BadgeCheck, Moon, Sparkles, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { useApp, MONTHLY_FEE, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const { phone, verified, plan, alulaOn, setAlulaOn, theme, setTheme } = useApp();
  const planLabel = plan === "pro" ? "Pro" : "Basic";

  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

        <div className="mt-6 bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-brand flex items-center justify-center text-white text-lg font-bold">
            {phone ? phone.slice(-2) : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{phone ? `+27 ${phone.slice(-9)}` : "Alula user"}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <BadgeCheck className={`h-3.5 w-3.5 ${verified ? "text-success" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground">{planLabel} plan · {formatZAR(MONTHLY_FEE[plan])} / month</span>
            </div>
          </div>
        </div>

        {!verified && (
          <Link to="/verify" className="mt-4 block rounded-2xl bg-primary text-primary-foreground p-4 shadow-button">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Upgrade to Pro</p>
                <p className="text-xs opacity-80">Higher limits, lower fees.</p>
              </div>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        )}

        <h2 className="mt-7 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Preferences</h2>
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          <ToggleRow icon={Sparkles} label="Alula guide" hint="Step-by-step help when sending or redeeming" checked={alulaOn} onChange={setAlulaOn} />
          <ToggleRow icon={Moon} label="Dark mode" hint="Easier on the eyes at night" checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
        </div>

        <h2 className="mt-7 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Account</h2>
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          <LinkRow icon={Lock} label="Change approval PIN" to="/setup-pin" />
          <LinkRow icon={HelpCircle} label="Help & Support" />
          <LinkRow icon={LogOut} label="Sign out" danger />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">Alula Pay v0.2 · Made for South Africa 🇿🇦</p>
      </div>
    </AppShell>
  );
}

function ToggleRow({ icon: Icon, label, hint, checked, onChange }: {
  icon: typeof Moon; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 p-4 cursor-pointer">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function LinkRow({ icon: Icon, label, to, danger }: { icon: typeof Moon; label: string; to?: string; danger?: boolean }) {
  const cls = `w-full flex items-center gap-3 p-4 text-left ${danger ? "text-destructive" : ""}`;
  const inner = (
    <>
      <Icon className={`h-5 w-5 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button className={cls}>{inner}</button>;
}
