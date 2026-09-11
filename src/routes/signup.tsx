import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Mail, Phone, Lock, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your Alula Pay account" },
      { name: "description", content: "Create your Alula Pay account and get started." },
      { property: "og:title", content: "Create your Alula Pay account" },
      { property: "og:description", content: "Create your Alula Pay account and get started." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useApp();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    const savedEmail = window.sessionStorage.getItem("alula-google-email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const canSubmit = firstName.trim().length >= 2 && lastName.trim().length >= 2 && phone.replace(/\D/g, "").length >= 9 && pin.length === 4;

  return (
    <PhoneFrame>
      <div className="flex h-full min-h-full flex-col overflow-y-auto bg-background px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Takes about 30 seconds.</p>

        <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-gold/30 px-3 py-1.5 text-xs font-medium text-gold-foreground shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          Basic plan — no ID needed to start
        </div>

        <div className="mt-5 space-y-3.5 rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-2xl pl-11 text-base shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName" autoComplete="given-name" placeholder="e.g. Thandi"
                value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="h-12 rounded-2xl pl-11 text-base shadow-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lastName" autoComplete="family-name" placeholder="e.g. Ndlovu"
                value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="h-12 rounded-2xl pl-11 text-base shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone" inputMode="tel" placeholder="082 123 4567"
                value={phone} onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-2xl pl-11 text-base shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pin">Create a 4-digit app PIN</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••"
                value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="h-12 rounded-2xl pl-11 text-base tracking-[0.4em] shadow-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">You'll use this PIN to sign in to the app.</p>
          </div>
        </div>

        <Button
          size="lg" disabled={!canSubmit}
          onClick={() => { signUp(phone, firstName, lastName); navigate({ to: "/setup-pin" }); }}
          className="mt-5 h-12 rounded-full text-base shadow-button"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </PhoneFrame>
  );
}
