import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { VOTER_COOKIE, VOTER_COOKIE_MAX_AGE } from "@/lib/polls";

const voteSchema = z.object({ optionId: z.string().min(1) });

/**
 * Offentlig, ikke-innlogget stemmegivning. Ren databaseskriving - ingen
 * betalt tjeneste involvert. En tilfeldig verdi lagres i en cookie for å
 * hindre at samme nettleser stemmer flere ganger på samme avstemning
 * (ikke vanntett, men krever ingen innlogging og koster ingenting).
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const parsed = voteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const poll = await prisma.poll.findUnique({
    where: { id: params.id },
    include: { options: true },
  });
  if (!poll) return NextResponse.json({ error: "Fant ikke avstemningen." }, { status: 404 });
  if (!poll.isOpen) return NextResponse.json({ error: "Denne avstemningen er stengt." }, { status: 400 });
  if (!poll.options.some((o) => o.id === parsed.data.optionId)) {
    return NextResponse.json({ error: "Ugyldig svaralternativ." }, { status: 400 });
  }

  const cookieStore = cookies();
  const voterKey = cookieStore.get(VOTER_COOKIE)?.value ?? randomUUID();

  try {
    await prisma.vote.create({
      data: { pollId: poll.id, optionId: parsed.data.optionId, voterKey },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Du har allerede stemt i denne avstemningen." }, { status: 409 });
    }
    throw err;
  }

  const res = NextResponse.json({ ok: true }, { status: 201 });
  res.cookies.set(VOTER_COOKIE, voterKey, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: VOTER_COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
