import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import logo from "@/assets/alula-logo.png";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();
  const { signedIn, onboarded, approvalPin } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      if (signedIn && !approvalPin) navigate({ to: "/setup-pin" });
      else if (signedIn) navigate({ to: "/home" });
      else if (onboarded) navigate({ to: "/signup" });
      else navigate({ to: "/onboarding" });
    }, 2400);
    return () => clearTimeout(t);
  }, [navigate, signedIn, onboarded, approvalPin]);

  return (
    <div className="min-h-screen w-full bg-gradient-splash flex items-center justify-center relative overflow-hidden">
      {/* Orbiting gold particles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-gold/80 animate-orbit"
            style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${5 + i * 0.6}s` }}
          />
        ))}
      </div>

      {/* Pulsing halo */}
      <span className="absolute h-56 w-56 rounded-full bg-gold/15 animate-ripple" />
      <span className="absolute h-56 w-56 rounded-full bg-primary/30 animate-ripple" style={{ animationDelay: "0.6s" }} />

      <div className="relative flex flex-col items-center animate-logo-entrance">
        <div className="animate-logo-glow relative">
          <img src={logo} alt="Alula Pay" className="w-32 h-32 rounded-3xl shadow-2xl relative z-10" />
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <span className="absolute inset-y-0 w-1/3 bg-white/30 animate-shine" />
          </div>
        </div>
      </div>
    </div>
  );
}
