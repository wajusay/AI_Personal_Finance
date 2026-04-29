-- SQLite doesn't support ALTER COLUMN for defaults reliably.
-- Rebuild Alert table to add DEFAULT CURRENT_TIMESTAMP on updatedAt.

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Alert" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "transactionId" TEXT,
  "explanation" TEXT NOT NULL,
  "suggestedAction" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" DATETIME,
  "dismissedAt" DATETIME,
  CONSTRAINT "Alert_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Alert" (
  "id",
  "type",
  "status",
  "transactionId",
  "explanation",
  "suggestedAction",
  "fingerprint",
  "createdAt",
  "updatedAt",
  "resolvedAt",
  "dismissedAt"
)
SELECT
  "id",
  "type",
  "status",
  "transactionId",
  "explanation",
  "suggestedAction",
  "fingerprint",
  "createdAt",
  "updatedAt",
  "resolvedAt",
  "dismissedAt"
FROM "Alert";

DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";

CREATE UNIQUE INDEX "Alert_fingerprint_key" ON "Alert"("fingerprint");
CREATE INDEX "Alert_status_idx" ON "Alert"("status");
CREATE INDEX "Alert_type_idx" ON "Alert"("type");
CREATE INDEX "Alert_transactionId_idx" ON "Alert"("transactionId");

PRAGMA foreign_keys=ON;

