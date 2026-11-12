import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkGuesses } from "@/lib/crossword";

const checkSchema = z.object({
  guesses: z.record(z.string().max(5)),
});

/**
 * Offentlig, ikke-innlogget: besøkende sender inn gjetninger og får tilbake
 * riktig/feil per rute - aldri selve bokstaven, så fasiten lekker ikke før
 * kryssordet faktisk er løst.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const crossword = await prisma.crossword.findUnique({ where: { id: params.id }, include: { words: true } });
  if (!crossword) return NextResponse.json({ error: "Fant ikke kryssordet" }, { status: 404 });

  const parsed = checkSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldige data." }, { status: 400 });
  }

  const result = checkGuesses(
    crossword.words.map((w) => ({
      answer: w.answer,
      clue: w.clue,
      row: w.row,
      col: w.col,
      direction: w.direction as "A" | "D",
    })),
    parsed.data.guesses
  );

  return NextResponse.json(result);
}
