import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import logo from "@/assets/alula-logo.png";

const SLIDE_DURATION_MS = 30000;
// A press shorter than this is a tap (navigate); held longer, it's a
// press-and-hold (pause + hide the progress bar until released).
const HOLD_THRESHOLD_MS = 180;

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
  const [paused, setPaused] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdTriggeredRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setRestartKey((k) => k + 1);
    setPaused(false);
  }, [open]);

  const startHold = () => {
    holdTriggeredRef.current = false;
    holdTimerRef.current = window.setTimeout(() => {
      holdTriggeredRef.current = true;
      setPaused(true);
    }, HOLD_THRESHOLD_MS);
  };

  // Called on release (or if the press leaves the tap zone). Returns
  // whether this press was a hold, so the caller can skip navigation.
  const endHold = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    const wasHold = holdTriggeredRef.current;
    if (wasHold) setPaused(false);
    return wasHold;
  };

  // onClose is an inline closure from the caller (a fresh reference every
  // render), so it can't sit in an effect's dependency array here — the
  // history push below must fire exactly once per open, not once per
  // render. A ref sidesteps that: it's kept current every render but never
  // triggers the effect itself.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Push a history entry while the story is open, so the device/browser
  // back button closes the story instead of falling through to whatever
  // page was open before Home. requestClose() (used by every UI trigger —
  // X button, Escape, swiping past the last slide) goes through
  // history.back() rather than calling onClose directly, so that press
  // consumes this entry; the popstate handler is what actually closes the
  // viewer, whether triggered by that call or a real back-button press.
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ storyViewer: true }, "");
    const onPopState = () => onCloseRef.current();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [open]);

  const requestClose = () => window.history.back();

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") requestClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (typeof document === "undefined" || !open || stories.length === 0) return null;

  const goTo = (i: number) => {
    if (i < 0) { setIndex(0); setRestartKey((k) => k + 1); return; }
    if (i >= stories.length) { requestClose(); return; }
    setIndex(i);
    setRestartKey((k) => k + 1);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-backdrop-in">
      <div className="relative h-full w-full overflow-hidden sm:h-[860px] sm:max-w-[420px] sm:rounded-[2.5rem]">
        {/* All slides stay mounted and simply cross-fade via opacity — swapping
            which <img> is rendered (remounting) is what caused the flash of
            black backdrop between slides. */}
        {stories.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt={s.alt ?? ""}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10" />

        {/* Tap zones: left third = previous, right two-thirds = next.
            A quick press navigates; holding past HOLD_THRESHOLD_MS pauses
            playback and hides the progress bar until released instead. */}
        <button
          aria-label="Previous slide"
          onPointerDown={startHold}
          onPointerUp={() => { if (!endHold()) goTo(index - 1); }}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          className="absolute inset-y-0 left-0 w-1/3"
        />
        <button
          aria-label="Next slide"
          onPointerDown={startHold}
          onPointerUp={() => { if (!endHold()) goTo(index + 1); }}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          className="absolute inset-y-0 right-0 w-2/3"
        />

        <div
          className={`absolute inset-x-0 top-0 p-3 transition-opacity duration-150 ${
            paused ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
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
                            animationPlayState: paused ? "paused" : "running",
                          }
                  }
                  onAnimationEnd={i === index ? () => goTo(index + 1) : undefined}
                />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-9 w-9 object-contain drop-shadow" />
              <span className="text-sm font-semibold text-white drop-shadow">Alula Pay</span>
            </div>
            <button
              aria-label="Close"
              onClick={requestClose}
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
