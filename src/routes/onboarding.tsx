import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";
import screen1 from "@/assets/onboarding-1.png";
import screen2 from "@/assets/onboarding-2.png";
import screen3 from "@/assets/onboarding-3.png";
import screen4 from "@/assets/onboarding-4.png";
import screen5 from "@/assets/onboarding-5.png";
import screen6 from "@/assets/onboarding-6.png";

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

const screens = [screen1, screen2, screen3, screen4, screen5, screen6];
const screenRatios = [853 / 1844, 852 / 1846, 853 / 1844, 852 / 1332, 843 / 1866, 852 / 1846];
const SCREEN_ALT = "Alula Pay onboarding screen";

function Onboarding() {
  const navigate = useNavigate();
  const { setOnboarded } = useApp();
  const [screen, setScreen] = useState(0);
  const [googleEmail, setGoogleEmail] = useState("");
  const [hypePhase, setHypePhase] = useState(0);

  useEffect(() => {
    if (screen !== 3) return;
    const interval = window.setInterval(() => setHypePhase((phase) => (phase + 1) % 4), 450);
    const timeout = window.setTimeout(() => setScreen(4), 5000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [screen]);

  const goToSignup = () => {
    if (googleEmail.trim()) {
      window.sessionStorage.setItem("alula-google-email", googleEmail.trim());
    }
    setOnboarded(true);
    navigate({ to: "/signup" });
  };

  const next = () => {
    if (screen < 2) setScreen((current) => current + 1);
    else if (screen === 2) setScreen(3);
  };

  const backToAccountChoices = () => {
    setGoogleEmail("");
    setScreen(4);
  };

  return (
    <PhoneFrame>
      <div className="relative flex h-full min-h-full items-center justify-center overflow-hidden bg-background">
        {screen < 4 && (
          <>
            <img
              src={screens[screen]}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover object-top opacity-55 blur-[32px]"
            />
            <div className="pointer-events-none absolute inset-0 bg-background/25" />
          </>
        )}
        {screen === 4 && <div className="pointer-events-none absolute inset-0 bg-gold" />}
        <div
          className={screen === 3
            ? "relative h-full w-full"
            : "relative z-10 max-h-[calc(100%+12px)] max-w-full -translate-y-1.5 overflow-hidden shadow-[0_32px_90px_-18px_rgba(0,0,0,0.55),0_12px_32px_-10px_rgba(0,0,0,0.28)]"}
          style={screen === 3 ? undefined : {
            aspectRatio: `${screenRatios[screen]}`,
            width: "100%",
          }}
        >
          <img
            src={screens[screen]}
            alt={SCREEN_ALT}
            className={screen < 3
              ? "absolute -left-[2%] top-0 block h-auto w-[104%] max-w-none select-none"
              : `absolute inset-0 block h-full w-full select-none ${screen === 3 ? "object-cover object-bottom" : "object-contain"}`}
            style={screen === 3 ? {
              filter: `hue-rotate(${[-4, 8, -7, 5][hypePhase]}deg) saturate(${[1, 1.08, 0.94, 1.06][hypePhase]})`,
              transition: "filter 420ms ease-in-out",
            } : undefined}
          />

          {screen < 3 && (
            <>
              <Button
                type="button"
                variant="ghost"
                aria-label={screen === 2 ? "Get started" : "Next"}
                onClick={next}
                className="absolute left-[7.5%] top-[90.5%] h-[6.8%] w-[85%] rounded-full bg-transparent p-0 text-transparent shadow-none hover:bg-transparent"
              />
            </>
          )}

          {screen === 4 && (
            <>
              <Button
                type="button"
                variant="ghost"
                aria-label="Open an account"
                onClick={() => navigate({ to: "/signup" })}
                className="absolute left-[8%] top-[60.1%] h-[6.6%] w-[46%] rounded-full bg-transparent p-0 text-transparent shadow-none hover:bg-transparent"
              />
              <Button
                type="button"
                variant="ghost"
                aria-label="I already have an account"
                onClick={() => navigate({ to: "/login" })}
                className="absolute right-[8%] top-[60.1%] h-[6.6%] w-[34%] rounded-full bg-transparent p-0 text-transparent shadow-none hover:bg-transparent"
              />
              <Button
                type="button"
                variant="ghost"
                aria-label="Continue with Google"
                onClick={() => setScreen(5)}
                className="absolute left-[8%] top-[75.9%] h-[7%] w-[84%] rounded-full bg-transparent p-0 text-transparent shadow-none hover:bg-transparent"
              />
              <Button
                type="button"
                variant="ghost"
                aria-label="Continue with Apple"
                onClick={() => navigate({ to: "/signup" })}
                className="absolute left-[8%] top-[84.5%] h-[7%] w-[84%] rounded-full bg-transparent p-0 text-transparent shadow-none hover:bg-transparent"
              />
            </>
          )}

          {screen === 5 && (
            <>
              <input
                aria-label="Email or phone"
                type="email"
                value={googleEmail}
                onChange={(event) => setGoogleEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && googleEmail.trim()) goToSignup();
                }}
                className="absolute left-[9.5%] top-[40.1%] h-[6.4%] w-[81%] rounded-lg px-6 text-[16px] text-[#202124] outline-none"
                style={{ backgroundColor: googleEmail ? "#FBFBFB" : "transparent" }}
              />

              <Button
                type="button"
                variant="ghost"
                aria-label="Continue with email"
                disabled={!googleEmail.trim()}
                onClick={goToSignup}
                className="absolute left-[9.5%] top-[70.4%] h-[7%] w-[82%] rounded-full bg-transparent p-0 text-transparent shadow-none hover:bg-transparent disabled:opacity-100"
              />
              <Button
                type="button"
                variant="ghost"
                aria-label="Back to account choices"
                onClick={backToAccountChoices}
                className="absolute left-[4%] top-[8%] h-[7%] w-[12%] bg-transparent p-0 text-transparent shadow-none hover:bg-transparent"
              />
            </>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}
