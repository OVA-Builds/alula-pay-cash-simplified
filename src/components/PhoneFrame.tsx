import { ReactNode, useEffect } from "react";

// Mobile Chrome's own UI chrome (URL bar, bottom toolbar) can show/hide
// without 100dvh re-computing to fill the newly-available space, leaving a
// static gap below the app content. window.visualViewport tracks the actual
// live visible height, so we mirror it into a CSS var and use that instead,
// falling back to 100dvh where visualViewport isn't supported.
function useViewportHeightVar() {
  useEffect(() => {
    const set = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-vh", `${h}px`);
    };
    set();
    window.visualViewport?.addEventListener("resize", set);
    window.addEventListener("resize", set);
    return () => {
      window.visualViewport?.removeEventListener("resize", set);
      window.removeEventListener("resize", set);
    };
  }, []);
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  useViewportHeightVar();
  return (
    <div className="h-[var(--app-vh,100dvh)] w-full bg-background flex items-center justify-center overflow-hidden sm:p-6">
      <div className="relative w-full sm:max-w-[420px] h-[var(--app-vh,100dvh)] sm:h-[860px] sm:rounded-[2.5rem] overflow-hidden bg-background sm:shadow-card sm:border border-border">
        {children}
      </div>
    </div>
  );
}
