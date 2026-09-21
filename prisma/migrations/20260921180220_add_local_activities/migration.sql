-- CreateEnum
CREATE TYPE "LocalActivityCategory" AS ENUM ('SPORT', 'LEISURE_CLUB', 'CULTURE', 'LIBRARY', 'OTHER');

-- CreateTable
CREATE TABLE "LocalActivity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ageRange" TEXT,
    "category" "LocalActivityCategory" NOT NULL,
    "externalUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocalActivity_category_sortOrder_idx" ON "LocalActivity"("category", "sortOrder");
