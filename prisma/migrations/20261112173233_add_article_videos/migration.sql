-- CreateTable
CREATE TABLE "ArticleVideo" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ArticleVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleVideo_articleId_idx" ON "ArticleVideo"("articleId");

-- AddForeignKey
ALTER TABLE "ArticleVideo" ADD CONSTRAINT "ArticleVideo_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Flytt eksisterende video (enkelt felt på Article) over til den nye
-- ArticleVideo-tabellen FØR de gamle kolonnene slettes, slik at ingen
-- video som allerede er publisert går tapt.
INSERT INTO "ArticleVideo" ("id", "articleId", "url", "muted", "sortOrder")
SELECT md5(random()::text || clock_timestamp()::text), "id", "videoUrl", "videoMuted", 0
FROM "Article"
WHERE "videoUrl" IS NOT NULL;

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "videoMuted",
DROP COLUMN "videoUrl";
