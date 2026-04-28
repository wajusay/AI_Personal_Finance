import { NextResponse } from "next/server";
import { CategorizationSource, StatementParsingStatus, StatementVerificationStatus, TransactionType } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { computeBalanceDifference } from "@/lib/statement-parse";

const txSchema = z.object({
  date: z.string().min(10),
  description: z.string().trim().min(1),
  amount: z.coerce.number().finite(),
});

const schema = z.object({
  institutionName: z.string().trim().min(1),
  accountName: z.string().trim().min(1),
  statementStartDate: z.string().min(10),
  statementEndDate: z.string().min(10),
  openingBalance: z.coerce.number().finite(),
  closingBalance: z.coerce.number().finite(),
  uploadedFileName: z.string().min(1),
  override: z.boolean().optional(),
  transactions: z.array(txSchema).min(1).max(5000),
});

function parseIsoDateToUtcDate(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const start = parseIsoDateToUtcDate(parsed.data.statementStartDate);
  const end = parseIsoDateToUtcDate(parsed.data.statementEndDate);
  if (!start || !end) {
    return NextResponse.json({ error: "Invalid statement dates" }, { status: 400 });
  }

  const diff = computeBalanceDifference({
    openingBalance: parsed.data.openingBalance,
    closingBalance: parsed.data.closingBalance,
    transactions: parsed.data.transactions,
  });
  if (diff === null) {
    return NextResponse.json({ error: "Missing balance data for verification" }, { status: 400 });
  }

  const balances = Math.abs(diff) <= 0.01;
  const overridden = !!parsed.data.override;
  if (!balances && !overridden) {
    return NextResponse.json(
      { error: "Statement does not balance. Override required to import.", difference: diff },
      { status: 400 },
    );
  }

  const verificationStatus: StatementVerificationStatus = balances
    ? StatementVerificationStatus.PASSED
    : StatementVerificationStatus.OVERRIDDEN;

  const statement = await prisma.statement.create({
    data: {
      institutionName: parsed.data.institutionName,
      accountName: parsed.data.accountName,
      statementStartDate: start,
      statementEndDate: end,
      openingBalance: parsed.data.openingBalance,
      closingBalance: parsed.data.closingBalance,
      uploadedFileName: parsed.data.uploadedFileName,
      parsingStatus: StatementParsingStatus.PARSED,
      verificationStatus,
      verificationDifference: diff,
    },
  });

  // Import extracted transactions into ledger
  // Deterministic default: Needs Review (user can refine with rules/AI later).
  const created = await prisma.$transaction(
    parsed.data.transactions.map((t) => {
      const d = parseIsoDateToUtcDate(t.date);
      if (!d) throw new Error("Invalid transaction date");
      const type: TransactionType = t.amount < 0 ? "EXPENSE" : "INCOME";
      const amount = Math.abs(t.amount);
      return prisma.transaction.create({
        data: {
          date: d,
          merchant: parsed.data.institutionName,
          description: t.description,
          amount,
          type,
          category: "Needs Review",
          needsReview: true,
          confidenceScore: 0.2,
          categorizationSource: CategorizationSource.IMPORT,
          reviewedAt: null,
          accountName: parsed.data.accountName,
          notes: `Statement ${statement.id}`,
        },
      });
    }),
  );

  return NextResponse.json({
    statementId: statement.id,
    imported: created.length,
    verificationStatus,
    difference: diff,
  });
}

