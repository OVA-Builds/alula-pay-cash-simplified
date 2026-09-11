import { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type StatusVariant = "success" | "error";

// The single "success"/"failed" visual used everywhere the app needs to
// confirm an outcome: a ringed check (green) or ringed X (red), a bold
// title, a description, and one primary action — the wording is the only
// thing that changes per use (see every call site for examples).
export function StatusIcon({ variant, size = "lg" }: { variant: StatusVariant; size?: "lg" | "sm" }) {
  const isSuccess = variant === "success";
  const ring = isSuccess ? "border-success" : "border-destructive";
  const iconColor = isSuccess ? "text-success" : "text-destructive";
  const Icon = isSuccess ? Check : X;
  const dims = size === "lg" ? "h-20 w-20" : "h-16 w-16";
  const iconDims = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  return (
    <div className={`flex ${dims} shrink-0 items-center justify-center rounded-full border-4 ${ring}`}>
      <Icon className={`${iconDims} ${iconColor}`} strokeWidth={3} />
    </div>
  );
}

export function StatusBody({
  variant,
  title,
  description,
  buttonLabel = "OK",
  onButtonClick,
  secondaryLabel,
  onSecondaryClick,
  size = "lg",
  children,
}: {
  variant: StatusVariant;
  title: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick: () => void;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  size?: "lg" | "sm";
  children?: ReactNode;
}) {
  const isSuccess = variant === "success";
  return (
    <div className="flex flex-col items-center text-center">
      <StatusIcon variant={variant} size={size} />
      <h1 className={`${size === "lg" ? "mt-6 text-xl" : "mt-4 text-lg"} font-bold tracking-tight text-foreground`}>
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      <div className="mt-6 flex w-full flex-col items-center gap-2">
        <Button
          onClick={onButtonClick}
          className={`h-11 min-w-[140px] rounded-xl px-10 ${
            isSuccess
              ? "bg-success text-success-foreground hover:bg-success/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          }`}
        >
          {buttonLabel}
        </Button>
        {secondaryLabel && (
          <button onClick={onSecondaryClick} className="text-sm font-medium text-muted-foreground">
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// Full-page version — a muted backdrop with the white status card centered
// on it, for routes that dedicate the whole screen to the outcome (a send
// confirmation, a completed payment, an upgrade). For a small in-place
// popup, use StatusBody directly inside a <DialogContent> instead.
export function StatusScreen(props: Parameters<typeof StatusBody>[0]) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6 sm:min-h-[860px]">
      <div className="w-full max-w-xs rounded-3xl border border-border bg-card p-7 shadow-xl">
        <StatusBody {...props} />
      </div>
    </div>
  );
}
