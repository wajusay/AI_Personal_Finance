import type { Prisma, Transaction } from "@prisma/client";

export type Anomaly =
  | {
      kind: "high_charge";
      transactionId: string;
      explanation: string;
      suggestedAction: string;
    }
  | {
      kind: "duplicate_charge";
      transactionId: string;
      explanation: string;
      suggestedAction: string;
    }
  | {
      kind: "subscription_increased";
      transactionId: string;
      explanation: string;
      suggestedAction: string;
    }
  | {
      kind: "utilities_spike";
      transactionId: string;
      explanation: string;
      suggestedAction: string;
    };

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

function daysBetween(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

export function detectAnomalies(transactions: Array<Transaction & { amount: Prisma.Decimal }>) {
  const txs = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  const anomalies: Anomaly[] = [];

  // Duplicate charges: same merchant + amount within 2 days.
  const byMerchantAmount = new Map<string, Array<typeof txs[number]>>();
  for (const t of txs) {
    const key = `${norm(t.merchant)}|${Number(t.amount).toFixed(2)}|${t.type}`;
    const list = byMerchantAmount.get(key) ?? [];
    list.push(t);
    byMerchantAmount.set(key, list);
  }
  for (const list of byMerchantAmount.values()) {
    if (list.length < 2) continue;
    const ordered = [...list].sort((a, b) => a.date.getTime() - b.date.getTime());
    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const cur = ordered[i];
      if (daysBetween(prev.date, cur.date) <= 2) {
        anomalies.push({
          kind: "duplicate_charge",
          transactionId: cur.id,
          explanation: `Possible duplicate: same merchant and amount as a nearby transaction (${prev.id}).`,
          suggestedAction: "Confirm whether this is a duplicate and delete or keep both as needed.",
        });
      }
    }
  }

  // High charges: compare current to historical mean+2*std for merchant+category (last 6 months).
  const byKey = new Map<string, Array<typeof txs[number]>>();
  for (const t of txs) {
    const key = `${norm(t.merchant)}|${norm(t.category)}|${t.type}`;
    const list = byKey.get(key) ?? [];
    list.push(t);
    byKey.set(key, list);
  }

  for (const [key, list] of byKey.entries()) {
    if (list.length < 6) continue;
    const ordered = [...list].sort((a, b) => b.date.getTime() - a.date.getTime());
    const cur = ordered[0];
    const history = ordered.slice(1, 13); // up to 12 prior
    if (history.length < 5) continue;

    const amounts = history.map((t) => Number(t.amount));
    const m = mean(amounts);
    const s = std(amounts);
    const curAmt = Number(cur.amount);
    if (s === 0) {
      if (curAmt > m * 1.75 && curAmt >= 50) {
        anomalies.push({
          kind: "high_charge",
          transactionId: cur.id,
          explanation: `Unusually high vs your typical ${key.split("|")[0]} charges.`,
          suggestedAction: "Review the transaction details and confirm it is expected.",
        });
      }
    } else {
      if (curAmt > m + 2 * s && curAmt >= 50) {
        anomalies.push({
          kind: "high_charge",
          transactionId: cur.id,
          explanation: `Unusually high: ${curAmt.toFixed(2)} vs average ${(m).toFixed(2)}.`,
          suggestedAction: "Review the charge and confirm it matches receipts/statements.",
        });
      }
    }
  }

  // Subscription increased: for recurring-like merchants (monthly-ish) compare last to prior avg.
  // Simple heuristic: at least 3 charges in last 120 days and low variance.
  for (const [key, list] of byKey.entries()) {
    if (!key.endsWith("|EXPENSE")) continue;
    const ordered = [...list].sort((a, b) => b.date.getTime() - a.date.getTime());
    const recent = ordered.filter((t) => daysBetween(t.date, ordered[0].date) <= 180);
    if (recent.length < 4) continue;
    const cur = recent[0];
    const history = recent.slice(1, 6);
    if (history.length < 3) continue;
    const amounts = history.map((t) => Number(t.amount));
    const m = mean(amounts);
    const s = std(amounts);
    const cv = m === 0 ? 1 : s / m;
    if (cv > 0.15) continue;
    const curAmt = Number(cur.amount);
    if (curAmt > m * 1.2 && curAmt >= 10) {
      anomalies.push({
        kind: "subscription_increased",
        transactionId: cur.id,
        explanation: `Subscription likely increased: ${curAmt.toFixed(2)} vs usual ${m.toFixed(2)}.`,
        suggestedAction: "Confirm the plan/price change and update your budget or cancel if unexpected.",
      });
    }
  }

  // Utilities spike: categories that look like utilities or merchants containing keywords.
  const utilityKeys = Array.from(byKey.entries()).filter(([k]) => {
    const [m, c] = k.split("|");
    return (
      c.includes("utilit") ||
      c.includes("internet") ||
      c.includes("phone") ||
      m.includes("electric") ||
      m.includes("water") ||
      m.includes("gas") ||
      m.includes("utility") ||
      m.includes("internet")
    );
  });

  for (const [, list] of utilityKeys) {
    const ordered = [...list].sort((a, b) => b.date.getTime() - a.date.getTime());
    if (ordered.length < 4) continue;
    const cur = ordered[0];
    const history = ordered.slice(1, 13);
    if (history.length < 3) continue;
    const amounts = history.map((t) => Number(t.amount));
    const m = mean(amounts);
    const s = std(amounts);
    const curAmt = Number(cur.amount);
    if (curAmt > m + 2.5 * s && curAmt >= 50) {
      anomalies.push({
        kind: "utilities_spike",
        transactionId: cur.id,
        explanation: `Utilities spike: ${curAmt.toFixed(2)} vs average ${m.toFixed(2)}.`,
        suggestedAction: "Review for billing issues or unusual usage. Review with tax advisor if applicable.",
      });
    }
  }

  return anomalies;
}

