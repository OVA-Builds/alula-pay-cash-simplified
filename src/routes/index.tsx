import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import logo from "@/assets/alula-logo.png";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Prototype always starts on onboarding.
    const t = setTimeout(() => navigate({ to: "/onboarding" }), 2400);
    return () => clearTimeout(t);
  }, [navigate]);

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
          <img src={logo} alt="Alula Pay" className="w-40 h-40 relative z-10 drop-shadow-2xl" />
        </div>
      </div>
    </div>
  );
}
