import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Transaction = {
  id: string;
  type: "redeem" | "transfer";
  amount: number;
  label: string;
  status: "Completed" | "Pending";
  date: string;
};

export type Beneficiary = {
  id: string;
  name: string;
  bank: string;
  branch: string;
  account: string;
  reference?: string;
};

export type Plan = "basic" | "pro";

type Ctx = {
  onboarded: boolean;
  signedIn: boolean;
  phone: string;
  firstName: string;
  balance: number;
  verified: boolean;
  plan: Plan;
  approvalPin: string | null;
  alulaOn: boolean;
  theme: "light" | "dark";
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  setOnboarded: (v: boolean) => void;
  signIn: (phone: string, firstName?: string) => void;
  signOut: () => void;
  addTransaction: (t: Transaction) => void;
  adjustBalance: (delta: number) => void;
  setVerified: (v: boolean) => void;
  setApprovalPin: (p: string) => void;
  setAlulaOn: (v: boolean) => void;
  setTheme: (t: "light" | "dark") => void;
  addBeneficiary: (b: Omit<Beneficiary, "id">) => Beneficiary;
};

const AppContext = createContext<Ctx | null>(null);

const sampleTx: Transaction[] = [
  { id: "t1", type: "redeem", amount: 200, label: "OTT voucher redeemed", status: "Completed", date: "Today, 10:24" },
  { id: "t2", type: "transfer", amount: -152.25, label: "Sent to Thandi Nkosi", status: "Completed", date: "Yesterday, 18:02" },
  { id: "t3", type: "redeem", amount: 500, label: "Blu voucher redeemed", status: "Completed", date: "12 May" },
];

const sampleBenes: Beneficiary[] = [
  { id: "b1", name: "Thandi Nkosi", bank: "Capitec Bank", branch: "470010", account: "1234567890", reference: "Rent" },
  { id: "b2", name: "Sipho Dlamini", bank: "FNB / RMB", branch: "250655", account: "62012345678", reference: "Groceries" },
  { id: "b3", name: "Ayanda Mthembu", bank: "Standard Bank", branch: "051001", account: "087654321", reference: "School fees" },
  { id: "b4", name: "Lerato Mokoena", bank: "TymeBank", branch: "678910", account: "5300012345", reference: "Mom" },
  { id: "b5", name: "Nomvula Khumalo", bank: "Nedbank", branch: "198765", account: "1098765432", reference: "Sister" },
];

export const STORAGE_KEY = "alula-pay-state-v2";

type Persisted = {
  onboarded: boolean; signedIn: boolean; phone: string; firstName: string; balance: number;
  verified: boolean; plan: Plan; approvalPin: string | null; alulaOn: boolean;
  theme: "light" | "dark"; transactions: Transaction[]; beneficiaries: Beneficiary[];
};

function readStoredState(): Partial<Persisted> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Persisted>) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [initial] = useState<Partial<Persisted> | null>(() => readStoredState());
  const [hydrated, setHydrated] = useState(false);
  const [onboarded, setOnboarded] = useState(() => initial?.onboarded ?? false);
  const [signedIn, setSignedIn] = useState(() => initial?.signedIn ?? false);
  const [phone, setPhone] = useState(() => initial?.phone ?? "");
  const [firstName, setFirstName] = useState(() => initial?.firstName ?? "");
  const [balance, setBalance] = useState(() => initial?.balance ?? 550);
  const [verified, setVerified] = useState(() => initial?.verified ?? false);
  const [plan, setPlan] = useState<Plan>(() => initial?.plan ?? "basic");
  const [approvalPin, setApprovalPinState] = useState<string | null>(() => initial?.approvalPin ?? null);
  const [alulaOn, setAlulaOn] = useState(() => initial?.alulaOn ?? true);
  const [theme, setThemeState] = useState<"light" | "dark">(() => initial?.theme ?? "light");
  const [transactions, setTransactions] = useState<Transaction[]>(() => initial?.transactions ?? sampleTx);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => initial?.beneficiaries ?? sampleBenes);

  // Unlock persistence only after the first browser render, so saved state never gets overwritten by defaults.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const data: Persisted = {
        onboarded, signedIn, phone, firstName, balance, verified, plan,
        approvalPin, alulaOn, theme, transactions, beneficiaries,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [hydrated, onboarded, signedIn, phone, firstName, balance, verified, plan, approvalPin, alulaOn, theme, transactions, beneficiaries]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const signIn = useCallback((p: string, name?: string) => {
    setPhone(p);
    if (name !== undefined) setFirstName(name.trim());
    setSignedIn(true);
  }, []);
  const signOut = useCallback(() => {
    setSignedIn(false);
    setApprovalPinState(null);
  }, []);
  const addTransaction = useCallback((t: Transaction) => setTransactions((prev) => [t, ...prev]), []);
  const adjustBalance = useCallback((delta: number) => setBalance((b) => Math.max(0, +(b + delta).toFixed(2))), []);
  const setApprovalPin = useCallback((p: string) => setApprovalPinState(p), []);
  const setTheme = useCallback((t: "light" | "dark") => setThemeState(t), []);
  const setVerifiedWithPlan = useCallback((v: boolean) => { setVerified(v); if (v) setPlan("pro"); }, []);
  const addBeneficiary = useCallback((b: Omit<Beneficiary, "id">) => {
    const newB = { ...b, id: crypto.randomUUID() };
    setBeneficiaries((prev) => [newB, ...prev]);
    return newB;
  }, []);

  return (
    <AppContext.Provider
      value={{
        onboarded, signedIn, phone, firstName, balance, verified, plan, approvalPin, alulaOn, theme,
        transactions, beneficiaries,
        setOnboarded, signIn, signOut, addTransaction, adjustBalance,
        setVerified: setVerifiedWithPlan,
        setApprovalPin, setAlulaOn, setTheme, addBeneficiary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// Format as R1,234.50 (no space, dot decimal, comma thousands) per founder preference.
export const formatZAR = (n: number) => {
  const neg = n < 0;
  const abs = Math.abs(n);
  const [intPart, decPart] = abs.toFixed(2).split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}R${withCommas}.${decPart}`;
};

// Fee logic from Alula Pay business plan:
// - EFT rail for transfers ≤ R3,000 (lower cost, slower)
// - RTC rail for transfers > R3,000 (immediate, higher cost)
// - Minimum fee protection on every transfer.
// Pro plan unlocks reduced rates.
export type FeeBreakdown = { rail: "EFT" | "RTC"; rate: number; fee: number; min: number };

// Plain-English names used everywhere in the UI instead of "EFT" / "RTC".
export const railLabel = (rail: "EFT" | "RTC") =>
  rail === "RTC" ? "Instant payment" : "1–2 day transfer";
export const railSettleCopy = (rail: "EFT" | "RTC") =>
  rail === "RTC" ? "Lands in their bank instantly" : "Lands in their bank in 1–2 working days";

export function calcTransferFee(amount: number, plan: Plan = "basic"): FeeBreakdown {
  if (amount <= 0) return { rail: "EFT", rate: 0, fee: 0, min: 0 };
  const isRTC = amount > 3000;
  const rate = isRTC
    ? (plan === "pro" ? 0.015 : 0.02)
    : (plan === "pro" ? 0.01 : 0.015);
  const min = isRTC ? 10 : 5;
  const fee = Math.max(min, +(amount * rate).toFixed(2));
  return { rail: isRTC ? "RTC" : "EFT", rate, fee, min };
}

export const MONTHLY_FEE = { basic: 5, pro: 10 } as const;
