import type { TransactionType } from "@prisma/client";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDateShort(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function typeLabel(t: TransactionType) {
  return t === "INCOME" ? "Income" : "Expense";
}

