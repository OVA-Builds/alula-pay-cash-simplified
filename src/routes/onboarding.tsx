import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Apple, ArrowLeft, ArrowRight, Chrome, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";
import logo from "@/assets/alula-logo.png";
import onb1 from "@/assets/onb-1.jpg";
import onb2 from "@/assets/onb-2.jpg";
import onb3 from "@/assets/onb-3.jpg";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started with Alula Pay" },
      { name: "description", content: "Set up Alula Pay in a few simple steps." },
      { property: "og:title", content: "Get started with Alula Pay" },
      { property: "og:description", content: "Set up Alula Pay in a few simple steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const SLIDES = [
  {
    image: onb1,
    title: "Send money in seconds",
    body: "Top up, pay bills, and send cash to family — all from your phone.",
  },
  {
    image: onb2,
    title: "Redeem cash easily",
    body: "Turn vouchers into cash at thousands of partner stores nationwide.",
  },
  {
    image: onb3,
    title: "Built for everyone",
    body: "No paperwork to start. Just your phone number and a PIN.",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const { setOnboarded } = useApp();
  const [screen, setScreen] = useState(0);
  const [googleEmail, setGoogleEmail] = useState("");

  useEffect(() => {
    if (screen !== 3) return;
    const timeout = window.setTimeout(() => setScreen(4), 1800);
    return () => window.clearTimeout(timeout);
  }, [screen]);

  const goToSignup = () => {
    if (googleEmail.trim()) {
      window.sessionStorage.setItem("alula-google-email", googleEmail.trim());
    }
    setOnboarded(true);
    navigate({ to: "/signup" });
  };

  const next = () => {
    if (screen < SLIDES.length - 1) setScreen((current) => current + 1);
    else setScreen(3);
  };

  const backToAccountChoices = () => {
    setGoogleEmail("");
    setScreen(4);
  };

  if (screen < SLIDES.length) {
    const slide = SLIDES[screen];
    const isLast = screen === SLIDES.length - 1;
    return (
      <PhoneFrame>
        <div className="relative flex h-full min-h-full flex-col overflow-hidden bg-background">
          <div className="relative h-[58%] w-full shrink-0 overflow-hidden">
            <img src={slide.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
            <button
              type="button"
              onClick={() => setScreen(4)}
              className="absolute right-5 top-6 rounded-full bg-background/70 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur"
            >
              Skip
            </button>
          </div>

          <div className="flex flex-1 flex-col px-8 pb-8 pt-2">
            <div className="flex justify-center gap-2 pb-6">
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === screen ? "w-6 bg-primary" : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight">{slide.title}</h1>
            <p className="mt-2 text-center text-muted-foreground">{slide.body}</p>

            <div className="mt-auto pt-8">
              <Button
                size="lg"
                onClick={next}
                className="h-14 w-full rounded-2xl text-base shadow-button"
              >
                {isLast ? "Get started" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  if (screen === 3) {
    return (
      <PhoneFrame>
        <div className="flex h-full min-h-full flex-col items-center justify-center gap-5 bg-gradient-splash px-10 text-center">
          <img src={logo} alt="Alula Pay" className="h-20 w-20 drop-shadow-2xl" />
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
          <div>
            <h1 className="text-xl font-semibold text-primary-foreground">Setting up your wallet</h1>
            <p className="mt-1 text-sm text-primary-foreground/70">This only takes a moment.</p>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  if (screen === 5) {
    return (
      <PhoneFrame>
        <div className="flex h-full min-h-full flex-col p-8">
          <button
            type="button"
            aria-label="Back to account choices"
            onClick={backToAccountChoices}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="pt-6">
            <h1 className="text-2xl font-bold tracking-tight">Continue with Google</h1>
            <p className="mt-2 text-muted-foreground">Enter the email linked to your Google account.</p>
          </div>

          <div className="mt-8 flex-1 space-y-2">
            <Label htmlFor="google-email">Email or phone</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="google-email"
                type="email"
                autoFocus
                placeholder="you@gmail.com"
                value={googleEmail}
                onChange={(event) => setGoogleEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && googleEmail.trim()) goToSignup();
                }}
                className="h-14 rounded-2xl pl-11 text-base"
              />
            </div>
          </div>

          <Button
            size="lg"
            disabled={!googleEmail.trim()}
            onClick={goToSignup}
            className="h-14 rounded-2xl text-base shadow-button"
          >
            Continue
          </Button>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="flex h-full min-h-full flex-col p-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <img src={logo} alt="Alula Pay" className="h-20 w-20" />
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Welcome to Alula Pay</h1>
          <p className="mt-2 text-muted-foreground">Create an account to get started.</p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            onClick={() => navigate({ to: "/signup" })}
            className="h-14 w-full rounded-2xl text-base shadow-button"
          >
            Open an account
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: "/login" })}
            className="h-14 w-full rounded-2xl text-base"
          >
            I already have an account
          </Button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setScreen(5)}
            className="h-14 w-full rounded-2xl text-base"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: "/signup" })}
            className="h-14 w-full rounded-2xl text-base"
          >
            <Apple className="h-4 w-4" />
            Continue with Apple
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
}
