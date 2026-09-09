import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

// A minimal, dependency-free bottom sheet — no Radix, no portal library.
// Renders straight onto document.body via createPortal so it always covers
// the full viewport, regardless of PhoneFrame's own overflow-hidden bezel.
export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 animate-backdrop-in bg-black/50" onClick={onClose} />
      <div className="relative w-full animate-sheet-in rounded-t-[2rem] bg-card pb-8 shadow-3d sm:max-w-[420px]">
        {children}
      </div>
    </div>,
    document.body,
  );
}
