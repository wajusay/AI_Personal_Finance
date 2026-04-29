"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AlertStatus, AlertType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { detectRecurringGroups } from "@/lib/detect/recurring";
import { detectAnomalies } from "@/lib/detect/anomalies";

function fp(parts: string[]) {
  return parts.join("|");
}

export async function scanAlerts() {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365); // 12 months
  const txs = await prisma.transaction.findMany({
    where: { date: { gte: since } },
    orderBy: [{ date: "desc" }],
  });

  const recurring = detectRecurringGroups(txs);
  const anomalies = detectAnomalies(txs);

  // Create recurring alerts (one per group)
  for (const g of recurring.slice(0, 100)) {
    const type =
      g.kind === "subscription"
        ? AlertType.RECURRING_SUBSCRIPTION
        : AlertType.RECURRING_BILL;
    const fingerprint = fp(["recurring", type, g.key, String(g.cadenceDays)]);
    await prisma.alert.upsert({
      where: { fingerprint },
      update: {
        type,
        explanation:
          g.kind === "subscription"
            ? `Likely subscription: ${g.merchant} (${g.count} payments, ~every ${g.cadenceDays} days).`
            : `Likely recurring bill: ${g.merchant} (${g.count} payments, ~every ${g.cadenceDays} days).`,
        suggestedAction: "Confirm this is recurring and ensure it’s expected.",
      },
      create: {
        type,
        status: AlertStatus.OPEN,
        transactionId: null,
        fingerprint,
        explanation:
          g.kind === "subscription"
            ? `Likely subscription: ${g.merchant} (${g.count} payments, ~every ${g.cadenceDays} days).`
            : `Likely recurring bill: ${g.merchant} (${g.count} payments, ~every ${g.cadenceDays} days).`,
        suggestedAction: "Confirm this is recurring and ensure it’s expected.",
      },
    });
  }

  // Create anomaly alerts (one per transaction per kind)
  for (const a of anomalies.slice(0, 200)) {
    const type: AlertType =
      a.kind === "high_charge"
        ? AlertType.ANOMALY_HIGH_CHARGE
        : a.kind === "duplicate_charge"
          ? AlertType.ANOMALY_DUPLICATE_CHARGE
          : a.kind === "subscription_increased"
            ? AlertType.ANOMALY_SUBSCRIPTION_INCREASED
            : AlertType.ANOMALY_UTILITIES_SPIKE;

    const fingerprint = fp(["anomaly", type, a.transactionId]);
    await prisma.alert.upsert({
      where: { fingerprint },
      update: {
        type,
        transactionId: a.transactionId,
        explanation: a.explanation,
        suggestedAction: a.suggestedAction,
      },
      create: {
        type,
        status: AlertStatus.OPEN,
        transactionId: a.transactionId,
        fingerprint,
        explanation: a.explanation,
        suggestedAction: a.suggestedAction,
      },
    });
  }

  revalidatePath("/alerts");
  redirect("/alerts");
}

export async function dismissAlert(id: string) {
  await prisma.alert.update({
    where: { id },
    data: { status: AlertStatus.DISMISSED, dismissedAt: new Date() },
  });
  revalidatePath("/alerts");
}

export async function resolveAlert(id: string) {
  await prisma.alert.update({
    where: { id },
    data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
  });
  revalidatePath("/alerts");
}

