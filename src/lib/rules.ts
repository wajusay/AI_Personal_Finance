import type { CategoryRule, TransactionType } from "@prisma/client";

export function applyCategoryRules(input: {
  merchant: string;
  description: string;
  type: TransactionType;
  rules: CategoryRule[];
}): { category: string; ruleId: string } | null {
  const haystack = `${input.merchant} ${input.description}`.toLowerCase();
  const rules = [...input.rules].sort((a, b) => b.priority - a.priority);

  for (const r of rules) {
    if (r.transactionType && r.transactionType !== input.type) continue;
    const needle = r.matchText.trim().toLowerCase();
    if (!needle) continue;
    if (haystack.includes(needle)) return { category: r.category, ruleId: r.id };
  }

  return null;
}

