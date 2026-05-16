import { create } from "zustand";

export type Transaction = {
  id: string;
  type: "redeem" | "transfer";
  amount: number;
  label: string;
  status: "Completed" | "Pending";
  date: string;
};

type State = {
  onboarded: boolean;
  signedIn: boolean;
  phone: string;
  balance: number;
  verified: boolean;
  transactions: Transaction[];
  setOnboarded: (v: boolean) => void;
  signIn: (phone: string) => void;
  addTransaction: (t: Transaction) => void;
  adjustBalance: (delta: number) => void;
  setVerified: (v: boolean) => void;
};

const sample: Transaction[] = [
  { id: "t1", type: "redeem", amount: 200, label: "Voucher redeemed", status: "Completed", date: "Today, 10:24" },
  { id: "t2", type: "transfer", amount: -150, label: "Sent to Capitec ••4421", status: "Completed", date: "Yesterday, 18:02" },
  { id: "t3", type: "redeem", amount: 500, label: "Voucher redeemed", status: "Completed", date: "12 May" },
];

export const useApp = create<State>((set) => ({
  onboarded: false,
  signedIn: false,
  phone: "",
  balance: 550,
  verified: false,
  transactions: sample,
  setOnboarded: (v) => set({ onboarded: v }),
  signIn: (phone) => set({ signedIn: true, phone }),
  addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
  adjustBalance: (delta) => set((s) => ({ balance: Math.max(0, s.balance + delta) })),
  setVerified: (v) => set({ verified: v }),
}));

export const formatZAR = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(n);
