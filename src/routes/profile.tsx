import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ChevronRight, HelpCircle, Settings, LogOut, BadgeCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const { phone, verified } = useApp();

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
              <span className="text-xs text-muted-foreground">
                {verified ? "Tier 2 — Verified" : "Tier 1 — Basic access"}
              </span>
            </div>
          </div>
        </div>

        {!verified && (
          <Link to="/verify" className="mt-4 block rounded-2xl bg-primary text-primary-foreground p-4 shadow-button">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Verify my account</p>
                <p className="text-xs opacity-80">Unlock higher limits.</p>
              </div>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        )}

        <div className="mt-6 bg-card rounded-2xl border border-border divide-y divide-border">
          <Item icon={Settings} label="Settings" />
          <Item icon={HelpCircle} label="Help & Support" />
          <Item icon={LogOut} label="Sign out" danger />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">Alula Pay v0.1 • Made for South Africa</p>
      </div>
    </AppShell>
  );
}

function Item({ icon: Icon, label, danger }: { icon: typeof Settings; label: string; danger?: boolean }) {
  return (
    <button className="w-full flex items-center gap-3 p-4 text-left">
      <Icon className={`h-5 w-5 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
      <span className={`flex-1 text-sm font-medium ${danger ? "text-destructive" : ""}`}>{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
