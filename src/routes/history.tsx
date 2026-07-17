import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, FileText, Download, Mail, MessageCircle, Check, Lock, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useApp, formatZAR } from "@/lib/app-state";

export const Route = createFileRoute("/history")({ component: History });

type SendVia = "download" | "email" | "whatsapp" | null;

function History() {
  const { transactions, firstName, plan } = useApp();
  const [via, setVia] = useState<SendVia>(null);
  const [dest, setDest] = useState("");
  const [sent, setSent] = useState(false);

  const openStatement = (mode: Exclude<SendVia, null>) => {
    setSent(false);
    setDest("");
    setVia(mode);
  };

  const submitSend = () => {
    setSent(true);
    setTimeout(() => { setVia(null); }, 1600);
  };

  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Transaction history</h1>
        <p className="text-sm text-muted-foreground mt-1">Everything that has moved in and out.</p>

        {/* 3-month deposit statement card */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">3-month deposit statement</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scannable proof of your Alula Pay activity — use it for rentals, credit, or opening accounts.
              </p>
            </div>
          </div>

          {plan === "pro" ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <StatementAction icon={Download} label="Download" onClick={() => openStatement("download")} />
              <StatementAction icon={Mail} label="Email" onClick={() => openStatement("email")} />
              <StatementAction icon={MessageCircle} label="WhatsApp" onClick={() => openStatement("whatsapp")} />
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-muted p-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">Upgrade to Pro to download or share your statement.</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-card rounded-2xl border border-border divide-y divide-border">
          {transactions.map((t) => {
            const positive = t.amount > 0;
            return (
              <div key={t.id} className="flex items-center gap-3 p-4">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center ${positive ? "bg-success/10" : "bg-muted"}`}>
                  {positive ? (
                    <ArrowDownLeft className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{t.date}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs capitalize text-muted-foreground">{t.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${positive ? "text-success" : "text-destructive"}`}>
                    {positive ? "+" : ""}{formatZAR(t.amount)}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${t.status === "Completed" ? "text-success" : "text-gold-foreground"}`}>
                    {t.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={via !== null} onOpenChange={(o) => !o && setVia(null)}>
        <DialogContent className="rounded-3xl max-w-sm">
          {sent ? (
            <div className="py-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-success flex items-center justify-center animate-tick-pop">
                <Check className="h-8 w-8 text-success-foreground" strokeWidth={3} />
              </div>
              <p className="mt-4 font-semibold">
                {via === "download" ? "Statement ready" : `Sent via ${via === "email" ? "email" : "WhatsApp"}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {via === "download"
                  ? `alula-statement-${(firstName || "you").toLowerCase()}.pdf`
                  : `We've sent it to ${dest}`}
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {via === "download" && "Download statement"}
                  {via === "email" && "Email statement"}
                  {via === "whatsapp" && "WhatsApp statement"}
                </DialogTitle>
                <DialogDescription>
                  Covers your last 3 months of Alula Pay activity — deposits, sends, and fees.
                </DialogDescription>
              </DialogHeader>

              {via !== "download" && (
                <div className="mt-2">
                  <Label htmlFor="dest">
                    {via === "email" ? "Email address" : "WhatsApp number"}
                  </Label>
                  <Input
                    id="dest"
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    placeholder={via === "email" ? "you@example.com" : "+27 82 000 0000"}
                    inputMode={via === "email" ? "email" : "tel"}
                    className="mt-2 h-12 rounded-2xl"
                  />
                </div>
              )}

              <Button
                size="lg"
                onClick={submitSend}
                disabled={via !== "download" && dest.trim().length < 5}
                className="mt-4 h-12 w-full rounded-2xl shadow-button"
              >
                {via === "download" && "Download PDF"}
                {via === "email" && "Send to email"}
                {via === "whatsapp" && "Send on WhatsApp"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function StatementAction({ icon: Icon, label, onClick }: { icon: typeof Download; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-3 active:scale-[0.98] transition-transform"
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}
