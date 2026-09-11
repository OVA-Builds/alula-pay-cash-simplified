import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, ChevronRight, HelpCircle, MessageCircle, LogOut, BadgeCheck, Moon, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { useApp, MONTHLY_FEE, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const navigate = useNavigate();
  const { phone, firstName, lastName, verified, plan, subscriptionActive, theme, setTheme, chatBubbleOn, setChatBubbleOn, signOut } = useApp();
  const planLabel = plan === "pro" ? "Pro" : "Basic";
  const fullName = [firstName, lastName].filter((n) => n?.trim()).join(" ");
  const initials = `${firstName?.trim()?.[0] ?? ""}${lastName?.trim()?.[0] ?? ""}`.toUpperCase() || "A";
  const handleSignOut = () => { signOut(); navigate({ to: "/onboarding" }); };

  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

        <div className="mt-6 bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-white text-lg font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{fullName || "Alula user"}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <BadgeCheck className={`h-3.5 w-3.5 shrink-0 ${verified ? "text-success" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground">
                {subscriptionActive ? `${planLabel} plan · ${formatZAR(MONTHLY_FEE[plan])} / month` : "Free Basic plan"}
              </span>
            </div>
            {phone && <p className="mt-1 text-xs text-muted-foreground">+27 {phone.slice(-9)}</p>}
          </div>
        </div>

        {plan !== "pro" && (
          <Link to="/subscribe" className="mt-4 block rounded-2xl bg-primary text-primary-foreground p-4 shadow-button">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{subscriptionActive ? "Upgrade to Pro" : "Choose a plan"}</p>
                <p className="text-xs opacity-80">
                  {subscriptionActive ? "Higher limits, instant payments." : "Pick Basic or Pro to keep sending."}
                </p>
              </div>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        )}

        <h2 className="mt-7 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Preferences</h2>
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          <ToggleRow icon={MessageCircle} label="Chat bubble on Home" hint="Show the floating chat button on your home screen" checked={chatBubbleOn} onChange={setChatBubbleOn} />
          <ToggleRow icon={Moon} label="Dark mode" hint="Easier on the eyes at night" checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
        </div>

        <h2 className="mt-7 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Account</h2>
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          <LinkRow icon={Lock} label="Change approval PIN" to="/setup-pin" />
          <LinkRow icon={HelpCircle} label="Help (FAQs)" to="/help" />
          <LinkRow icon={MessageCircle} label="Chat with Alula" to="/support" />
          <LinkRow icon={LogOut} label="Sign out" danger onClick={handleSignOut} />
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

function LinkRow({ icon: Icon, label, to, danger, onClick }: { icon: typeof Moon; label: string; to?: string; danger?: boolean; onClick?: () => void }) {
  const cls = `w-full flex items-center gap-3 p-4 text-left ${danger ? "text-destructive" : ""}`;
  const inner = (
    <>
      <Icon className={`h-5 w-5 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}
