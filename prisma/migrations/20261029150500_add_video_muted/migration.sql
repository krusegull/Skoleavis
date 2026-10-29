-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "videoMuted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "videoMuted" BOOLEAN NOT NULL DEFAULT false;
