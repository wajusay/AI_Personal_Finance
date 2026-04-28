import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { applyCategoryRules } from "@/lib/rules";

const mappingSchema = z.object({
  date: z.string().min(1),
  merchant: z.string().min(1),
  description: z.string().min(1),
  amount: z.string().min(1),
  accountName: z.string().min(1),
});

const requestSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.record(z.string(), z.string().nullable().optional())),
  mapping: mappingSchema,
  limit: z.number().int().min(1).max(10000).optional(),
});

function parseCsvDateToUtcDate(value: string) {
  const v = value.trim();
  // Accept: YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const m1 = iso.exec(v);
  if (m1) {
    const y = Number(m1[1]);
    const m = Number(m1[2]);
    const d = Number(m1[3]);
    return new Date(Date.UTC(y, m - 1, d));
  }

  // Accept: M/D/YYYY or MM/DD/YYYY
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m2 = us.exec(v);
  if (m2) {
    const m = Number(m2[1]);
    const d = Number(m2[2]);
    const y = Number(m2[3]);
    return new Date(Date.UTC(y, m - 1, d));
  }

  return null;
}

function parseAmount(value: string) {
  const raw = value.trim();
  if (!raw) return null;
  const neg = raw.includes("(") && raw.includes(")");
  const cleaned = raw.replace(/[,$()]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  const signed = neg ? -Math.abs(n) : n;
  return signed;
}

function txHash(input: {
  date: Date;
  merchant: string;
  description: string;
  accountName: string;
  type: TransactionType;
  amount: number; // positive amount
}) {
  const dateKey = input.date.toISOString().slice(0, 10);
  const amtKey = input.amount.toFixed(2);
  return [
    dateKey,
    input.type,
    amtKey,
    input.merchant.trim().toLowerCase(),
    input.description.trim().toLowerCase(),
    input.accountName.trim().toLowerCase(),
  ].join("|");
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const limit = parsed.data.limit ?? 5000;
  const rows = parsed.data.rows.slice(0, limit);
  const mapping = parsed.data.mapping;

  const rules = await prisma.categoryRule.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  const normalized = [];
  const errors: Array<{ rowIndex: number; message: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? {};
    const dateStr = String(r[mapping.date] ?? "").trim();
    const merchant = String(r[mapping.merchant] ?? "").trim();
    const description = String(r[mapping.description] ?? "").trim();
    const amountStr = String(r[mapping.amount] ?? "").trim();
    const accountName = String(r[mapping.accountName] ?? "").trim();

    const date = parseCsvDateToUtcDate(dateStr);
    if (!date) {
      errors.push({ rowIndex: i, message: `Invalid date: "${dateStr}"` });
      continue;
    }
    if (!merchant) {
      errors.push({ rowIndex: i, message: "Missing merchant" });
      continue;
    }
    if (!description) {
      errors.push({ rowIndex: i, message: "Missing description" });
      continue;
    }
    const signedAmount = parseAmount(amountStr);
    if (signedAmount === null) {
      errors.push({ rowIndex: i, message: `Invalid amount: "${amountStr}"` });
      continue;
    }
    if (!accountName) {
      errors.push({ rowIndex: i, message: "Missing account name" });
      continue;
    }

    const type: TransactionType = signedAmount < 0 ? "EXPENSE" : "INCOME";
    const amount = Math.abs(signedAmount);
    const matched = applyCategoryRules({ merchant, description, type, rules });
    const category = matched?.category ?? "Needs Review";
    const needsReview = !matched;

    normalized.push({
      rowIndex: i,
      date: date.toISOString(),
      merchant,
      description,
      accountName,
      type,
      amount,
      category,
      needsReview,
      matchedRuleId: matched?.ruleId ?? null,
    });
  }

  const dates = normalized.map((n) => new Date(n.date));
  const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
  const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;

  const existing = minDate && maxDate
    ? await prisma.transaction.findMany({
        where: { date: { gte: minDate, lte: maxDate } },
        select: { date: true, merchant: true, description: true, accountName: true, type: true, amount: true, id: true },
      })
    : [];

  const existingHashes = new Set(
    existing.map((e) =>
      txHash({
        date: e.date,
        merchant: e.merchant,
        description: e.description,
        accountName: e.accountName,
        type: e.type,
        amount: Number(e.amount),
      }),
    ),
  );

  const preview = normalized.map((n) => {
    const hash = txHash({
      date: new Date(n.date),
      merchant: n.merchant,
      description: n.description,
      accountName: n.accountName,
      type: n.type,
      amount: n.amount,
    });
    return { ...n, duplicate: existingHashes.has(hash), hash };
  });

  const summary = {
    parsed: rows.length,
    valid: preview.length,
    invalid: errors.length,
    duplicates: preview.filter((p) => p.duplicate).length,
    toImport: preview.filter((p) => !p.duplicate).length,
    needsReview: preview.filter((p) => p.needsReview && !p.duplicate).length,
  };

  return NextResponse.json({ summary, errors, preview });
}

