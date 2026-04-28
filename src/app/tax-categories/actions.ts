"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuditRiskLevel } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(1),
  schedule: z.string().trim().optional(),
  lineItem: z.string().trim().optional(),
  description: z.string().trim().optional(),
  requiresDocumentation: z.enum(["on"]).optional(),
  auditRiskLevel: z.enum([AuditRiskLevel.LOW, AuditRiskLevel.MEDIUM, AuditRiskLevel.HIGH]),
});

export async function createTaxCategory(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) redirect("/tax-categories?error=invalid");

  await prisma.taxCategory.create({
    data: {
      name: parsed.data.name,
      schedule: parsed.data.schedule || null,
      lineItem: parsed.data.lineItem || null,
      description: parsed.data.description || null,
      requiresDocumentation: parsed.data.requiresDocumentation === "on",
      auditRiskLevel: parsed.data.auditRiskLevel,
    },
  });

  revalidatePath("/tax-categories");
  redirect("/tax-categories");
}

export async function deleteTaxCategory(id: string) {
  await prisma.taxCategory.delete({ where: { id } });
  revalidatePath("/tax-categories");
}

export async function updateTaxCategory(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) redirect(`/tax-categories/${id}/edit?error=invalid`);

  await prisma.taxCategory.update({
    where: { id },
    data: {
      name: parsed.data.name,
      schedule: parsed.data.schedule || null,
      lineItem: parsed.data.lineItem || null,
      description: parsed.data.description || null,
      requiresDocumentation: parsed.data.requiresDocumentation === "on",
      auditRiskLevel: parsed.data.auditRiskLevel,
    },
  });

  revalidatePath("/tax-categories");
  redirect("/tax-categories");
}

