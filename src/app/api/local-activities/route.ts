import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { LocalActivityCategory } from "@prisma/client";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  ageRange: z.string().trim().max(60).optional().or(z.literal("")),
  category: z.nativeEnum(LocalActivityCategory),
  externalUrl: z.string().trim().url().max(500),
});

/** Redaktør/admin: legger til et nytt fritidstilbud i katalogen. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Fyll ut navn, beskrivelse, kategori og en gyldig lenke." }, { status: 400 });
  }

  const { name, description, ageRange, category, externalUrl } = parsed.data;
  const activity = await prisma.localActivity.create({
    data: { name, description, ageRange: ageRange || null, category, externalUrl },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
