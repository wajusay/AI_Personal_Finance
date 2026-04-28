"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TransactionType } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";

const inputSchema = z.object({
  matchText: z.string().trim().min(1),
  category: z.string().trim().min(1),
  transactionType: z.enum(["ALL", TransactionType.INCOME, TransactionType.EXPENSE]).default("ALL"),
  priority: z.coerce.number().int().min(0).max(100000).default(100),
});

export async function createRule(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) redirect("/rules?error=invalid");

  await prisma.categoryRule.create({
    data: {
      matchText: parsed.data.matchText,
      category: parsed.data.category,
      transactionType: parsed.data.transactionType === "ALL" ? null : parsed.data.transactionType,
      priority: parsed.data.priority,
    },
  });

  revalidatePath("/rules");
  redirect("/rules");
}

export async function deleteRule(id: string) {
  await prisma.categoryRule.delete({ where: { id } });
  revalidatePath("/rules");
}

export async function updateRule(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) redirect(`/rules/${id}/edit?error=invalid`);

  await prisma.categoryRule.update({
    where: { id },
    data: {
      matchText: parsed.data.matchText,
      category: parsed.data.category,
      transactionType: parsed.data.transactionType === "ALL" ? null : parsed.data.transactionType,
      priority: parsed.data.priority,
    },
  });

  revalidatePath("/rules");
  redirect("/rules");
}

