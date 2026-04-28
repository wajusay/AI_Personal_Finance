"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TransactionType } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";

const transactionInputSchema = z.object({
  date: z.string().min(1),
  merchant: z.string().trim().min(1),
  description: z.string().trim().min(1),
  amount: z.coerce.number().finite(),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  category: z.string().trim().min(1),
  accountName: z.string().trim().min(1),
  notes: z.string().trim().optional(),
});

function parseDate(dateStr: string) {
  // From <input type="date">: YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

export async function createTransaction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = transactionInputSchema.safeParse(raw);
  if (!parsed.success) {
    redirect("/transactions/new?error=invalid");
  }

  const date = parseDate(parsed.data.date);
  if (!date) redirect("/transactions/new?error=invalid-date");

  await prisma.transaction.create({
    data: {
      date,
      merchant: parsed.data.merchant,
      description: parsed.data.description,
      amount: parsed.data.amount,
      type: parsed.data.type,
      category: parsed.data.category,
      accountName: parsed.data.accountName,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function updateTransaction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = transactionInputSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/transactions/${id}/edit?error=invalid`);
  }

  const date = parseDate(parsed.data.date);
  if (!date) redirect(`/transactions/${id}/edit?error=invalid-date`);

  await prisma.transaction.update({
    where: { id },
    data: {
      date,
      merchant: parsed.data.merchant,
      description: parsed.data.description,
      amount: parsed.data.amount,
      type: parsed.data.type,
      category: parsed.data.category,
      accountName: parsed.data.accountName,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  redirect("/transactions");
}

