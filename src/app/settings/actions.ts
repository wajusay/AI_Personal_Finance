"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";

const schema = z.object({
  aiEnabled: z.enum(["on"]).optional(),
  ollamaModel: z.string().trim().min(1),
  aiConfidenceThreshold: z.coerce.number().min(0).max(1),
});

export async function updateSettings(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) redirect("/settings?error=invalid");

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {
      aiEnabled: parsed.data.aiEnabled === "on",
      ollamaModel: parsed.data.ollamaModel,
      aiConfidenceThreshold: parsed.data.aiConfidenceThreshold,
    },
    create: {
      id: "singleton",
      aiEnabled: parsed.data.aiEnabled === "on",
      ollamaModel: parsed.data.ollamaModel,
      aiConfidenceThreshold: parsed.data.aiConfidenceThreshold,
    },
  });

  revalidatePath("/settings");
  redirect("/settings");
}

