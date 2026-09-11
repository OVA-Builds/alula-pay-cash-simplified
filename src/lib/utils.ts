import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fixes an accidental Caps Lock submission ("VLIM NDLOVU") into proper
// title case ("Vlim Ndlovu"). Leaves already mixed-case input alone (e.g.
// "McDonald", "O'Brien") so it never fights an intentional spelling.
export function fixShoutyCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const hasLower = /[a-z]/.test(trimmed);
  const hasUpper = /[A-Z]/.test(trimmed);
  if (hasLower || !hasUpper) return value;
  return trimmed.replace(
    /[A-Za-zÀ-ÖØ-öø-ÿ]+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}
