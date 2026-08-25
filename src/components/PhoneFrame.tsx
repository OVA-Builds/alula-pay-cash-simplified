import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] w-full bg-background flex items-center justify-center overflow-hidden sm:p-6">
      <div className="relative w-full sm:max-w-[420px] h-[100dvh] sm:h-[860px] sm:rounded-[2.5rem] overflow-hidden bg-background sm:shadow-card sm:border border-border">
        {children}
      </div>
    </div>
  );
}
