import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Zap, ShieldCheck, Landmark, MapPin, Timer, Check,
  CreditCard, BarChart3, ScanFace, Send, Headphones, FileText,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useApp } from "@/lib/app-state";
import s1 from "@/assets/onb-s1.png.asset.json";
import s2 from "@/assets/onb-s2.png.asset.json";
import s3 from "@/assets/onb-s3.png.asset.json";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const BG = "#EEF1FA";
const NAVY = "#0B1B4B";
const BLUE = "#1E56E8";
const GREY = "#6B7280";
const CARD = "#F5F7FD";

type Feature = { icon: typeof Zap; l1: string; l2: string };

const slides: {
  image: string;
  imgH: number;
  title: { text: string; blue?: boolean }[];
  sub: string[];
  features: Feature[];
  cta: string;
}[] = [
  {
    image: s1.url,
    imgH: 300,
    title: [{ text: "Get your money" }, { text: "to any bank account" }, { text: "in " }, { text: "easy steps", blue: true }],
    sub: ["Fast, secure and made for the way", "you live."],
    features: [
      { icon: Zap, l1: "Fast", l2: "Transfers" },
      { icon: ShieldCheck, l1: "Secure &", l2: "Trusted" },
      { icon: Landmark, l1: "Any Bank.", l2: "Anytime." },
    ],
    cta: "Next",
  },
  {
    image: s2.url,
    imgH: 300,
    title: [{ text: "You can" }, { text: "conveniently find", blue: true }, { text: "a voucher everywhere" }],
    sub: ["From local shops to trusted partners.", "Get one in seconds."],
    features: [
      { icon: MapPin, l1: "Near", l2: "You" },
      { icon: Timer, l1: "Quick", l2: "& Easy" },
      { icon: Check, l1: "Trusted", l2: "Partners" },
    ],
    cta: "Next",
  },
  {
    image: s3.url,
    imgH: 215,
    title: [{ text: "Choose the plan" }, { text: "that " }, { text: "works for you", blue: true }],
    sub: ["Simple. Transparent. Build for real life."],
    features: [],
    cta: "Get Started",
  },
];

const planRows: { icon: typeof Zap; label: string[]; basic: string; pro: string }[] = [
  { icon: CreditCard, label: ["Subscription"], basic: "R5 / month", pro: "R10 / month" },
  { icon: BarChart3, label: ["Monthly Limit"], basic: "R5 000", pro: "R50 000" },
  { icon: ScanFace, label: ["Bio Metrics"], basic: "—", pro: "✓" },
  { icon: Send, label: ["Normal EFT"], basic: "✓", pro: "✓" },
  { icon: Zap, label: ["Immediate Payment"], basic: "—", pro: "✓" },
  { icon: Headphones, label: ["Support"], basic: "✓", pro: "✓" },
  { icon: FileText, label: ["3 Months", "Transaction Statement"], basic: "—", pro: "✓" },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const { setOnboarded } = useApp();
  const slide = slides[i];
  const last = i === slides.length - 1;

  const next = () => {
    if (last) {
      setOnboarded(true);
      navigate({ to: "/hype" });
    } else setI(i + 1);
  };

  return (
    <PhoneFrame>
      <div
        className="flex flex-col min-h-full h-full overflow-y-auto overscroll-contain"
        style={{ backgroundColor: BG, color: NAVY }}
      >
        {/* Hero image (exact design artwork) */}
        <div className="px-2 pt-2">
          <img
            key={i}
            src={slide.image}
            alt=""
            className="w-full rounded-[22px] object-cover animate-float-up"
            style={{ height: slide.imgH }}
          />
        </div>

        {/* Headline */}
        <div key={`t-${i}`} className="px-6 pt-6 animate-float-up">
          <h1 className="text-[27px] leading-[1.16] font-extrabold tracking-tight">
            {slide.title.map((p, k) => (
              <span key={k} style={{ color: p.blue ? BLUE : NAVY }}>
                {p.text}
                {p.text.endsWith(" ") ? null : <br />}
              </span>
            ))}
          </h1>
          {slide.sub.map((line) => (
            <p key={line} className="text-[15px] leading-[1.45]" style={{ color: GREY }}>
              {line}
            </p>
          ))}
        </div>

        {/* Feature card OR plan table */}
        {slide.features.length > 0 ? (
          <div className="px-6 mt-6">
            <div className="rounded-[20px] grid grid-cols-3" style={{ backgroundColor: CARD }}>
              {slide.features.map((f, k) => (
                <div
                  key={f.l1}
                  className="flex flex-col items-center gap-2 py-5"
                  style={{ borderLeft: k === 0 ? undefined : "1px solid #E2E7F5" }}
                >
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: BLUE }}>
                    <f.icon className="h-5 w-5 text-white" strokeWidth={2.4} />
                  </div>
                  <p className="text-[13px] font-semibold leading-tight text-center" style={{ color: NAVY }}>
                    {f.l1}
                    <br />
                    {f.l2}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 mt-5">
            <div className="rounded-[18px] overflow-hidden" style={{ backgroundColor: CARD }}>
              <div className="grid grid-cols-[1.35fr_1fr_1fr]">
                <div className="px-4 py-4 text-[14px] font-bold" style={{ color: NAVY }}>Features</div>
                <div className="px-2 py-3 text-center" style={{ backgroundColor: "#E4EAFB" }}>
                  <p className="text-[16px] font-bold" style={{ color: NAVY }}>Basic</p>
                  <p className="text-[11px]" style={{ color: NAVY }}>R5 / month</p>
                </div>
                <div className="px-2 py-3 text-center" style={{ backgroundColor: "#0B37A8" }}>
                  <p className="text-[16px] font-bold text-white">Pro</p>
                  <p className="text-[11px] text-white/85">R10 / month</p>
                </div>
              </div>
              {planRows.map((r) => (
                <div key={r.label.join(" ")} className="grid grid-cols-[1.35fr_1fr_1fr] items-center" style={{ borderTop: "1px solid #E2E7F5" }}>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: BLUE }}>
                      <r.icon className="h-3.5 w-3.5 text-white" strokeWidth={2.4} />
                    </span>
                    <span className="text-[11.5px] leading-tight font-medium" style={{ color: NAVY }}>
                      {r.label.map((l) => (<span key={l} className="block">{l}</span>))}
                    </span>
                  </div>
                  <Cell value={r.basic} bg="#E9EEFB" />
                  <Cell value={r.pro} bg="#F0F3FC" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-4" />

        {/* CTA */}
        <div className="px-6 mt-6">
          <button
            onClick={next}
            className="h-14 w-full rounded-full flex items-center justify-center gap-3 text-[17px] font-semibold text-white active:scale-[0.99] transition"
            style={{ backgroundColor: BLUE }}
          >
            {slide.cta}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2.5 py-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to screen ${idx + 1}`}
              className="h-2.5 w-2.5 rounded-full transition-colors"
              style={{ backgroundColor: idx === i ? BLUE : "#C9D0E3" }}
            />
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

function Cell({ value, bg }: { value: string; bg: string }) {
  return (
    <div className="h-full flex items-center justify-center py-2.5 text-[12.5px]" style={{ backgroundColor: bg, color: NAVY }}>
      {value === "✓" ? (
        <span className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: BLUE }}>
          <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
        </span>
      ) : value === "—" ? (
        <span style={{ color: NAVY }}>—</span>
      ) : (
        value
      )}
    </div>
  );
}
