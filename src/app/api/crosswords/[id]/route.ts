import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { buildGrid, buildPublicShape } from "@/lib/crossword";

const wordSchema = z.object({
  answer: z.string().trim().min(1).max(20),
  clue: z.string().trim().min(1).max(300),
  row: z.number().int().min(0).max(40),
  col: z.number().int().min(0).max(40),
  direction: z.enum(["A", "D"]),
});

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  intro: z.string().trim().max(500).optional().nullable(),
  isOpen: z.boolean().optional(),
  words: z.array(wordSchema).min(1).max(40).optional(),
});

/**
 * Offentlig: returnerer kun rutenettets FORM og ledetrådene - aldri
 * bokstavene. Innloggede Redaktør/Admin som henter fra dashbordet får i
 * tillegg fasiten (sendt kun til dem, for å kunne redigere kryssordet).
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const crossword = await prisma.crossword.findUnique({ where: { id: params.id }, include: { words: true } });
  if (!crossword) return NextResponse.json({ error: "Fant ikke kryssordet" }, { status: 404 });

  const user = await getSessionUser();
  const isEditor = user && canApproveArticles(user.role);

  const shape = buildPublicShape(
    crossword.words.map((w) => ({ answer: w.answer, clue: w.clue, row: w.row, col: w.col, direction: w.direction as "A" | "D" }))
  );

  return NextResponse.json({
    crossword: { id: crossword.id, title: crossword.title, intro: crossword.intro, isOpen: crossword.isOpen },
    shape,
    ...(isEditor ? { words: crossword.words } : {}),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const crossword = await prisma.crossword.findUnique({ where: { id: params.id } });
  if (!crossword) return NextResponse.json({ error: "Fant ikke kryssordet" }, { status: 404 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldige data." }, { status: 400 });
  }

  if (parsed.data.words) {
    const { conflicts } = buildGrid(parsed.data.words);
    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "Ordene krysser hverandre feil - bokstavene stemmer ikke der de møtes.", conflicts },
        { status: 400 }
      );
    }
  }

  const { words, ...fields } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    if (words) {
      await tx.crosswordWord.deleteMany({ where: { crosswordId: crossword.id } });
      await tx.crosswordWord.createMany({
        data: words.map((w) => ({
          crosswordId: crossword.id,
          answer: w.answer.toUpperCase(),
          clue: w.clue,
          row: w.row,
          col: w.col,
          direction: w.direction,
        })),
      });
    }
    return tx.crossword.update({
      where: { id: crossword.id },
      data: fields,
      include: { words: true },
    });
  });

  return NextResponse.json({ crossword: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const crossword = await prisma.crossword.findUnique({ where: { id: params.id } });
  if (!crossword) return NextResponse.json({ error: "Fant ikke kryssordet" }, { status: 404 });

  await prisma.crossword.delete({ where: { id: crossword.id } });
  return NextResponse.json({ ok: true });
}
