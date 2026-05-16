import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/signup")({ component: SignUp });

function SignUp() {
  const navigate = useNavigate();
  const { signIn } = useApp();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const canSubmit = phone.replace(/\D/g, "").length >= 9 && pin.length === 4;

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen sm:min-h-[860px] p-8">
        <div className="pt-4">
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Takes about 30 seconds.</p>
        </div>

        <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-gold/30 px-3 py-1.5 text-xs font-medium text-gold-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Basic plan — no ID needed to start
        </div>

        <div className="mt-10 space-y-6 flex-1">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone" inputMode="tel" placeholder="082 123 4567"
                value={phone} onChange={(e) => setPhone(e.target.value)}
                className="h-14 rounded-2xl pl-11 text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">Create a 4-digit app PIN</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••"
                value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="h-14 rounded-2xl pl-11 text-base tracking-[0.4em]"
              />
            </div>
            <p className="text-xs text-muted-foreground">You'll use this PIN to sign in to the app.</p>
          </div>
        </div>

        <Button
          size="lg" disabled={!canSubmit}
          onClick={() => { signIn(phone); navigate({ to: "/setup-pin" }); }}
          className="h-14 rounded-2xl text-base shadow-button"
        >
          Continue
        </Button>
      </div>
    </PhoneFrame>
  );
}
