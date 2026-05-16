import { Link, useLocation } from "@tanstack/react-router";
import { Home, Send, Clock, User } from "lucide-react";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/send", label: "Send", icon: Send },
  { to: "/history", label: "History", icon: Clock },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border px-4 pt-2 pb-4">
      <ul className="grid grid-cols-4 gap-1">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
