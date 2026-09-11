import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";
import { loginUser } from "@/lib/backend/users";
import logo from "@/assets/alula-logo.png";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const { signIn, phone: savedPhone, firstName, lastName, email, incomeSource, appPin } = useApp();
  const [phone, setPhone] = useState(savedPhone || "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = phone.length === 10 && pin.length === 4 && !submitting;

  const handleLogin = async () => {
    setSubmitting(true);
    setError("");
    const result = await loginUser({ data: { phone, pin } }).catch(() => null);
    if (!result) {
      // Demo fallback: this device's own last account, for when the server
      // can't be reached at all — never used when a real check succeeds or
      // fails cleanly, only when the request itself couldn't complete.
      if (appPin && pin === appPin && phone === savedPhone) {
        signIn({ phone, firstName, lastName, email, incomeSource });
        navigate({ to: "/home" });
        return;
      }
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
      return;
    }
    if (!result.ok) {
      setError(result.error);
      setPin("");
      setSubmitting(false);
      return;
    }
    signIn(result.user);
    navigate({ to: "/home" });
  };

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen sm:min-h-[860px] p-8">
        <div className="pt-6 flex flex-col items-center text-center">
          <img src={logo} alt="Alula Pay" className="w-20 h-20" />
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your Alula Pay wallet.</p>
        </div>

        <div className="mt-10 space-y-6 flex-1">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone" inputMode="tel" maxLength={20}
                value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-14 rounded-2xl pl-11 text-base"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">App PIN</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="pin" type="text" inputMode="numeric" maxLength={4} autoComplete="off"
                value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                className="h-14 rounded-2xl pl-11 text-base tracking-[0.4em] [-webkit-text-security:disc]"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        <Button
          size="lg" disabled={!canSubmit} onClick={handleLogin}
          className="h-14 rounded-2xl text-base shadow-button"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New to Alula Pay?{" "}
          <Link to="/onboarding" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
}
