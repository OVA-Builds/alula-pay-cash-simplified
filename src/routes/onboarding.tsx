import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Landmark,
  Mail,
  MapPin,
  ShieldCheck,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";
import hero1 from "@/assets/onboarding-1-hero.png";
import hero2 from "@/assets/onboarding-2-hero.png";
import hero3 from "@/assets/onboarding-3-hero.png";
import heroChoices from "@/assets/onboarding-5-hero.png";
import hypeImage from "@/assets/onboarding-4.png";

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
    hero: hero1,
    title: "Get your money to any bank account in easy steps",
    body: "Fast, secure and made for the way you live.",
    features: [
      { icon: Zap, label: "Fast Transfers" },
      { icon: ShieldCheck, label: "Secure & Trusted" },
      { icon: Landmark, label: "Any Bank. Anytime." },
    ],
  },
  {
    hero: hero2,
    title: "You can conveniently find a voucher everywhere",
    body: "From local shops to trusted partners. Get one in seconds.",
    features: [
      { icon: MapPin, label: "Near You" },
      { icon: Timer, label: "Quick & Easy" },
      { icon: CheckCircle2, label: "Trusted Partners" },
    ],
  },
];

const PLAN_ROWS: { label: string; basic: string | boolean; pro: string | boolean }[] = [
  { label: "Subscription", basic: "R10 / month", pro: "R20 / month" },
  { label: "Monthly Limit", basic: "R5 000", pro: "R50 000" },
  { label: "Bio Metrics", basic: false, pro: true },
  { label: "Normal EFT", basic: true, pro: true },
  { label: "Immediate Payment", basic: false, pro: true },
  { label: "Support", basic: true, pro: true },
  { label: "3 Months Statement", basic: false, pro: true },
];

function PlanCell({ value }: { value: string | boolean }) {
  if (typeof value === "string") return <span className="text-xs font-medium">{value}</span>;
  return value ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <Check className="h-3 w-3" />
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const { setOnboarded } = useApp();
  const [screen, setScreen] = useState(0);
  const [googleEmail, setGoogleEmail] = useState("");

  useEffect(() => {
    if (screen !== 3) return;
    const timeout = window.setTimeout(() => setScreen(4), 3200);
    return () => window.clearTimeout(timeout);
  }, [screen]);

  const goToSignup = () => {
    if (googleEmail.trim()) {
      window.sessionStorage.setItem("alula-google-email", googleEmail.trim());
    }
    setOnboarded(true);
    navigate({ to: "/signup" });
  };

  const backToAccountChoices = () => {
    setGoogleEmail("");
    setScreen(4);
  };

  if (screen < 2) {
    const slide = SLIDES[screen];
    return (
      <PhoneFrame>
        <div className="flex h-full min-h-full flex-col overflow-y-auto bg-background">
          <img
            src={slide.hero}
            alt=""
            className="block max-h-[420px] min-h-[160px] w-full flex-1 rounded-b-[2rem] object-cover"
            style={{ objectPosition: "50% 28%" }}
          />
          <div className="flex shrink-0 flex-col px-6 py-5">
            <h1 className="text-xl font-extrabold leading-tight tracking-tight">{slide.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{slide.body}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3">
              {slide.features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-semibold leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 pt-5">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === screen ? "w-5 bg-primary" : "w-1.5 bg-muted"}`} />
                ))}
              </div>
              <Button size="lg" onClick={() => setScreen((s) => s + 1)} className="h-12 rounded-full px-6 shadow-button">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  if (screen === 2) {
    return (
      <PhoneFrame>
        <div className="flex h-full min-h-full flex-col overflow-y-auto bg-background">
          <img
            src={hero3}
            alt=""
            className="block min-h-[90px] max-h-[280px] w-full flex-1 rounded-b-[2rem] object-cover"
            style={{ objectPosition: "50% 15%" }}
          />
          <div className="flex shrink-0 flex-col px-6 py-4">
            <h1 className="text-lg font-extrabold leading-tight tracking-tight">
              Choose the plan that <span className="text-primary">works for you</span>
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">Simple. Transparent. Build for real life.</p>

            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr>
                    <th className="p-2 font-semibold">Features</th>
                    <th className="bg-muted p-2 text-center font-semibold">
                      Basic<div className="font-normal text-muted-foreground">R10/mo</div>
                    </th>
                    <th className="bg-primary p-2 text-center font-semibold text-primary-foreground">
                      Pro<div className="font-normal text-primary-foreground/80">R20/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PLAN_ROWS.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 1 ? "bg-muted/40" : undefined}>
                      <td className="p-2">{row.label}</td>
                      <td className="bg-muted/60 p-2 text-center"><PlanCell value={row.basic} /></td>
                      <td className="bg-primary/10 p-2 text-center"><PlanCell value={row.pro} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === screen ? "w-5 bg-primary" : "w-1.5 bg-muted"}`} />
                ))}
              </div>
              <Button size="lg" onClick={() => setScreen(3)} className="h-12 rounded-full px-6 shadow-button">
                Get started
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
        <div className="relative h-full w-full">
          <img
            src={hypeImage}
            alt=""
            className="absolute inset-0 h-full w-full select-none object-cover"
            style={{ objectPosition: "35% 100%" }}
          />
        </div>
      </PhoneFrame>
    );
  }

  if (screen === 4) {
    return (
      <PhoneFrame>
        <div className="flex h-full min-h-full flex-col overflow-y-auto bg-primary">
          <img
            src={heroChoices}
            alt="ATM deposits? A thing of the past!"
            className="block max-h-[480px] min-h-[220px] w-full flex-1 object-cover"
            style={{ objectPosition: "50% 100%" }}
          />
          <div className="flex shrink-0 flex-col gap-3 px-6 py-6">
            <Button
              size="lg"
              onClick={() => navigate({ to: "/signup" })}
              className="h-12 rounded-full bg-primary-foreground/15 text-primary-foreground shadow-none hover:bg-primary-foreground/25"
            >
              Open an account
            </Button>
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="text-sm font-medium text-primary-foreground underline underline-offset-2"
            >
              I already have an account
            </button>

            <div className="my-1 flex items-center gap-3">
              <span className="h-px flex-1 bg-primary-foreground/30" />
              <span className="text-xs text-primary-foreground/70">OR</span>
              <span className="h-px flex-1 bg-primary-foreground/30" />
            </div>

            <Button
              size="lg"
              onClick={() => setScreen(5)}
              className="h-12 rounded-full bg-white text-[#202124] shadow-none hover:bg-white/90"
            >
              <GoogleG className="h-4 w-4" />
              Continue with Google
            </Button>
            <Button
              size="lg"
              onClick={() => navigate({ to: "/signup" })}
              className="h-12 rounded-full bg-white text-[#202124] shadow-none hover:bg-white/90"
            >
              <Apple className="h-4 w-4" />
              Continue with Apple
            </Button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="flex h-full min-h-full flex-col overflow-y-auto bg-background p-6">
        <button
          type="button"
          aria-label="Back to account choices"
          onClick={backToAccountChoices}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mt-4 flex flex-col items-center text-center">
          <GoogleG className="h-10 w-10" />
          <h1 className="mt-4 text-xl font-bold">Sign in with Google</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your Google Account to continue to <span className="font-semibold text-foreground">Alula Pay</span>
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Email or phone"
              type="email"
              autoFocus
              placeholder="Email or phone"
              value={googleEmail}
              onChange={(event) => setGoogleEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && googleEmail.trim()) goToSignup();
              }}
              className="h-14 rounded-2xl pl-11 text-base"
            />
          </div>
          <button type="button" className="text-sm font-medium text-primary">Forgot email?</button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          To continue, Google will share your name, email address, and profile picture with Alula Pay. See Alula
          Pay's Privacy Policy and Terms of Service.
        </p>

        <Button
          size="lg"
          disabled={!googleEmail.trim()}
          onClick={goToSignup}
          className="mt-auto h-14 rounded-2xl text-base shadow-button"
        >
          Continue
        </Button>
      </div>
    </PhoneFrame>
  );
}
