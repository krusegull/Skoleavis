import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPublicShape } from "@/lib/crossword";
import { CrosswordSolver } from "@/components/crossword/CrosswordSolver";

export const revalidate = 30;

export default async function KryssordPage({ params }: { params: { id: string } }) {
  const crossword = await prisma.crossword.findUnique({ where: { id: params.id }, include: { words: true } });
  if (!crossword) notFound();

  const shape = buildPublicShape(
    crossword.words.map((w) => ({ answer: w.answer, clue: w.clue, row: w.row, col: w.col, direction: w.direction as "A" | "D" }))
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">{crossword.title}</h1>
      {crossword.intro && <p className="mt-4 font-serif text-ink/80">{crossword.intro}</p>}
      {!crossword.isOpen && (
        <p className="mt-4 border border-ink/30 bg-ink/5 px-3 py-2 font-sans text-sm text-muted">
          Dette kryssordet er stengt for nye forsøk.
        </p>
      )}

      <div className="mt-8">
        <CrosswordSolver crosswordId={crossword.id} shape={shape} />
      </div>
    </div>
  );
}
