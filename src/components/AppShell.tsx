import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { PhoneFrame } from "./PhoneFrame";
import { AlulaGuide } from "./AlulaGuide";

export function AppShell({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen sm:min-h-[860px]">
        <div className="flex-1 overflow-y-auto">{children}</div>
        {!hideNav && <BottomNav />}
        <AlulaGuide />
      </div>
    </PhoneFrame>
  );
}
