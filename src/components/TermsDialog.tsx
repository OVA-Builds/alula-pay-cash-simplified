import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TERMS_SECTIONS, TERMS_EFFECTIVE_DATE } from "@/lib/terms";

// Read-to-the-end gate: Agree/Decline stay disabled until the reader has
// actually scrolled through the whole document, not just opened the dialog.
export function TermsDialog({
  open,
  onOpenChange,
  onAgree,
  onDecline,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
  onDecline: () => void;
}) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) setReachedEnd(false);
    onOpenChange(next);
  };

  const handleScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReachedEnd(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 rounded-3xl p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
          <DialogTitle>Terms and Conditions</DialogTitle>
          <p className="text-xs text-muted-foreground">Effective {TERMS_EFFECTIVE_DATE}</p>
        </DialogHeader>

        <div ref={bodyRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {TERMS_SECTIONS.map((section, i) => (
              <div key={section.heading}>
                <h3 className="text-sm font-semibold text-foreground">
                  {i + 1}. {section.heading}
                </h3>
                {section.body.map((paragraph, j) => (
                  <p key={j} className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-6 pb-1 text-center text-xs font-medium text-muted-foreground">
            — End of Terms and Conditions —
          </p>
        </div>

        <div className="shrink-0 border-t border-border px-6 py-4">
          {!reachedEnd && (
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Scroll to the bottom to continue
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!reachedEnd}
              onClick={onDecline}
              className="h-11 flex-1 rounded-xl"
            >
              Decline
            </Button>
            <Button
              type="button"
              disabled={!reachedEnd}
              onClick={onAgree}
              className="h-11 flex-1 rounded-xl"
            >
              Agree
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
