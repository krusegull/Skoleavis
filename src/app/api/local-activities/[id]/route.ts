import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { LocalActivityCategory } from "@prisma/client";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  ageRange: z.string().trim().max(60).nullable().optional(),
  category: z.nativeEnum(LocalActivityCategory).optional(),
  externalUrl: z.string().trim().url().max(500).optional(),
});

/** Redaktør/admin: rediger et fritidstilbud. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const activity = await prisma.localActivity.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ activity });
}

/** Redaktør/admin: fjern et fritidstilbud fra katalogen. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  await prisma.localActivity.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
