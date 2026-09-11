import { Loader2 } from "lucide-react";

// The one loading/processing screen used everywhere a transaction or a
// selfie verification is in flight — always shown before the outcome
// (StatusScreen success or error), never after.
export function BufferScreen({
  title = "Processing…",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6 sm:min-h-[860px]">
      <div className="w-full max-w-xs rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-ripple" />
          <span className="absolute inset-0 rounded-full bg-primary/10 animate-ripple" style={{ animationDelay: "0.5s" }} />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={2.2} />
          </div>
        </div>
        <h1 className="mt-6 text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
