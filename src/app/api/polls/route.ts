import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";

const createSchema = z.object({
  question: z.string().trim().min(1).max(200),
  options: z.array(z.string().trim().min(1).max(100)).min(2).max(40),
});

/** Redaktør/admin: oppretter en ny avstemning med faste svaralternativer. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Fyll ut spørsmål og minst to svaralternativer." }, { status: 400 });
  }

  const poll = await prisma.poll.create({
    data: {
      question: parsed.data.question,
      options: {
        create: parsed.data.options.map((label, i) => ({ label, sortOrder: i })),
      },
    },
  });

  return NextResponse.json({ poll }, { status: 201 });
}
