import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";

const patchSchema = z.object({ isOpen: z.boolean() });

/** Redaktør/admin: åpne eller lukke en avstemning. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const poll = await prisma.poll.update({ where: { id: params.id }, data: { isOpen: parsed.data.isOpen } });
  return NextResponse.json({ poll });
}

/** Redaktør/admin: slett en avstemning (og alle stemmer på den). */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  await prisma.poll.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
