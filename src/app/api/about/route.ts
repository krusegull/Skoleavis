import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";

const updateAboutSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10000),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
});

/** Admin/Redaktør oppdaterer "Om oss"-siden. */
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = updateAboutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const about = await prisma.aboutPage.upsert({
    where: { id: "about" },
    update: {
      title: parsed.data.title,
      body: parsed.data.body,
      imageUrl: parsed.data.imageUrl || null,
    },
    create: {
      id: "about",
      title: parsed.data.title,
      body: parsed.data.body,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  return NextResponse.json({ about });
}
