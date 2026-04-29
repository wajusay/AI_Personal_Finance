import type { Prisma, Transaction } from "@prisma/client";

export type RecurringGroup = {
  key: string;
  merchant: string;
  category: string;
  count: number;
  avgAmount: number;
  stdAmount: number;
  cadenceDays: number; // median delta
  kind: "subscription" | "bill";
  lastDate: Date;
  nextDueDate: Date;
};

function median(nums: number[]) {
  if (nums.length === 0) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function mean(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function std(nums: number[]) {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const v = mean(nums.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

function addDaysUTC(d: Date, days: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
}

export function detectRecurringGroups(transactions: Array<Transaction & { amount: Prisma.Decimal }>) {
  // Expenses only are the typical recurring "bills/subscriptions".
  const expenses = transactions.filter((t) => t.type === "EXPENSE");
  const groups = new Map<string, typeof expenses>();

  for (const t of expenses) {
    const key = `${t.merchant.trim().toLowerCase()}|${t.category.trim().toLowerCase()}`;
    const existing = groups.get(key) ?? [];
    existing.push(t);
    groups.set(key, existing);
  }

  const results: RecurringGroup[] = [];

  for (const [key, txs] of groups.entries()) {
    if (txs.length < 3) continue;
    const ordered = [...txs].sort((a, b) => a.date.getTime() - b.date.getTime());
    const deltas: number[] = [];
    for (let i = 1; i < ordered.length; i++) {
      const diffDays = (ordered[i].date.getTime() - ordered[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      deltas.push(diffDays);
    }
    const cadence = Math.round(median(deltas));

    // Monthly-ish or weekly-ish only for now.
    const isMonthly = cadence >= 25 && cadence <= 35;
    const isWeekly = cadence >= 6 && cadence <= 8;
    if (!isMonthly && !isWeekly) continue;

    const amounts = ordered.map((t) => Number(t.amount));
    const avg = mean(amounts);
    const s = std(amounts);
    const cv = avg === 0 ? 1 : s / avg;

    const kind: RecurringGroup["kind"] = cv <= 0.12 ? "subscription" : "bill";
    const last = ordered[ordered.length - 1].date;
    const nextDue = addDaysUTC(last, cadence);

    const [merchant, category] = key.split("|");
    results.push({
      key,
      merchant,
      category,
      count: ordered.length,
      avgAmount: Math.round(avg * 100) / 100,
      stdAmount: Math.round(s * 100) / 100,
      cadenceDays: cadence,
      kind,
      lastDate: last,
      nextDueDate: nextDue,
    });
  }

  // Most confident first: more samples + lower variance.
  results.sort((a, b) => b.count - a.count || a.stdAmount - b.stdAmount);
  return results;
}

