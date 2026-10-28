-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "additionalCategories" "Category"[] DEFAULT ARRAY[]::"Category"[];
