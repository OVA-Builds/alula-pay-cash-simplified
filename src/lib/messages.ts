import { ShieldCheck, Landmark, Megaphone } from "lucide-react";

export type Message = { id: string; icon: typeof ShieldCheck; title: string; body: string; date: string };

export const MESSAGES: Message[] = [
  {
    id: "m1",
    icon: ShieldCheck,
    title: "Pro sends land in minutes",
    body: "Upgrade to Pro for instant payments, a R49,999.99 monthly limit, and downloadable 3-month statements.",
    date: "This week",
  },
  {
    id: "m2",
    icon: Landmark,
    title: "Save a beneficiary to pay faster",
    body: "Turn on \"Save as beneficiary\" next time you send — their details will be one tap away after that.",
    date: "This week",
  },
  {
    id: "m3",
    icon: Megaphone,
    title: "Know your fees upfront",
    body: "Every send shows its fee separately before you approve — 5% per send, R20 minimum, no surprises.",
    date: "Last week",
  },
];
