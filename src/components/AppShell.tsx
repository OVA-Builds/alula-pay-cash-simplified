import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { PhoneFrame } from "./PhoneFrame";

export function AppShell({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <PhoneFrame>
      <div className="flex flex-col h-[100dvh] sm:h-[860px] overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
        {!hideNav && (
          <div className="shrink-0">
            <BottomNav />
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
