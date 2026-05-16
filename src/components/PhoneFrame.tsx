import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center sm:p-6">
      <div className="relative w-full sm:max-w-[420px] min-h-screen sm:min-h-[860px] sm:rounded-[2.5rem] overflow-hidden bg-background sm:shadow-card sm:border border-border">
        {children}
      </div>
    </div>
  );
}
