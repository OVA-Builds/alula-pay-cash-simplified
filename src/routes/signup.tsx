import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Mail, Phone, Lock, ShieldCheck, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TermsDialog } from "@/components/TermsDialog";
import { useApp } from "@/lib/app-state";
import { fixShoutyCase } from "@/lib/utils";

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

const INCOME_SOURCES = ["Self-employed", "Unemployed", "Employed", "Grants", "Pensioner"] as const;

function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useApp();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [incomeSource, setIncomeSource] = useState<string>("");
  const [pin, setPin] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    const savedEmail = window.sessionStorage.getItem("alula-google-email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const canSubmit =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    phone.length === 10 &&
    incomeSource !== "" &&
    pin.length === 4 &&
    agreedToTerms;

  return (
    <PhoneFrame>
      <div className="flex h-full min-h-full flex-col overflow-y-auto bg-background px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Takes about a minute.</p>

        <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-gold-foreground shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          Basic plan — no ID needed to start
        </div>

        <div className="mt-5 space-y-3.5 rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName" autoComplete="given-name"
                value={firstName} onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => setFirstName(fixShoutyCase(firstName))}
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
                id="lastName" autoComplete="family-name"
                value={lastName} onChange={(e) => setLastName(e.target.value)}
                onBlur={() => setLastName(fixShoutyCase(lastName))}
                className="h-12 rounded-2xl pl-11 text-base shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone" inputMode="tel" maxLength={20}
                value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-12 rounded-2xl pl-11 text-base shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-2xl pl-11 text-base shadow-sm"
              />
            </div>
          </div>

          <div className="border-t border-border pt-3.5 space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="incomeSource">Source of income</Label>
              <Select value={incomeSource} onValueChange={setIncomeSource}>
                <SelectTrigger id="incomeSource" className="h-12 rounded-2xl pl-3 text-base shadow-sm [&>svg]:mr-1">
                  <span className="flex items-center gap-2.5">
                    <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <SelectValue placeholder="Select an option" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {INCOME_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pin">Create a 4-digit app PIN</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pin" type="password" inputMode="numeric" maxLength={4}
                  value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="h-12 rounded-2xl pl-11 text-base tracking-[0.4em] shadow-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">You'll use this PIN to sign in to the app.</p>
            </div>
          </div>
        </div>

        <label
          htmlFor="terms"
          className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm cursor-pointer"
        >
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(v) => setAgreedToTerms(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm leading-snug text-muted-foreground">
            I agree to Alula Pay's{" "}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsOpen(true); }}
              className="font-semibold text-primary underline underline-offset-2"
            >
              Terms and Conditions
            </button>
          </span>
        </label>

        <Button
          size="lg" disabled={!canSubmit}
          onClick={() => {
            signUp({ phone, firstName: fixShoutyCase(firstName), lastName: fixShoutyCase(lastName), pin, email, incomeSource });
            navigate({ to: "/setup-pin" });
          }}
          className="mt-5 h-12 rounded-full text-base shadow-button"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <TermsDialog
        open={termsOpen}
        onOpenChange={setTermsOpen}
        onAgree={() => { setAgreedToTerms(true); setTermsOpen(false); }}
        onDecline={() => { setAgreedToTerms(false); setTermsOpen(false); }}
      />
    </PhoneFrame>
  );
}
