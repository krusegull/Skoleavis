import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { buildGrid } from "@/lib/crossword";

const wordSchema = z.object({
  answer: z.string().trim().min(1).max(20),
  clue: z.string().trim().min(1).max(300),
  row: z.number().int().min(0).max(40),
  col: z.number().int().min(0).max(40),
  direction: z.enum(["A", "D"]),
});

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  intro: z.string().trim().max(500).optional().nullable(),
  words: z.array(wordSchema).min(1).max(40),
});

/** Offentlig liste over åpne kryssord (ingen fasit her). */
export async function GET() {
  const crosswords = await prisma.crossword.findMany({
    where: { isOpen: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, intro: true, createdAt: true, _count: { select: { words: true } } },
  });
  return NextResponse.json({ crosswords });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig kryssord. Sjekk at alle felt er fylt ut." }, { status: 400 });
  }

  const { conflicts } = buildGrid(parsed.data.words);
  if (conflicts.length > 0) {
    return NextResponse.json(
      {
        error: "Ordene krysser hverandre feil - bokstavene stemmer ikke der de møtes.",
        conflicts,
      },
      { status: 400 }
    );
  }

  const crossword = await prisma.crossword.create({
    data: {
      title: parsed.data.title,
      intro: parsed.data.intro || null,
      words: {
        create: parsed.data.words.map((w) => ({
          answer: w.answer.toUpperCase(),
          clue: w.clue,
          row: w.row,
          col: w.col,
          direction: w.direction,
        })),
      },
    },
    include: { words: true },
  });

  return NextResponse.json({ crossword }, { status: 201 });
}
