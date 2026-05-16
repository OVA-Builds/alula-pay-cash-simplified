import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type Transaction = {
  id: string;
  type: "redeem" | "transfer";
  amount: number;
  label: string;
  status: "Completed" | "Pending";
  date: string;
};

type Ctx = {
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

const AppContext = createContext<Ctx | null>(null);

const sample: Transaction[] = [
  { id: "t1", type: "redeem", amount: 200, label: "Voucher redeemed", status: "Completed", date: "Today, 10:24" },
  { id: "t2", type: "transfer", amount: -150, label: "Sent to Capitec ••4421", status: "Completed", date: "Yesterday, 18:02" },
  { id: "t3", type: "redeem", amount: 500, label: "Voucher redeemed", status: "Completed", date: "12 May" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState(550);
  const [verified, setVerified] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(sample);

  const signIn = useCallback((p: string) => {
    setPhone(p);
    setSignedIn(true);
  }, []);
  const addTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => [t, ...prev]);
  }, []);
  const adjustBalance = useCallback((delta: number) => {
    setBalance((b) => Math.max(0, b + delta));
  }, []);

  return (
    <AppContext.Provider
      value={{
        onboarded, signedIn, phone, balance, verified, transactions,
        setOnboarded, signIn, addTransaction, adjustBalance, setVerified,
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

export const formatZAR = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(n);
