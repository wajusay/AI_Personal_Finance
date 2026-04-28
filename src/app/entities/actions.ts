"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EntityType } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(1),
  type: z.enum([
    EntityType.PERSONAL,
    EntityType.LLC,
    EntityType.TRUST,
    EntityType.FOUNDATION,
    EntityType.BUSINESS,
    EntityType.PROPERTY,
  ]),
  notes: z.string().trim().optional(),
});

export async function createEntity(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) redirect("/entities?error=invalid");

  await prisma.entity.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/entities");
  redirect("/entities");
}

export async function deleteEntity(id: string) {
  await prisma.entity.delete({ where: { id } });
  revalidatePath("/entities");
}

export async function updateEntity(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) redirect(`/entities/${id}/edit?error=invalid`);

  await prisma.entity.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/entities");
  redirect("/entities");
}

