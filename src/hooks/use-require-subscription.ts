import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";

// Redirects away from money-moving routes once the free-transaction grace
// period is used up and no subscription is active yet. Pass enabled:false
// on a success/receipt screen — a transfer that itself used up the last free
// transaction must still be shown to the user, not swept away mid-render.
export function useRequireSubscription(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const { paywallActive } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (enabled && paywallActive) navigate({ to: "/subscribe" });
  }, [enabled, paywallActive, navigate]);
}
