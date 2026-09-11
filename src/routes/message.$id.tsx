import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp } from "@/lib/app-state";
import { MESSAGES, heldBalanceReminderMessage } from "@/lib/messages";

export const Route = createFileRoute("/message/$id")({ component: MessageDetail });

function MessageDetail() {
  const router = useRouter();
  const { id } = Route.useParams();
  const { markMessagesRead, heldBalance } = useApp();
  const heldReminder = heldBalanceReminderMessage(heldBalance);
  const message = (heldReminder && heldReminder.id === id ? heldReminder : undefined) ?? MESSAGES.find((m) => m.id === id);

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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-transform active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {!message ? (
          <p className="text-sm text-muted-foreground">This message is no longer available.</p>
        ) : (
          <>
            <div className="flex items-start gap-3">
              {message.logo ? (
                <img src={message.logo} alt="Alula Pay" className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-card" />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-soft">
                  <message.icon className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0 flex-1 pt-1">
                <h1 className="text-xl font-bold tracking-tight">{message.title}</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">{message.date}</p>
              </div>
            </div>

            {message.photo && (
              <img src={message.photo} alt="" className="mt-5 w-full rounded-3xl object-cover shadow-card" />
            )}

            <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4 shadow-soft">
              <p className="text-sm font-medium leading-relaxed text-foreground">{message.body}</p>
            </div>

            <div className="mt-4 space-y-4 rounded-3xl border border-border bg-card p-5 shadow-card">
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
