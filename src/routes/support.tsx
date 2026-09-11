import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useApp, formatZAR, formatTxDate } from "@/lib/app-state";
import { SUPPORT_TOPICS, VOUCHER_PROVIDER_CONTACTS, matchSupportTopic, type SupportTopic } from "@/lib/support-bot";
import logo from "@/assets/alula-logo.png";

export const Route = createFileRoute("/support")({ component: Support });

const WAIT_MS = 5000;
const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
const GREETING = ["Hi there, I'm Alula 👋", "How can I help you today?"];
const ASK_MORE = "Anything else I can help with?";
const OUT_OF_SCOPE =
  "I can only help with things inside Alula Pay, so I'm not sure about that one. Here's what I can do:";

type Bubble = { id: string; from: "bot" | "user" | "system"; lines: string[] };
type QuickReply = { id: string; label: string };

function menuReplies(): QuickReply[] {
  return [...SUPPORT_TOPICS.map((t) => ({ id: t.id, label: t.menuLabel })), { id: "other", label: "Something else" }];
}

function providerReplies(): QuickReply[] {
  return VOUCHER_PROVIDER_CONTACTS.map((p) => ({ id: `provider:${p.id}`, label: p.name }));
}

const MAIN_MENU_REPLY: QuickReply[] = [{ id: "main-menu", label: "Main menu" }];

function Support() {
  const router = useRouter();
  const { transactions } = useApp();
  const [phase, setPhase] = useState<"waiting" | "chat">("waiting");
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [draft, setDraft] = useState("");
  const [ended, setEnded] = useState(false);
  const [awaitingFreeText, setAwaitingFreeText] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase("chat");
      setMessages([{ id: "greeting", from: "bot", lines: GREETING }]);
      setQuickReplies(menuReplies());
      lastActivityRef.current = Date.now();
    }, WAIT_MS);
    return () => clearTimeout(t);
  }, []);

  // Auto-end the chat after 3 minutes of no activity — matches how a real
  // support session would time out rather than staying open forever.
  useEffect(() => {
    if (phase !== "chat" || ended) return;
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
        setMessages((prev) => [...prev, { id: `end-${Date.now()}`, from: "system", lines: ["This chat has ended due to inactivity. Come back anytime! 👋"] }]);
        setQuickReplies([]);
        setEnded(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, ended]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, quickReplies]);

  const touch = () => { lastActivityRef.current = Date.now(); };

  const say = (from: Bubble["from"], lines: string[]) => {
    setMessages((prev) => [...prev, { id: `${from}-${Date.now()}-${Math.random()}`, from, lines }]);
  };

  const answerTopic = (topic: SupportTopic) => {
    if (topic.special === "transactions") {
      const recent = transactions.slice(0, 5);
      const lines = recent.length
        ? [
            "Here's your last few:",
            ...recent.map((t) => `${formatTxDate(t)} — ${t.label}: ${t.amount > 0 ? "+" : "-"}${formatZAR(Math.abs(t.amount))}`),
          ]
        : ["You don't have any transactions yet — once you send or load a voucher, they'll show up here and in History."];
      say("bot", lines);
      say("bot", [ASK_MORE]);
      setQuickReplies(MAIN_MENU_REPLY);
      return;
    }
    if (topic.special === "voucher-invalid") {
      say("bot", ["Which voucher brand is giving you trouble?"]);
      setQuickReplies(providerReplies());
      return;
    }
    say("bot", topic.answer);
    say("bot", [ASK_MORE]);
    setQuickReplies(MAIN_MENU_REPLY);
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (ended) return;
    touch();
    say("user", [reply.label]);
    setQuickReplies([]);
    setAwaitingFreeText(false);

    if (reply.id === "main-menu") {
      say("bot", ["Here's the menu again:"]);
      setQuickReplies(menuReplies());
      return;
    }
    if (reply.id === "other") {
      say("bot", ["Sure — can you describe the problem you're facing?"]);
      setAwaitingFreeText(true);
      return;
    }
    if (reply.id.startsWith("provider:")) {
      const providerId = reply.id.slice("provider:".length);
      const provider = VOUCHER_PROVIDER_CONTACTS.find((p) => p.id === providerId);
      if (provider) {
        say("bot", [`Here's what usually fixes a ${provider.name} that won't load:`, ...provider.procedure]);
        say("bot", [`If you need to log a call, ${provider.name} support is on ${provider.landline} or ${provider.email}.`]);
        say("bot", [ASK_MORE]);
      }
      setQuickReplies(MAIN_MENU_REPLY);
      return;
    }
    const topic = SUPPORT_TOPICS.find((t) => t.id === reply.id);
    if (topic) answerTopic(topic);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text || ended) return;
    touch();
    say("user", [text]);
    setDraft("");
    setAwaitingFreeText(false);

    const matched = matchSupportTopic(text);
    if (matched) {
      answerTopic(matched);
    } else {
      say("bot", [OUT_OF_SCOPE]);
      setQuickReplies(menuReplies());
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setQuickReplies([]);
    setEnded(false);
    setAwaitingFreeText(false);
    setDraft("");
    setPhase("waiting");
    lastActivityRef.current = Date.now();
    setTimeout(() => {
      setPhase("chat");
      setMessages([{ id: `greeting-${Date.now()}`, from: "bot", lines: GREETING }]);
      setQuickReplies(menuReplies());
      lastActivityRef.current = Date.now();
    }, WAIT_MS);
  };

  return (
    <AppShell hideNav>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-background px-5 py-4">
          <button
            onClick={() => (router.history.canGoBack() ? router.history.back() : router.navigate({ to: "/profile" }))}
            aria-label="Back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-accent"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-full object-contain" />
          <div className="min-w-0">
            <p className="text-sm font-bold">Alula</p>
            <p className="text-xs text-muted-foreground">In-app assistant</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {phase === "waiting" && (
            <div className="flex items-center gap-2 rounded-3xl rounded-bl-md bg-muted px-4 py-3 w-fit">
              <span className="text-xs text-muted-foreground">Waiting for agent to join</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-typing-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
              {m.from === "system" ? (
                <p className="mx-auto text-center text-[11px] text-muted-foreground">{m.lines[0]}</p>
              ) : (
                <div
                  className={`max-w-[85%] space-y-1 rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  }`}
                >
                  {m.lines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}

          {quickReplies.length > 0 && (
            <div className="flex flex-col items-start gap-2 pt-1">
              {quickReplies.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleQuickReply(r)}
                  className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-left text-sm font-medium text-primary active:scale-[0.98] transition-transform"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {ended && (
            <button
              onClick={startNewChat}
              className="mx-auto mt-2 block rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-button active:scale-[0.98] transition-transform"
            >
              Start a new chat
            </button>
          )}

          <div ref={listEndRef} />
        </div>

        <div className="border-t border-border bg-background p-3">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              disabled={phase !== "chat" || ended}
              placeholder={awaitingFreeText ? "Describe what's going on…" : "Type a message…"}
              className="h-11 flex-1 rounded-full border border-border bg-muted/50 px-4 text-sm outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={phase !== "chat" || ended || !draft.trim()}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-button disabled:opacity-40 active:scale-95 transition-transform"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
