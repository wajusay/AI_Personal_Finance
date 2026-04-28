"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CategorizationSource } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";

const correctSchema = z.object({
  category: z.string().trim().min(1),
  applyRule: z.enum(["on"]).optional(),
});

export async function approveTransaction(id: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) redirect("/review");

  await prisma.transaction.update({
    where: { id },
    data: {
      needsReview: false,
      reviewedAt: new Date(),
      confidenceScore: 1,
      categorizationSource: CategorizationSource.MANUAL,
    },
  });

  revalidatePath("/review");
  revalidatePath("/transactions");
  revalidatePath("/");
}

export async function correctTransaction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = correctSchema.safeParse(raw);
  if (!parsed.success) redirect(`/review?error=invalid`);

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) redirect("/review");

  const category = parsed.data.category;
  const applyRule = parsed.data.applyRule === "on";

  await prisma.$transaction(async (p) => {
    await p.transaction.update({
      where: { id },
      data: {
        category,
        needsReview: category.trim().toLowerCase() === "needs review",
        reviewedAt: new Date(),
        confidenceScore: 1,
        categorizationSource: CategorizationSource.MANUAL,
      },
    });

    if (applyRule) {
      await p.categoryRule.create({
        data: {
          matchText: tx.merchant,
          category,
          transactionType: tx.type,
          priority: 100,
        },
      });
    }
  });

  revalidatePath("/review");
  revalidatePath("/rules");
  revalidatePath("/transactions");
  revalidatePath("/");
}

