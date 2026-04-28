import { NextResponse } from "next/server";
import { CategorizationSource, TransactionType } from "@prisma/client";
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
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const m1 = iso.exec(v);
  if (m1) return new Date(Date.UTC(Number(m1[1]), Number(m1[2]) - 1, Number(m1[3])));
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m2 = us.exec(v);
  if (m2) return new Date(Date.UTC(Number(m2[3]), Number(m2[1]) - 1, Number(m2[2])));
  return null;
}

function parseAmount(value: string) {
  const raw = value.trim();
  if (!raw) return null;
  const neg = raw.includes("(") && raw.includes(")");
  const cleaned = raw.replace(/[,$()]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return neg ? -Math.abs(n) : n;
}

function txHash(input: {
  date: Date;
  merchant: string;
  description: string;
  accountName: string;
  type: TransactionType;
  amount: number;
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
    if (!merchant || !description || !accountName) {
      errors.push({ rowIndex: i, message: "Missing required fields" });
      continue;
    }
    const signedAmount = parseAmount(amountStr);
    if (signedAmount === null) {
      errors.push({ rowIndex: i, message: `Invalid amount: "${amountStr}"` });
      continue;
    }

    const type: TransactionType = signedAmount < 0 ? "EXPENSE" : "INCOME";
    const amount = Math.abs(signedAmount);
    const matched = applyCategoryRules({ merchant, description, type, rules });

    normalized.push({
      date,
      merchant,
      description,
      accountName,
      type,
      amount,
      category: matched?.category ?? "Needs Review",
      needsReview: !matched,
      confidenceScore: matched ? 0.9 : 0.2,
      categorizationSource: matched ? CategorizationSource.RULE : CategorizationSource.IMPORT,
    });
  }

  const minDate = normalized.length
    ? new Date(Math.min(...normalized.map((n) => n.date.getTime())))
    : null;
  const maxDate = normalized.length
    ? new Date(Math.max(...normalized.map((n) => n.date.getTime())))
    : null;

  const existing = minDate && maxDate
    ? await prisma.transaction.findMany({
        where: { date: { gte: minDate, lte: maxDate } },
        select: { date: true, merchant: true, description: true, accountName: true, type: true, amount: true },
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

  const toCreate = normalized.filter((n) => {
    const hash = txHash(n);
    return !existingHashes.has(hash);
  });

  const created = await prisma.$transaction(
    toCreate.map((t) =>
      prisma.transaction.create({
        data: {
          date: t.date,
          merchant: t.merchant,
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
          needsReview: t.needsReview,
          confidenceScore: t.confidenceScore,
          categorizationSource: t.categorizationSource,
          reviewedAt: null,
          accountName: t.accountName,
        },
      }),
    ),
  );

  return NextResponse.json({
    summary: {
      parsed: rows.length,
      valid: normalized.length,
      invalid: errors.length,
      created: created.length,
      skippedDuplicates: normalized.length - created.length,
    },
    errors,
  });
}

