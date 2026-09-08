import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/apiAuth";
import { canApproveArticles } from "@/lib/permissions";
import { ArticleStatus } from "@prisma/client";

const rejectSchema = z.object({ reason: z.string().max(1000).optional() });

/** Redaktør/admin avviser en sak til godkjenning, med valgfri begrunnelse. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !canApproveArticles(user.role)) {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "Fant ikke saken" }, { status: 404 });
  if (article.status !== ArticleStatus.PENDING_REVIEW) {
    return NextResponse.json({ error: "Kun saker til godkjenning kan avvises" }, { status: 400 });
  }

  const parsed = rejectSchema.safeParse(await req.json().catch(() => ({})));
  const reason = parsed.success ? parsed.data.reason : undefined;

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: {
      status: ArticleStatus.REJECTED,
      rejectionReason: reason ?? null,
      reviewedById: user.id,
    },
  });

  return NextResponse.json({ article: updated });
}
