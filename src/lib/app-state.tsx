import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import logo from "@/assets/alula-logo.png";

export type Transaction = {
  id: string;
  type: "load" | "transfer";
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
  rail?: "EFT" | "RTC";
};

// A subscription voucher worth more than the plan price leaves a leftover
// that Alula Pay never just sits on. If the leftover clears MIN_SEND on its
// own it becomes a forced send immediately; otherwise it's held here — too
// small to send alone — until a later top-up (see topUpHeldBalance) pushes
// the combined total over MIN_SEND. startedAt anchors the 90-day expiry
// countdown to the original transaction and never resets on a top-up.
export type HeldBalance = { amount: number; startedAt: number };

export type Beneficiary = {
  id: string;
  name: string;
  bank: string;
  branch: string;
  account: string;
  reference?: string;
};

export type Plan = "basic" | "pro";

// ---- Hustle tool ----------------------------------------------------------

export type Goal = {
  id: string;
  name: string;
  cost: number;
  durationMonths: number;
  createdAt: number;
};

export type BusinessLineItem = { label: string; amount: number };

// One log covers all three operational categories at once — ingredients
// (food/restaurant businesses only, see SideHustle.industry), supplies, and
// profit — each its own list of line items (e.g. "Meat R400", "Spices R100")
// built up with a + button. A category left empty just means nothing was
// logged for it that time.
export type BusinessLogType = "ingredients" | "supplies" | "profit";

export type BusinessEntry = {
  id: string;
  createdAt: number;
  ingredients: BusinessLineItem[];
  supplies: BusinessLineItem[];
  profit: BusinessLineItem[];
  savePct: number;
  // A log can be corrected once after the fact, then it's locked in for good.
  edited: boolean;
};

export const INDUSTRIES = [
  "Food & Beverage",
  "Personal Care & Grooming",
  "Automotive & Cleaning",
  "Retail & Trade",
  "Repairs & Technical Services",
  "Transport & Delivery",
  "Construction & Home Services",
  "Other",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export type SideHustle = {
  id: string;
  name: string;
  description: string;
  registered: boolean;
  industry: Industry;
  createdAt: number;
  entries: BusinessEntry[];
};

export const CHALLENGE_LENGTHS = [7, 14, 21, 30] as const;
export type ChallengeLength = (typeof CHALLENGE_LENGTHS)[number];

export type Challenge = {
  days: ChallengeLength;
  startedAt: number;
  struck: boolean[];
};

type Ctx = {
  onboarded: boolean;
  signedIn: boolean;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  incomeSource: string;
  verified: boolean;
  plan: Plan;
  approvalPin: string | null;
  // Signed in with this PIN at signup, checked against on login — separate
  // from approvalPin, which authorises individual payments once inside the app.
  appPin: string | null;
  theme: "light" | "dark";
  // Floating "Chat" bubble on Home that opens the Alula assistant.
  chatBubbleOn: boolean;
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  setOnboarded: (v: boolean) => void;
  signIn: (phone: string, firstName?: string) => void;
  signUp: (details: { phone: string; firstName: string; lastName: string; pin: string; email: string; incomeSource: string }) => void;
  signOut: () => void;
  addTransaction: (t: Transaction) => void;
  setVerified: (v: boolean) => void;
  verifyIdentity: () => void;
  setApprovalPin: (p: string | null) => void;
  setTheme: (t: "light" | "dark") => void;
  setChatBubbleOn: (v: boolean) => void;
  addBeneficiary: (b: Omit<Beneficiary, "id">) => Beneficiary;
  // Approval PIN attempts / lockout
  pinAttemptsLeft: number;
  pinLocked: boolean;
  registerPinAttempt: (correct: boolean) => { locked: boolean; left: number };
  resetPinLock: () => void;
  // Subscription paywall
  freeTransactionsLeft: number;
  subscriptionActive: boolean;
  paywallActive: boolean;
  pendingPlan: Plan | null;
  pendingAmountPaid: number;
  choosePendingPlan: (p: Plan) => void;
  applyVoucherTowardSubscription: (
    voucherAmount: number,
    voucherLabel: string,
  ) => { fullyPaid: boolean; outstanding: number; leftover: number };
  // A leftover from an overpaid subscription voucher that must be sent to
  // the bank before the client can use the app for anything else — the
  // popup showing it cannot be dismissed except by completing that send.
  pendingForcedSend: number;
  clearPendingForcedSend: () => void;
  // A leftover too small to send alone (below MIN_SEND). Held until a
  // top-up (via the Add Voucher flow) brings the combined total to
  // MIN_SEND or beyond, at which point it becomes a pendingForcedSend.
  heldBalance: HeldBalance | null;
  topUpHeldBalance: (amount: number) => { forced: boolean; combined: number };
  // Notifications: static tips/marketing messages the client can dismiss.
  // Transactions are never deletable — only these are.
  deletedMessageIds: string[];
  readMessageIds: string[];
  deleteMessage: (id: string) => void;
  markMessagesRead: (ids: string[]) => void;
  // Transactions created after this timestamp count as "new" for the bottom
  // nav's Alerts badge, alongside unread messages. Updated whenever the
  // Notifications page is opened.
  lastAlertsSeenAt: number;
  markAlertsSeen: () => void;
  // True for the whole session after signUp(), false once the client has
  // signed back in as a returning user — lets Home greet a brand-new
  // client differently from a returning one without flipping mid-session.
  isNewSignup: boolean;
  // Hustle tool: goals, side-hustle tracking, and the savings challenge.
  goals: Goal[];
  addGoal: (g: Omit<Goal, "id" | "createdAt">) => void;
  deleteGoal: (id: string) => void;
  sideHustles: SideHustle[];
  addSideHustle: (h: Omit<SideHustle, "id" | "createdAt" | "entries">) => SideHustle | null;
  addBusinessEntry: (hustleId: string, e: Omit<BusinessEntry, "id" | "createdAt" | "edited">) => BusinessEntry;
  // Returns false if the entry doesn't exist or has already been edited once.
  updateBusinessEntry: (hustleId: string, entryId: string, e: Omit<BusinessEntry, "id" | "createdAt" | "edited">) => boolean;
  challenge: Challenge | null;
  startChallenge: (days: ChallengeLength) => void;
  endChallenge: () => void;
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
  { id: "t1", type: "load", amount: 200, label: "OTT voucher added", status: "Completed", createdAt: todayAt(10, 24) },
  {
    id: "t2", type: "transfer", amount: -152.25, label: "Sent to Thandi Nkosi", status: "Completed", createdAt: yesterdayAt(18, 2),
    recipientName: "Thandi Nkosi", bankName: "Capitec Bank", accountNumber: "1234567890", reference: "Rent",
    sendAmount: 145, fee: 7.25, rail: "RTC",
  },
  { id: "t3", type: "load", amount: 500, label: "Blu voucher added", status: "Completed", createdAt: dateAt(5, 12, 14, 30) },
];

const sampleBenes: Beneficiary[] = [
  { id: "b1", name: "Thandi Nkosi", bank: "Capitec Bank", branch: "470010", account: "1234567890", reference: "Rent" },
  { id: "b2", name: "Sipho Dlamini", bank: "FNB / RMB", branch: "250655", account: "62012345678", reference: "Groceries" },
  { id: "b3", name: "Ayanda Mthembu", bank: "Standard Bank", branch: "051001", account: "087654321", reference: "School fees" },
  { id: "b4", name: "Lerato Mokoena", bank: "GoTyme", branch: "678910", account: "5300012345", reference: "Mom" },
  { id: "b5", name: "Nomvula Khumalo", bank: "Nedbank", branch: "198765", account: "1098765432", reference: "Sister" },
];

export const STORAGE_KEY = "alula-pay-state-v2";

type Persisted = {
  onboarded: boolean; signedIn: boolean; phone: string; firstName: string; lastName: string; email: string; incomeSource: string;
  verified: boolean; plan: Plan; approvalPin: string | null; appPin: string | null;
  theme: "light" | "dark"; chatBubbleOn: boolean; transactions: Transaction[]; beneficiaries: Beneficiary[];
  freeTransactionsLeft: number; freeTxPeriod: string | null; lastPaidPeriod: string | null;
  pendingPlan: Plan | null; pendingAmountPaid: number;
  pendingForcedSend: number; heldBalance: HeldBalance | null;
  deletedMessageIds: string[]; readMessageIds: string[];
  lastAlertsSeenAt: number;
  isNewSignup: boolean;
  goals: Goal[]; sideHustles: SideHustle[]; challenge: Challenge | null;
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

// The Hustle tool's data shape has changed more than once during
// development. Browsers that persisted an older shape would otherwise crash
// the app the moment a component reads e.g. entry.ingredients on a record
// that never had that field — this normalizes whatever's in localStorage
// into the current SideHustle/BusinessEntry shape, migrating what it can
// recognize from earlier shapes and dropping what it can't.
function toLineItems(v: unknown): BusinessLineItem[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (x): x is BusinessLineItem => !!x && typeof x === "object" && typeof x.label === "string" && typeof x.amount === "number"
  );
}

function sanitizeEntry(raw: any): BusinessEntry {
  let ingredients = toLineItems(raw?.ingredients);
  let supplies = toLineItems(raw?.supplies);
  let profit = toLineItems(raw?.profit);

  // Migrate the "one type per log" shape: { type, items, savePct }.
  if (ingredients.length === 0 && supplies.length === 0 && profit.length === 0 && Array.isArray(raw?.items)) {
    const items = toLineItems(raw.items);
    if (raw.type === "ingredients") ingredients = items;
    else if (raw.type === "supplies") supplies = items;
    else if (raw.type === "profit") profit = items;
  }

  // Migrate the original shape: { costType, costOfGoods, otherExpenses, profit: number, savePct }.
  if (ingredients.length === 0 && supplies.length === 0 && profit.length === 0 && typeof raw?.costOfGoods === "number") {
    const costLine: BusinessLineItem[] = [{ label: raw.costType === "supplies" ? "Supplies" : "Ingredients", amount: raw.costOfGoods }];
    const other = toLineItems(raw?.otherExpenses);
    if (raw.costType === "supplies") supplies = [...costLine, ...other];
    else ingredients = [...costLine, ...other];
    if (typeof raw.profit === "number" && raw.profit !== 0) profit = [{ label: "Profit", amount: raw.profit }];
  }

  return {
    id: typeof raw?.id === "string" ? raw.id : crypto.randomUUID(),
    createdAt: typeof raw?.createdAt === "number" ? raw.createdAt : Date.now(),
    ingredients, supplies, profit,
    savePct: typeof raw?.savePct === "number" ? raw.savePct : 0,
    edited: typeof raw?.edited === "boolean" ? raw.edited : false,
  };
}

function sanitizeSideHustles(raw: unknown): SideHustle[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((h: any) => ({
    id: typeof h?.id === "string" ? h.id : crypto.randomUUID(),
    name: typeof h?.name === "string" ? h.name : "",
    description: typeof h?.description === "string" ? h.description : "",
    registered: !!h?.registered,
    industry: (INDUSTRIES as readonly string[]).includes(h?.industry) ? h.industry : "Other",
    createdAt: typeof h?.createdAt === "number" ? h.createdAt : Date.now(),
    entries: Array.isArray(h?.entries) ? h.entries.map(sanitizeEntry) : [],
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [verified, setVerified] = useState(false);
  const [plan, setPlan] = useState<Plan>("basic");
  const [approvalPin, setApprovalPinState] = useState<string | null>(null);
  const [appPin, setAppPin] = useState<string | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [chatBubbleOn, setChatBubbleOn] = useState(true);
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
  const [pendingForcedSend, setPendingForcedSend] = useState(0);
  const [heldBalance, setHeldBalance] = useState<HeldBalance | null>(null);
  const [deletedMessageIds, setDeletedMessageIds] = useState<string[]>([]);
  const [readMessageIds, setReadMessageIds] = useState<string[]>([]);
  const [lastAlertsSeenAt, setLastAlertsSeenAt] = useState(0);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sideHustles, setSideHustles] = useState<SideHustle[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

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
      if (initial.lastName !== undefined) setLastName(initial.lastName);
      if (initial.email !== undefined) setEmail(initial.email);
      if (initial.incomeSource !== undefined) setIncomeSource(initial.incomeSource);
      if (initial.verified !== undefined) setVerified(initial.verified);
      if (initial.plan !== undefined) setPlan(initial.plan);
      if (initial.approvalPin !== undefined) setApprovalPinState(initial.approvalPin);
      if (initial.appPin !== undefined) setAppPin(initial.appPin);
      if (initial.theme !== undefined) setThemeState(initial.theme);
      if (initial.chatBubbleOn !== undefined) setChatBubbleOn(initial.chatBubbleOn);
      if (initial.transactions !== undefined) setTransactions(initial.transactions);
      if (initial.beneficiaries !== undefined) setBeneficiaries(initial.beneficiaries);
      if (initial.freeTransactionsLeft !== undefined) setFreeTransactionsLeft(initial.freeTransactionsLeft);
      if (initial.freeTxPeriod !== undefined) setFreeTxPeriod(initial.freeTxPeriod);
      if (initial.lastPaidPeriod !== undefined) setLastPaidPeriod(initial.lastPaidPeriod);
      if (initial.pendingPlan !== undefined) setPendingPlan(initial.pendingPlan);
      if (initial.pendingAmountPaid !== undefined) setPendingAmountPaid(initial.pendingAmountPaid);
      if (initial.pendingForcedSend !== undefined) setPendingForcedSend(initial.pendingForcedSend);
      if (initial.heldBalance !== undefined) setHeldBalance(initial.heldBalance);
      if (initial.deletedMessageIds !== undefined) setDeletedMessageIds(initial.deletedMessageIds);
      if (initial.readMessageIds !== undefined) setReadMessageIds(initial.readMessageIds);
      if (initial.lastAlertsSeenAt !== undefined) setLastAlertsSeenAt(initial.lastAlertsSeenAt);
      if (initial.isNewSignup !== undefined) setIsNewSignup(initial.isNewSignup);
      if (initial.goals !== undefined) setGoals(initial.goals);
      if (initial.sideHustles !== undefined) setSideHustles(sanitizeSideHustles(initial.sideHustles));
      if (initial.challenge !== undefined) setChallenge(initial.challenge);
    }
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const data: Persisted = {
        onboarded, signedIn, phone, firstName, lastName, email, incomeSource, verified, plan,
        approvalPin, appPin, theme, chatBubbleOn, transactions, beneficiaries,
        freeTransactionsLeft, freeTxPeriod, lastPaidPeriod, pendingPlan, pendingAmountPaid,
        pendingForcedSend, heldBalance,
        deletedMessageIds, readMessageIds, lastAlertsSeenAt, isNewSignup,
        goals, sideHustles, challenge,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [hydrated, onboarded, signedIn, phone, firstName, lastName, email, incomeSource, verified, plan, approvalPin, appPin, theme, chatBubbleOn, transactions, beneficiaries, freeTransactionsLeft, freeTxPeriod, lastPaidPeriod, pendingPlan, pendingAmountPaid, pendingForcedSend, heldBalance, deletedMessageIds, readMessageIds, lastAlertsSeenAt, isNewSignup, goals, sideHustles, challenge]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [pinAttemptsLeft, setPinAttemptsLeft] = useState(3);
  const [pinLocked, setPinLocked] = useState(false);

  const signIn = useCallback((p: string, name?: string) => {
    setPhone(p);
    if (name !== undefined) setFirstName(name.trim());
    setSignedIn(true);
    setPinAttemptsLeft(3);
    setPinLocked(false);
    setIsNewSignup(false);
  }, []);
  const signUp = useCallback(({ phone: p, firstName: name, lastName: surname, pin, email: e, incomeSource: src }: {
    phone: string; firstName: string; lastName: string; pin: string; email: string; incomeSource: string;
  }) => {
    // Always start a new signup on the Basic tier, unverified, with a fresh approval PIN flow.
    setPhone(p);
    setFirstName(name.trim());
    setLastName(surname.trim());
    setEmail(e.trim());
    setIncomeSource(src);
    setSignedIn(true);
    setPlan("basic");
    setVerified(false);
    setApprovalPinState(null);
    setAppPin(pin);
    setPinAttemptsLeft(3);
    setPinLocked(false);
    setTransactions([]);
    setFreeTransactionsLeft(2);
    setFreeTxPeriod(null);
    setLastPaidPeriod(null);
    setPendingPlan(null);
    setPendingAmountPaid(0);
    setPendingForcedSend(0);
    setHeldBalance(null);
    // Demo convenience: every signup gets the messages fresh again, deleted
    // or read ones included. To be reduced to a one-time reset before the
    // app ships.
    setDeletedMessageIds([]);
    setReadMessageIds([]);
    setLastAlertsSeenAt(0);
    setIsNewSignup(true);
    setGoals([]);
    setSideHustles([]);
    setChallenge(null);
  }, []);
  const signOut = useCallback(() => {
    // Signing out returns the user to onboarding for the demo.
    setSignedIn(false);
    setOnboarded(false);
  }, []);
const addTransaction = useCallback((t: Transaction) => {
  const enriched: Transaction = { ...t, createdAt: t.createdAt ?? Date.now() };
  setTransactions((prev) => [enriched, ...prev]);
  // Sends (not voucher loads) count against the two free transactions every
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
    // Every successful send counts as a day's deposit toward an active
    // savings challenge — strike whichever day-slot "now" falls in, if it
    // hasn't been struck already.
    setChallenge((prev) => {
      if (!prev) return prev;
      const dayIndex = Math.floor((Date.now() - prev.startedAt) / (24 * 60 * 60 * 1000));
      if (dayIndex < 0 || dayIndex >= prev.days || prev.struck[dayIndex]) return prev;
      const struck = [...prev.struck];
      struck[dayIndex] = true;
      return { ...prev, struck };
    });
  }
}, []);
  const setApprovalPin = useCallback((p: string | null) => {
    setApprovalPinState(p);
    setPinAttemptsLeft(3);
    setPinLocked(false);
  }, []);
  const setTheme = useCallback((t: "light" | "dark") => setThemeState(t), []);
  const setVerifiedWithPlan = useCallback((v: boolean) => { setVerified(v); if (v) setPlan("pro"); }, []);
  // Marks the once-off DHA selfie check done without granting the Pro plan
  // itself — the subscribe flow runs this before payment, and payment
  // (applyVoucherTowardSubscription) is what actually activates the plan.
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

  // A leftover too small to send alone (below MIN_SEND) combines with any
  // top-up here rather than landing in the spendable wallet balance —
  // Alula Pay never just holds spare money once it's big enough to move.
  // Once the combined total clears MIN_SEND it becomes a forced send.
  const topUpHeldBalance = useCallback((amount: number) => {
    let forced = false;
    let combined = 0;
    // setPendingForcedSend must stay outside this updater — React may invoke
    // a functional setState updater more than once (e.g. Strict Mode), and
    // calling another setState from inside it would double-apply the amount
    // every extra invocation. Read the outcome here, act on it below instead.
    setHeldBalance((prev) => {
      combined = +((prev?.amount ?? 0) + amount).toFixed(2);
      if (combined >= MIN_SEND) {
        forced = true;
        return null;
      }
      return { amount: combined, startedAt: prev?.startedAt ?? Date.now() };
    });
    if (forced) setPendingForcedSend((p) => +(p + combined).toFixed(2));
    return { forced, combined };
  }, []);

  const clearPendingForcedSend = useCallback(() => setPendingForcedSend(0), []);

  // Applies a loaded voucher's value toward the outstanding subscription
  // fee — never more than what's actually still owed. Vouchers used here
  // are earmarked for the subscription; only the portion applied shows as
  // a subscription-payment transaction. Partial payments persist (added to
  // pendingAmountPaid) so the user always continues where they left off
  // rather than losing progress. Any leftover from an overpaid voucher
  // (only possible once the subscription is fully paid) is never added to
  // the spendable wallet balance — it's routed straight into a forced send
  // (pendingForcedSend) if it clears MIN_SEND on its own, or held
  // (topUpHeldBalance) until a later top-up gets it there.
  const applyVoucherTowardSubscription = useCallback((voucherAmount: number, voucherLabel: string) => {
    const target = pendingPlan ? MONTHLY_FEE[pendingPlan] : 0;
    const stillOwed = Math.max(0, +(target - pendingAmountPaid).toFixed(2));
    const applied = Math.min(voucherAmount, stillOwed);
    const leftover = +(voucherAmount - applied).toFixed(2);
    const newPaid = +(pendingAmountPaid + applied).toFixed(2);

    setTransactions((prev) => [{
      id: crypto.randomUUID(),
      type: "load",
      amount: applied,
      label: `${voucherLabel} — Subscription payment`,
      status: "Completed",
      createdAt: Date.now(),
    }, ...prev]);

    const fullyPaid = !!pendingPlan && newPaid >= target;
    if (fullyPaid) {
      setPlan(pendingPlan!);
      if (pendingPlan === "pro") setVerified(true);
      setLastPaidPeriod(getBillingPeriod());
      setPendingAmountPaid(0);
      setPendingPlan(null);
      if (leftover > 0) {
        if (leftover >= MIN_SEND) setPendingForcedSend((p) => +(p + leftover).toFixed(2));
        else topUpHeldBalance(leftover);
      }
      return { fullyPaid: true, outstanding: 0, leftover };
    }
    setPendingAmountPaid(newPaid);
    return { fullyPaid: false, outstanding: +(target - newPaid).toFixed(2), leftover: 0 };
  }, [pendingPlan, pendingAmountPaid, topUpHeldBalance]);

  const deleteMessage = useCallback((id: string) => {
    setDeletedMessageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const markMessagesRead = useCallback((ids: string[]) => {
    setReadMessageIds((prev) => {
      const toAdd = ids.filter((id) => !prev.includes(id));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }, []);
  const markAlertsSeen = useCallback(() => setLastAlertsSeenAt(Date.now()), []);

  // Hustle tool ---------------------------------------------------------
  const addGoal = useCallback((g: Omit<Goal, "id" | "createdAt">) => {
    setGoals((prev) => [{ ...g, id: crypto.randomUUID(), createdAt: Date.now() }, ...prev]);
  }, []);
  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addSideHustle = useCallback((h: Omit<SideHustle, "id" | "createdAt" | "entries">) => {
    let created: SideHustle | null = null;
    setSideHustles((prev) => {
      if (prev.length >= 5) return prev;
      created = { ...h, id: crypto.randomUUID(), createdAt: Date.now(), entries: [] };
      return [created, ...prev];
    });
    return created;
  }, []);
  const addBusinessEntry = useCallback((hustleId: string, e: Omit<BusinessEntry, "id" | "createdAt" | "edited">) => {
    const created: BusinessEntry = { ...e, id: crypto.randomUUID(), createdAt: Date.now(), edited: false };
    setSideHustles((prev) => prev.map((h) => (h.id === hustleId ? { ...h, entries: [created, ...h.entries] } : h)));
    return created;
  }, []);
  const updateBusinessEntry = useCallback((hustleId: string, entryId: string, e: Omit<BusinessEntry, "id" | "createdAt" | "edited">) => {
    let success = false;
    setSideHustles((prev) =>
      prev.map((h) => {
        if (h.id !== hustleId) return h;
        return {
          ...h,
          entries: h.entries.map((entry) => {
            if (entry.id !== entryId || entry.edited) return entry;
            success = true;
            return { ...entry, ...e, edited: true };
          }),
        };
      })
    );
    return success;
  }, []);

  const startChallenge = useCallback((days: ChallengeLength) => {
    setChallenge({ days, startedAt: Date.now(), struck: Array(days).fill(false) });
  }, []);
  const endChallenge = useCallback(() => setChallenge(null), []);

  const currentBillingPeriod = getBillingPeriod();
  // freeTransactionsLeft only reflects the current billing period if
  // freeTxPeriod still matches it — otherwise the 2 free transactions have
  // rolled over and are refreshed (the count itself is only written back to
  // state the next time a transfer actually consumes one, in addTransaction).
  const effectiveFreeTransactionsLeft = freeTxPeriod === currentBillingPeriod ? freeTransactionsLeft : 2;
  const subscriptionActive = lastPaidPeriod === currentBillingPeriod;
  const paywallActive = effectiveFreeTransactionsLeft <= 0 && !subscriptionActive;

  // Nothing downstream should ever render on the pre-hydration defaults —
  // a first name that resets to "there", free transactions flashing back to
  // 2 of 2, a plan reverting to Basic, all for the split second before
  // localStorage has actually been read. Hold the whole app on a blank
  // splash until hydration finishes instead of ever showing that data.
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-brand">
        <img src={logo} alt="Alula Pay" className="h-28 w-28 animate-pulse drop-shadow-2xl" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        onboarded, signedIn, phone, firstName, lastName, email, incomeSource, verified, plan, approvalPin, appPin, theme, chatBubbleOn,
        transactions, beneficiaries,
        setOnboarded, signIn, signUp, signOut, addTransaction,
        setVerified: setVerifiedWithPlan,
        verifyIdentity,
        setApprovalPin, setTheme, setChatBubbleOn, addBeneficiary,
        pinAttemptsLeft, pinLocked, registerPinAttempt, resetPinLock,
        freeTransactionsLeft: effectiveFreeTransactionsLeft, subscriptionActive, paywallActive,
        pendingPlan, pendingAmountPaid, choosePendingPlan, applyVoucherTowardSubscription,
        pendingForcedSend, clearPendingForcedSend, heldBalance, topUpHeldBalance,
        deletedMessageIds, readMessageIds, deleteMessage, markMessagesRead,
        lastAlertsSeenAt, markAlertsSeen,
        isNewSignup,
        goals, addGoal, deleteGoal,
        sideHustles, addSideHustle, addBusinessEntry, updateBusinessEntry,
        challenge, startChallenge, endChallenge,
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

// Transactions are never deleted — this is only how far back History and
// Notifications' Transactions tab look by default.
export function threeMonthsAgo(): number {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return d.getTime();
}

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

// A held balance (see HeldBalance) expires 90 days after the transaction
// that created it, and the client is reminded to top it up every 2 days
// until then.
export const HELD_BALANCE_EXPIRY_DAYS = 90;
export const HELD_BALANCE_REMINDER_INTERVAL_DAYS = 2;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const heldBalanceDaysLeft = (h: HeldBalance) =>
  Math.max(0, HELD_BALANCE_EXPIRY_DAYS - Math.floor((Date.now() - h.startedAt) / MS_PER_DAY));

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
