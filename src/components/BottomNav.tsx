import { Link, useLocation } from "@tanstack/react-router";
import { Home, Bell, Clock, User } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { MESSAGES } from "@/lib/messages";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/history", label: "History", icon: Clock },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const { transactions, deletedMessageIds, readMessageIds, lastAlertsSeenAt } = useApp();

  const unreadMessages = MESSAGES.filter((m) => !deletedMessageIds.includes(m.id) && !readMessageIds.includes(m.id)).length;
  const newTransactions = transactions.filter((t) => (t.createdAt ?? 0) > lastAlertsSeenAt).length;
  const alertCount = unreadMessages + newTransactions;

  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border px-4 pt-2 pb-4">
      <ul className="grid grid-cols-4 gap-1">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          const badge = to === "/notifications" ? alertCount : 0;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
