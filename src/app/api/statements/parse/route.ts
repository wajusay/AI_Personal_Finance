import { NextResponse } from "next/server";
import { z } from "zod";

import { computeBalanceDifference, parseStatementText } from "@/lib/statement-parse";

const schema = z.object({
  uploadedFileName: z.string().min(1),
  text: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const extracted = parseStatementText(parsed.data.text);
  const balanceDifference = computeBalanceDifference({
    openingBalance: extracted.openingBalance,
    closingBalance: extracted.closingBalance,
    transactions: extracted.transactions,
  });

  return NextResponse.json({
    parsed: {
      ...extracted,
      balanceDifference,
    },
  });
}

