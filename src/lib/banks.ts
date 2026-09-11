import capitecLogo from "@/assets/banks/capitec.png";
import fnbLogo from "@/assets/banks/fnb.png";
import nedbankLogo from "@/assets/banks/nedbank.jpg";
import gotymeLogo from "@/assets/banks/tymebank.jpg";
import discoveryLogo from "@/assets/banks/discovery.jpg";
import africanBankLogo from "@/assets/banks/african-bank.jpg";
import bankZeroLogo from "@/assets/banks/bank-zero.jpg";
import absaLogo from "@/assets/banks/absa.png";
import standardBankLogo from "@/assets/banks/standard-bank.jpg";
import investecLogo from "@/assets/banks/investec.jpg";
import bidvestLogo from "@/assets/banks/bidvest.png";

export type Bank = {
  name: string;
  branch: string;
  // Real brand logo, shown in the bank chooser carousel when available.
  logo?: string;
  // Fallback tile color for banks without a logo asset — keeps every tile
  // in the carousel the same size and style either way.
  color: string;
  // Account numbers aren't free-form — each bank issues them at a fixed
  // length, so the account number field must accept exactly this many
  // digits, no more and no less (typical published length per bank).
  accountLength: number;
};

export const SA_BANKS: Bank[] = [
  { name: "Capitec Bank", branch: "470010", logo: capitecLogo, color: "bg-blue-600", accountLength: 10 },
  { name: "Absa Bank", branch: "632005", logo: absaLogo, color: "bg-red-600", accountLength: 11 },
  { name: "Standard Bank", branch: "051001", logo: standardBankLogo, color: "bg-blue-700", accountLength: 10 },
  { name: "FNB / RMB", branch: "250655", logo: fnbLogo, color: "bg-emerald-700", accountLength: 11 },
  { name: "Nedbank", branch: "198765", logo: nedbankLogo, color: "bg-teal-600", accountLength: 10 },
  { name: "GoTyme", branch: "678910", logo: gotymeLogo, color: "bg-cyan-600", accountLength: 10 },
  { name: "Discovery Bank", branch: "679000", logo: discoveryLogo, color: "bg-yellow-500", accountLength: 11 },
  { name: "African Bank", branch: "430000", logo: africanBankLogo, color: "bg-orange-600", accountLength: 9 },
  { name: "Investec", branch: "580105", logo: investecLogo, color: "bg-slate-800", accountLength: 8 },
  { name: "Bidvest Bank", branch: "462005", logo: bidvestLogo, color: "bg-indigo-900", accountLength: 9 },
  { name: "Bank Zero", branch: "888000", logo: bankZeroLogo, color: "bg-neutral-800", accountLength: 11 },
];
