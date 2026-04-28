-- CreateTable
CREATE TABLE "Statement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "statementStartDate" DATETIME NOT NULL,
    "statementEndDate" DATETIME NOT NULL,
    "openingBalance" DECIMAL NOT NULL,
    "closingBalance" DECIMAL NOT NULL,
    "uploadedFileName" TEXT NOT NULL,
    "parsingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationDifference" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Statement_statementStartDate_idx" ON "Statement"("statementStartDate");

-- CreateIndex
CREATE INDEX "Statement_statementEndDate_idx" ON "Statement"("statementEndDate");

-- CreateIndex
CREATE INDEX "Statement_parsingStatus_idx" ON "Statement"("parsingStatus");

-- CreateIndex
CREATE INDEX "Statement_verificationStatus_idx" ON "Statement"("verificationStatus");
