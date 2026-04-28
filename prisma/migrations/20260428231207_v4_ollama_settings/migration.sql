-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "aiReasoning" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "aiSuggestedCategory" TEXT;

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "aiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ollamaModel" TEXT NOT NULL DEFAULT 'llama3.2',
    "aiConfidenceThreshold" REAL NOT NULL DEFAULT 0.85,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
