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
};

export const SA_BANKS: Bank[] = [
  { name: "Capitec Bank", branch: "470010", logo: capitecLogo, color: "bg-blue-600" },
  { name: "Absa Bank", branch: "632005", logo: absaLogo, color: "bg-red-600" },
  { name: "Standard Bank", branch: "051001", logo: standardBankLogo, color: "bg-blue-700" },
  { name: "FNB / RMB", branch: "250655", logo: fnbLogo, color: "bg-emerald-700" },
  { name: "Nedbank", branch: "198765", logo: nedbankLogo, color: "bg-teal-600" },
  { name: "GoTyme", branch: "678910", logo: gotymeLogo, color: "bg-cyan-600" },
  { name: "Discovery Bank", branch: "679000", logo: discoveryLogo, color: "bg-yellow-500" },
  { name: "African Bank", branch: "430000", logo: africanBankLogo, color: "bg-orange-600" },
  { name: "Investec", branch: "580105", logo: investecLogo, color: "bg-slate-800" },
  { name: "Bidvest Bank", branch: "462005", logo: bidvestLogo, color: "bg-indigo-900" },
  { name: "Bank Zero", branch: "888000", logo: bankZeroLogo, color: "bg-neutral-800" },
];
