-- CreateTable
CREATE TABLE "CategoryRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "transactionType" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "merchant" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Needs Review',
    "needsReview" BOOLEAN NOT NULL DEFAULT true,
    "accountName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Transaction" ("accountName", "amount", "category", "createdAt", "date", "description", "id", "merchant", "notes", "type", "updatedAt") SELECT "accountName", "amount", "category", "createdAt", "date", "description", "id", "merchant", "notes", "type", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");
CREATE INDEX "Transaction_needsReview_idx" ON "Transaction"("needsReview");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CategoryRule_priority_idx" ON "CategoryRule"("priority");

-- CreateIndex
CREATE INDEX "CategoryRule_transactionType_idx" ON "CategoryRule"("transactionType");
