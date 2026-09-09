import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { MESSAGES } from "@/lib/messages";

export const Route = createFileRoute("/message/$id")({ component: MessageDetail });

function MessageDetail() {
  const router = useRouter();
  const { id } = Route.useParams();
  const { markMessagesRead } = useApp();
  const message = MESSAGES.find((m) => m.id === id);

  useEffect(() => {
    if (message) markMessagesRead([message.id]);
  }, [message, markMessagesRead]);

  return (
    <AppShell hideNav>
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/notifications" }))}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {!message ? (
          <p className="text-sm text-muted-foreground">This message is no longer available.</p>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <message.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <h1 className="text-xl font-bold tracking-tight">{message.title}</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">{message.date}</p>
              </div>
            </div>

            <p className="mt-5 text-sm font-medium leading-relaxed text-foreground">{message.body}</p>

            <div className="mt-5 space-y-4 border-t border-border pt-5">
              {message.newsletter.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">{para}</p>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
