-- CreateTable
CREATE TABLE "Crossword" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Crossword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrosswordWord" (
    "id" TEXT NOT NULL,
    "crosswordId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "clue" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,

    CONSTRAINT "CrosswordWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrosswordWord_crosswordId_idx" ON "CrosswordWord"("crosswordId");

-- AddForeignKey
ALTER TABLE "CrosswordWord" ADD CONSTRAINT "CrosswordWord_crosswordId_fkey" FOREIGN KEY ("crosswordId") REFERENCES "Crossword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
