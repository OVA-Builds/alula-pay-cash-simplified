import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import logo from "@/assets/alula-logo.png";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();
  const { signedIn, onboarded } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      if (signedIn) navigate({ to: "/home" });
      else if (onboarded) navigate({ to: "/signup" });
      else navigate({ to: "/onboarding" });
    }, 2200);
    return () => clearTimeout(t);
  }, [navigate, signedIn, onboarded]);

  return (
    <div className="min-h-screen w-full bg-gradient-splash flex items-center justify-center relative overflow-hidden">
      <div className="flex flex-col items-center gap-6 animate-logo-entrance">
        <div className="animate-logo-shimmer">
          <img src={logo} alt="Alula Pay" className="w-32 h-32 rounded-3xl shadow-2xl" />
        </div>
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold tracking-tight">Alula Pay</h1>
          <p className="text-white/70 text-sm mt-2">Cash to bank, simply.</p>
        </div>
      </div>
      <div className="absolute bottom-10 text-white/40 text-xs">South Africa</div>
    </div>
  );
}
