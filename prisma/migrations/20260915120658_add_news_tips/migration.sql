-- CreateTable
CREATE TABLE "NewsTip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT,
    "category" "Category",
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "articleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsTip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsTip_dismissed_createdAt_idx" ON "NewsTip"("dismissed", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsTip_sourceUrl_key" ON "NewsTip"("sourceUrl");

-- AddForeignKey
ALTER TABLE "NewsTip" ADD CONSTRAINT "NewsTip_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
