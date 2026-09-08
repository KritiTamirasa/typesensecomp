const SYMBOLS: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };

export function money(amount: number, currency = "USD", digits = 2): string {
  const sym = SYMBOLS[currency] ?? `${currency} `;
  return `${sym}${amount.toFixed(digits)}`;
}

const KM_PER_MILE = 1.60934;

export const milesToKm = (mi: number) => mi * KM_PER_MILE;
export const kmToMiles = (km: number) => km / KM_PER_MILE;
