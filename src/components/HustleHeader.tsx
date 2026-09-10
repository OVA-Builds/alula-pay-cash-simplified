import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

// Shared compact header for every /hustle/* screen: back button and the page
// title share one row (no separate icon badge), with the dark panel cropped
// tightly around that row plus an optional one-line subtitle — no leftover
// black space below short content, and it stays pinned while the page scrolls.
export function HustleHeader({
  title,
  subtitle,
  fallbackTo,
  right,
}: {
  title: ReactNode;
  subtitle?: string;
  fallbackTo: string;
  right?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pb-3 pt-5 shadow-lg">
      <div className="relative flex items-start gap-3 px-6">
        <button
          onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: fallbackTo }))}
          aria-label="Back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="min-w-0 flex-1 pt-2 text-lg font-bold leading-snug tracking-tight text-white">{title}</h1>
        {right}
      </div>
      {subtitle && <p className="relative mt-2 px-6 text-xs leading-snug text-white/60">{subtitle}</p>}
    </div>
  );
}
