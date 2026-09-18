-- Renames the "QUIZ" category to "COMPETITION". No existing rows used QUIZ
-- at the time of writing, so this is a safe direct swap - Postgres doesn't
-- support removing an enum value directly, so the type is recreated.
BEGIN;

ALTER TYPE "Category" RENAME TO "Category_old";

CREATE TYPE "Category" AS ENUM ('NEWS', 'REPORTAGE', 'INTERVIEW', 'REVIEW', 'SPORT', 'CULTURE', 'WEEKLY_PICK', 'HISTORICAL_NEWS', 'COMPETITION');

ALTER TABLE "Article" ALTER COLUMN "category" TYPE "Category" USING ("category"::text::"Category");
ALTER TABLE "NewsTip" ALTER COLUMN "category" TYPE "Category" USING ("category"::text::"Category");

DROP TYPE "Category_old";

COMMIT;
