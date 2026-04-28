-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERSONAL',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaxCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "schedule" TEXT,
    "lineItem" TEXT,
    "description" TEXT,
    "requiresDocumentation" BOOLEAN NOT NULL DEFAULT false,
    "auditRiskLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
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
    "confidenceScore" REAL,
    "categorizationSource" TEXT NOT NULL DEFAULT 'IMPORT',
    "aiSuggestedCategory" TEXT,
    "aiReasoning" TEXT,
    "reviewedAt" DATETIME,
    "entityId" TEXT,
    "taxCategoryId" TEXT,
    "businessPurpose" TEXT,
    "deductiblePercentage" INTEGER,
    "documentationStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "accountName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_taxCategoryId_fkey" FOREIGN KEY ("taxCategoryId") REFERENCES "TaxCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("accountName", "aiReasoning", "aiSuggestedCategory", "amount", "categorizationSource", "category", "confidenceScore", "createdAt", "date", "description", "id", "merchant", "needsReview", "notes", "reviewedAt", "type", "updatedAt") SELECT "accountName", "aiReasoning", "aiSuggestedCategory", "amount", "categorizationSource", "category", "confidenceScore", "createdAt", "date", "description", "id", "merchant", "needsReview", "notes", "reviewedAt", "type", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");
CREATE INDEX "Transaction_needsReview_idx" ON "Transaction"("needsReview");
CREATE INDEX "Transaction_reviewedAt_idx" ON "Transaction"("reviewedAt");
CREATE INDEX "Transaction_entityId_idx" ON "Transaction"("entityId");
CREATE INDEX "Transaction_taxCategoryId_idx" ON "Transaction"("taxCategoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Entity_type_idx" ON "Entity"("type");

-- CreateIndex
CREATE INDEX "TaxCategory_auditRiskLevel_idx" ON "TaxCategory"("auditRiskLevel");
