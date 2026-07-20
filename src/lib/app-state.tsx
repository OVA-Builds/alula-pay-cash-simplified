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
  signUp: (phone: string, firstName: string) => void;
  signOut: () => void;
  addTransaction: (t: Transaction) => void;
  adjustBalance: (delta: number) => void;
  setVerified: (v: boolean) => void;
  setApprovalPin: (p: string | null) => void;
  setAlulaOn: (v: boolean) => void;
  setTheme: (t: "light" | "dark") => void;
  addBeneficiary: (b: Omit<Beneficiary, "id">) => Beneficiary;
  // Approval PIN attempts / lockout
  pinAttemptsLeft: number;
  pinLocked: boolean;
  registerPinAttempt: (correct: boolean) => { locked: boolean; left: number };
  resetPinLock: () => void;
  // Alula in-app guided tour
  guideMode: "deposit" | "withdraw" | null;
  startGuide: (m: "deposit" | "withdraw") => void;
  stopGuide: () => void;
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

  const [pinAttemptsLeft, setPinAttemptsLeft] = useState(3);
  const [pinLocked, setPinLocked] = useState(false);
  const [guideMode, setGuideMode] = useState<"deposit" | "withdraw" | null>(null);
  const startGuide = useCallback((m: "deposit" | "withdraw") => setGuideMode(m), []);
  const stopGuide = useCallback(() => setGuideMode(null), []);

  const signIn = useCallback((p: string, name?: string) => {
    setPhone(p);
    if (name !== undefined) setFirstName(name.trim());
    setSignedIn(true);
    setPinAttemptsLeft(3);
    setPinLocked(false);
  }, []);
  const signUp = useCallback((p: string, name: string) => {
    // Always start a new signup on the Basic tier, unverified, with a fresh approval PIN flow.
    // New account: balance = -R5 (owes first month's Basic subscription), no transaction history.
    setPhone(p);
    setFirstName(name.trim());
    setSignedIn(true);
    setPlan("basic");
    setVerified(false);
    setApprovalPinState(null);
    setPinAttemptsLeft(3);
    setPinLocked(false);
    setBalance(-MONTHLY_FEE.basic);
    setTransactions([]);
  }, []);
  const signOut = useCallback(() => {
    // Signing out returns the user to onboarding for the demo.
    setSignedIn(false);
    setOnboarded(false);
  }, []);
  const addTransaction = useCallback((t: Transaction) => setTransactions((prev) => [t, ...prev]), []);
  const adjustBalance = useCallback((delta: number) => setBalance((b) => Math.max(0, +(b + delta).toFixed(2))), []);
  const setApprovalPin = useCallback((p: string | null) => {
    setApprovalPinState(p);
    setPinAttemptsLeft(3);
    setPinLocked(false);
  }, []);
  const setTheme = useCallback((t: "light" | "dark") => setThemeState(t), []);
  const setVerifiedWithPlan = useCallback((v: boolean) => { setVerified(v); if (v) setPlan("pro"); }, []);
  const addBeneficiary = useCallback((b: Omit<Beneficiary, "id">) => {
    const newB = { ...b, id: crypto.randomUUID() };
    setBeneficiaries((prev) => [newB, ...prev]);
    return newB;
  }, []);
  const registerPinAttempt = useCallback((correct: boolean) => {
    if (correct) {
      setPinAttemptsLeft(3);
      return { locked: false, left: 3 };
    }
    let nextLeft = 0;
    let locked = false;
    setPinAttemptsLeft((prev) => {
      nextLeft = Math.max(0, prev - 1);
      if (nextLeft === 0) { locked = true; setPinLocked(true); }
      return nextLeft;
    });
    return { locked, left: nextLeft };
  }, []);
  const resetPinLock = useCallback(() => {
    setPinLocked(false);
    setPinAttemptsLeft(3);
    setApprovalPinState(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        onboarded, signedIn, phone, firstName, balance, verified, plan, approvalPin, alulaOn, theme,
        transactions, beneficiaries,
        setOnboarded, signIn, signUp, signOut, addTransaction, adjustBalance,
        setVerified: setVerifiedWithPlan,
        setApprovalPin, setAlulaOn, setTheme, addBeneficiary,
        pinAttemptsLeft, pinLocked, registerPinAttempt, resetPinLock,
        guideMode, startGuide, stopGuide,
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

// Fee logic from Alula Pay business plan (2025 v2):
// - Both tiers: 5% per send, R20 minimum send amount.
// - Basic delivery: 1–2 working days.
// - Pro delivery: instant (within 10 minutes).
export type FeeBreakdown = { rail: "EFT" | "RTC"; rate: number; fee: number; min: number };

// Plain-English names used everywhere in the UI instead of "EFT" / "RTC".
export const railLabel = (rail: "EFT" | "RTC") =>
  rail === "RTC" ? "Instant payment" : "1–2 day transfer";
export const railSettleCopy = (rail: "EFT" | "RTC") =>
  rail === "RTC" ? "Lands in their bank within 10 minutes" : "Lands in their bank in 1–2 working days";

// Minimum single send amount (ZAR) — enforced across all payment flows.
export const MIN_SEND = 20;

export function calcTransferFee(amount: number, plan: Plan = "basic"): FeeBreakdown {
  if (amount <= 0) return { rail: "EFT", rate: 0, fee: 0, min: 0 };
  const isRTC = plan === "pro";
  const rate = 0.05;
  const fee = +(amount * rate).toFixed(2);
  return { rail: isRTC ? "RTC" : "EFT", rate, fee, min: 0 };
}

export const MONTHLY_FEE = { basic: 5, pro: 10 } as const;

// Tier limits per business plan v2 (2025).
export const TIER_LIMITS = {
  basic: { wallet: 2000, singleTx: 2000, monthly: 2000, daily: 2000 },
  pro:   { wallet: 49999.99, singleTx: 10000, monthly: 49999.99, daily: 10000 },
} as const;
