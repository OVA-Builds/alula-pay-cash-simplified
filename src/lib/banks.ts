import nedbankLogo from "@/assets/banks/nedbank.png";
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
  { name: "Capitec Bank", branch: "470010", color: "bg-blue-600" },
  { name: "Absa Bank", branch: "632005", logo: absaLogo, color: "bg-red-600" },
  { name: "Standard Bank", branch: "051001", logo: standardBankLogo, color: "bg-blue-700" },
  { name: "FNB / RMB", branch: "250655", color: "bg-emerald-700" },
  { name: "Nedbank", branch: "198765", logo: nedbankLogo, color: "bg-teal-600" },
  { name: "TymeBank", branch: "678910", color: "bg-cyan-600" },
  { name: "Discovery Bank", branch: "679000", color: "bg-yellow-500" },
  { name: "African Bank", branch: "430000", color: "bg-orange-600" },
  { name: "Investec", branch: "580105", logo: investecLogo, color: "bg-slate-800" },
  { name: "Bidvest Bank", branch: "462005", logo: bidvestLogo, color: "bg-indigo-900" },
  { name: "Bank Zero", branch: "888000", color: "bg-neutral-800" },
  { name: "Sasfin Bank", branch: "683000", color: "bg-purple-700" },
  { name: "Mercantile Bank", branch: "450905", color: "bg-rose-700" },
  { name: "HSBC South Africa", branch: "587000", color: "bg-red-700" },
  { name: "Citibank SA", branch: "350005", color: "bg-blue-800" },
];
