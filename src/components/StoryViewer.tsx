import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import logo from "@/assets/alula-logo.png";

const SLIDE_DURATION_MS = 30000;

export type Story = { image: string; alt?: string };

// Instagram-style full-screen story viewer — a fixed number of slides, each
// shown for SLIDE_DURATION_MS with a segmented progress bar (the "seeker")
// across the top so how much of the 30s is left is always visible. No
// posted-at timestamp is ever shown, by design.
export function StoryViewer({
  stories,
  open,
  onClose,
}: {
  stories: Story[];
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setRestartKey((k) => k + 1);
  }, [open]);

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

  if (typeof document === "undefined" || !open || stories.length === 0) return null;

  const goTo = (i: number) => {
    if (i < 0) { setIndex(0); setRestartKey((k) => k + 1); return; }
    if (i >= stories.length) { onClose(); return; }
    setIndex(i);
    setRestartKey((k) => k + 1);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-backdrop-in">
      <div className="relative h-full w-full overflow-hidden sm:h-[860px] sm:max-w-[420px] sm:rounded-[2.5rem]">
        <img
          key={index}
          src={stories[index].image}
          alt={stories[index].alt ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10" />

        {/* Tap zones: left third = previous, right two-thirds = next */}
        <button
          aria-label="Previous slide"
          onClick={() => goTo(index - 1)}
          className="absolute inset-y-0 left-0 w-1/3"
        />
        <button
          aria-label="Next slide"
          onClick={() => goTo(index + 1)}
          className="absolute inset-y-0 right-0 w-2/3"
        />

        <div className="absolute inset-x-0 top-0 p-3">
          <div className="flex gap-1.5">
            {stories.map((_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  key={i === index ? `active-${restartKey}` : `idle-${i}`}
                  className="h-full rounded-full bg-white"
                  style={
                    i < index
                      ? { width: "100%" }
                      : i > index
                        ? { width: "0%" }
                        : {
                            width: "0%",
                            animationName: "story-fill",
                            animationDuration: `${SLIDE_DURATION_MS}ms`,
                            animationTimingFunction: "linear",
                            animationFillMode: "forwards",
                          }
                  }
                  onAnimationEnd={i === index ? () => goTo(index + 1) : undefined}
                />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white p-1 shadow-soft">
                <img src={logo} alt="" className="h-full w-full object-contain" />
              </span>
              <span className="text-sm font-semibold text-white drop-shadow">Alula Pay</span>
            </div>
            <button
              aria-label="Close"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white active:scale-95"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
