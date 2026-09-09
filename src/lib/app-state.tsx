import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Transaction = {
  id: string;
  type: "redeem" | "transfer";
  amount: number;
  label: string;
  status: "Completed" | "Pending";
  date?: string;
  createdAt?: number;
  // Itemized detail for a "transfer" send — shown separately in the
  // transaction list so the fee never gets folded silently into one number.
  recipientName?: string;
  bankName?: string;
  accountNumber?: string;
  reference?: string;
  sendAmount?: number;
  fee?: number;
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
  verifyIdentity: () => void;
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
  // Subscription paywall
  freeTransactionsLeft: number;
  subscriptionActive: boolean;
  paywallActive: boolean;
  pendingPlan: Plan | null;
  pendingAmountPaid: number;
  choosePendingPlan: (p: Plan) => void;
  redeemTowardSubscription: (amount: number, voucherLabel: string) => { fullyPaid: boolean; outstanding: number };
};

const AppContext = createContext<Ctx | null>(null);

const now = new Date();

const todayAt = (h: number, m: number) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();

const yesterdayAt = (h: number, m: number) => {
  const d = new Date(now);
  d.setDate(now.getDate() - 1);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).getTime();
};

const dateAt = (month: number, day: number, h: number, m: number) =>
  new Date(now.getFullYear(), month - 1, day, h, m).getTime();

const sampleTx: Transaction[] = [
  { id: "t1", type: "redeem", amount: 200, label: "OTT voucher redeemed", status: "Completed", createdAt: todayAt(10, 24) },
  {
    id: "t2", type: "transfer", amount: -152.25, label: "Sent to Thandi Nkosi", status: "Completed", createdAt: yesterdayAt(18, 2),
    recipientName: "Thandi Nkosi", bankName: "Capitec Bank", accountNumber: "1234567890", reference: "Rent",
    sendAmount: 145, fee: 7.25,
  },
  { id: "t3", type: "redeem", amount: 500, label: "Blu voucher redeemed", status: "Completed", createdAt: dateAt(5, 12, 14, 30) },
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
  freeTransactionsLeft: number; freeTxPeriod: string | null; lastPaidPeriod: string | null;
  pendingPlan: Plan | null; pendingAmountPaid: number;
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
  const [hydrated, setHydrated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [balance, setBalance] = useState(550);
  const [verified, setVerified] = useState(false);
  const [plan, setPlan] = useState<Plan>("basic");
  const [approvalPin, setApprovalPinState] = useState<string | null>(null);
  const [alulaOn, setAlulaOn] = useState(true);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTx);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(sampleBenes);
  // freeTransactionsLeft counts down from 2 within the billing period named
  // by freeTxPeriod. When the current billing period (see getBillingPeriod)
  // no longer matches freeTxPeriod, the 2 free transactions are treated as
  // refreshed — this is derived below rather than reset eagerly, so it
  // naturally rolls over the moment the 2nd of the month arrives.
  const [freeTransactionsLeft, setFreeTransactionsLeft] = useState(2);
  const [freeTxPeriod, setFreeTxPeriod] = useState<string | null>(null);
  const [lastPaidPeriod, setLastPaidPeriod] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [pendingAmountPaid, setPendingAmountPaid] = useState(0);

  // Apply any persisted state once, after mount. The very first render (both
  // server and the client's hydration pass) always starts from the same
  // plain defaults above — reading localStorage synchronously into initial
  // state would make the client's first render diverge from the server's,
  // causing a hydration mismatch.
  useEffect(() => {
    const initial = readStoredState();
    if (initial) {
      if (initial.onboarded !== undefined) setOnboarded(initial.onboarded);
      if (initial.signedIn !== undefined) setSignedIn(initial.signedIn);
      if (initial.phone !== undefined) setPhone(initial.phone);
      if (initial.firstName !== undefined) setFirstName(initial.firstName);
      if (initial.balance !== undefined) setBalance(initial.balance);
      if (initial.verified !== undefined) setVerified(initial.verified);
      if (initial.plan !== undefined) setPlan(initial.plan);
      if (initial.approvalPin !== undefined) setApprovalPinState(initial.approvalPin);
      if (initial.alulaOn !== undefined) setAlulaOn(initial.alulaOn);
      if (initial.theme !== undefined) setThemeState(initial.theme);
      if (initial.transactions !== undefined) setTransactions(initial.transactions);
      if (initial.beneficiaries !== undefined) setBeneficiaries(initial.beneficiaries);
      if (initial.freeTransactionsLeft !== undefined) setFreeTransactionsLeft(initial.freeTransactionsLeft);
      if (initial.freeTxPeriod !== undefined) setFreeTxPeriod(initial.freeTxPeriod);
      if (initial.lastPaidPeriod !== undefined) setLastPaidPeriod(initial.lastPaidPeriod);
      if (initial.pendingPlan !== undefined) setPendingPlan(initial.pendingPlan);
      if (initial.pendingAmountPaid !== undefined) setPendingAmountPaid(initial.pendingAmountPaid);
    }
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const data: Persisted = {
        onboarded, signedIn, phone, firstName, balance, verified, plan,
        approvalPin, alulaOn, theme, transactions, beneficiaries,
        freeTransactionsLeft, freeTxPeriod, lastPaidPeriod, pendingPlan, pendingAmountPaid,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [hydrated, onboarded, signedIn, phone, firstName, balance, verified, plan, approvalPin, alulaOn, theme, transactions, beneficiaries, freeTransactionsLeft, freeTxPeriod, lastPaidPeriod, pendingPlan, pendingAmountPaid]);

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
    setPhone(p);
    setFirstName(name.trim());
    setSignedIn(true);
    setPlan("basic");
    setVerified(false);
    setApprovalPinState(null);
    setPinAttemptsLeft(3);
    setPinLocked(false);
    setBalance(0);
    setTransactions([]);
    setFreeTransactionsLeft(2);
    setFreeTxPeriod(null);
    setLastPaidPeriod(null);
    setPendingPlan(null);
    setPendingAmountPaid(0);
  }, []);
  const signOut = useCallback(() => {
    // Signing out returns the user to onboarding for the demo.
    setSignedIn(false);
    setOnboarded(false);
  }, []);
const addTransaction = useCallback((t: Transaction) => {
  const enriched: Transaction = { ...t, createdAt: t.createdAt ?? Date.now() };
  setTransactions((prev) => [enriched, ...prev]);
  // Sends (not redeems) count against the two free transactions every
  // billing period grants before a subscription is required. If the
  // billing period has rolled over since the count was last touched, the
  // 2 free transactions are refreshed first.
  if (t.type === "transfer") {
    const currentPeriod = getBillingPeriod();
    setFreeTxPeriod((prevPeriod) => {
      if (prevPeriod !== currentPeriod) {
        setFreeTransactionsLeft(1);
      } else {
        setFreeTransactionsLeft((n) => Math.max(0, n - 1));
      }
      return currentPeriod;
    });
  }
}, []);
  const adjustBalance = useCallback((delta: number) => setBalance((b) => +(b + delta).toFixed(2)), []);
  const setApprovalPin = useCallback((p: string | null) => {
    setApprovalPinState(p);
    setPinAttemptsLeft(3);
    setPinLocked(false);
  }, []);
  const setTheme = useCallback((t: "light" | "dark") => setThemeState(t), []);
  const setVerifiedWithPlan = useCallback((v: boolean) => { setVerified(v); if (v) setPlan("pro"); }, []);
  // Marks the once-off DHA selfie check done without granting the Pro plan
  // itself — the subscribe flow runs this before payment, and payment
  // (redeemTowardSubscription) is what actually activates the plan.
  const verifyIdentity = useCallback(() => setVerified(true), []);
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

  const choosePendingPlan = useCallback((p: Plan) => {
    setPendingPlan(p);
  }, []);

  // Applies a redeemed voucher's value toward the outstanding subscription
  // fee. Vouchers used here are earmarked for the subscription — they don't
  // add to the spendable wallet balance. Partial payments persist (added to
  // pendingAmountPaid) so the user always continues where they left off
  // rather than losing progress.
  const redeemTowardSubscription = useCallback((amount: number, voucherLabel: string) => {
    const target = pendingPlan ? MONTHLY_FEE[pendingPlan] : 0;
    const newPaid = +(pendingAmountPaid + amount).toFixed(2);

    setTransactions((prev) => [{
      id: crypto.randomUUID(),
      type: "redeem",
      amount,
      label: `${voucherLabel} — Subscription payment`,
      status: "Completed",
      createdAt: Date.now(),
    }, ...prev]);

    if (pendingPlan && newPaid >= target) {
      setPlan(pendingPlan);
      if (pendingPlan === "pro") setVerified(true);
      setLastPaidPeriod(getBillingPeriod());
      setPendingAmountPaid(0);
      setPendingPlan(null);
      return { fullyPaid: true, outstanding: 0 };
    }
    setPendingAmountPaid(newPaid);
    return { fullyPaid: false, outstanding: +(target - newPaid).toFixed(2) };
  }, [pendingPlan, pendingAmountPaid]);

  const currentBillingPeriod = getBillingPeriod();
  // freeTransactionsLeft only reflects the current billing period if
  // freeTxPeriod still matches it — otherwise the 2 free transactions have
  // rolled over and are refreshed (the count itself is only written back to
  // state the next time a transfer actually consumes one, in addTransaction).
  const effectiveFreeTransactionsLeft = freeTxPeriod === currentBillingPeriod ? freeTransactionsLeft : 2;
  const subscriptionActive = lastPaidPeriod === currentBillingPeriod;
  const paywallActive = effectiveFreeTransactionsLeft <= 0 && !subscriptionActive;

  return (
    <AppContext.Provider
      value={{
        onboarded, signedIn, phone, firstName, balance, verified, plan, approvalPin, alulaOn, theme,
        transactions, beneficiaries,
        setOnboarded, signIn, signUp, signOut, addTransaction, adjustBalance,
        setVerified: setVerifiedWithPlan,
        verifyIdentity,
        setApprovalPin, setAlulaOn, setTheme, addBeneficiary,
        pinAttemptsLeft, pinLocked, registerPinAttempt, resetPinLock,
        guideMode, startGuide, stopGuide,
        freeTransactionsLeft: effectiveFreeTransactionsLeft, subscriptionActive, paywallActive,
        pendingPlan, pendingAmountPaid, choosePendingPlan, redeemTowardSubscription,
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

export function formatTxDate(t: Transaction): string {
  if (t.date && !t.createdAt) return t.date;

  const ts = t.createdAt ?? Date.now();
  const d = new Date(ts);
  const now = new Date();

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isToday = isSameDay(d, now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = isSameDay(d, yesterday);

  const time = d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;

  const date = d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
  return `${date}, ${time}`;
}

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

export function calcTransferFee(
  amount: number,
  plan: Plan = "basic",
  rail?: "EFT" | "RTC",
): FeeBreakdown {
  if (amount <= 0) return { rail: rail ?? "EFT", rate: 0, fee: 0, min: 0 };
  const chosen = rail ?? (plan === "pro" ? "RTC" : "EFT");
  const rate = 0.05;
  const fee = +(amount * rate).toFixed(2);
  return { rail: chosen, rate, fee, min: 0 };
}


export const MONTHLY_FEE = { basic: 10, pro: 20 } as const;

// The subscription billing cycle rolls over on the 2nd of each calendar
// month. Returns a "YYYY-MM" key identifying the cycle `d` falls in.
export function getBillingPeriod(d: Date = new Date()): string {
  const cycleStart = d.getDate() >= 2 ? new Date(d.getFullYear(), d.getMonth(), 1) : new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return `${cycleStart.getFullYear()}-${String(cycleStart.getMonth() + 1).padStart(2, "0")}`;
}

// Tier limits per business plan v2 (2025).
export const TIER_LIMITS = {
  basic: { wallet: 2000, singleTx: 2000, monthly: 5000, daily: 2000 },
  pro:   { wallet: 49999.99, singleTx: 10000, monthly: 49999.99, daily: 10000 },
} as const;
