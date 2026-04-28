import { prisma } from "@/lib/db";

export type AppSettingsShape = {
  aiEnabled: boolean;
  ollamaModel: string;
  aiConfidenceThreshold: number; // 0..1
};

export async function getAppSettings(): Promise<AppSettingsShape> {
  const s = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
    select: {
      aiEnabled: true,
      ollamaModel: true,
      aiConfidenceThreshold: true,
    },
  });

  return {
    aiEnabled: s.aiEnabled,
    ollamaModel: s.ollamaModel,
    aiConfidenceThreshold: s.aiConfidenceThreshold,
  };
}

